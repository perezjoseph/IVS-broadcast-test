import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import DebugInfo from './DebugInfo';

const App = () => {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            channelArn: config.channelArn
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <header>
        <h1>IVS Streaming Platform</h1>
      </header>
      <main>
        {channel ? (
          <>
            <VideoPlayer playbackUrl={channel.playbackUrl} />
            <DebugInfo />
          </>
        ) : (
          <div>
            <div>No channel available</div>
            <DebugInfo />
          </div>
        )}
      </main>
      <footer>
        <p>© 2025 IVS Streaming Platform</p>
      </footer>
    </div>
  );
};

export default App;