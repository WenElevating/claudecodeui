import type { LucideIcon } from 'lucide-react';

type FileTreeEmptyStateV2Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function FileTreeEmptyStateV2({ icon: Icon, title, description }: FileTreeEmptyStateV2Props) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--claude-tertiary))]">
        <Icon className="h-6 w-6 text-[hsl(var(--claude-text-muted))]" />
      </div>
      <h4 className="mb-1 font-medium text-[hsl(var(--claude-text))]">{title}</h4>
      <p className="text-sm text-[hsl(var(--claude-text-secondary))]">{description}</p>
    </div>
  );
}
