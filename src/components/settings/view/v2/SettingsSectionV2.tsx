import type { ReactNode } from 'react';
import { cn } from '../../../../lib/utils';

type SettingsSectionV2Props = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsSectionV2({ title, description, children, className }: SettingsSectionV2Props) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-[hsl(var(--claude-text))]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[hsl(var(--claude-text-secondary))]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
