import React, { useState, useEffect } from 'react';
import Header from './Header';
import VideoPlayer from './VideoPlayer';
import VideoInfo from './VideoInfo';
import CommentSection from './CommentSection';
import DebugInfo from './DebugInfo';

const App = () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Fetch config from our test API endpoint
    fetch('/api/test-config')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        return response.json();
      })
      .then(config => {
        console.log("Fetched config:", config);
        if (config && config.playbackUrl) {
          setChannel({
            playbackUrl: config.playbackUrl,
            channelArn: config.channelArn,
            ingestEndpoint: config.ingestEndpoint,
            streamKey: config.streamKey,
          });
        } else {
          setError('No playback URL available in config');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Config fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stream...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        {error ? (
          <div className="error-message">
            <h2>Error loading stream</h2>
            <p>{error}</p>
            <button className="btn primary-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="content-container">
            <div className="video-section">
              <VideoPlayer playbackUrl={channel?.playbackUrl} />
              <VideoInfo channel={channel} />
            </div>
            
            <div className="sidebar">
              <CommentSection channelArn={channel?.channelArn} />
            </div>
          </div>
        )}
        
        <div className="debug-toggle-container">
          <button className="btn outline-btn small" onClick={toggleDebug}>
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>
        
        {showDebug && <DebugInfo />}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>IVS Streaming Platform</h3>
            <p>Powered by Amazon Interactive Video Service</p>
          </div>
          <div className="footer-links">
            <a href="#terms">Terms of Service</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#help">Help Center</a>
          </div>
          <div className="footer-copyright">
            <p>© 2025 IVS Streaming Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;