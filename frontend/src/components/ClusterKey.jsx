export default function ClusterKey({ clusterCounts, config }) {
  return (
    <div className="cluster-key">
      {Object.entries(config).map(([key, cfg]) => {
        const count  = clusterCounts[key] || 0;
        const active = count > 0;
        return (
          <div key={key} className={`key-item ${active ? 'active' : ''}`}>
            <span
              className="key-dot"
              style={{ background: cfg.color, boxShadow: active ? `0 0 6px ${cfg.color}` : 'none' }}
            />
            {cfg.label}
            {active && <span className="key-count">{count}</span>}
          </div>
        );
      })}
    </div>
  );
}
