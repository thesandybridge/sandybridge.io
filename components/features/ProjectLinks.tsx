import Link from 'next/link';
import { Github, ExternalLink, FileText, Package } from 'lucide-react';

interface ProjectLinksProps {
  github?: string;
  url?: string;
  blog?: string;
  npm?: string;
}

export function ProjectLinks({ github, url, blog, npm }: ProjectLinksProps) {
  if (!github && !url && !blog && !npm) return null;

  return (
    <div className="project-links">
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
          <Github size={20} className="project-icon" />
        </a>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Live site">
          <ExternalLink size={20} className="project-icon" />
        </a>
      )}
      {npm && (
        <a href={npm} target="_blank" rel="noopener noreferrer" aria-label="npm package">
          <Package size={20} className="project-icon" />
        </a>
      )}
      {blog && (
        <Link href={blog} aria-label="Blog post">
          <FileText size={20} className="project-icon" />
        </Link>
      )}
    </div>
  );
}
