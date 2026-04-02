import type { ReactNode, RefObject } from 'react';
import { Folder, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FileTreeNode, FileTreeViewMode } from '../../types/types';
import FileTreeEmptyStateV2 from './FileTreeEmptyStateV2';
import FileTreeNodeV2 from './FileTreeNodeV2';

type FileTreeBodyV2Props = {
  files: FileTreeNode[];
  filteredFiles: FileTreeNode[];
  searchQuery: string;
  viewMode: FileTreeViewMode;
  expandedDirs: Set<string>;
  onItemClick: (item: FileTreeNode) => void;
  renderFileIcon: (filename: string) => ReactNode;
  formatFileSize: (bytes?: number) => string;
  formatRelativeTime: (date?: string) => string;
  onRename?: (item: FileTreeNode) => void;
  onDelete?: (item: FileTreeNode) => void;
  onNewFile?: (path: string) => void;
  onNewFolder?: (path: string) => void;
  onCopyPath?: (item: FileTreeNode) => void;
  onDownload?: (item: FileTreeNode) => void;
  onRefresh?: () => void;
  renamingItem?: FileTreeNode | null;
  renameValue?: string;
  setRenameValue?: (value: string) => void;
  handleConfirmRename?: () => void;
  handleCancelRename?: () => void;
  renameInputRef?: RefObject<HTMLInputElement>;
  operationLoading?: boolean;
};

export default function FileTreeBodyV2({
  files,
  filteredFiles,
  searchQuery,
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
}: FileTreeBodyV2Props) {
  const { t } = useTranslation();

  return (
    <>
      {files.length === 0 ? (
        <FileTreeEmptyStateV2
          icon={Folder}
          title={t('fileTree.noFilesFound')}
          description={t('fileTree.checkProjectPath')}
        />
      ) : filteredFiles.length === 0 && searchQuery ? (
        <FileTreeEmptyStateV2
          icon={Search}
          title={t('fileTree.noMatchesFound')}
          description={t('fileTree.tryDifferentSearch')}
        />
      ) : (
        <div>
          {filteredFiles.map((item) => (
            <FileTreeNodeV2
              key={item.path}
              item={item}
              level={0}
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
    </>
  );
}
