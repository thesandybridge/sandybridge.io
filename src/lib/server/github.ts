import { createAsyncCache } from './async-cache';
import type { RepoStats, WorkflowRun, ContributionDay } from '../types/github';
export type { RepoStats, WorkflowRun, ContributionDay } from '../types/github';
function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' || parsed.protocol !== 'https:') return null;
    const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  } catch { return null; }
}

async function getCommitCount(owner: string, repo: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      { headers: getGitHubHeaders(), signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return 0;
    const link = res.headers.get('Link');
    if (!link) return 1;
    const match = link.match(/page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

async function loadRepoStats(owner: string, repo: string): Promise<RepoStats | null> {
  try {
    const [res, commits] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: getGitHubHeaders(),
        signal: AbortSignal.timeout(5000),
      }),
      getCommitCount(owner, repo),
    ]);

    if (!res.ok) return null;

    const data = await res.json();
    return {
      stars: data.stargazers_count ?? 0,
      commits,
      language: data.language ?? null,
      lastPush: data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : '',
    };
  } catch {
    return null;
  }
}

async function loadWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`,
      { headers: getGitHubHeaders(), signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.workflow_runs || []).map((run: Record<string, unknown>) => ({
      name: run.name as string,
      status: mapWorkflowStatus(run.status as string, run.conclusion as string | null),
      conclusion: run.conclusion as string | null,
      updatedAt: run.updated_at as string,
      url: run.html_url as string,
    }));
  } catch {
    return [];
  }
}

function mapWorkflowStatus(status: string, conclusion: string | null): WorkflowRun['status'] {
  if (status === 'completed') {
    if (conclusion === 'success') return 'success';
    if (conclusion === 'failure' || conclusion === 'cancelled') return 'failure';
  }
  if (status === 'in_progress' || status === 'queued') return 'in_progress';
  return 'pending';
}

async function loadContributions(username: string): Promise<ContributionDay[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    return weeks.flatMap((week: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] ?? 0,
      }))
    );
  } catch {
    return [];
  }
}

const getRepoStatsCache = createAsyncCache<RepoStats | null>(64, 5 * 60 * 1000);
export function getRepoStats(owner: string, repo: string): Promise<RepoStats | null> {
  return getRepoStatsCache.get(`${owner}/${repo}`, () => loadRepoStats(owner, repo));
}

const getWorkflowRunsCache = createAsyncCache<WorkflowRun[]>(64, 5 * 60 * 1000);
export function getWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
  return getWorkflowRunsCache.get(`${owner}/${repo}`, () => loadWorkflowRuns(owner, repo));
}

const getContributionsCache = createAsyncCache<ContributionDay[]>(64, 5 * 60 * 1000);
export function getContributions(username: string): Promise<ContributionDay[]> {
  return getContributionsCache.get(username, () => loadContributions(username));
}
