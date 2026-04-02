import { Settings, Sparkles, PanelLeftOpen } from 'lucide-react';
import type { TFunction } from 'i18next';

type SidebarCollapsedProps = {
  onExpand: () => void;
  updateAvailable: boolean;
  onShowVersionModal: () => void;
  onShowSettings: () => void;
  t: TFunction;
};

export default function SidebarCollapsed({
  onExpand,
  updateAvailable,
  onShowVersionModal,
  onShowSettings,
  t,
}: SidebarCollapsedProps) {
  return (
    <div className="flex h-full flex-col items-center py-3">
      {/* Expand button */}
      <button
        className="group flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
        onClick={onExpand}
        aria-label={t('common:versionUpdate.ariaLabels.showSidebar')}
        title={t('common:versionUpdate.ariaLabels.showSidebar')}
      >
        <PanelLeftOpen className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>

      <div className="nav-divider my-2 w-6" />

      {/* Update indicator */}
      {updateAvailable && (
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          onClick={onShowVersionModal}
          aria-label={t('common:versionUpdate.ariaLabels.updateAvailable')}
          title={t('common:versionUpdate.ariaLabels.updateAvailable')}
        >
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        </button>
      )}

      {/* Settings */}
      <button
        className="group mt-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
        onClick={onShowSettings}
        aria-label={t('actions.settings')}
        title={t('actions.settings')}
      >
        <Settings className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>
    </div>
  );
}
