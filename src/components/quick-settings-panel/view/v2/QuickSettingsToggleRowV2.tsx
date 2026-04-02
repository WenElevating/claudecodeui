import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import SettingsToggleV2 from '../../../settings/view/v2/SettingsToggleV2';

type QuickSettingsToggleRowV2Props = {
  label: string;
  icon: LucideIcon;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function QuickSettingsToggleRowV2({
  label,
  icon: Icon,
  checked,
  onCheckedChange,
}: QuickSettingsToggleRowV2Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-[hsl(var(--claude-text))]">
        <Icon className="h-4 w-4 text-[hsl(var(--claude-text-secondary))]" />
        {label}
      </span>
      <SettingsToggleV2
        checked={checked}
        onChange={onCheckedChange}
        ariaLabel={label}
      />
    </div>
  );
}

export default memo(QuickSettingsToggleRowV2);
