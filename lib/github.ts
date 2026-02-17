export interface RepoStats {
  stars: number;
  language: string | null;
  lastPush: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function getRepoStats(owner: string, repo: string): Promise<RepoStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
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
