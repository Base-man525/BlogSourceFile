var AudioController = (function() {
    var audio = null;
    var isPlaying = false;
    var currentTrackIndex = -1;
    var userManuallyEnabled = false;
    var hasExternalAudio = false;
    var tracks = [
        '../background-music/Website Home\'s music/Bandari - 安妮的仙境.mp3',
        '../background-music/Website Settings\' music/DAOKO (ダヲコ) _ 米津玄師 (よねづ けんし) - 打上花火.mp3',
        '../background-music/Website announcement\'s music/Troye Sivan - Strawberries & Cigarettes.mp3',
        '../background-music/Login the website and Registered the Accounts\' music/ハルノユキ (春之雪)-Lily Sayonara.mp3'
    ];

    function checkExternalAudio() {
        return new Promise(function(resolve) {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (audioContext.state === 'running') {
                audioContext.close();
                resolve(false);
                return;
            }

            var startTime = Date.now();
            audioContext.resume().then(function() {
                var timeDiff = Date.now() - startTime;
                audioContext.close();
                resolve(timeDiff > 100);
            }).catch(function() {
                audioContext.close();
                resolve(true);
            });
        });
    }

    function init() {
        var savedState = localStorage.getItem('audioState');
        if (savedState) {
            try {
                var state = JSON.parse(savedState);
                isPlaying = state.isPlaying;
                currentTrackIndex = state.currentTrackIndex;
                userManuallyEnabled = state.userManuallyEnabled || false;
            } catch (e) {
                currentTrackIndex = -1;
            }
        }

        if (currentTrackIndex < 0 || currentTrackIndex >= tracks.length) {
            currentTrackIndex = Math.floor(Math.random() * tracks.length);
        }

        audio = new Audio(tracks[currentTrackIndex]);
        audio.loop = true;
        audio.volume = 0.5;

        checkExternalAudio().then(function(hasExternal) {
            hasExternalAudio = hasExternal;
            
            if (hasExternalAudio && !userManuallyEnabled) {
                isPlaying = false;
                saveState();
            } else if (isPlaying) {
                audio.play().catch(function() {
                    isPlaying = false;
                    saveState();
                });
            }
        });
    }

    function saveState() {
        localStorage.setItem('audioState', JSON.stringify({
            isPlaying: isPlaying,
            currentTrackIndex: currentTrackIndex,
            userManuallyEnabled: userManuallyEnabled
        }));
    }

    function toggle() {
        if (!audio) init();
        
        userManuallyEnabled = true;
        
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play().then(function() {
                isPlaying = true;
            }).catch(function() {
                isPlaying = false;
            });
        }
        saveState();
        return isPlaying;
    }

    function play() {
        if (!audio) init();
        
        if (hasExternalAudio && !userManuallyEnabled) {
            return false;
        }
        
        userManuallyEnabled = true;
        audio.play().then(function() {
            isPlaying = true;
        }).catch(function() {
            isPlaying = false;
        });
        saveState();
        return isPlaying;
    }

    function pause() {
        if (!audio) init();
        audio.pause();
        isPlaying = false;
        saveState();
    }

    function isAudioPlaying() {
        return isPlaying;
    }

    function getCurrentTrackIndex() {
        return currentTrackIndex;
    }

    function setVolume(vol) {
        if (!audio) init();
        audio.volume = vol;
    }

    function wasUserManuallyEnabled() {
        return userManuallyEnabled;
    }

    return {
        init: init,
        toggle: toggle,
        play: play,
        pause: pause,
        isPlaying: isAudioPlaying,
        getCurrentTrackIndex: getCurrentTrackIndex,
        setVolume: setVolume,
        wasUserManuallyEnabled: wasUserManuallyEnabled
    };
})();