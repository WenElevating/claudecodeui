import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FileTreeLoadingStateV2() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--claude-text-muted))]">
        <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--claude-accent))]" />
        {t('fileTree.loading')}
      </div>
    </div>
  );
}
