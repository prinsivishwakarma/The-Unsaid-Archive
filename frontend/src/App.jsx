import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import WhisperWall from './components/WhisperWall';
import InputPanel from './components/InputPanel';
import ClusterKey from './components/ClusterKey';
import StatsBar from './components/StatsBar';
import LoadingSpinner from './components/LoadingSpinner';
import DebugPanel from './components/DebugPanel';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import ClusterVisualization from './components/ClusterVisualization';
import SimpleBackground from './components/SimpleBackground';
import './App.css';

const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 5000
});

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
      console.log('Connected to server');
      setError(null);
      clearTimeout(connectionTimeoutRef.current);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setError('Connection lost. Trying to reconnect...');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError(`Connection error: ${error.message}`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setError(null);
    });

    socket.on('new_whisper', (whisper) => {
      console.log('New whisper received:', whisper);
      setWhispers(prev => [...prev, whisper]);
      setTotalCount(prev => prev + 1);
      setClusters(prev => ({ ...prev, [whisper.cluster]: (prev[whisper.cluster] || 0) + 1 }));
      setLastNew(whisper);
    });

    socket.on('stats', (stats) => {
      console.log('Stats received:', stats);
      setTotalCount(stats.total);
      setConnected(stats.connected);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect');
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

  const addSampleWhispers = useCallback(async () => {
    const sampleWhispers = [
      "I was told to smile and be quiet at work",
      "My body doesn't feel like mine anymore",
      "I love my family but they don't see me",
      "I'm so angry I could scream but no one would hear",
      "I dream of running away and starting over",
      "I love someone who doesn't know I exist",
      "I feel worthless most days",
      "I want to be heard but I'm afraid to speak"
    ];

    const clusters = ['work', 'body', 'home', 'anger', 'dream', 'love', 'worth', 'voice'];
    
    for (let i = 0; i < sampleWhispers.length; i++) {
      try {
        await fetch('/api/whisper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: sampleWhispers[i],
            cluster: clusters[i]
          })
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between submissions
      } catch (error) {
        console.error('Error adding sample whisper:', error);
      }
    }
    
    // Refresh the data after adding samples
    setTimeout(() => {
      fetchWhispers();
    }, 1000);
  }, [fetchWhispers]);

  if (loading) {
    return <LoadingSpinner message="Loading whispers from the archive..." />;
  }

  return (
    <div className="app">
      <SimpleBackground />
      
      <Navbar 
        totalCount={totalCount}
        connected={connected}
        onToggleStats={() => setShowStats(!showStats)}
        showStats={showStats}
      />
      
      <DebugPanel socket={socket} onAddSampleData={addSampleWhispers} />

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <main className="app-main" style={{ paddingTop: '100px' }}>
        <div className="content-grid">
          <div className="left-section">
            <ErrorBoundary>
              <ClusterVisualization 
                clusterCounts={clusters}
                config={CLUSTER_CONFIG}
                onFilterClick={toggleFilter}
                activeFilter={filter}
              />
            </ErrorBoundary>
            
            {showStats && (
              <ErrorBoundary>
                <StatsBar 
                  clusterCounts={clusters}
                  config={CLUSTER_CONFIG}
                  onFilterClick={toggleFilter}
                  activeFilter={filter}
                />
              </ErrorBoundary>
            )}
          </div>

          <div className="center-section">
            <ErrorBoundary>
              <div className="whisper-container">
                <WhisperWall 
                  whispers={filteredWhispers}
                  clusters={clusters}
                  lastNew={lastNew}
                  config={CLUSTER_CONFIG}
                />
              </div>
            </ErrorBoundary>
          </div>
          
          <div className="right-section">
            <ErrorBoundary>
              <ClusterKey 
                clusterCounts={clusters}
                config={CLUSTER_CONFIG}
                onFilterClick={toggleFilter}
                activeFilter={filter}
              />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <InputPanel 
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </ErrorBoundary>
          </div>
        </div>
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
