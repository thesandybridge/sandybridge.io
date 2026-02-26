import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getChangelog, groupChangelogByDate } from '~/lib/changelog'
import s from '~/styles/changelog.module.css'

const fetchChangelog = createServerFn({ method: 'GET' }).handler(async () => {
  const entries = getChangelog(100)
  return { entries, grouped: groupChangelogByDate(entries) }
})

export const Route = createFileRoute('/changelog')({
  loader: () => fetchChangelog(),
  head: () => ({
    meta: [
      { title: 'Changelog | sandybridge.io' },
      { name: 'description', content: 'Recent changes and updates to this site.' },
    ],
  }),
  component: ChangelogPage,
})

function ChangelogPage() {
  const { entries, grouped } = Route.useLoaderData()
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

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
  )
}
