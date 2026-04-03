import { Check, GitBranch, Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ConfirmationRequest, GitRemoteStatus } from '../../../types/types';
import NewBranchModalV2 from '../modals/NewBranchModalV2';

type BranchesViewV2Props = {
  isMobile: boolean;
  isLoading: boolean;
  currentBranch: string;
  localBranches: string[];
  remoteBranches: string[];
  remoteStatus: GitRemoteStatus | null;
  isCreatingBranch: boolean;
  onSwitchBranch: (branchName: string) => Promise<boolean>;
  onCreateBranch: (branchName: string) => Promise<boolean>;
  onDeleteBranch: (branchName: string) => Promise<boolean>;
  onRequestConfirmation: (request: ConfirmationRequest) => void;
};

type BranchRowV2Props = {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  aheadCount: number;
  behindCount: number;
  isMobile: boolean;
  onSwitch: () => void;
  onDelete: () => void;
};

function BranchRowV2({ name, isCurrent, isRemote, aheadCount, behindCount, isMobile, onSwitch, onDelete }: BranchRowV2Props) {
  return (
    <div
      className={`group flex items-center gap-3 border-b border-[hsl(var(--claude-border)/0.4)] px-4 transition-colors hover:bg-[hsl(var(--claude-tertiary)/0.4)] ${
        isMobile ? 'py-2.5' : 'py-3'
      } ${isCurrent ? 'bg-[hsl(var(--claude-accent)/0.05)]' : ''}`}
    >
      {/* Branch icon */}
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
        isCurrent
          ? 'border-[hsl(var(--claude-accent)/0.3)] bg-[hsl(var(--claude-accent)/0.1)] text-[hsl(var(--claude-accent))]'
          : isRemote
          ? 'border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-tertiary))] text-[hsl(var(--claude-text-secondary))]'
          : 'border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-tertiary)/0.5)] text-[hsl(var(--claude-text-secondary))]'
      }`}>
        {isRemote ? <Globe className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
      </div>

      {/* Name + pills */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={`truncate text-sm font-medium ${isCurrent ? 'text-[hsl(var(--claude-text))]' : 'text-[hsl(var(--claude-text)/0.8)]'}`}>
            {name}
          </span>
          {isCurrent && (
            <span className="shrink-0 rounded-full bg-[hsl(var(--claude-accent)/0.15)] px-1.5 py-0.5 text-xs font-semibold text-[hsl(var(--claude-accent))]">
              current
            </span>
          )}
          {isRemote && !isCurrent && (
            <span className="shrink-0 rounded-full bg-[hsl(var(--claude-tertiary))] px-1.5 py-0.5 text-xs text-[hsl(var(--claude-text-secondary))]">
              remote
            </span>
          )}
        </div>
        {isCurrent && (aheadCount > 0 || behindCount > 0) && (
          <div className="flex items-center gap-2 text-xs">
            {aheadCount > 0 && (
              <span className="text-green-600 dark:text-green-400">↑{aheadCount} ahead</span>
            )}
            {behindCount > 0 && (
              <span className="text-[hsl(var(--claude-accent))]">↓{behindCount} behind</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`flex shrink-0 items-center gap-1 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {isCurrent ? (
          <Check className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
        ) : !isRemote ? (
          <>
            <button
              onClick={onSwitch}
              className="rounded-md px-2 py-1 text-xs font-medium text-[hsl(var(--claude-text-secondary))] transition-colors hover:bg-[hsl(var(--claude-tertiary))] hover:text-[hsl(var(--claude-text))]"
              title={`Switch to ${name}`}
            >
              Switch
            </button>
            <button
              onClick={onDelete}
              className="rounded-md p-1 text-[hsl(var(--claude-text-secondary))] transition-colors hover:bg-red-500/10 hover:text-red-500"
              title={`Delete ${name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeaderV2({ label, count }: { label: string; count: number }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-[hsl(var(--claude-bg)/0.95)] px-4 py-2 backdrop-blur-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--claude-text-secondary))]">{label}</span>
      <span className="rounded-full bg-[hsl(var(--claude-tertiary))] px-1.5 py-0.5 text-xs text-[hsl(var(--claude-text-secondary))]">{count}</span>
    </div>
  );
}

export default function BranchesViewV2({
  isMobile,
  isLoading,
  currentBranch,
  localBranches,
  remoteBranches,
  remoteStatus,
  isCreatingBranch,
  onSwitchBranch,
  onCreateBranch,
  onDeleteBranch,
  onRequestConfirmation,
}: BranchesViewV2Props) {
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);

  const aheadCount = remoteStatus?.ahead ?? 0;
  const behindCount = remoteStatus?.behind ?? 0;

  const requestSwitch = (branch: string) => {
    onRequestConfirmation({
      type: 'commit',
      message: `Switch to branch "${branch}"? Make sure you have no uncommitted changes.`,
      onConfirm: () => void onSwitchBranch(branch),
    });
  };

  const requestDelete = (branch: string) => {
    onRequestConfirmation({
      type: 'deleteBranch',
      message: `Delete branch "${branch}"? This cannot be undone.`,
      onConfirm: () => void onDeleteBranch(branch),
    });
  };

  if (isLoading && localBranches.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-[hsl(var(--claude-accent))]" />
      </div>
    );
  }

  return (
    <div className={`flex flex-1 flex-col overflow-hidden ${isMobile ? 'pb-mobile-nav' : ''}`}>
      {/* Create branch button */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--claude-border)/0.4)] px-4 py-2.5">
        <span className="text-sm text-[hsl(var(--claude-text-secondary))]">
          {localBranches.length} local{remoteBranches.length > 0 ? `, ${remoteBranches.length} remote` : ''}
        </span>
        <button
          onClick={() => setShowNewBranchModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--claude-accent)/0.1)] px-3 py-1.5 text-sm font-medium text-[hsl(var(--claude-accent))] transition-colors hover:bg-[hsl(var(--claude-accent)/0.2)]"
        >
          <Plus className="h-3.5 w-3.5" />
          New branch
        </button>
      </div>

      {/* Branch list */}
      <div className="flex-1 overflow-y-auto">
        {localBranches.length > 0 && (
          <>
            <SectionHeaderV2 label="Local" count={localBranches.length} />
            {localBranches.map((branch) => (
              <BranchRowV2
                key={`local:${branch}`}
                name={branch}
                isCurrent={branch === currentBranch}
                isRemote={false}
                aheadCount={branch === currentBranch ? aheadCount : 0}
                behindCount={branch === currentBranch ? behindCount : 0}
                isMobile={isMobile}
                onSwitch={() => requestSwitch(branch)}
                onDelete={() => requestDelete(branch)}
              />
            ))}
          </>
        )}

        {remoteBranches.length > 0 && (
          <>
            <SectionHeaderV2 label="Remote" count={remoteBranches.length} />
            {remoteBranches.map((branch) => (
              <BranchRowV2
                key={`remote:${branch}`}
                name={branch}
                isCurrent={false}
                isRemote={true}
                aheadCount={0}
                behindCount={0}
                isMobile={isMobile}
                onSwitch={() => requestSwitch(branch)}
                onDelete={() => requestDelete(branch)}
              />
            ))}
          </>
        )}

        {localBranches.length === 0 && remoteBranches.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-[hsl(var(--claude-text-secondary))]">
            <GitBranch className="h-10 w-10 opacity-30" />
            <p className="text-sm">No branches found</p>
          </div>
        )}
      </div>

      <NewBranchModalV2
        isOpen={showNewBranchModal}
        currentBranch={currentBranch}
        isCreatingBranch={isCreatingBranch}
        onClose={() => setShowNewBranchModal(false)}
        onCreateBranch={onCreateBranch}
      />
    </div>
  );
}
