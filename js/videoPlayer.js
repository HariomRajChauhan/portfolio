// YouTube Player API initialization
let player;
let videoPlayer;

// This function will be called by YouTube API when it's ready
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');
    // Initialize video player after API is ready
    videoPlayer = new VideoPlayer();
    videoPlayer.setupThumbnails();
}

class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.isPlaying = false;
        this.setupPlayerModal();
    }

    setupPlayerModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'video-modal';
        this.modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-close">&times;</div>
                <div id="youtube-player"></div>
                <div class="custom-controls">
                    <div class="progress-bar">
                        <div class="progress-filled"></div>
                    </div>
                    <div class="controls-main">
                        <button class="play-pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="time">
                            <span class="current">0:00</span>
                            <span>/</span>
                            <span class="duration">0:00</span>
                        </div>
                        <div class="volume-container">
                            <button class="volume">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <div class="volume-slider">
                                <div class="volume-filled"></div>
                            </div>
                        </div>
                        <button class="fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.appendChild(this.modal);

        // Setup event listeners
        this.modal.querySelector('.video-modal-close').addEventListener('click', () => this.closePlayer());
        this.modal.querySelector('.play-pause').addEventListener('click', () => this.togglePlay());
        this.modal.querySelector('.volume').addEventListener('click', () => this.toggleMute());
        this.modal.querySelector('.fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Setup progress bar
        const progressBar = this.modal.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => this.handleProgress(e));

        // Setup volume slider
        const volumeSlider = this.modal.querySelector('.volume-slider');
        volumeSlider.addEventListener('click', (e) => this.handleVolume(e));

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closePlayer();
        });

        // Add keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'escape':
                    if (this.modal.classList.contains('active')) {
                        this.closePlayer();
                    }
                    break;
            }
        });
    }

    setupThumbnails() {
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            const videoId = card.dataset.videoId;
            const thumbnail = card.querySelector('.video-thumbnail');

            // Add click event
            thumbnail.addEventListener('click', () => {
                console.log('Initializing player with video ID:', videoId);
                this.initPlayer(videoId);
            });
        });
    }

    initPlayer(videoId) {
        console.log('Initializing player...');
        if (this.currentVideoId === videoId && player) {
            this.openPlayer();
            return;
        }

        this.currentVideoId = videoId;

        if (player) {
            player.loadVideoById(videoId);
            this.openPlayer();
            return;
        }

        player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'rel': 0,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onPlayerStateChange.bind(this),
                'onError': (e) => {
                    console.error('YouTube Player Error:', e);
                }
            }
        });
    }

    onPlayerReady(event) {
        console.log('Player ready');
        this.updateDuration();
        this.startTimeUpdate();
        event.target.playVideo();
    }

    onPlayerStateChange(event) {
        console.log('Player state changed:', event.data);
        const playPauseBtn = this.modal.querySelector('.play-pause i');
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            playPauseBtn.className = 'fas fa-pause';
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            playPauseBtn.className = 'fas fa-play';
        }
    }

    openPlayer() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closePlayer() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        if (player) {
            player.pauseVideo();
        }
    }

    togglePlay() {
        if (!player) return;
        if (this.isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }

    toggleMute() {
        if (!player) return;
        const volumeBtn = this.modal.querySelector('.volume i');
        if (player.isMuted()) {
            player.unMute();
            volumeBtn.className = 'fas fa-volume-up';
        } else {
            player.mute();
            volumeBtn.className = 'fas fa-volume-mute';
        }
        this.updateVolumeUI();
    }

    toggleFullscreen() {
        const container = this.modal.querySelector('.video-modal-content');
        if (!document.fullscreenElement) {
            container.requestFullscreen();
            this.modal.querySelector('.fullscreen i').className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            this.modal.querySelector('.fullscreen i').className = 'fas fa-expand';
        }
    }

    handleProgress(e) {
        if (!player) return;
        const progressBar = this.modal.querySelector('.progress-bar');
        const percent = (e.offsetX / progressBar.offsetWidth);
        const duration = player.getDuration();
        player.seekTo(duration * percent);
    }

    handleVolume(e) {
        if (!player) return;
        const volumeSlider = this.modal.querySelector('.volume-slider');
        const percent = (e.offsetX / volumeSlider.offsetWidth);
        player.setVolume(percent * 100);
        this.updateVolumeUI();
    }

    updateVolumeUI() {
        if (!player) return;
        const volumeFilled = this.modal.querySelector('.volume-filled');
        const volume = player.isMuted() ? 0 : player.getVolume();
        volumeFilled.style.width = `${volume}%`;
    }

    updateDuration() {
        if (!player) return;
        const durationEl = this.modal.querySelector('.duration');
        const duration = player.getDuration();
        durationEl.textContent = this.formatTime(duration);
    }

    startTimeUpdate() {
        setInterval(() => {
            if (!player || !this.isPlaying) return;

            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            const progress = (currentTime / duration) * 100;

            // Update progress bar
            this.modal.querySelector('.progress-filled').style.width = `${progress}%`;

            // Update current time
            this.modal.querySelector('.current').textContent = this.formatTime(currentTime);
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
} 