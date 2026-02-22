import s from './SummaryCards.module.css';

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
    <div className={s.grid}>
      <div className={s.card}>
        <span className={s.value}>{totalViews.toLocaleString()}</span>
        <span className={s.label}>Total Views</span>
      </div>
      <div className={s.card}>
        <span className={s.value}>{viewsThisWeek.toLocaleString()}</span>
        <span className={s.label}>Views This Week</span>
      </div>
      <div className={s.card}>
        <span className={s.value} style={{ fontSize: '1rem', wordBreak: 'break-word', textAlign: 'center' }}>{topPost || '—'}</span>
        <span className={s.label}>Most Popular</span>
      </div>
      <div className={s.card}>
        <span className={s.value}>{avgViews.toLocaleString()}</span>
        <span className={s.label}>Avg Views/Post</span>
      </div>
    </div>
  );
}
