import { useCallback, useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { browseFilesystemFolders } from '../../data/workspaceApi';
import { getSuggestionRootPath } from '../../utils/pathUtils';
import type { FolderSuggestion, WorkspaceType } from '../../types';
import FolderBrowserModalV2 from './FolderBrowserModalV2';

type WorkspacePathFieldV2Props = {
  workspaceType: WorkspaceType;
  value: string;
  disabled?: boolean;
  onChange: (path: string) => void;
  onAdvanceToConfirm: () => void;
};

export default function WorkspacePathFieldV2({
  workspaceType,
  value,
  disabled = false,
  onChange,
  onAdvanceToConfirm,
}: WorkspacePathFieldV2Props) {
  const [pathSuggestions, setPathSuggestions] = useState<FolderSuggestion[]>([]);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);

  useEffect(() => {
    if (value.trim().length <= 2) {
      setPathSuggestions([]);
      setShowPathDropdown(false);
      return;
    }

    const timerId = window.setTimeout(async () => {
      try {
        const directoryPath = getSuggestionRootPath(value);
        const result = await browseFilesystemFolders(directoryPath);
        const normalizedInput = value.toLowerCase();

        const matchingSuggestions = result.suggestions
          .filter((suggestion) => {
            const normalizedSuggestion = suggestion.path.toLowerCase();
            return (
              normalizedSuggestion.startsWith(normalizedInput) &&
              normalizedSuggestion !== normalizedInput
            );
          })
          .slice(0, 5);

        setPathSuggestions(matchingSuggestions);
        setShowPathDropdown(matchingSuggestions.length > 0);
      } catch (error) {
        console.error('Failed to load path suggestions:', error);
      }
    }, 200);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value]);

  const handleSuggestionSelect = useCallback(
    (suggestion: FolderSuggestion) => {
      onChange(suggestion.path);
      setShowPathDropdown(false);
    },
    [onChange],
  );

  const handleFolderSelected = useCallback(
    (selectedPath: string, advanceToConfirm: boolean) => {
      onChange(selectedPath);
      setShowFolderBrowser(false);
      if (advanceToConfirm) {
        onAdvanceToConfirm();
      }
    },
    [onAdvanceToConfirm, onChange],
  );

  return (
    <>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              workspaceType === 'existing'
                ? '/path/to/existing/workspace'
                : '/path/to/new/workspace'
            }
            disabled={disabled}
            className="w-full rounded-xl border border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-bg))] px-3 py-2 text-sm text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-text-muted))] focus:border-[hsl(var(--claude-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--claude-accent)/0.2)]"
          />

          {showPathDropdown && pathSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] shadow-lg">
              {pathSuggestions.map((suggestion) => (
                <button
                  key={suggestion.path}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[hsl(var(--claude-tertiary))]"
                >
                  <div className="font-medium text-[hsl(var(--claude-text))]">{suggestion.name}</div>
                  <div className="text-xs text-[hsl(var(--claude-text-muted))]">{suggestion.path}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFolderBrowser(true)}
          className="v2-btn v2-btn-secondary flex items-center justify-center rounded-xl px-3 py-2"
          title="Browse folders"
          disabled={disabled}
        >
          <FolderOpen className="h-4 w-4" />
        </button>
      </div>

      <FolderBrowserModalV2
        isOpen={showFolderBrowser}
        autoAdvanceOnSelect={workspaceType === 'existing'}
        onClose={() => setShowFolderBrowser(false)}
        onFolderSelected={handleFolderSelected}
      />
    </>
  );
}
