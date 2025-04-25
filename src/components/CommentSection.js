import React, { useState, useEffect, useRef } from 'react';

const CommentSection = ({ channelArn }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [usernameSet, setUsernameSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const commentsEndRef = useRef(null);

  // Extract channel ID from ARN
  const getChannelId = () => {
    if (!channelArn) return 'default';
    const parts = channelArn.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    // Check for stored username
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setUsernameSet(true);
    }

    // Fetch comments if we have a channel ARN
    if (channelArn) {
      fetchComments();
    }

    // Set up polling for new comments
    const interval = setInterval(() => {
      if (channelArn) {
        fetchComments();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [channelArn]);
  
  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const channelId = getChannelId();
      
      // In a real app, this would use the API
      // For now, we'll use localStorage as a fallback
      const storedComments = localStorage.getItem(`comments-${channelId}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username);
      setUsernameSet(true);
    }
  };
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const channelId = getChannelId();
      const newCommentObj = {
        id: Date.now(),
        text: newComment,
        username: username,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      
      // In a real app, we'd make an API call here
      // For now, we'll update local state and save to localStorage
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(`comments-${channelId}`, JSON.stringify(updatedComments));
      
      setNewComment('');
    }
  };
  
  const handleLikeComment = (commentId) => {
    const channelId = getChannelId();
    
    // Update in memory
    const updatedComments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    );
    
    setComments(updatedComments);
    
    // In a real app, we'd make an API call here
    // For now, we'll update localStorage
    localStorage.setItem(`comments-${channelId}`, JSON.stringify(updatedComments));
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!usernameSet) {
    return (
      <div className="username-form-container">
        <form onSubmit={handleSubmitUsername} className="username-form">
          <h3>Enter your name to join the chat</h3>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              required
              className="input-field"
            />
            <button type="submit" className="btn primary-btn">Join Chat</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>Live Chat</h3>
        <div className="online-indicator">
          <span className="online-dot"></span>
          <span>Live</span>
        </div>
      </div>
      
      <div className="comments-container">
        {isLoading && comments.length === 0 ? (
          <div className="loading-comments">
            <p>Loading comments...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-username">{comment.username}</span>
                <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-actions">
                <button 
                  onClick={() => handleLikeComment(comment.id)} 
                  className="like-button"
                >
                  ❤️ {comment.likes > 0 && <span>{comment.likes}</span>}
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>
      
      <form onSubmit={handleSubmitComment} className="comment-form">
        <div className="input-group">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input-field"
          />
          <button type="submit" className="btn send-btn">Send</button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;