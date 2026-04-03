import { ChevronRight, Trash2 } from 'lucide-react';
import type { FileStatusCode } from '../../../types/types';
import { getStatusBadgeClass, getStatusLabel } from '../../../utils/gitPanelUtils';
import GitDiffViewer from '../../shared/GitDiffViewer';

type FileChangeItemV2Props = {
  filePath: string;
  status: FileStatusCode;
  isMobile: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  diff?: string;
  wrapText: boolean;
  onToggleSelected: (filePath: string) => void;
  onToggleExpanded: (filePath: string) => void;
  onOpenFile: (filePath: string) => void;
  onToggleWrapText: () => void;
  onRequestFileAction: (filePath: string, status: FileStatusCode) => void;
};

export default function FileChangeItemV2({
  filePath,
  status,
  isMobile,
  isExpanded,
  isSelected,
  diff,
  wrapText,
  onToggleSelected,
  onToggleExpanded,
  onOpenFile,
  onToggleWrapText,
  onRequestFileAction,
}: FileChangeItemV2Props) {
  const statusLabel = getStatusLabel(status);
  const badgeClass = getStatusBadgeClass(status);

  return (
    <div className="border-b border-[hsl(var(--claude-border)/0.6)] last:border-0">
      <div className={`flex items-center transition-colors hover:bg-[hsl(var(--claude-tertiary)/0.5)] ${isMobile ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected(filePath)}
          onClick={(event) => event.stopPropagation()}
          className={`rounded border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-bg))] text-[hsl(var(--claude-accent))] checked:bg-[hsl(var(--claude-accent))] focus:ring-[hsl(var(--claude-accent)/0.4)] ${isMobile ? 'mr-1.5' : 'mr-2'}`}
        />

        <div className="flex min-w-0 flex-1 items-center">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpanded(filePath);
            }}
            className={`cursor-pointer rounded p-0.5 hover:bg-[hsl(var(--claude-tertiary))] ${isMobile ? 'mr-1' : 'mr-2'}`}
            title={isExpanded ? 'Collapse diff' : 'Expand diff'}
          >
            <ChevronRight className={`h-3 w-3 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>

          <span
            className={`flex-1 truncate ${isMobile ? 'text-xs' : 'text-sm'} cursor-pointer text-[hsl(var(--claude-text-secondary))] hover:text-[hsl(var(--claude-accent))] hover:underline`}
            onClick={(event) => {
              event.stopPropagation();
              onOpenFile(filePath);
            }}
            title="Click to open file"
          >
            {filePath}
          </span>

          <span className="flex items-center gap-1">
            {(status === 'M' || status === 'D' || status === 'U') && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onRequestFileAction(filePath, status);
                }}
                className={`${isMobile ? 'px-2 py-1 text-xs' : 'p-1'} flex items-center gap-1 rounded font-medium text-red-500 hover:bg-red-500/10`}
                title={status === 'U' ? 'Delete untracked file' : 'Discard changes'}
              >
                <Trash2 className="h-3 w-3" />
                {isMobile && <span>{status === 'U' ? 'Delete' : 'Discard'}</span>}
              </button>
            )}

            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${badgeClass}`}
              title={statusLabel}
            >
              {status}
            </span>
          </span>
        </div>
      </div>

      <div
        className={`duration-400 overflow-hidden bg-[hsl(var(--claude-tertiary)/0.3)] transition-all ease-in-out ${isExpanded && diff ? 'max-h-[600px] translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 opacity-0'
          }`}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--claude-border))] p-2">
          <span className="flex items-center gap-2">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${badgeClass}`}>
              {status}
            </span>
            <span className="text-sm font-medium text-[hsl(var(--claude-text))]">{statusLabel}</span>
          </span>
          {isMobile && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleWrapText();
              }}
              className="text-sm text-[hsl(var(--claude-text-secondary))] transition-colors hover:text-[hsl(var(--claude-text))]"
              title={wrapText ? 'Switch to horizontal scroll' : 'Switch to text wrap'}
            >
              {wrapText ? 'Scroll' : 'Wrap'}
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {diff && <GitDiffViewer diff={diff} isMobile={isMobile} wrapText={wrapText} />}
        </div>
      </div>
    </div>
  );
}
