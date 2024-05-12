import React, { useRef, useState, useEffect } from 'react';

const CustomVideoPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videos] = useState([
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  ]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(videoElement.duration);
    };
    const handleTimeUpdate = () => {
      const { currentTime, duration } = videoElement;
      setProgress((currentTime / duration) * 100);
    };
    const handleMouseEnter = () => {
      setShowControls(true);
    };
    const handleMouseLeave = (e) => {
      const relatedTarget = e.relatedTarget || e.toElement;
      if (!videoRef.current.paused && !relatedTarget?.classList.contains('video-controls')) {
        setShowControls(false);
      }
    };

    const handleKeyPress = (e) => {
      switch (e.key) {
        case ' ':
          togglePlay();
          break;
        case 'ArrowUp':
          setVolume((prevVolume) => Math.min(prevVolume + 0.1, 1));
          break;
        case 'ArrowDown':
          setVolume((prevVolume) => Math.max(prevVolume - 0.1, 0));
          break;
        case 'ArrowRight':
          videoElement.currentTime += 10;
          break;
        case 'ArrowLeft':
          videoElement.currentTime -= 10;
          break;
        case 'm':
        case 'M':
          videoElement.muted = !videoElement.muted;
          break;
        case 'f':
        case 'F':
          handleFullScreen();
          break;
        case 'Escape':
          handleFullScreen();
          break;
        case 'w':
        case 'W':
          minimize();
          break;
        case 'n':
        case 'N':
          playNextVideo();
          break;
        case 'p':
        case 'P':
          playPreviousVideo();
          break;
        default:
          break;
      }
    };
    
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('mouseenter', handleMouseEnter);
    videoElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('mouseenter', handleMouseEnter);
      videoElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const { offsetX, target } = e.nativeEvent;
    const width = target.clientWidth;
    const clickTime = (offsetX / width) * videoRef.current.duration;
    videoRef.current.currentTime = clickTime;
  };

  const handleVolumeChange = (e) => {
    const volumeLevel = e.target.value;
    setVolume(volumeLevel);
    videoRef.current.volume = volumeLevel;
  };

  const handlePlaybackRateChange = (e) => {
    const playbackRateValue = parseFloat(e.target.value);
    setPlaybackRate(playbackRateValue);
    videoRef.current.playbackRate = playbackRateValue;
  };

  const handleForward = () => {
    videoRef.current.currentTime += 10;
  };

  const handleBackward = () => {
    videoRef.current.currentTime -= 10;
  };

  const minimize = () => {
    const videoPlayer = videoRef.current;
    videoPlayer.classList.add('minimized');
  
    if (!videoPlayer.paused) {
      togglePlay();
    }
  };
  
  const handleFullScreen = () => {
    if (!isFullScreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { 
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const playPreviousVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex === 0 ? videos.length - 1 : prevIndex - 1));
  };

  const playNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex === videos.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <span className="text-white">Loading...</span>
        </div>
      )}
      <video
        ref={videoRef}
        src={videos[currentVideoIndex]}
        className="w-full"
        onEnded={playNextVideo}
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 video-controls">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="text-white rounded-full p-2 mr-2" onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="text-white rounded-full p-2 mr-2" onClick={playPreviousVideo}>Previous</button>
              <button className="text-white rounded-full p-2 mr-2" onClick={playNextVideo}>Next</button>
              <button className="text-white rounded-full p-2 mr-2" onClick={handleBackward}>10s Backward</button>
              <button className="text-white rounded-full p-2 mr-2" onClick={handleForward}>10s Forward</button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="mr-2"
              />
              <span className="text-white">{Math.round(duration)}</span>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-2">{Math.round(progress * duration / 100)}</span>
              <select
                value={playbackRate}
                onChange={handlePlaybackRateChange}
                className="rounded p-2 mr-2"
              >
                {[...Array(15)].map((_, i) => (
                  <option key={i} value={(i + 1) * 0.25}>{(i + 1) * 0.25}x</option>
                ))}
              </select>
              <button className="text-white rounded-full p-2" onClick={handleFullScreen}>
                {isFullScreen ? 'Exit Fullscreen' : 'Full Screen'}
              </button>
            </div>
          </div>
          <div
            className="relative w-full mt-2 h-2 bg-gray-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
