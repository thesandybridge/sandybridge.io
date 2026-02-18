import Link from 'next/link';
import { NotFoundPath } from '@/components/NotFoundPath';

export default function NotFound() {
  return (
    <div className="not-found">
      <pre className="not-found-ascii" aria-hidden="true">
{` █  █  ███  █  █
 █  █ █   █ █  █
 ████ █   █ ████
    █ █   █    █
    █  ███     █`}
      </pre>
      <div className="not-found-terminal">
        <div className="not-found-line">
          <span className="not-found-prompt">guest@sandybridge:~$</span> cd <NotFoundPath />
        </div>
        <div className="not-found-line not-found-error">
          bash: cd: No such file or directory
        </div>
        <div className="not-found-line">
          <span className="not-found-prompt">guest@sandybridge:~$</span> ls
        </div>
        <div className="not-found-line">
          home&nbsp;&nbsp;blog&nbsp;&nbsp;portfolio&nbsp;&nbsp;uses
        </div>
      </div>
      <div className="not-found-actions">
        <Link href="/">cd ~</Link>
        <span className="not-found-hint">
          Press <kbd>Ctrl+K</kbd> to open command palette
        </span>
      </div>
    </div>
  );
}
