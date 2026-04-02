import { useCallback, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, X, Loader2, Folder, Upload } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { ICON_SIZE_CLASS, getFileIconData } from '../../constants/fileIcons';
import { useExpandedDirectories } from '../../hooks/useExpandedDirectories';
import { useFileTreeData } from '../../hooks/useFileTreeData';
import { useFileTreeOperations } from '../../hooks/useFileTreeOperations';
import { useFileTreeSearch } from '../../hooks/useFileTreeSearch';
import { useFileTreeViewMode } from '../../hooks/useFileTreeViewMode';
import { useFileTreeUpload } from '../../hooks/useFileTreeUpload';
import type { FileTreeImageSelection, FileTreeNode } from '../../types/types';
import { formatFileSize, formatRelativeTime, isImageFile } from '../../utils/fileTreeUtils';
import type { Project } from '../../../../types/app';
import { Input } from '../../../../shared/view/ui';
import ImageViewer from '../ImageViewer';
import FileTreeBodyV2 from './FileTreeBodyV2';
import FileTreeDetailedColumnsV2 from './FileTreeDetailedColumnsV2';
import FileTreeHeaderV2 from './FileTreeHeaderV2';
import FileTreeLoadingStateV2 from './FileTreeLoadingStateV2';

type FileTreeV2Props = {
  selectedProject: Project | null;
  onFileOpen?: (filePath: string) => void;
};

export default function FileTreeV2({ selectedProject, onFileOpen }: FileTreeV2Props) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<FileTreeImageSelection | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const { files, loading, refreshFiles } = useFileTreeData(selectedProject);
  const { viewMode, changeViewMode } = useFileTreeViewMode();
  const { expandedDirs, toggleDirectory, expandDirectories, collapseAll } = useExpandedDirectories();
  const { searchQuery, setSearchQuery, filteredFiles } = useFileTreeSearch({
    files,
    expandDirectories,
  });

  const operations = useFileTreeOperations({
    selectedProject,
    onRefresh: refreshFiles,
    showToast,
  });

  const upload = useFileTreeUpload({
    selectedProject,
    onRefresh: refreshFiles,
    showToast,
  });

  useEffect(() => {
    if (operations.isCreating && newItemInputRef.current) {
      newItemInputRef.current.focus();
      newItemInputRef.current.select();
    }
  }, [operations.isCreating]);

  useEffect(() => {
    if (operations.renamingItem && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [operations.renamingItem]);

  const renderFileIcon = useCallback((filename: string) => {
    const { icon: Icon, color } = getFileIconData(filename);
    return <Icon className={cn(ICON_SIZE_CLASS, color)} />;
  }, []);

  const handleItemClick = useCallback(
    (item: FileTreeNode) => {
      if (item.type === 'directory') {
        toggleDirectory(item.path);
        return;
      }

      if (isImageFile(item.name) && selectedProject) {
        setSelectedImage({
          name: item.name,
          path: item.path,
          projectPath: selectedProject.path,
          projectName: selectedProject.name,
        });
        return;
      }

      onFileOpen?.(item.path);
    },
    [onFileOpen, selectedProject, toggleDirectory],
  );

  const formatRelativeTimeLabel = useCallback(
    (date?: string) => formatRelativeTime(date, t),
    [t],
  );

  if (loading) {
    return <FileTreeLoadingStateV2 />;
  }

  return (
    <div
      ref={upload.treeRef}
      className="relative flex h-full flex-col bg-[hsl(var(--claude-bg))]"
      onDragEnter={upload.handleDragEnter}
      onDragOver={upload.handleDragOver}
      onDragLeave={upload.handleDragLeave}
      onDrop={upload.handleDrop}
    >
      {upload.isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-[hsl(var(--claude-accent))] bg-[hsl(var(--claude-accent)/0.08)]">
          <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] px-6 py-4 shadow-[var(--shadow-lg)]">
            <Upload className="h-6 w-6 text-[hsl(var(--claude-accent))]" />
            <span className="text-sm font-medium text-[hsl(var(--claude-text))]">{t('fileTree.dropToUpload', 'Drop files to upload')}</span>
          </div>
        </div>
      )}

      <FileTreeHeaderV2
        viewMode={viewMode}
        onViewModeChange={changeViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onNewFile={() => operations.handleStartCreate('', 'file')}
        onNewFolder={() => operations.handleStartCreate('', 'directory')}
        onRefresh={refreshFiles}
        onCollapseAll={collapseAll}
        loading={loading}
        operationLoading={operations.operationLoading}
      />

      {viewMode === 'detailed' && filteredFiles.length > 0 && <FileTreeDetailedColumnsV2 />}

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">
        {operations.isCreating && (
          <div
            className="mb-1 flex items-center gap-1.5 py-[3px] pr-2"
            style={{ paddingLeft: `${(operations.newItemParent.split('/').length - 1) * 16 + 4}px` }}
          >
            {operations.newItemType === 'directory' ? (
              <Folder className={cn(ICON_SIZE_CLASS, 'text-amber-600')} />
            ) : (
              <span className="ml-[18px]">{renderFileIcon(operations.newItemName)}</span>
            )}
            <Input
              ref={newItemInputRef}
              type="text"
              value={operations.newItemName}
              onChange={(e) => operations.setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') operations.handleConfirmCreate();
                if (e.key === 'Escape') operations.handleCancelCreate();
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (operations.isCreating) operations.handleConfirmCreate();
                }, 100);
              }}
              className="h-6 flex-1 border-[hsl(var(--claude-border))] bg-transparent text-sm"
              disabled={operations.operationLoading}
            />
          </div>
        )}

        <FileTreeBodyV2
          files={files}
          filteredFiles={filteredFiles}
          searchQuery={searchQuery}
          viewMode={viewMode}
          expandedDirs={expandedDirs}
          onItemClick={handleItemClick}
          renderFileIcon={renderFileIcon}
          formatFileSize={formatFileSize}
          formatRelativeTime={formatRelativeTimeLabel}
          onRename={operations.handleStartRename}
          onDelete={operations.handleStartDelete}
          onNewFile={(path) => operations.handleStartCreate(path, 'file')}
          onNewFolder={(path) => operations.handleStartCreate(path, 'directory')}
          onCopyPath={operations.handleCopyPath}
          onDownload={operations.handleDownload}
          onRefresh={refreshFiles}
          renamingItem={operations.renamingItem}
          renameValue={operations.renameValue}
          setRenameValue={operations.setRenameValue}
          handleConfirmRename={operations.handleConfirmRename}
          handleCancelRename={operations.handleCancelRename}
          renameInputRef={renameInputRef}
          operationLoading={operations.operationLoading}
        />
      </div>

      {selectedImage && (
        <ImageViewer
          file={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {operations.deleteConfirmation.isOpen && operations.deleteConfirmation.item && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] p-4 shadow-[var(--shadow-lg)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-[hsl(var(--claude-text))]">
                  {t('fileTree.delete.title', 'Delete {{type}}', {
                    type: operations.deleteConfirmation.item.type === 'directory' ? 'Folder' : 'File',
                  })}
                </h3>
                <p className="text-sm text-[hsl(var(--claude-text-secondary))]">
                  {operations.deleteConfirmation.item.name}
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-[hsl(var(--claude-text-secondary))]">
              {operations.deleteConfirmation.item.type === 'directory'
                ? t('fileTree.delete.folderWarning', 'This folder and all its contents will be permanently deleted.')
                : t('fileTree.delete.fileWarning', 'This file will be permanently deleted.')}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={operations.handleCancelDelete}
                disabled={operations.operationLoading}
                className="v2-btn-secondary rounded-lg px-3 py-1.5 text-sm"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={operations.handleConfirmDelete}
                disabled={operations.operationLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {operations.operationLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('fileTree.delete.confirm', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl shadow-[var(--shadow-lg)] flex items-center gap-2 animate-in slide-in-from-bottom-2',
            toast.type === 'success'
              ? 'bg-[hsl(var(--claude-green))] text-white'
              : 'bg-red-600 text-white',
          )}
        >
          {toast.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
