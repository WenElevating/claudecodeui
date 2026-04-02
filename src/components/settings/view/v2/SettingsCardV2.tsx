import type { ReactNode } from 'react';
import { cn } from '../../../../lib/utils';

type SettingsCardV2Props = {
  children: ReactNode;
  className?: string;
  divided?: boolean;
};

export default function SettingsCardV2({ children, className, divided }: SettingsCardV2Props) {
  return (
    <div
      className={cn(
        'v2-surface p-1',
        divided && 'divide-y divide-[hsl(var(--claude-border))]',
        className,
      )}
    >
      {children}
    </div>
  );
}
