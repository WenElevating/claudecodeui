import { GitBranch } from 'lucide-react';

type GitRepositoryErrorStateV2Props = {
  error: string;
  details?: string;
};

export default function GitRepositoryErrorStateV2({ error, details }: GitRepositoryErrorStateV2Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-[hsl(var(--claude-text-secondary))]">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--claude-tertiary))]">
        <GitBranch className="h-8 w-8 opacity-40" />
      </div>
      <h3 className="mb-3 text-center text-lg font-medium text-[hsl(var(--claude-text))]">{error}</h3>
      {details && (
        <p className="mb-6 max-w-md text-center text-sm leading-relaxed">{details}</p>
      )}
      <div className="max-w-md rounded-xl border border-[hsl(var(--claude-accent)/0.1)] bg-[hsl(var(--claude-accent)/0.05)] p-4">
        <p className="text-center text-sm text-[hsl(var(--claude-accent))]">
          <strong>Tip:</strong> Run{' '}
          <code className="rounded-md bg-[hsl(var(--claude-accent)/0.1)] px-2 py-1 font-mono text-xs">git init</code>{' '}
          in your project directory to initialize git source control.
        </p>
      </div>
    </div>
  );
}
