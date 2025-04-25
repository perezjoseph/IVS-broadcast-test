import React, { useEffect, useRef, useState } from 'react';
import { MediaPlayer } from 'amazon-ivs-player';

const VideoPlayer = ({ playbackUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState("Initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayerControls, setShowPlayerControls] = useState(true);

  useEffect(() => {
    console.log("Playback URL:", playbackUrl);
    
    if (!playbackUrl || !videoRef.current) {
      setPlayerState("Missing playback URL or video element");
      return;
    }

    try {
      // Check if IVS is supported in the current browser
      const ivsSupported = MediaPlayer.isPlayerSupported;
      setIsSupported(ivsSupported);
      console.log("IVS Player supported:", ivsSupported);
      
      if (ivsSupported) {
        // Initialize player
        setPlayerState("Initializing player");
        playerRef.current = new MediaPlayer();
        playerRef.current.attachHTMLVideoElement(videoRef.current);
        
        // Add event listeners
        playerRef.current.addEventListener('stateChanged', (state) => {
          setPlayerState(`${state}`);
          setIsPlaying(state === 'Playing');
          console.log('Player State:', state);
        });
        
        playerRef.current.addEventListener('error', (err) => {
          setErrorMessage(`Player error: ${err.type}`);
          console.error('Player Error:', err);
        });
        
        // Load and play the stream
        setPlayerState("Loading stream");
        playerRef.current.load(playbackUrl);
        
        playerRef.current.play()
          .then(() => {
            console.log("Playback started");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Play error:", err);
            setErrorMessage(`Play error: ${err.message}`);
          });
      } else {
        setPlayerState("IVS Player not supported in this browser");
      }
    } catch (err) {
      console.error("Player initialization error:", err);
      setErrorMessage(`Initialization error: ${err.message}`);
    }

    return () => {
      // Clean up
      if (playerRef.current) {
        try {
          playerRef.current.delete();
        } catch (err) {
          console.error("Error cleaning up player:", err);
        }
      }
    };
  }, [playbackUrl]);

  // Controls functionality
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const toggleMute = () => {
    if (!playerRef.current) return;
    
    const newMutedState = !isMuted;
    playerRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };
  
  const handleVolumeChange = (e) => {
    if (!playerRef.current) return;
    
    const newVolume = parseInt(e.target.value);
    playerRef.current.setVolume(newVolume / 100);
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleFullscreen = () => {
    const videoContainer = document.querySelector('.video-container');
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className="video-container"
      onMouseEnter={() => setShowPlayerControls(true)}
      onMouseLeave={() => setShowPlayerControls(false)}
    >
      <video 
        ref={videoRef} 
        playsInline 
        width="100%" 
        className="video-player"
      />
      
      {/* Custom video controls */}
      <div className={`video-controls ${showPlayerControls ? 'visible' : ''}`}>
        <div className="video-progress">
          <div className="progress-bar">
            <div className="progress-filled" style={{ width: '70%' }}></div>
          </div>
        </div>
        
        <div className="controls-bottom">
          <button onClick={togglePlay} className="control-button">
            {isPlaying ? 
              <span className="material-icon">⏸</span> : 
              <span className="material-icon">▶</span>
            }
          </button>
          
          <div className="volume-control">
            <button onClick={toggleMute} className="control-button">
              {isMuted ? 
                <span className="material-icon">🔇</span> : 
                <span className="material-icon">🔊</span>
              }
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
          
          <div className="player-status">
            <span>{playerState}</span>
          </div>
          
          <button onClick={toggleFullscreen} className="control-button">
            {isFullscreen ? 
              <span className="material-icon">⤦</span> : 
              <span className="material-icon">⤢</span>
            }
          </button>
        </div>
      </div>
      
      {/* Error display */}
      {errorMessage && (
        <div className="player-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{errorMessage}</span>
          </div>
        </div>
      )}
      
      {/* Unsupported browser warning */}
      {!isSupported && (
        <div className="browser-support-warning">
          <p>Your browser doesn't support the IVS player.</p>
          <p>Please try Chrome, Firefox, or Safari.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;