import React, { useState } from 'react';

const VideoInfo = ({ channel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format the channel ARN to extract the channel ID
  const formatChannelId = (channelArn) => {
    if (!channelArn) return 'Unknown Channel';
    const parts = channelArn.split('/');
    return parts[parts.length - 1];
  };
  
  // Mock data for stream details
  const streamInfo = {
    title: 'Live Stream Demo',
    channelName: formatChannelId(channel?.channelArn),
    startedAt: new Date().toLocaleString(),
    viewers: Math.floor(Math.random() * 100) + 5,
    category: 'Technology',
    tags: ['AWS', 'IVS', 'Streaming', 'Demo'],
    description: 'This is a demonstration of Amazon Interactive Video Service (IVS) streaming capabilities with a custom React frontend. The stream showcases low-latency video delivery with an enhanced user interface and interactive features.'
  };
  
  return (
    <div className="video-info">
      <div className="video-info-header">
        <div className="stream-title-container">
          <h2 className="stream-title">{streamInfo.title}</h2>
          <div className="live-indicator">LIVE</div>
        </div>
        <div className="channel-info">
          <div className="channel-avatar">
            {streamInfo.channelName.charAt(0).toUpperCase()}
          </div>
          <div className="channel-details">
            <div className="channel-name">{streamInfo.channelName}</div>
            <div className="channel-stats">
              <span className="viewer-count">{streamInfo.viewers} watching</span>
              <span className="stream-time">Started {streamInfo.startedAt}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`video-info-details ${isExpanded ? 'expanded' : ''}`}>
        <div className="stream-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Category:</span>
            <span className="metadata-value">{streamInfo.category}</span>
          </div>
          <div className="metadata-item tags">
            <span className="metadata-label">Tags:</span>
            <div className="tag-list">
              {streamInfo.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="stream-description">
          <p>{isExpanded ? streamInfo.description : `${streamInfo.description.substring(0, 100)}...`}</p>
        </div>
        
        <button 
          className="btn text-btn expand-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      
      <div className="video-actions">
        <button className="btn outline-btn action-btn">
          <span className="icon">👍</span> Like
        </button>
        <button className="btn outline-btn action-btn">
          <span className="icon">🔗</span> Share
        </button>
        <button className="btn outline-btn action-btn">
          <span className="icon">⭐</span> Follow
        </button>
      </div>
    </div>
  );
};

export default VideoInfo;