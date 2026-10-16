import metadata from '../generated/git-metadata.json';

export interface ChangelogEntry {
  hash: string;
  date: string;
  message: string;
  body?: string;
}

export function getChangelog(limit = 50): ChangelogEntry[] {
  return metadata.changelog.slice(0, Math.max(0, Math.min(limit, 100)));
}

export function groupChangelogByDate(entries: ChangelogEntry[]): Record<string, ChangelogEntry[]> {
  const grouped: Record<string, ChangelogEntry[]> = {};

  for (const entry of entries) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    grouped[entry.date].push(entry);
  }

  return grouped;
}
