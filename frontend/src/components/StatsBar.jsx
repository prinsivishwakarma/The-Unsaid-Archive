export default function StatsBar({ clusterCounts, config, onFilterClick, activeFilter }) {
  const total = Object.values(clusterCounts).reduce((sum, count) => sum + count, 0);
  const activeClusterCount = Object.values(clusterCounts).filter(c => c > 0).length;
  const connected = Object.values(clusterCounts).reduce((sum, c) => sum + (c > 1 ? c - 1 : 0), 0);

  return (
    <div className="stats-bar">
      <div className="stat">
        <div className="stat-num">{total.toLocaleString()}</div>
        <div className="stat-label">Voices</div>
      </div>
      <div className="stat">
        <div className="stat-num">{activeClusterCount}</div>
        <div className="stat-label">Themes</div>
      </div>
      <div className="stat">
        <div className="stat-num">{connected}</div>
        <div className="stat-label">Connected</div>
      </div>
      
      <div className="cluster-stats">
        {Object.entries(config).map(([key, cfg]) => {
          const count = clusterCounts[key] || 0;
          const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
          const isActive = activeFilter === key;
          
          return (
            <button
              key={key}
              className={`cluster-stat ${count > 0 ? 'active' : ''} ${isActive ? 'filtering' : ''}`}
              onClick={() => onFilterClick && onFilterClick(key)}
              disabled={count === 0}
              style={{ '--cluster-color': cfg.color }}
            >
              <div className="cluster-info">
                <span className="cluster-name">{cfg.label}</span>
                <span className="cluster-count">{count}</span>
              </div>
              <div className="cluster-bar">
                <div 
                  className="cluster-fill" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {isActive && (
                <span className="filter-indicator">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
