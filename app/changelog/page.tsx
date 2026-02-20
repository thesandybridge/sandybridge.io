import type { Metadata } from 'next';
import { getChangelog, groupChangelogByDate } from '@/lib/changelog';

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

      <div className="changelog">
        {dates.map((date) => (
          <div key={date} className="changelog-day">
            <h2 className="changelog-date">{date}</h2>
            <ul className="changelog-entries">
              {grouped[date].map((entry) => (
                <li key={entry.hash} className="changelog-entry">
                  <code className="changelog-hash">{entry.hash}</code>
                  <span className="changelog-message">{entry.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="empty-state">No changelog entries found.</p>
      )}
    </>
  );
}
