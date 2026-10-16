export interface RepoStats {
  stars: number;
  commits: number;
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

