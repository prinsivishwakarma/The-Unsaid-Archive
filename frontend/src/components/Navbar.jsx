import { useState, useEffect } from 'react';

export default function Navbar({ totalCount, connected, onToggleStats, showStats }) {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-background">
        <div className="navbar-particles"></div>
        <div className="navbar-gradient"></div>
      </div>
      
      <div className="navbar-content">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
              <div className="logo-core">UA</div>
            </div>
          </div>
          
          <div className="brand-text">
            <h1 className="brand-title">
              The Unsaid Archive
              <span className="title-glow"></span>
            </h1>
            <p className="brand-subtitle">
              Anonymous whispers, shared souls
              <span className="subtitle-pulse">●</span>
            </p>
          </div>
        </div>

        <div className="navbar-center">
          <div className="time-display">
            <span className="time-text">
              {time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="stats-section">
            <div className="live-stats">
              <div className="stat-item">
                <span className="stat-number">{totalCount.toLocaleString()}</span>
                <span className="stat-label">Voices</span>
                <div className="stat-glow"></div>
              </div>
              
              {connected > 0 && (
                <div className="connected-indicator">
                  <div className="pulse-dot"></div>
                  <span className="connected-text">{connected} listening</span>
                </div>
              )}
            </div>
          </div>

          <button 
            className={`stats-toggle-btn ${showStats ? 'active' : ''}`}
            onClick={onToggleStats}
            aria-label="Toggle statistics"
          >
            <div className="btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18m-9-9v18"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </div>
            <span className="btn-text">{showStats ? 'Hide' : 'Show'} Stats</span>
            <div className="btn-ripple"></div>
          </button>
        </div>
      </div>

      <div className="navbar-bottom-border">
        <div className="border-gradient"></div>
      </div>
    </nav>
  );
}
