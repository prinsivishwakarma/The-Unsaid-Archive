import { useRef, useEffect, useCallback, useState } from 'react';

export default function WhisperWall({ whispers, clusters, lastNew, config }) {
  const canvasRef = useRef(null);
  const stateRef = useRef([]);
  const rafRef = useRef(null);
  const [hoveredWhisper, setHoveredWhisper] = useState(null);
  const [showConnections, setShowConnections] = useState(true);

  const addWhisperObj = useCallback((whisper, allWhispers) => {
    const cfg = config[whisper.cluster];
    if (!cfg) return null;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = cfg.cx * W;
    const cy = cfg.cy * H;

    const clusterCount = stateRef.current.filter(w => w.cluster === whisper.cluster).length;
    const radius = 80 + clusterCount * 22 + Math.random() * 50;
    const angle = Math.random() * Math.PI * 2;

    return {
      id: whisper.id,
      text: whisper.text,
      cluster: whisper.cluster,
      color: cfg.color,
      x: Math.max(80, Math.min(W - 80, cx + Math.cos(angle) * radius)),
      y: Math.max(80, Math.min(H - 200, cy + Math.sin(angle) * radius * 0.7)),
      opacity: 0,
      targetOpacity: 0.16 + Math.random() * 0.22,
      fontSize: 11 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0003 + Math.random() * 0.0003,
      driftX: (Math.random() - 0.5) * 0.14,
      driftY: (Math.random() - 0.5) * 0.07,
      hovered: false,
      scale: 1,
      targetScale: 1,
      rotation: (Math.random() - 0.5) * 0.1,
      createdAt: Date.now(),
    };
  }, [config]);

  useEffect(() => {
    stateRef.current = [];
    whispers.forEach(w => {
      const obj = addWhisperObj(w, whispers);
      if (obj) { 
        obj.opacity = obj.targetOpacity; 
        stateRef.current.push(obj); 
      }
    });
  }, []);

  useEffect(() => {
    if (!lastNew) return;
    const exists = stateRef.current.find(w => w.id === lastNew.id);
    if (exists) return;
    const obj = addWhisperObj(lastNew, whispers);
    if (obj) {
      obj.scale = 0.5;
      obj.targetScale = 1.2;
      stateRef.current.push(obj);
      setTimeout(() => {
        obj.targetScale = 1;
      }, 500);
    }
  }, [lastNew, addWhisperObj, whispers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function frame(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = stateRef.current;

      if (showConnections) {
        Object.keys(config).forEach(key => {
          const group = state.filter(w => w.cluster === key);
          if (group.length < 2) return;
          const cfg = config[key];
          const alpha = Math.min(group.length * 0.025, 0.1);
          ctx.save();
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = cfg.color;
          ctx.shadowBlur = 8;
          
          for (let i = 0; i < group.length - 1; i++) {
            for (let j = i + 1; j < group.length; j++) {
              const dist = Math.hypot(group[i].x - group[j].x, group[i].y - group[j].y);
              if (dist < 200) {
                ctx.beginPath();
                ctx.moveTo(group[i].x, group[i].y);
                ctx.lineTo(group[j].x, group[j].y);
                ctx.stroke();
              }
            }
          }
          ctx.restore();
        });
      }

      state.forEach(w => {
        w.x += w.driftX;
        w.y += w.driftY;
        if (w.x < 60 || w.x > canvas.width - 60) w.driftX *= -1;
        if (w.y < 60 || w.y > canvas.height - 180) w.driftY *= -1;

        if (w.opacity < w.targetOpacity) w.opacity += 0.004;
        if (Math.abs(w.scale - w.targetScale) > 0.01) {
          w.scale += (w.targetScale - w.scale) * 0.1;
        }

        const breath = Math.sin(t * w.speed + w.phase);
        const clusterSize = state.filter(s => s.cluster === w.cluster).length;
        const glowBoost = Math.min(clusterSize * 2.5, 22);
        const alpha = w.hovered ? 0.95 : w.opacity * (0.85 + breath * 0.15);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(w.x, w.y);
        ctx.rotate(w.rotation + breath * 0.02);
        ctx.scale(w.scale, w.scale);
        
        ctx.font = `italic ${w.hovered ? w.fontSize + 2 : w.fontSize}px 'EB Garamond', serif`;
        ctx.fillStyle = w.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = w.color;
        ctx.shadowBlur = w.hovered ? 30 : glowBoost;

        const display = w.text.length > 40 ? w.text.slice(0, 38) + '…' : w.text;
        ctx.fillText(display, 0, 0);
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [config, showConnections]);

  const handleMouseMove = useCallback(e => {
    const mx = e.clientX, my = e.clientY;
    let foundHovered = null;
    
    stateRef.current.forEach(w => {
      const dist = Math.hypot(mx - w.x, my - w.y);
      const wasHovered = w.hovered;
      w.hovered = dist < 90;
      
      if (w.hovered && !wasHovered) {
        w.targetScale = 1.3;
        foundHovered = w;
      } else if (!w.hovered && wasHovered) {
        w.targetScale = 1;
      }
    });
    
    setHoveredWhisper(foundHovered);
  }, []);

  const handleClick = useCallback(e => {
    const mx = e.clientX, my = e.clientY;
    stateRef.current.forEach(w => {
      const dist = Math.hypot(mx - w.x, my - w.y);
      if (dist < 90) {
        navigator.clipboard.writeText(w.text);
      }
    });
  }, []);

  return (
    <div className="whisper-wall-container">
      <canvas
        ref={canvasRef}
        className="whisper-wall"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          stateRef.current.forEach(w => {
            w.hovered = false;
            w.targetScale = 1;
          });
          setHoveredWhisper(null);
        }}
        onClick={handleClick}
      />
      
      <div className="wall-controls">
        <button 
          className={`connections-toggle ${showConnections ? 'active' : ''}`}
          onClick={() => setShowConnections(!showConnections)}
        >
          {showConnections ? 'Hide' : 'Show'} Connections
        </button>
      </div>

      {hoveredWhisper && (
        <div className="whisper-tooltip">
          <div className="tooltip-content">
            <span className="tooltip-cluster" style={{ color: hoveredWhisper.color }}>
              {config[hoveredWhisper.cluster]?.label || hoveredWhisper.cluster}
            </span>
            <p className="tooltip-text">{hoveredWhisper.text}</p>
            <span className="tooltip-hint">Click to copy</span>
          </div>
        </div>
      )}
    </div>
  );
}
