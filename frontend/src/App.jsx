import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import WhisperWall from './components/WhisperWall';
import InputPanel from './components/InputPanel';
import ClusterKey from './components/ClusterKey';
import StatsBar from './components/StatsBar';
import './App.css';

const socket = io('http://localhost:3001');

// Cluster layout config (mirrors backend cluster_centroids table)
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
  const [whispers, setWhispers]       = useState([]);
  const [clusters, setClusters]       = useState({});
  const [totalCount, setTotalCount]   = useState(0);
  const [connected, setConnected]     = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [lastNew, setLastNew]         = useState(null);

  // Load existing whispers on mount
  useEffect(() => {
    fetch('/api/whispers')
      .then(r => r.json())
      .then(({ whispers: w }) => {
        setWhispers(w);
        setTotalCount(w.length);
        // Build cluster counts
        const counts = {};
        w.forEach(wh => counts[wh.cluster] = (counts[wh.cluster] || 0) + 1);
        setClusters(counts);
      });

    // Real-time: listen for new whispers from any user in the world
    socket.on('new_whisper', (whisper) => {
      setWhispers(prev => [...prev, whisper]);
      setTotalCount(prev => prev + 1);
      setClusters(prev => ({ ...prev, [whisper.cluster]: (prev[whisper.cluster] || 0) + 1 }));
      setLastNew(whisper);
    });

    socket.on('stats', ({ total, connected }) => {
      setTotalCount(total);
      setConnected(connected);
    });

    return () => {
      socket.off('new_whisper');
      socket.off('stats');
    };
  }, []);

  // Submit a new whisper
  async function handleSubmit(text) {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // Socket.io broadcasts to everyone incl. us — no need to manually add
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>The Unsaid Archive</h1>
          <p>Anonymous · Real-time · Women's Day 2026</p>
        </div>
        <div className="live-count">
          <span className="live-dot" />
          <strong>{totalCount}</strong> whispers · {connected} listening
        </div>
      </header>

      <WhisperWall
        whispers={whispers}
        clusters={CLUSTER_CONFIG}
        lastNew={lastNew}
      />

      <StatsBar
        total={totalCount}
        clusterCounts={clusters}
        config={CLUSTER_CONFIG}
      />

      <ClusterKey
        clusterCounts={clusters}
        config={CLUSTER_CONFIG}
      />

      <InputPanel
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
