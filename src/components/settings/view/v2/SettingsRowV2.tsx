import type { ReactNode } from 'react';
import { cn } from '../../../../lib/utils';

type SettingsRowV2Props = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsRowV2({ label, description, children, className }: SettingsRowV2Props) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-5 py-4', className)}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[hsl(var(--claude-text))]">{label}</div>
        {description && (
          <div className="mt-0.5 text-sm text-[hsl(var(--claude-text-secondary))]">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
