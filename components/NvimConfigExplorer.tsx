'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Copy, Check, ExternalLink } from 'lucide-react';

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
      <div className="file-tree-node">
        <button
          className={`file-tree-item directory${isExpanded ? ' expanded' : ''}`}
          style={{ paddingLeft }}
          onClick={() => onToggle(node.path)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} />
          <span>{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div className="file-tree-children">
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
      className={`file-tree-item file${isSelected ? ' selected' : ''}`}
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
    return <div className="nvim-explorer-loading">Loading config...</div>;
  }

  if (error) {
    return <div className="nvim-explorer-error">{error}</div>;
  }

  return (
    <div className="nvim-explorer">
      <div className="nvim-explorer-sidebar">
        <div className="nvim-explorer-header">
          <Folder size={14} />
          <span>~/.config/nvim</span>
        </div>
        <div className="file-tree">
          {tree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              level={0}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onSelect={setSelectedPath}
              onToggle={handleToggle}
            />
          ))}
        </div>
        <a
          href="https://github.com/thesandybridge/nvim"
          target="_blank"
          rel="noopener noreferrer"
          className="nvim-explorer-github"
        >
          <ExternalLink size={14} />
          Clone from GitHub
        </a>
      </div>
      <div className="nvim-explorer-content">
        {selectedPath && (
          <div className="nvim-explorer-file-header">
            <span className="nvim-explorer-file-path">{selectedPath}</span>
            <button
              className="nvim-explorer-copy"
              onClick={handleCopy}
              disabled={!fileContent}
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        <div className="nvim-explorer-code">
          {loadingFile ? (
            <div className="nvim-explorer-loading">Loading file...</div>
          ) : fileContent ? (
            <div
              className="nvim-explorer-highlighted"
              dangerouslySetInnerHTML={{ __html: fileContent.highlighted }}
            />
          ) : selectedPath ? (
            <div className="nvim-explorer-empty">Unable to load file</div>
          ) : (
            <div className="nvim-explorer-empty">Select a file to view its contents</div>
          )}
        </div>
      </div>
    </div>
  );
}
