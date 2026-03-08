import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import WhisperWall from './components/WhisperWall';
import InputPanel from './components/InputPanel';
import ClusterKey from './components/ClusterKey';
import StatsBar from './components/StatsBar';
import './App.css';

const socket = io('http://localhost:3001');

export const CLUSTER_CONFIG = {
  work:  { label:'Workplace',     color:'#e8a0bf', cx:0.25, cy:0.30 },
  body:  { label:'Body',          color:'#a78bfa', cx:0.75, cy:0.25 },
  home:  { label:'Home & Family', color:'#f59e7a', cx:0.22, cy:0.72 },
  anger: { label:'Anger',         color:'#fb7185', cx:0.78, cy:0.68 },
  dream: { label:'Ambition',      color:'#67e8f9', cx:0.50, cy:0.18 },
  love:  { label:'Love',          color:'#f0abfc', cx:0.82, cy:0.45 },
  worth: { label:'Self-Worth',    color:'#86efac', cx:0.18, cy:0.50 },
  voice: { label:'Voice',         color:'#fde68a', cx:0.50, cy:0.80 },
};

export default function App() {
  const [whispers, setWhispers] = useState([]);
  const [clusters, setClusters] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [connected, setConnected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastNew, setLastNew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showStats, setShowStats] = useState(true);
  const connectionTimeoutRef = useRef(null);

  const fetchWhispers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/whispers');
      if (!response.ok) throw new Error('Failed to fetch whispers');
      const { whispers: w } = await response.json();
      setWhispers(w);
      setTotalCount(w.length);
      const counts = {};
      w.forEach(wh => counts[wh.cluster] = (counts[wh.cluster] || 0) + 1);
      setClusters(counts);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching whispers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWhispers();

    connectionTimeoutRef.current = setTimeout(() => {
      if (!socket.connected) {
        setError('Connection timeout. Please refresh the page.');
      }
    }, 5000);

    socket.on('connect', () => {
      setError(null);
      clearTimeout(connectionTimeoutRef.current);
    });

    socket.on('disconnect', () => {
      setError('Connection lost. Trying to reconnect...');
    });

    socket.on('new_whisper', (whisper) => {
      setWhispers(prev => [...prev, whisper]);
      setTotalCount(prev => prev + 1);
      setClusters(prev => ({ ...prev, [whisper.cluster]: (prev[whisper.cluster] || 0) + 1 }));
      setLastNew(whisper);
    });

    socket.on('stats', (stats) => {
      setTotalCount(stats.total);
      setConnected(stats.connected);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_whisper');
      socket.off('stats');
      clearTimeout(connectionTimeoutRef.current);
    };
  }, [fetchWhispers]);

  const handleSubmit = useCallback(async (text) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit whisper');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error submitting whisper:', err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const filteredWhispers = filter === 'all' 
    ? whispers 
    : whispers.filter(w => w.cluster === filter);

  const handleRetry = () => {
    fetchWhispers();
  };

  const toggleFilter = (cluster) => {
    setFilter(prev => prev === cluster ? 'all' : cluster);
  };

  if (loading && whispers.length === 0) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading whispers...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>The Unsaid Archive</h1>
          <p className="tagline">Anonymous whispers, shared souls</p>
        </div>
        <div className="live-count">
          <span className="count">{totalCount.toLocaleString()}</span>
          <span className="label">voices</span>
          {connected > 0 && <span className="connected">{connected} listening</span>}
        </div>
        <button 
          className="stats-toggle"
          onClick={() => setShowStats(!showStats)}
          aria-label="Toggle statistics"
        >
          {showStats ? 'Hide' : 'Show'} Stats
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      {showStats && (
        <StatsBar 
          clusterCounts={clusters}
          config={CLUSTER_CONFIG}
          onFilterClick={toggleFilter}
          activeFilter={filter}
        />
      )}

      <main className="app-main">
        <div className="whisper-container">
          <WhisperWall 
            whispers={filteredWhispers}
            clusters={clusters}
            lastNew={lastNew}
            config={CLUSTER_CONFIG}
          />
        </div>
        
        <aside className="sidebar">
          <ClusterKey 
            clusterCounts={clusters}
            config={CLUSTER_CONFIG}
            onFilterClick={toggleFilter}
            activeFilter={filter}
          />
          <InputPanel 
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>Your whispers are anonymous and permanent</p>
        <div className="connection-status">
          <span className={`status-indicator ${socket.connected ? 'connected' : 'disconnected'}`}></span>
          {socket.connected ? 'Connected' : 'Reconnecting...'}
        </div>
      </footer>
    </div>
  );
}
