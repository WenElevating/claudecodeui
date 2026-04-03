import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import type { GitCommitSummary } from '../../../types/types';
import { getStatusBadgeClass, parseCommitFiles } from '../../../utils/gitPanelUtils';
import GitDiffViewer from '../../shared/GitDiffViewer';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type CommitHistoryItemV2Props = {
  commit: GitCommitSummary;
  isExpanded: boolean;
  diff?: string;
  isMobile: boolean;
  wrapText: boolean;
  onToggle: () => void;
};

export default function CommitHistoryItemV2({
  commit,
  isExpanded,
  diff,
  isMobile,
  wrapText,
  onToggle,
}: CommitHistoryItemV2Props) {
  const fileSummary = useMemo(() => {
    if (!diff) return null;
    return parseCommitFiles(diff);
  }, [diff]);

  return (
    <div className="border-b border-[hsl(var(--claude-border)/0.6)] last:border-0">
      <button
        type="button"
        aria-expanded={isExpanded}
        className="flex w-full cursor-pointer items-start border-0 bg-transparent p-3 text-left transition-colors hover:bg-[hsl(var(--claude-tertiary)/0.5)]"
        onClick={onToggle}
      >
        <span className="mr-2 mt-1 rounded p-0.5 hover:bg-[hsl(var(--claude-tertiary))]">
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[hsl(var(--claude-text))]">{commit.message}</p>
              <p className="mt-1 text-sm text-[hsl(var(--claude-text-secondary))]">
                {commit.author}
                {' \u2022 '}
                {commit.date}
              </p>
            </div>
            <span className="flex-shrink-0 font-mono text-sm text-[hsl(var(--claude-text-secondary)/0.6)]">
              {commit.hash.substring(0, 7)}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && diff && (
        <div className="bg-[hsl(var(--claude-tertiary)/0.3)]">
          <div className="max-h-[32rem] overflow-y-auto p-3">
            {/* Full hash */}
            <p className="mb-2 select-all font-mono text-xs text-[hsl(var(--claude-text-secondary)/0.7)]">
              {commit.hash}
            </p>

            {/* Author + Date */}
            <div className="mb-3 flex gap-4 text-xs text-[hsl(var(--claude-text-secondary))]">
              <span>
                <span className="text-[hsl(var(--claude-text-secondary)/0.6)]">Author </span>
                {commit.author}
              </span>
              <span>
                <span className="text-[hsl(var(--claude-text-secondary)/0.6)]">Date </span>
                {formatDate(commit.date)}
              </span>
            </div>

            {/* Stats card */}
            {fileSummary && (
              <div className="mb-3 flex gap-4 rounded-md bg-[hsl(var(--claude-tertiary)/0.8)] px-4 py-2 text-center text-xs">
                <div>
                  <div className="text-[hsl(var(--claude-text-secondary)/0.6)]">Files</div>
                  <div className="font-semibold text-[hsl(var(--claude-text))]">{fileSummary.totalFiles}</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--claude-text-secondary)/0.6)]">Added</div>
                  <div className="font-semibold text-green-600 dark:text-green-400">+{fileSummary.totalInsertions}</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--claude-text-secondary)/0.6)]">Removed</div>
                  <div className="font-semibold text-red-600 dark:text-red-400">-{fileSummary.totalDeletions}</div>
                </div>
              </div>
            )}

            {/* Changed files list */}
            {fileSummary && fileSummary.files.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--claude-text-secondary)/0.6)]">
                  Changed Files
                </p>
                <div className="rounded-md border border-[hsl(var(--claude-border)/0.6)]">
                  {fileSummary.files.map((file, idx) => (
                    <div
                      key={file.path}
                      className={`flex items-center gap-2 px-2.5 py-1.5 text-xs ${
                        idx < fileSummary.files.length - 1 ? 'border-b border-[hsl(var(--claude-border)/0.4)]' : ''
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[9px] font-bold ${getStatusBadgeClass(file.status)}`}
                      >
                        {file.status}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {file.directory && (
                          <span className="text-[hsl(var(--claude-text-secondary)/0.6)]">{file.directory}</span>
                        )}
                        <span className="font-medium text-[hsl(var(--claude-text))]">{file.filename}</span>
                      </span>
                      <span className="flex-shrink-0 font-mono text-[hsl(var(--claude-text-secondary)/0.6)]">
                        {file.insertions > 0 && (
                          <span className="text-green-600 dark:text-green-400">+{file.insertions}</span>
                        )}
                        {file.insertions > 0 && file.deletions > 0 && '/'}
                        {file.deletions > 0 && (
                          <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diff viewer */}
            <GitDiffViewer diff={diff} isMobile={isMobile} wrapText={wrapText} />
          </div>
        </div>
      )}
    </div>
  );
}
