'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const pathname = usePathname();
  const url = `https://sandybridge.io${pathname}`;
  const [copyText, setCopyText] = useState('Copy link');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy link'), 1000);
    });
  }, [url]);

  return (
    <div className="share-buttons">
      <span>Share:</span>
      <a
        href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Reddit
      </a>
      <button className="share-copy-link" onClick={handleCopy}>{copyText}</button>
    </div>
  );
}
