import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, FolderOpen, FolderPlus, HardDrive, Loader2, Plus, X } from 'lucide-react';
import { browseFilesystemFolders, createFolderInFilesystem, listAvailableDrives } from '../../data/workspaceApi';
import { getParentPath, joinFolderPath, isWindowsDriveRoot } from '../../utils/pathUtils';
import type { FolderSuggestion } from '../../types';

type FolderBrowserModalV2Props = {
  isOpen: boolean;
  autoAdvanceOnSelect: boolean;
  onClose: () => void;
  onFolderSelected: (folderPath: string, advanceToConfirm: boolean) => void;
};

export default function FolderBrowserModalV2({
  isOpen,
  autoAdvanceOnSelect,
  onClose,
  onFolderSelected,
}: FolderBrowserModalV2Props) {
  const [currentPath, setCurrentPath] = useState('~');
  const [folders, setFolders] = useState<FolderSuggestion[]>([]);
  const [drives, setDrives] = useState<FolderSuggestion[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [showHiddenFolders, setShowHiddenFolders] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available drives on mount
  useEffect(() => {
    if (!isOpen) return;

    listAvailableDrives()
      .then(setDrives)
      .catch(err => console.error('Failed to load drives:', err));
  }, [isOpen]);

  const loadFolders = useCallback(async (pathToLoad: string) => {
    setLoadingFolders(true);
    setError(null);

    try {
      const result = await browseFilesystemFolders(pathToLoad);
      setCurrentPath(result.path);
      setFolders(result.suggestions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load folders');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadFolders('~');
  }, [isOpen, loadFolders]);

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((folder) => showHiddenFolders || !folder.name.startsWith('.'))
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
    [folders, showHiddenFolders],
  );

  const resetNewFolderState = () => {
    setShowNewFolderInput(false);
    setNewFolderName('');
  };

  const handleClose = () => {
    setError(null);
    resetNewFolderState();
    onClose();
  };

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    setError(null);

    try {
      const folderPath = joinFolderPath(currentPath, newFolderName);
      const createdPath = await createFolderInFilesystem(folderPath);
      resetNewFolderState();
      await loadFolders(createdPath);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  }, [currentPath, loadFolders, newFolderName]);

  const parentPath = getParentPath(currentPath);
  const isAtDriveRoot = isWindowsDriveRoot(currentPath);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--claude-border))] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--claude-accent)/0.1)]">
              <FolderOpen className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--claude-text))]">Select Folder</h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHiddenFolders((prev) => !prev)}
              className={`v2-icon-btn ${showHiddenFolders ? 'bg-[hsl(var(--claude-accent)/0.1)] text-[hsl(var(--claude-accent))]' : ''}`}
              title={showHiddenFolders ? 'Hide hidden folders' : 'Show hidden folders'}
            >
              {showHiddenFolders ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowNewFolderInput((prev) => !prev)}
              className={`v2-icon-btn ${showNewFolderInput ? 'bg-[hsl(var(--claude-accent)/0.1)] text-[hsl(var(--claude-accent))]' : ''}`}
              title="Create new folder"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={handleClose} className="v2-icon-btn">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* New folder input */}
        {showNewFolderInput && (
          <div className="border-b border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                className="flex-1 rounded-lg border border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-bg))] px-3 py-1.5 text-sm text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-text-muted))] focus:border-[hsl(var(--claude-accent))] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') resetNewFolderState();
                }}
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || creatingFolder}
                className="v2-btn v2-btn-primary rounded-lg px-3 py-1.5 text-sm text-white"
              >
                {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </button>
              <button onClick={resetNewFolderState} className="v2-btn v2-btn-secondary rounded-lg px-3 py-1.5 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 pt-3">
            <div className="rounded-lg border border-[hsl(var(--claude-red)/0.2)] bg-[hsl(var(--claude-red)/0.05)] p-3">
              <p className="text-sm text-[hsl(var(--claude-red))]">{error}</p>
            </div>
          </div>
        )}

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto p-3">
          {loadingFolders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--claude-text-muted))]" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* Parent folder navigation */}
              {parentPath && (
                <button
                  onClick={() => loadFolders(parentPath)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--claude-tertiary))]"
                >
                  <FolderOpen className="h-4 w-4 text-[hsl(var(--claude-text-muted))]" />
                  <span className="text-sm font-medium text-[hsl(var(--claude-text-secondary))]">..</span>
                </button>
              )}

              {/* Drives section - show when at drive root level on Windows */}
              {isAtDriveRoot && drives.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-[hsl(var(--claude-text-muted))]">
                    Drives
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {drives.map((drive) => (
                      <button
                        key={drive.path}
                        onClick={() => loadFolders(drive.path)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[hsl(var(--claude-tertiary))] ${
                          currentPath === drive.path ? 'bg-[hsl(var(--claude-accent)/0.1)]' : ''
                        }`}
                      >
                        <HardDrive className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
                        <span className="text-sm font-medium text-[hsl(var(--claude-text))]">{drive.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visibleFolders.length === 0 ? (
                <div className="py-12 text-center text-sm text-[hsl(var(--claude-text-muted))]">
                  No subfolders found
                </div>
              ) : (
                visibleFolders.map((folder) => (
                  <div key={folder.path} className="group flex items-center gap-1 rounded-lg">
                    <button
                      onClick={() => loadFolders(folder.path)}
                      className="flex flex-1 items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--claude-tertiary))]"
                    >
                      <FolderPlus className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
                      <span className="text-sm font-medium text-[hsl(var(--claude-text))]">{folder.name}</span>
                    </button>
                    <button
                      onClick={() => onFolderSelected(folder.path, autoAdvanceOnSelect)}
                      className="mr-2 rounded-md px-2 py-1 text-xs text-[hsl(var(--claude-text-muted))] opacity-0 transition-all hover:bg-[hsl(var(--claude-tertiary))] hover:text-[hsl(var(--claude-text))] group-hover:opacity-100"
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with path display */}
        <div className="border-t border-[hsl(var(--claude-border))]">
          <div className="flex items-center gap-2 bg-[hsl(var(--claude-surface))] px-4 py-2.5">
            <span className="flex-shrink-0 text-xs text-[hsl(var(--claude-text-muted))]">Path:</span>
            <code className="flex-1 truncate font-mono text-xs text-[hsl(var(--claude-text))]">
              {currentPath}
            </code>
          </div>
          <div className="flex items-center justify-end gap-2 p-3">
            <button onClick={handleClose} className="v2-btn v2-btn-secondary rounded-lg px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              onClick={() => onFolderSelected(currentPath, autoAdvanceOnSelect)}
              className="v2-btn v2-btn-secondary rounded-lg px-4 py-2 text-sm"
            >
              Use this folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
