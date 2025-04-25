import React from 'react';

const DebugInfo = () => {
  return (
    <div className="debug-info" style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px 0', borderRadius: '5px' }}>
      <h3>Debug Information</h3>
      <p><strong>Playback URL:</strong> {process.env.PLAYBACK_URL || 'Not available'}</p>
      <p><strong>Channel ARN:</strong> {process.env.CHANNEL_ARN || 'Not available'}</p>
      <p><strong>Environment variables available:</strong> {Object.keys(process.env).length > 0 ? 'Yes' : 'No'}</p>
      
      <div>
        <h4>Available environment variables:</h4>
        <ul>
          {Object.keys(process.env).map(key => (
            <li key={key}>{key}: {key.includes('KEY') ? '[HIDDEN]' : process.env[key]}</li>
          ))}
        </ul>
      </div>
      
      <p><strong>Browser IVS Support:</strong> Check browser console for compatibility</p>
    </div>
  );
};

export default DebugInfo;