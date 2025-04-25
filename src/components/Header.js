import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <h1>IVS Streaming</h1>
          <div className="logo-tagline">Live Video Platform</div>
        </div>
        
        <div className="desktop-nav">
          <nav>
            <ul>
              <li><a href="/" className="active">Home</a></li>
              <li><a href="/stream-test.html">Stream Test</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </nav>
          
          <div className="header-actions">
            <button className="btn outline-btn">Sign In</button>
            <button className="btn primary-btn">Start Streaming</button>
          </div>
        </div>
        
        <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="mobile-nav">
          <nav>
            <ul>
              <li><a href="/" className="active">Home</a></li>
              <li><a href="/stream-test.html">Stream Test</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#signin">Sign In</a></li>
              <li><a href="#stream" className="highlight">Start Streaming</a></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;