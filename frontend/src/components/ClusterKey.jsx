export default function ClusterKey({ clusterCounts, config, onFilterClick, activeFilter }) {
  return (
    <div className="cluster-key">
      <h4>Clusters</h4>
      <div className="key-grid">
        {Object.entries(config).map(([key, cfg]) => {
          const count = clusterCounts[key] || 0;
          const active = count > 0;
          const isActive = activeFilter === key;
          
          return (
            <button
              key={key}
              className={`key-item ${active ? 'active' : ''} ${isActive ? 'filtering' : ''}`}
              onClick={() => onFilterClick && onFilterClick(key)}
              disabled={!active}
            >
              <span
                className="key-dot"
                style={{ 
                  background: cfg.color, 
                  boxShadow: active ? `0 0 8px ${cfg.color}` : 'none',
                  opacity: active ? 1 : 0.3
                }}
              />
              <span className="key-label">{cfg.label}</span>
              {active && (
                <span className="key-count">{count}</span>
              )}
              {isActive && (
                <span className="filter-indicator">✓</span>
              )}
            </button>
          );
        })}
        
        {activeFilter !== 'all' && (
          <button
            className="key-item clear-filter"
            onClick={() => onFilterClick && onFilterClick('all')}
          >
            <span className="key-dot" style={{ background: 'var(--muted)' }} />
            <span className="key-label">Clear Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}
