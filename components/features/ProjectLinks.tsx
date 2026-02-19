import Link from 'next/link';
import { Github, ExternalLink, FileText } from 'lucide-react';

interface ProjectLinksProps {
  github?: string;
  url?: string;
  blog?: string;
}

export function ProjectLinks({ github, url, blog }: ProjectLinksProps) {
  if (!github && !url && !blog) return null;

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
      {blog && (
        <Link href={blog} aria-label="Blog post">
          <FileText size={20} className="project-icon" />
        </Link>
      )}
    </div>
  );
}
