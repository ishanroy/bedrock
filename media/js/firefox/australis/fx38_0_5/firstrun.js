;(function($, Mozilla) {
    'use strict';

    var hasVideo = ($('#video').length > 0);
    var $ctaSignup = $('#cta-signup');
    var $videoFrame = $('#video-frame');
    var $videoTitle = $('#video-title');
    var $video = $('#firstrun-video');
    var funnelcakeId = parseInt($('#intro').data('funnelcake'), 0);

    var ctaDirect;
    var videoOnLoad = false;

    // 37 sends user to sync in hamburger menu
    if (funnelcakeId === 37) {
        ctaDirect = false;
    // 38 and 39 send user directly to signup form
    } else if (funnelcakeId === 38 || funnelcakeId === 39) {
        ctaDirect = true;
    // anything else sends user to signup form
    } else {
        ctaDirect = true;
    }

    // if locale has video, do A/B test
    if (hasVideo) {
        videoOnLoad = (Math.random() >= 0.5);

        // manual override to test videos
        if (window.location.href.indexOf('&v=') !== -1) {
            var parts = window.location.href.split('&v=');
            var variation = parts[1];

            if (variation === '1') {
                videoOnLoad = false;
            } else {
                videoOnLoad = true;
            }
        }

        window.dataLayer.push({
            'event': 'dataLayer-initialized',
            'page': {
                'category': 'firstrun-38.0.5',
                'variation': (videoOnLoad) ? '1' : '2'
            }
        });

        $video.on('play', function() {
            // GA track video play
            window.dataLayer.push({
                'event': 'firstrun-38.0.5-video',
                'interaction': 'start',
                'videoTitle': 'When its Personal Campaign Video'
            });
        }).on('pause', function() {
            // is video over?
            // 'pause' event fires just before 'ended', so
            // using 'ended' results in extra pause tracking.
            var action = ($video[0].currentTime === $video[0].duration) ? 'finish' : 'pause';

            if (action === 'finish') {
                // GA track video finish
                window.dataLayer.push({
                    'event': 'firstrun-38.0.5-video',
                    'interaction': 'finish',
                    'videoTitle': 'When its Personal Campaign Video'
                });

                // take a little breath before closing modal
                setTimeout(function() {
                    Mozilla.Modal.closeModal();
                }, 500);
            }
          });
    }

    // display appropriate copy
    if (!ctaDirect) {
        $('.ctaMenu').addClass('visible');
    } else {
        $('.ctaDirect').addClass('visible');
    }

    var showVideo = function(origin, autoplay) {
        var opts = {
            title: $videoTitle.text()
        };

        if (autoplay) {
            opts.onCreate = function() {
                // slight pause after modal opens
                setTimeout(function() {
                    $video[0].play();
                }, 250);
            };
        }

        Mozilla.Modal.createModal(origin, $videoFrame, opts);
    };

    // to be safe, make sure user is on desktop firefox version 38 or higher
    if (window.isFirefox() && !window.isFirefoxMobile() && window.getFirefoxMasterVersion() >= 36) {
        // if primary CTA should highlight Sync in settings
        if (!ctaDirect) {
            // Query if the UITour API is working before we start the tour
            Mozilla.UITour.getConfiguration('sync', function() {
                $ctaSignup.on('click', function() {
                    // call twice two correctly position highlight
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1049130
                    Mozilla.UITour.showHighlight('accountStatus', 'wobble');
                    Mozilla.UITour.showHighlight('accountStatus', 'wobble');
                });
            });
        } else {
            $ctaSignup.on('click', function() {
                Mozilla.UITour.showFirefoxAccounts();
            });
        }

        // if showing video on page load, hide video copy/CTA and show video
        if (videoOnLoad) {
            $('#video').addClass('hidden');
            showVideo(document.documentElement, false);
        // if not showing video on page load, attach click listener to video CTA
        } else if (hasVideo) {
            $('#cta-video').on('click', function(e) {
                e.preventDefault();
                showVideo(this, true);
            });
        }
    }
})(window.jQuery, window.Mozilla);
