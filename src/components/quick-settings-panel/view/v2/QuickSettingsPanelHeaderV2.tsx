import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type QuickSettingsPanelHeaderV2Props = {
  onClose: () => void;
};

export default function QuickSettingsPanelHeaderV2({
  onClose,
}: QuickSettingsPanelHeaderV2Props) {
  const { t } = useTranslation('settings');

  return (
    <div className="flex items-center justify-between border-b border-[hsl(var(--claude-border))] px-4 py-3">
      <h3 className="text-base font-semibold text-[hsl(var(--claude-text))]">
        {t('quickSettings.title')}
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="v2-icon-btn"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
