import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import { getStatusBadgeClass } from '../../../utils/gitPanelUtils';

type FileStatusLegendV2Props = {
  isMobile: boolean;
};

const LEGEND_ITEMS = [
  { status: 'M', label: 'Modified' },
  { status: 'A', label: 'Added' },
  { status: 'D', label: 'Deleted' },
  { status: 'U', label: 'Untracked' },
] as const;

export default function FileStatusLegendV2({ isMobile }: FileStatusLegendV2Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return null;
  }

  return (
    <div className="border-b border-[hsl(var(--claude-border)/0.6)]">
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-center gap-1 bg-[hsl(var(--claude-tertiary)/0.3)] px-4 py-2 text-sm text-[hsl(var(--claude-text-secondary))] transition-colors hover:bg-[hsl(var(--claude-tertiary)/0.5)]"
      >
        <Info className="h-3 w-3" />
        <span>File Status Guide</span>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {isOpen && (
        <div className="bg-[hsl(var(--claude-tertiary)/0.3)] px-4 py-3 text-sm">
          <div className="flex justify-center gap-6">
            {LEGEND_ITEMS.map((item) => (
              <span key={item.status} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${getStatusBadgeClass(item.status)}`}
                >
                  {item.status}
                </span>
                <span className="italic text-[hsl(var(--claude-text-secondary))]">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
