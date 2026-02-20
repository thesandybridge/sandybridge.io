import { execSync } from 'child_process';

export interface ChangelogEntry {
  hash: string;
  date: string;
  message: string;
  body?: string;
}

export function getChangelog(limit = 50): ChangelogEntry[] {
  try {
    const log = execSync(
      `git log --pretty=format:"%H|%cs|%s|%b<<<END>>>" -n ${limit}`,
      { encoding: 'utf-8', cwd: process.cwd() }
    );

    return log
      .split('<<<END>>>')
      .filter((entry) => entry.trim())
      .map((entry) => {
        const [hash, date, message, ...bodyParts] = entry.trim().split('|');
        const body = bodyParts.join('|').trim();
        return {
          hash: hash.slice(0, 7),
          date,
          message,
          body: body || undefined,
        };
      });
  } catch {
    return [];
  }
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
