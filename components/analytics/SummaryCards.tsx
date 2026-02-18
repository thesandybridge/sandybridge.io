export function SummaryCards({
  totalViews,
  viewsThisWeek,
  topPost,
  avgViews,
}: {
  totalViews: number;
  viewsThisWeek: number;
  topPost: string;
  avgViews: number;
}) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-value">{totalViews.toLocaleString()}</span>
        <span className="stat-label">Total Views</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{viewsThisWeek.toLocaleString()}</span>
        <span className="stat-label">Views This Week</span>
      </div>
      <div className="stat-card">
        <span className="stat-value" style={{ fontSize: '1rem', wordBreak: 'break-word', textAlign: 'center' }}>{topPost || '—'}</span>
        <span className="stat-label">Most Popular</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{avgViews.toLocaleString()}</span>
        <span className="stat-label">Avg Views/Post</span>
      </div>
    </div>
  );
}
