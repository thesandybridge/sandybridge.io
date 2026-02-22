'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Share2, Twitter, Linkedin, MessageSquare, Link2, Check } from 'lucide-react';
import s from './Share.module.css';

interface ShareProps {
  title: string;
}

export function Share({ title }: ShareProps) {
  const pathname = usePathname();
  const url = `https://sandybridge.io${pathname}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  const shareLinks = [
    {
      name: 'X',
      icon: Twitter,
      href: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Reddit',
      icon: MessageSquare,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button className={s.shareTrigger} aria-label="Share">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={s.shareDropdown} sideOffset={8} align="start">
          {shareLinks.map((link) => (
            <DropdownMenu.Item key={link.name} asChild>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={s.shareDropdownItem}
              >
                <link.icon size={16} />
                <span>{link.name}</span>
              </a>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className={s.shareDropdownSeparator} />
          <DropdownMenu.Item className={s.shareDropdownItem} onSelect={handleCopy}>
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
