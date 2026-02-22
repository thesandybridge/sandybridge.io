import { getWorkflowRuns, parseGitHubUrl, type WorkflowRun } from '@/lib/github';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import s from './StatusBadges.module.css';

interface StatusBadgesProps {
  github?: string;
  url?: string;
}

const statusIcons: Record<WorkflowRun['status'], typeof CheckCircle> = {
  success: CheckCircle,
  failure: XCircle,
  pending: Clock,
  in_progress: Loader,
};

const statusLabels: Record<WorkflowRun['status'], string> = {
  success: 'Passing',
  failure: 'Failing',
  pending: 'Pending',
  in_progress: 'Running',
};

const statusClasses: Record<WorkflowRun['status'], string> = {
  success: s.statusSuccess,
  failure: s.statusFailure,
  pending: s.statusPending,
  in_progress: s.statusInProgress,
};

export async function StatusBadges({ github }: StatusBadgesProps) {
  if (!github) return null;

  const parsed = parseGitHubUrl(github);
  if (!parsed) return null;

  const runs = await getWorkflowRuns(parsed.owner, parsed.repo);
  if (runs.length === 0) return null;

  // Get the most recent run
  const latestRun = runs[0];
  const Icon = statusIcons[latestRun.status];

  return (
    <div className={s.statusBadges}>
      <a
        href={latestRun.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${s.statusBadge} ${statusClasses[latestRun.status]}`}
        title={`${latestRun.name}: ${statusLabels[latestRun.status]}`}
      >
        <Icon size={12} />
        <span>CI: {statusLabels[latestRun.status]}</span>
      </a>
    </div>
  );
}
