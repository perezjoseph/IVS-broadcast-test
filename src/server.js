const dotenv = require('dotenv');
const fs = require('fs');
const express = require('express');
const path = require('path');
const { IvsClient, GetChannelCommand } = require('@aws-sdk/client-ivs');

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env file');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON request body
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Create IVS client
const ivsClient = new IvsClient({ region: process.env.AWS_REGION || 'us-east-1' });

// API endpoints
app.get('/api/channel/:channelArn', async (req, res) => {
  try {
    const command = new GetChannelCommand({
      arn: req.params.channelArn
    });
    
    const response = await ivsClient.send(command);
    res.json(response.channel);
  } catch (error) {
    console.error('Error retrieving channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Configuration endpoint for frontend
app.get('/api/config', (req, res) => {
  console.log('Config request received');
  console.log('Environment variables:', {
    channelArn: process.env.CHANNEL_ARN,
    playbackUrl: process.env.PLAYBACK_URL,
    ingestEndpoint: process.env.INGEST_ENDPOINT,
  });
  
  // Provide the IVS details as a simple API endpoint
  res.json({
    channelArn: process.env.CHANNEL_ARN,
    playbackUrl: process.env.PLAYBACK_URL,
    ingestEndpoint: process.env.INGEST_ENDPOINT,
    apiEndpoint: process.env.API_ENDPOINT
  });
});

// Comments API endpoints
let comments = {};

// Get comments for a channel
app.get('/api/comments/:channelId', (req, res) => {
  const channelId = req.params.channelId;
  const channelComments = comments[channelId] || [];
  
  res.json(channelComments);
});

// Add a comment to a channel
app.post('/api/comments/:channelId', (req, res) => {
  const channelId = req.params.channelId;
  const { text, username } = req.body;
  
  if (!text || !username) {
    return res.status(400).json({ error: 'Comment text and username are required' });
  }
  
  const newComment = {
    id: Date.now(),
    text,
    username,
    timestamp: new Date().toISOString(),
    likes: 0
  };
  
  // Initialize comments array for this channel if it doesn't exist
  if (!comments[channelId]) {
    comments[channelId] = [];
  }
  
  comments[channelId].push(newComment);
  res.status(201).json(newComment);
});

// Like a comment
app.post('/api/comments/:channelId/:commentId/like', (req, res) => {
  const { channelId, commentId } = req.params;
  const channelComments = comments[channelId] || [];
  
  const commentIndex = channelComments.findIndex(comment => 
    comment.id === parseInt(commentId));
  
  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  
  // Increment like count
  comments[channelId][commentIndex].likes += 1;
  res.json(comments[channelId][commentIndex]);
});

// Hardcoded test endpoint as fallback for development
app.get('/api/test-config', (req, res) => {
  res.json({
    channelArn: 'arn:aws:ivs:us-east-1:851725368801:channel/B1gsi467AKe0',
    playbackUrl: 'https://57f31b04fea5.us-east-1.playback.live-video.net/api/video/v1/us-east-1.851725368801.channel.B1gsi467AKe0.m3u8',
    ingestEndpoint: '57f31b04fea5.global-contribute.live-video.net',
    streamKey: 'sk_us-east-1_l3LwDu0GdQMF_7u1JKUsmEcd7kQ4ZryX46uQhA5O7bP'
  });
});

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;