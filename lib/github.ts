export interface RepoStats {
  stars: number;
  language: string | null;
  lastPush: string;
}

export interface WorkflowRun {
  name: string;
  status: 'success' | 'failure' | 'pending' | 'in_progress';
  conclusion: string | null;
  updatedAt: string;
  url: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

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
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function getRepoStats(owner: string, repo: string): Promise<RepoStats | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getGitHubHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      stars: data.stargazers_count ?? 0,
      language: data.language ?? null,
      lastPush: data.pushed_at ? new Date(data.pushed_at).toISOString().split('T')[0] : '',
    };
  } catch {
    return null;
  }
}

export async function getWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`,
      {
        headers: getGitHubHeaders(),
        next: { revalidate: 300 },
      }
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

export async function getContributions(username: string): Promise<ContributionDay[]> {
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
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
