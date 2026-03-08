export default function StatsBar({ total, clusterCounts, config }) {
  const activeClusterCount = Object.values(clusterCounts).filter(c => c > 0).length;
  const connected = Object.values(clusterCounts).reduce((sum, c) => sum + (c > 1 ? c - 1 : 0), 0);

  return (
    <div className="stats-bar">
      <div className="stat">
        <div className="stat-num">{total}</div>
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
    </div>
  );
}
