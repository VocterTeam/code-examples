kaboodleModule.youtubeVideo = (function () {
    var player;
    var playerElementClass = 'player';
    var playerReady = false;
    var players;
    var playersInit = [];
    var apiUrl = 'https://www.youtube.com/iframe_api';
    var videoIdInitial = 'arisupsq_fU';
    var playerTemplate = '<div id="player" class="player"></div>';
    var PLAYER_STATES = {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        VIDEO_CUED: 5
    };

    return {
        videoSrcHandler: function (element, event) {
            var videoSrc = $(element).attr('src');

            if (event === 'stop') {
                $(element).attr('src', videoSrc);
            }
        },
        onPlayerStateChange: function (event) {

            if (event.data == YT.PlayerState.ENDED) {
                console.log('PlayerState.ENDED');
            }
        },
        onYouTubePlayer: function () {
            var module = this;

            for (var i = 0; i < players.length; i++) {
                playersInit[i] = new YT.Player(players[i], {
                    height: '490',
                    width: '880',
                    videoId: videoIdInitial,

                    playerVars: { controls: 1, showinfo: 0, rel: 0, showsearch: 0, iv_load_policy: 3 },
                    events: {
                        'onStateChange': module.onPlayerStateChange,
                    }
                });
            }
        },
        onPlayerReady: function (event) {
            playerReady = true;
            
        },
        getYoutubeVideoIdByUrl: function (url) {
            var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);

            if (videoid != null) {
                console.log("video id = ", videoid[1]);

                return videoid[1];

            } else {
                console.log("The youtube url is not valid.");
                return false;
            }
        },
        stopAllVideos: function () {
            for (var i = 0; i < playersInit.length; i++) {
                playersInit[i].stopVideo();
            }
        },
        loadVideoByUrl: function (playerId, url) {
            this.stopAllVideos();

            var playerIndex = parseInt(playerId.slice(playerElementClass.length, playerId.length)) - 1;

            if (kaboodleModule.isIOsDevice()) {
                playersInit[playerIndex].cueVideoById(this.getYoutubeVideoIdByUrl(url), 0, "default");
            } else {
                playersInit[playerIndex].loadVideoById(this.getYoutubeVideoIdByUrl(url), 0, "default");
            }
        },
        setApi: function () {

            if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubePlayerAPIReady = function () {
                    kaboodleModule.youtubeVideo.onYouTubePlayer();
                };
            }
        },
        init: function () {
            players = document.querySelectorAll('.' + playerElementClass);

            this.setApi();
        }
    }
})();