import { useState, useEffect, useRef } from 'react';

export default function ClusterVisualization({ clusterCounts, config, onFilterClick, activeFilter }) {
  const canvasRef = useRef(null);
  const [hoveredCluster, setHoveredCluster] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const animate = () => {
      time += 0.01;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw constellation connections
      Object.entries(config).forEach(([key, cfg], index) => {
        const count = clusterCounts[key] || 0;
        if (count === 0) return;

        const angle = (index / Object.keys(config).length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.3;
        const x = centerX + Math.cos(angle + time * 0.1) * radius;
        const y = centerY + Math.sin(angle + time * 0.1) * radius;

        // Draw connections to other clusters
        Object.entries(config).forEach(([otherKey, otherCfg], otherIndex) => {
          if (key === otherKey) return;
          const otherCount = clusterCounts[otherKey] || 0;
          if (otherCount === 0) return;

          const otherAngle = (otherIndex / Object.keys(config).length) * Math.PI * 2;
          const otherX = centerX + Math.cos(otherAngle + time * 0.1) * radius;
          const otherY = centerY + Math.sin(otherAngle + time * 0.1) * radius;

          const distance = Math.hypot(x - otherX, y - otherY);
          if (distance < width * 0.4) {
            const opacity = Math.max(0, 1 - distance / (width * 0.4)) * 0.3;
            ctx.strokeStyle = cfg.color;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(otherX, otherY);
            ctx.stroke();
          }
        });
      });

      // Draw cluster nodes
      Object.entries(config).forEach(([key, cfg], index) => {
        const count = clusterCounts[key] || 0;
        if (count === 0) return;

        const angle = (index / Object.keys(config).length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.3;
        const x = centerX + Math.cos(angle + time * 0.1) * radius;
        const y = centerY + Math.sin(angle + time * 0.1) * radius;

        const nodeRadius = Math.max(15, Math.min(40, count * 2));
        const isHovered = hoveredCluster === key;
        const isActive = activeFilter === key;

        // Outer glow
        if (isHovered || isActive) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 2);
          gradient.addColorStop(0, cfg.color + '40');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main node
        const nodeGradient = ctx.createRadialGradient(x - nodeRadius/3, y - nodeRadius/3, 0, x, y, nodeRadius);
        nodeGradient.addColorStop(0, cfg.color);
        nodeGradient.addColorStop(0.7, cfg.color + 'cc');
        nodeGradient.addColorStop(1, cfg.color + '88');
        
        ctx.fillStyle = nodeGradient;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.strokeStyle = cfg.color;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius + 5 + Math.sin(time * 2 + index) * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Cluster label
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.font = 'bold 11px "DM Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.label, x, y);

        // Count
        ctx.font = '9px "DM Mono", monospace';
        ctx.globalAlpha = 0.8;
        ctx.fillText(count.toString(), x, y + 12);
      });

      // Center core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20);
      coreGradient.addColorStop(0, '#ffffff40');
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [clusterCounts, config, hoveredCluster, activeFilter]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Check if hovering over a cluster
    const width = canvasRef.current.offsetWidth;
    const height = canvasRef.current.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    let foundCluster = null;
    Object.entries(config).forEach(([key, cfg], index) => {
      const count = clusterCounts[key] || 0;
      if (count === 0) return;

      const angle = (index / Object.keys(config).length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const nodeRadius = Math.max(15, Math.min(40, count * 2));

      const distance = Math.hypot(mousePos.x - x, mousePos.y - y);
      if (distance < nodeRadius + 10) {
        foundCluster = key;
      }
    });

    setHoveredCluster(foundCluster);
  };

  const handleClick = () => {
    if (hoveredCluster) {
      onFilterClick(hoveredCluster);
    }
  };

  return (
    <div className="cluster-visualization">
      <div className="viz-header">
        <h3>Cluster Constellation</h3>
        <p>Interactive cluster relationships</p>
      </div>
      
      <div className="viz-container">
        <canvas
          ref={canvasRef}
          className="cluster-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCluster(null)}
          onClick={handleClick}
        />
        
        {hoveredCluster && (
          <div 
            className="cluster-tooltip"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y - 40}px`
            }}
          >
            <div className="tooltip-content">
              <span style={{ color: config[hoveredCluster]?.color }}>
                {config[hoveredCluster]?.label}
              </span>
              <span>{clusterCounts[hoveredCluster] || 0} whispers</span>
            </div>
          </div>
        )}
      </div>

      <div className="viz-controls">
        <button 
          className="clear-filter-btn"
          onClick={() => onFilterClick('all')}
          style={{ opacity: activeFilter === 'all' ? 0.5 : 1 }}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}
