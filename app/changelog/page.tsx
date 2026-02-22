import type { Metadata } from 'next';
import { getChangelog, groupChangelogByDate } from '@/lib/changelog';
import s from './changelog.module.css';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent changes and updates to this site.',
};

export const revalidate = 3600; // Revalidate every hour

export default function ChangelogPage() {
  const entries = getChangelog(100);
  const grouped = groupChangelogByDate(entries);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <h1>Changelog</h1>
      <p>Recent changes and updates to this site, automatically generated from git history.</p>

      <div className={s.changelog}>
        {dates.map((date) => (
          <div key={date} className={s.day}>
            <h2 className={s.date}>{date}</h2>
            <ul className={s.entries}>
              {grouped[date].map((entry) => (
                <li key={entry.hash} className={s.entry}>
                  <code className={s.hash}>{entry.hash}</code>
                  <span className={s.message}>{entry.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className={s.emptyState}>No changelog entries found.</p>
      )}
    </>
  );
}
