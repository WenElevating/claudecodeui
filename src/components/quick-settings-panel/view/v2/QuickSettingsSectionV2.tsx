import type { ReactNode } from 'react';

type QuickSettingsSectionV2Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function QuickSettingsSectionV2({
  title,
  children,
  className = '',
}: QuickSettingsSectionV2Props) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--claude-text-muted))]">
        {title}
      </h4>
      {children}
    </div>
  );
}
