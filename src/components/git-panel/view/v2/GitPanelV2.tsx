import { useCallback, useMemo, useState } from 'react';
import { useGitPanelController } from '../../hooks/useGitPanelController';
import { useRevertLocalCommit } from '../../hooks/useRevertLocalCommit';
import type { ConfirmationRequest, GitPanelProps, GitPanelView } from '../../types/types';
import { getChangedFileCount } from '../../utils/gitPanelUtils';
import ChangesViewV2 from './changes/ChangesViewV2';
import HistoryViewV2 from './history/HistoryViewV2';
import BranchesViewV2 from './branches/BranchesViewV2';
import GitPanelHeaderV2 from './GitPanelHeaderV2';
import GitRepositoryErrorStateV2 from './GitRepositoryErrorStateV2';
import GitViewTabsV2 from './GitViewTabsV2';
import ConfirmActionModalV2 from './modals/ConfirmActionModalV2';

export default function GitPanelV2({ selectedProject, isMobile = false, onFileOpen }: GitPanelProps) {
  const [activeView, setActiveView] = useState<GitPanelView>('changes');
  const [wrapText, setWrapText] = useState(true);
  const [hasExpandedFiles, setHasExpandedFiles] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmationRequest | null>(null);

  const {
    gitStatus,
    gitDiff,
    isLoading,
    currentBranch,
    branches,
    localBranches,
    remoteBranches,
    recentCommits,
    commitDiffs,
    remoteStatus,
    isCreatingBranch,
    isFetching,
    isPulling,
    isPushing,
    isPublishing,
    isCreatingInitialCommit,
    operationError,
    clearOperationError,
    refreshAll,
    switchBranch,
    createBranch,
    deleteBranch,
    handleFetch,
    handlePull,
    handlePush,
    handlePublish,
    discardChanges,
    deleteUntrackedFile,
    fetchCommitDiff,
    generateCommitMessage,
    commitChanges,
    createInitialCommit,
    openFile,
  } = useGitPanelController({
    selectedProject,
    activeView,
    onFileOpen,
  });

  const { isRevertingLocalCommit, revertLatestLocalCommit } = useRevertLocalCommit({
    projectName: selectedProject?.name ?? null,
    onSuccess: refreshAll,
  });

  const executeConfirmedAction = useCallback(async () => {
    if (!confirmAction) return;
    const actionToExecute = confirmAction;
    setConfirmAction(null);
    try {
      await actionToExecute.onConfirm();
    } catch (error) {
      console.error('Error executing confirmation action:', error);
    }
  }, [confirmAction]);

  const changeCount = useMemo(() => getChangedFileCount(gitStatus), [gitStatus]);

  if (!selectedProject) {
    return (
      <div className="flex h-full items-center justify-center text-[hsl(var(--claude-text-secondary))]">
        <p>Select a project to view source control</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--claude-bg))]">
      <GitPanelHeaderV2
        isMobile={isMobile}
        currentBranch={currentBranch}
        branches={branches}
        remoteStatus={remoteStatus}
        isLoading={isLoading}
        isCreatingBranch={isCreatingBranch}
        isFetching={isFetching}
        isPulling={isPulling}
        isPushing={isPushing}
        isPublishing={isPublishing}
        isRevertingLocalCommit={isRevertingLocalCommit}
        operationError={operationError}
        onRefresh={refreshAll}
        onRevertLocalCommit={revertLatestLocalCommit}
        onSwitchBranch={switchBranch}
        onCreateBranch={createBranch}
        onFetch={handleFetch}
        onPull={handlePull}
        onPush={handlePush}
        onPublish={handlePublish}
        onClearError={clearOperationError}
        onRequestConfirmation={setConfirmAction}
      />

      {gitStatus?.error ? (
        <GitRepositoryErrorStateV2 error={gitStatus.error} details={gitStatus.details} />
      ) : (
        <>
          <GitViewTabsV2
            activeView={activeView}
            isHidden={hasExpandedFiles}
            changeCount={changeCount}
            onChange={setActiveView}
          />

          {activeView === 'changes' && (
            <ChangesViewV2
              key={selectedProject.fullPath}
              isMobile={isMobile}
              projectPath={selectedProject.fullPath}
              gitStatus={gitStatus}
              gitDiff={gitDiff}
              isLoading={isLoading}
              wrapText={wrapText}
              isCreatingInitialCommit={isCreatingInitialCommit}
              onWrapTextChange={setWrapText}
              onCreateInitialCommit={createInitialCommit}
              onOpenFile={openFile}
              onDiscardFile={discardChanges}
              onDeleteFile={deleteUntrackedFile}
              onCommitChanges={commitChanges}
              onGenerateCommitMessage={generateCommitMessage}
              onRequestConfirmation={setConfirmAction}
              onExpandedFilesChange={setHasExpandedFiles}
            />
          )}

          {activeView === 'history' && (
            <HistoryViewV2
              isMobile={isMobile}
              isLoading={isLoading}
              recentCommits={recentCommits}
              commitDiffs={commitDiffs}
              wrapText={wrapText}
              onFetchCommitDiff={fetchCommitDiff}
            />
          )}

          {activeView === 'branches' && (
            <BranchesViewV2
              isMobile={isMobile}
              isLoading={isLoading}
              currentBranch={currentBranch}
              localBranches={localBranches}
              remoteBranches={remoteBranches}
              remoteStatus={remoteStatus}
              isCreatingBranch={isCreatingBranch}
              onSwitchBranch={switchBranch}
              onCreateBranch={createBranch}
              onDeleteBranch={deleteBranch}
              onRequestConfirmation={setConfirmAction}
            />
          )}
        </>
      )}

      <ConfirmActionModalV2
        action={confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          void executeConfirmedAction();
        }}
      />
    </div>
  );
}
