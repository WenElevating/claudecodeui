import { History, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { GitDiffMap, GitCommitSummary } from '../../../types/types';
import CommitHistoryItemV2 from './CommitHistoryItemV2';

type HistoryViewV2Props = {
  isMobile: boolean;
  isLoading: boolean;
  recentCommits: GitCommitSummary[];
  commitDiffs: GitDiffMap;
  wrapText: boolean;
  onFetchCommitDiff: (commitHash: string) => Promise<void>;
};

export default function HistoryViewV2({
  isMobile,
  isLoading,
  recentCommits,
  commitDiffs,
  wrapText,
  onFetchCommitDiff,
}: HistoryViewV2Props) {
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  const toggleCommitExpanded = useCallback(
    (commitHash: string) => {
      const isExpanding = !expandedCommits.has(commitHash);

      setExpandedCommits((previous) => {
        const next = new Set(previous);
        if (next.has(commitHash)) {
          next.delete(commitHash);
        } else {
          next.add(commitHash);
        }
        return next;
      });

      if (isExpanding && !commitDiffs[commitHash]) {
        onFetchCommitDiff(commitHash).catch((err) => {
          console.error('Failed to fetch commit diff:', err);
        });
      }
    },
    [commitDiffs, expandedCommits, onFetchCommitDiff, setExpandedCommits],
  );

  return (
    <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-mobile-nav' : ''}`}>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-[hsl(var(--claude-accent))]" />
        </div>
      ) : recentCommits.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-[hsl(var(--claude-text-secondary))]">
          <History className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">No commits found</p>
        </div>
      ) : (
        <div className={isMobile ? 'pb-4' : ''}>
          {recentCommits.map((commit) => (
            <CommitHistoryItemV2
              key={commit.hash}
              commit={commit}
              isExpanded={expandedCommits.has(commit.hash)}
              diff={commitDiffs[commit.hash]}
              isMobile={isMobile}
              wrapText={wrapText}
              onToggle={() => toggleCommitExpanded(commit.hash)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
