import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DarkModeToggle } from '../../../../shared/view/ui';
import LanguageSelector from '../../../../shared/view/ui/LanguageSelector';
import {
  INPUT_SETTING_TOGGLES,
  TOOL_DISPLAY_TOGGLES,
  VIEW_OPTION_TOGGLES,
} from '../../constants';
import type {
  PreferenceToggleItem,
  PreferenceToggleKey,
  QuickSettingsPreferences,
} from '../../types';
import QuickSettingsSectionV2 from './QuickSettingsSectionV2';
import QuickSettingsToggleRowV2 from './QuickSettingsToggleRowV2';

type QuickSettingsContentV2Props = {
  isDarkMode: boolean;
  isMobile: boolean;
  preferences: QuickSettingsPreferences;
  onPreferenceChange: (key: PreferenceToggleKey, value: boolean) => void;
};

export default function QuickSettingsContentV2({
  isDarkMode,
  isMobile,
  preferences,
  onPreferenceChange,
}: QuickSettingsContentV2Props) {
  const { t } = useTranslation('settings');

  const renderToggleRows = (items: PreferenceToggleItem[]) => (
    items.map(({ key, labelKey, icon }) => (
      <QuickSettingsToggleRowV2
        key={key}
        label={t(labelKey)}
        icon={icon}
        checked={preferences[key]}
        onCheckedChange={(value) => onPreferenceChange(key, value)}
      />
    ))
  );

  return (
    <div className={`flex-1 space-y-5 overflow-y-auto overflow-x-hidden bg-[hsl(var(--claude-bg))] p-4 ${isMobile ? 'pb-mobile-nav' : ''}`}>
      <QuickSettingsSectionV2 title={t('quickSettings.sections.appearance')}>
        <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-[hsl(var(--claude-text))]">
            {isDarkMode ? (
              <Moon className="h-4 w-4 text-[hsl(var(--claude-text-secondary))]" />
            ) : (
              <Sun className="h-4 w-4 text-[hsl(var(--claude-text-secondary))]" />
            )}
            {t('quickSettings.darkMode')}
          </span>
          <DarkModeToggle />
        </div>
        <LanguageSelector compact />
      </QuickSettingsSectionV2>

      <QuickSettingsSectionV2 title={t('quickSettings.sections.toolDisplay')}>
        {renderToggleRows(TOOL_DISPLAY_TOGGLES)}
      </QuickSettingsSectionV2>

      <QuickSettingsSectionV2 title={t('quickSettings.sections.viewOptions')}>
        {renderToggleRows(VIEW_OPTION_TOGGLES)}
      </QuickSettingsSectionV2>

      <QuickSettingsSectionV2 title={t('quickSettings.sections.inputSettings')}>
        {renderToggleRows(INPUT_SETTING_TOGGLES)}
        <p className="ml-1 text-xs text-[hsl(var(--claude-text-muted))]">
          {t('quickSettings.sendByCtrlEnterDescription')}
        </p>
      </QuickSettingsSectionV2>
    </div>
  );
}
