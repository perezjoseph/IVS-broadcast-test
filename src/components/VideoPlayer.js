import React, { useEffect, useRef, useState } from 'react';
import { MediaPlayer } from 'amazon-ivs-player';

const VideoPlayer = ({ playbackUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [playerState, setPlayerState] = useState("Initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSupported, setIsSupported] = useState(false);

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
          setPlayerState(`Player state: ${state}`);
          console.log('Player State:', state);
        });
        
        playerRef.current.addEventListener('error', (err) => {
          setErrorMessage(`Player error: ${err.type}`);
          console.error('Player Error:', err);
        });
        
        // Load and play the stream
        setPlayerState("Loading stream");
        playerRef.current.load(playbackUrl);
        
        setPlayerState("Playing");
        playerRef.current.play()
          .then(() => console.log("Playback started"))
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

  return (
    <div className="video-container">
      <video ref={videoRef} playsInline controls width="100%" />
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p><strong>Player Status:</strong> {playerState}</p>
        {errorMessage && <p style={{ color: 'red' }}><strong>Error:</strong> {errorMessage}</p>}
        <p><strong>IVS Supported:</strong> {isSupported ? 'Yes' : 'No'}</p>
        <p><strong>Playback URL:</strong> {playbackUrl || 'Not provided'}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;