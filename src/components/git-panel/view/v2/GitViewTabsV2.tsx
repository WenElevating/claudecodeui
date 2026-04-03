import { FileText, GitBranch, History } from 'lucide-react';
import type { GitPanelView } from '../../types/types';

type GitViewTabsV2Props = {
  activeView: GitPanelView;
  isHidden: boolean;
  changeCount: number;
  onChange: (view: GitPanelView) => void;
};

const TABS: { id: GitPanelView; label: string; Icon: typeof FileText }[] = [
  { id: 'changes', label: 'Changes', Icon: FileText },
  { id: 'history', label: 'Commits', Icon: History },
  { id: 'branches', label: 'Branches', Icon: GitBranch },
];

export default function GitViewTabsV2({ activeView, isHidden, changeCount, onChange }: GitViewTabsV2Props) {
  return (
    <div
      className={`flex border-b border-[hsl(var(--claude-border)/0.6)] transition-all duration-300 ease-in-out ${
        isHidden ? 'max-h-0 -translate-y-2 overflow-hidden opacity-0' : 'max-h-16 translate-y-0 opacity-100'
      }`}
    >
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeView === id
              ? 'border-b-2 border-[hsl(var(--claude-accent))] text-[hsl(var(--claude-accent))]'
              : 'text-[hsl(var(--claude-text-secondary))] hover:text-[hsl(var(--claude-text))]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {id === 'changes' && changeCount > 0 && (
              <span className="rounded-full bg-[hsl(var(--claude-accent)/0.15)] px-1.5 py-0.5 text-xs font-semibold text-[hsl(var(--claude-accent))]">
                {changeCount}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
