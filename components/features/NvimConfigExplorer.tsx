'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Copy, Check, ExternalLink, FolderOpen } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import s from './NvimConfigExplorer.module.css';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileContent {
  path: string;
  content: string;
  highlighted: string;
  language: string;
}

function FileTreeNode({
  node,
  level,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
}: {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const paddingLeft = level * 16 + 8;

  if (node.type === 'directory') {
    return (
      <div>
        <button
          className={`${s.fileTreeItem} ${s.directory}${isExpanded ? ` ${s.expanded}` : ''}`}
          style={{ paddingLeft }}
          onClick={() => onToggle(node.path)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} />
          <span>{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                selectedPath={selectedPath}
                expandedPaths={expandedPaths}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={`${s.fileTreeItem}${isSelected ? ` ${s.selected}` : ''}`}
      style={{ paddingLeft }}
      onClick={() => onSelect(node.path)}
    >
      <File size={14} />
      <span>{node.name}</span>
    </button>
  );
}

export function NvimConfigExplorer() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['lua', 'lua/plugins', 'lua/thesbx', 'after', 'after/plugin']));
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  // Fetch file tree on mount
  useEffect(() => {
    fetch('/api/nvim-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTree(data.tree);
          // Auto-select init.lua if it exists
          const initLua = data.tree.find((n: FileNode) => n.name === 'init.lua');
          if (initLua) {
            setSelectedPath(initLua.path);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load config');
        setLoading(false);
      });
  }, []);

  // Fetch file content when selection changes
  useEffect(() => {
    if (!selectedPath) {
      setFileContent(null);
      return;
    }

    setLoadingFile(true);
    fetch(`/api/nvim-config?file=${encodeURIComponent(selectedPath)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setFileContent(null);
        } else {
          setFileContent(data);
        }
        setLoadingFile(false);
      })
      .catch(() => {
        setFileContent(null);
        setLoadingFile(false);
      });
  }, [selectedPath]);

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback((path: string) => {
    setSelectedPath(path);
    setMobileTreeOpen(false); // Close accordion on mobile when file selected
  }, []);

  const handleCopy = useCallback(async () => {
    if (!fileContent) return;
    try {
      await navigator.clipboard.writeText(fileContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = fileContent.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fileContent]);

  if (loading) {
    return (
      <div className={s.explorer}>
        <div className={s.sidebar}>
          <div className={s.header}>
            <Folder size={14} />
            <span>~/.config/nvim</span>
          </div>
          <div className={s.fileTree} style={{ padding: '0.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <Skeleton height="1.5rem" />
              </div>
            ))}
          </div>
        </div>
        <div className={s.content}>
          <div className={s.fileHeader}>
            <Skeleton width="40%" height="1rem" />
          </div>
          <div className={s.code} style={{ padding: '1rem' }}>
            {[...Array(15)].map((_, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <Skeleton width={`${60 + (i * 7) % 40}%`} height="1rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={s.error}>{error}</div>;
  }

  return (
    <div className={s.explorer}>
      <div className={`${s.sidebar}${mobileTreeOpen ? ` ${s.mobileOpen}` : ''}`}>
        <button
          className={s.header}
          onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
          aria-expanded={mobileTreeOpen}
        >
          {mobileTreeOpen ? <FolderOpen size={14} /> : <Folder size={14} />}
          <span>~/.config/nvim</span>
          <ChevronDown size={14} className={`${s.mobileChevron}${mobileTreeOpen ? ` ${s.mobileChevronOpen}` : ''}`} />
        </button>
        <div className={`${s.fileTree}${mobileTreeOpen ? ` ${s.mobileVisible}` : ''}`}>
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              level={0}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={handleFileSelect}
              onToggle={handleToggle}
            />
          ))}
        </div>
        <a
          href="https://github.com/thesandybridge/nvim"
          target="_blank"
          rel="noopener noreferrer"
          className={s.github}
        >
          <ExternalLink size={14} />
          Clone from GitHub
        </a>
      </div>
      <div className={s.content}>
        {selectedPath && (
          <div className={s.fileHeader}>
            <span className={s.filePath}>{selectedPath}</span>
            <button
              className={s.copy}
              onClick={handleCopy}
              disabled={!fileContent}
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        <div className={s.code}>
          {loadingFile ? (
            <div style={{ padding: '1rem' }}>
              {[...Array(20)].map((_, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <Skeleton width={`${40 + (i * 11) % 50}%`} height="1rem" />
                </div>
              ))}
            </div>
          ) : fileContent ? (
            <div
              className={s.highlighted}
              dangerouslySetInnerHTML={{ __html: fileContent.highlighted }}
            />
          ) : selectedPath ? (
            <div className={s.empty}>Unable to load file</div>
          ) : (
            <div className={s.empty}>Select a file to view its contents</div>
          )}
        </div>
      </div>
    </div>
  );
}
