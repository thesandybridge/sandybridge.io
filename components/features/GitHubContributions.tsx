import { getContributions, type ContributionDay } from '@/lib/github';

interface GitHubContributionsProps {
  username: string;
}

const levelColors = [
  'var(--secondary-bg)',
  'rgba(var(--secondary-fg-rgb), 0.25)',
  'rgba(var(--secondary-fg-rgb), 0.5)',
  'rgba(var(--secondary-fg-rgb), 0.75)',
  'var(--secondary-fg)',
] as const;

function groupByWeek(days: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of days) {
    const date = new Date(day.date);
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

export async function GitHubContributions({ username }: GitHubContributionsProps) {
  const contributions = await getContributions(username);

  if (contributions.length === 0) {
    return null;
  }

  const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);
  const weeks = groupByWeek(contributions);

  // Only show the last ~20 weeks for a compact view
  const recentWeeks = weeks.slice(-20);

  return (
    <div className="github-contributions">
      <div className="contributions-header">
        <span className="contributions-total">
          {totalContributions.toLocaleString()} contributions in the last year
        </span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="contributions-link"
        >
          @{username}
        </a>
      </div>
      <div className="contributions-graph">
        {recentWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="contributions-week">
            {week.map((day) => (
              <div
                key={day.date}
                className="contributions-day"
                style={{ backgroundColor: levelColors[day.level] }}
                title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="contributions-legend">
        <span>Less</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className="contributions-day"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
