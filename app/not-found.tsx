import Link from 'next/link';
import { NotFoundPath } from '@/components/features';
import s from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={s.notFound}>
      <pre className={s.ascii} aria-hidden="true">
{` █  █  ███  █  █
 █  █ █   █ █  █
 ████ █   █ ████
    █ █   █    █
    █  ███     █`}
      </pre>
      <div className={s.terminal}>
        <div className={s.line}>
          <span className={s.prompt}>guest@sandybridge:~$</span> cd <NotFoundPath />
        </div>
        <div className={`${s.line} ${s.error}`}>
          bash: cd: No such file or directory
        </div>
        <div className={s.line}>
          <span className={s.prompt}>guest@sandybridge:~$</span> ls
        </div>
        <div className={s.line}>
          home&nbsp;&nbsp;blog&nbsp;&nbsp;portfolio&nbsp;&nbsp;uses
        </div>
      </div>
      <div className={s.actions}>
        <Link href="/">cd ~</Link>
        <span className={s.hint}>
          Press <kbd>Ctrl+K</kbd> to open command palette
        </span>
      </div>
    </div>
  );
}
