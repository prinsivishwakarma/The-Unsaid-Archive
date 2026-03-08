import React, { useState } from 'react';

export default function DebugPanel({ socket, onAddSampleData }) {
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="debug-panel">
      <button 
        className="debug-toggle"
        onClick={() => setIsVisible(!isVisible)}
      >
        Debug
      </button>
      
      {isVisible && (
        <div className="debug-content">
          <h4>Debug Panel</h4>
          <div className="debug-info">
            <p><strong>Socket Status:</strong> {socket.connected ? 'Connected' : 'Disconnected'}</p>
            <p><strong>Socket ID:</strong> {socket.id || 'N/A'}</p>
          </div>
          
          <div className="debug-actions">
            <button onClick={onAddSampleData} className="debug-btn">
              Add Sample Whispers
            </button>
            <button onClick={() => window.location.reload()} className="debug-btn">
              Reload Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
