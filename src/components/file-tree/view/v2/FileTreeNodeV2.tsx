import type { ReactNode, RefObject } from 'react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { FileTreeNode as FileTreeNodeType, FileTreeViewMode } from '../../types/types';
import { Input } from '../../../../shared/view/ui';
import FileContextMenu from '../FileContextMenu';

type FileTreeNodeV2Props = {
  item: FileTreeNodeType;
  level: number;
  viewMode: FileTreeViewMode;
  expandedDirs: Set<string>;
  onItemClick: (item: FileTreeNodeType) => void;
  renderFileIcon: (filename: string) => ReactNode;
  formatFileSize: (bytes?: number) => string;
  formatRelativeTime: (date?: string) => string;
  onRename?: (item: FileTreeNodeType) => void;
  onDelete?: (item: FileTreeNodeType) => void;
  onNewFile?: (path: string) => void;
  onNewFolder?: (path: string) => void;
  onCopyPath?: (item: FileTreeNodeType) => void;
  onDownload?: (item: FileTreeNodeType) => void;
  onRefresh?: () => void;
  renamingItem?: FileTreeNodeType | null;
  renameValue?: string;
  setRenameValue?: (value: string) => void;
  handleConfirmRename?: () => void;
  handleCancelRename?: () => void;
  renameInputRef?: RefObject<HTMLInputElement>;
  operationLoading?: boolean;
};

type TreeItemIconV2Props = {
  item: FileTreeNodeType;
  isOpen: boolean;
  renderFileIcon: (filename: string) => ReactNode;
};

function TreeItemIconV2({ item, isOpen, renderFileIcon }: TreeItemIconV2Props) {
  if (item.type === 'directory') {
    return (
      <span className="flex flex-shrink-0 items-center gap-0.5">
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 text-[hsl(var(--claude-text-muted))] transition-transform duration-150',
            isOpen && 'rotate-90',
          )}
        />
        {isOpen ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-amber-600" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-[hsl(var(--claude-text-secondary))]" />
        )}
      </span>
    );
  }

  return <span className="ml-[18px] flex flex-shrink-0 items-center">{renderFileIcon(item.name)}</span>;
}

export default function FileTreeNodeV2({
  item,
  level,
  viewMode,
  expandedDirs,
  onItemClick,
  renderFileIcon,
  formatFileSize,
  formatRelativeTime,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  onCopyPath,
  onDownload,
  onRefresh,
  renamingItem,
  renameValue,
  setRenameValue,
  handleConfirmRename,
  handleCancelRename,
  renameInputRef,
  operationLoading,
}: FileTreeNodeV2Props) {
  const isDirectory = item.type === 'directory';
  const isOpen = isDirectory && expandedDirs.has(item.path);
  const hasChildren = Boolean(isDirectory && item.children && item.children.length > 0);
  const isRenaming = renamingItem?.path === item.path;

  const nameClassName = cn(
    'text-[13px] leading-tight truncate',
    isDirectory
      ? 'font-medium text-[hsl(var(--claude-text))]'
      : 'text-[hsl(var(--claude-text-secondary))]',
  );

  const rowClassName = cn(
    viewMode === 'detailed'
      ? 'group grid grid-cols-12 gap-2 py-[3px] pr-2 hover:bg-[hsl(var(--claude-tertiary))] cursor-pointer items-center rounded-lg transition-colors duration-100'
      : viewMode === 'compact'
        ? 'group flex items-center justify-between py-[3px] pr-2 hover:bg-[hsl(var(--claude-tertiary))] cursor-pointer rounded-lg transition-colors duration-100'
        : 'group flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer rounded-lg hover:bg-[hsl(var(--claude-tertiary))] transition-colors duration-100',
    isDirectory && isOpen && 'border-l-2 border-[hsl(var(--claude-accent)/0.4)]',
    (isDirectory && !isOpen) || !isDirectory ? 'border-l-2 border-transparent' : '',
  );

  if (isRenaming && setRenameValue && handleConfirmRename && handleCancelRename) {
    return (
      <div
        className={cn(rowClassName, 'bg-[hsl(var(--claude-accent)/0.1)]')}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <TreeItemIconV2 item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} />
        <Input
          ref={renameInputRef}
          type="text"
          value={renameValue || ''}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') handleConfirmRename();
            if (e.key === 'Escape') handleCancelRename();
          }}
          onBlur={() => {
            setTimeout(() => {
              handleConfirmRename();
            }, 100);
          }}
          className="h-6 flex-1 border-[hsl(var(--claude-border))] bg-transparent text-sm"
          disabled={operationLoading}
        />
      </div>
    );
  }

  const rowContent = (
    <div
      className={rowClassName}
      style={{ paddingLeft: `${level * 16 + 4}px` }}
      onClick={() => onItemClick(item)}
    >
      {viewMode === 'detailed' ? (
        <>
          <div className="col-span-5 flex min-w-0 items-center gap-1.5">
            <TreeItemIconV2 item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} />
            <span className={nameClassName}>{item.name}</span>
          </div>
          <div className="col-span-2 text-sm tabular-nums text-[hsl(var(--claude-text-muted))]">
            {item.type === 'file' ? formatFileSize(item.size) : ''}
          </div>
          <div className="col-span-3 text-sm text-[hsl(var(--claude-text-muted))]">{formatRelativeTime(item.modified)}</div>
          <div className="col-span-2 font-mono text-sm text-[hsl(var(--claude-text-muted))]">{item.permissionsRwx || ''}</div>
        </>
      ) : viewMode === 'compact' ? (
        <>
          <div className="flex min-w-0 items-center gap-1.5">
            <TreeItemIconV2 item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} />
            <span className={nameClassName}>{item.name}</span>
          </div>
          <div className="ml-2 flex flex-shrink-0 items-center gap-3 text-sm text-[hsl(var(--claude-text-muted))]">
            {item.type === 'file' && (
              <>
                <span className="tabular-nums">{formatFileSize(item.size)}</span>
                <span className="font-mono">{item.permissionsRwx}</span>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <TreeItemIconV2 item={item} isOpen={isOpen} renderFileIcon={renderFileIcon} />
          <span className={nameClassName}>{item.name}</span>
        </>
      )}
    </div>
  );

  const hasContextMenu = onRename || onDelete || onNewFile || onNewFolder || onCopyPath || onDownload || onRefresh;

  return (
    <div className="select-none">
      {hasContextMenu ? (
        <FileContextMenu
          item={item}
          onRename={onRename}
          onDelete={onDelete}
          onNewFile={onNewFile}
          onNewFolder={onNewFolder}
          onCopyPath={onCopyPath}
          onDownload={onDownload}
          onRefresh={onRefresh}
        >
          {rowContent}
        </FileContextMenu>
      ) : (
        rowContent
      )}

      {isDirectory && isOpen && hasChildren && (
        <div className="relative">
          <span
            className="absolute bottom-0 top-0 border-l border-[hsl(var(--claude-border)/0.4)]"
            style={{ left: `${level * 16 + 14}px` }}
            aria-hidden="true"
          />
          {item.children?.map((child) => (
            <FileTreeNodeV2
              key={child.path}
              item={child}
              level={level + 1}
              viewMode={viewMode}
              expandedDirs={expandedDirs}
              onItemClick={onItemClick}
              renderFileIcon={renderFileIcon}
              formatFileSize={formatFileSize}
              formatRelativeTime={formatRelativeTime}
              onRename={onRename}
              onDelete={onDelete}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onCopyPath={onCopyPath}
              onDownload={onDownload}
              onRefresh={onRefresh}
              renamingItem={renamingItem}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              handleConfirmRename={handleConfirmRename}
              handleCancelRename={handleCancelRename}
              renameInputRef={renameInputRef}
              operationLoading={operationLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
