import { useRef, useEffect, useCallback } from 'react';

// Each whisper rendered as floating italic text on canvas
// Cluster members glow brighter together
// Connection lines drawn between same-cluster whispers

export default function WhisperWall({ whispers, clusters, lastNew }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef([]);   // live whisper objects with positions
  const rafRef     = useRef(null);

  // Convert incoming whisper data → renderable object with position + physics
  const addWhisperObj = useCallback((whisper, allWhispers) => {
    const cfg = clusters[whisper.cluster];
    if (!cfg) return null;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = cfg.cx * W;
    const cy = cfg.cy * H;

    // Count existing in this cluster to determine orbit radius
    const clusterCount = stateRef.current.filter(w => w.cluster === whisper.cluster).length;
    const radius = 80 + clusterCount * 22 + Math.random() * 50;
    const angle  = Math.random() * Math.PI * 2;

    return {
      id:      whisper.id,
      text:    whisper.text,
      cluster: whisper.cluster,
      color:   cfg.color,
      x: Math.max(80, Math.min(W - 80, cx + Math.cos(angle) * radius)),
      y: Math.max(80, Math.min(H - 200, cy + Math.sin(angle) * radius * 0.7)),
      opacity:       0,
      targetOpacity: 0.16 + Math.random() * 0.22,
      fontSize:      11 + Math.random() * 4,
      phase:         Math.random() * Math.PI * 2,
      speed:         0.0003 + Math.random() * 0.0003,
      driftX:        (Math.random() - 0.5) * 0.14,
      driftY:        (Math.random() - 0.5) * 0.07,
      hovered:       false,
    };
  }, [clusters]);

  // Initialize whisper objects from loaded data
  useEffect(() => {
    stateRef.current = [];
    whispers.forEach(w => {
      const obj = addWhisperObj(w, whispers);
      if (obj) { obj.opacity = obj.targetOpacity; stateRef.current.push(obj); }
    });
  }, []);  // only on mount

  // Handle new arrivals in real-time
  useEffect(() => {
    if (!lastNew) return;
    const exists = stateRef.current.find(w => w.id === lastNew.id);
    if (exists) return;
    const obj = addWhisperObj(lastNew, whispers);
    if (obj) stateRef.current.push(obj);
  }, [lastNew]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    function frame(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = stateRef.current;

      // Draw cluster connection lines
      Object.keys(clusters).forEach(key => {
        const group = state.filter(w => w.cluster === key);
        if (group.length < 2) return;
        const cfg   = clusters[key];
        const alpha = Math.min(group.length * 0.025, 0.1);
        ctx.save();
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth   = 0.5;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = cfg.color;
        ctx.shadowBlur  = 8;
        for (let i = 0; i < group.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(group[i].x, group[i].y);
          ctx.lineTo(group[i + 1].x, group[i + 1].y);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw whispers
      state.forEach(w => {
        // Physics: drift + boundary bounce
        w.x += w.driftX;
        w.y += w.driftY;
        if (w.x < 60 || w.x > canvas.width - 60)  w.driftX *= -1;
        if (w.y < 60 || w.y > canvas.height - 180) w.driftY *= -1;

        // Fade in
        if (w.opacity < w.targetOpacity) w.opacity += 0.004;

        // Breathing
        const breath  = Math.sin(t * w.speed + w.phase);
        const clusterSize = state.filter(s => s.cluster === w.cluster).length;
        const glowBoost   = Math.min(clusterSize * 2.5, 22);
        const alpha = w.hovered ? 0.95 : w.opacity * (0.85 + breath * 0.15);

        ctx.save();
        ctx.globalAlpha  = alpha;
        ctx.font         = `italic ${w.hovered ? w.fontSize + 2 : w.fontSize}px 'EB Garamond', serif`;
        ctx.fillStyle    = w.color;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor  = w.color;
        ctx.shadowBlur   = w.hovered ? 30 : glowBoost;

        const display = w.text.length > 40 ? w.text.slice(0, 38) + '…' : w.text;
        ctx.fillText(display, w.x, w.y);
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [clusters]);

  // Hover detection
  const handleMouseMove = useCallback(e => {
    const mx = e.clientX, my = e.clientY;
    stateRef.current.forEach(w => {
      const dist = Math.hypot(mx - w.x, my - w.y);
      w.hovered  = dist < 90;
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="whisper-wall"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => stateRef.current.forEach(w => w.hovered = false)}
    />
  );
}
