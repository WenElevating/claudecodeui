import { ChevronDown, Eye, FileText, FolderPlus, List, RefreshCw, Search, TableProperties, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../lib/utils';
import type { FileTreeViewMode } from '../../types/types';

type FileTreeHeaderV2Props = {
  viewMode: FileTreeViewMode;
  onViewModeChange: (mode: FileTreeViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onRefresh?: () => void;
  onCollapseAll?: () => void;
  loading?: boolean;
  operationLoading?: boolean;
};

export default function FileTreeHeaderV2({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  onNewFile,
  onNewFolder,
  onRefresh,
  onCollapseAll,
  loading,
  operationLoading,
}: FileTreeHeaderV2Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 border-b border-[hsl(var(--claude-border))] px-4 pb-3 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--claude-text))]">{t('fileTree.files')}</h3>
        <div className="flex items-center gap-0.5">
          {onNewFile && (
            <button
              type="button"
              className="v2-icon-btn"
              onClick={onNewFile}
              title={t('fileTree.newFile', 'New File (Cmd+N)')}
              aria-label={t('fileTree.newFile', 'New File (Cmd+N)')}
              disabled={operationLoading}
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          )}
          {onNewFolder && (
            <button
              type="button"
              className="v2-icon-btn"
              onClick={onNewFolder}
              title={t('fileTree.newFolder', 'New Folder (Cmd+Shift+N)')}
              aria-label={t('fileTree.newFolder', 'New Folder (Cmd+Shift+N)')}
              disabled={operationLoading}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          )}
          {onRefresh && (
            <button
              type="button"
              className="v2-icon-btn"
              onClick={onRefresh}
              title={t('fileTree.refresh', 'Refresh')}
              aria-label={t('fileTree.refresh', 'Refresh')}
              disabled={operationLoading}
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            </button>
          )}
          {onCollapseAll && (
            <button
              type="button"
              className="v2-icon-btn"
              onClick={onCollapseAll}
              title={t('fileTree.collapseAll', 'Collapse All')}
              aria-label={t('fileTree.collapseAll', 'Collapse All')}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="mx-0.5 h-4 w-px bg-[hsl(var(--claude-border))]" />
          <button
            type="button"
            className={cn(
              'v2-icon-btn',
              viewMode === 'simple' && 'bg-[hsl(var(--claude-accent)/0.15)] text-amber-600',
            )}
            onClick={() => onViewModeChange('simple')}
            title={t('fileTree.simpleView')}
            aria-label={t('fileTree.simpleView')}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              'v2-icon-btn',
              viewMode === 'compact' && 'bg-[hsl(var(--claude-accent)/0.15)] text-amber-600',
            )}
            onClick={() => onViewModeChange('compact')}
            title={t('fileTree.compactView')}
            aria-label={t('fileTree.compactView')}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={cn(
              'v2-icon-btn',
              viewMode === 'detailed' && 'bg-[hsl(var(--claude-accent)/0.15)] text-amber-600',
            )}
            onClick={() => onViewModeChange('detailed')}
            title={t('fileTree.detailedView')}
            aria-label={t('fileTree.detailedView')}
          >
            <TableProperties className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="v2-input-wrapper !py-1.5">
        <Search className="h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--claude-text-muted))]" />
        <input
          type="text"
          placeholder={t('fileTree.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="v2-input-field !py-0 !text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            className="flex-shrink-0 rounded-full p-0.5 text-[hsl(var(--claude-text-muted))] hover:bg-[hsl(var(--claude-tertiary))] hover:text-[hsl(var(--claude-text))]"
            onClick={() => onSearchQueryChange('')}
            title={t('fileTree.clearSearch')}
            aria-label={t('fileTree.clearSearch')}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
