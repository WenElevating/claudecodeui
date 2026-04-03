import { useTranslation } from 'react-i18next';
import { DarkModeToggle } from '../../../../shared/view/ui';
import type { CodeEditorSettingsState, ProjectSortOrder } from '../../types/types';
import LanguageSelector from '../../../../shared/view/ui/LanguageSelector';
import SettingsCardV2 from '../v2/SettingsCardV2';
import SettingsRowV2 from '../v2/SettingsRowV2';
import SettingsSectionV2 from '../v2/SettingsSectionV2';
import SettingsToggleV2 from '../v2/SettingsToggleV2';
import { useUiPreferences } from '../../../../hooks/useUiPreferences';

type AppearanceSettingsTabV2Props = {
  projectSortOrder: ProjectSortOrder;
  onProjectSortOrderChange: (value: ProjectSortOrder) => void;
  codeEditorSettings: CodeEditorSettingsState;
  onCodeEditorSettingChange: <K extends keyof CodeEditorSettingsState>(key: K, value: CodeEditorSettingsState[K]) => void;
};

export default function AppearanceSettingsTabV2({
  projectSortOrder,
  onProjectSortOrderChange,
  codeEditorSettings,
  onCodeEditorSettingChange,
}: AppearanceSettingsTabV2Props) {
  const { t } = useTranslation('settings');
  const { preferences, setPreference } = useUiPreferences();

  return (
    <div className="space-y-8">
      <SettingsSectionV2 title={t('appearanceSettings.uiDesign.label') || 'UI Design'}>
        <SettingsCardV2>
          <SettingsRowV2
            label={t('appearanceSettings.uiDesign.newUi.label') || 'New UI Design (V2)'}
            description={t('appearanceSettings.uiDesign.newUi.description') || 'Switch to the new Claude Code Mobile style UI design'}
          >
            <SettingsToggleV2
              checked={preferences.useNewUi}
              onChange={(value) => setPreference('useNewUi', value)}
              ariaLabel="New UI Design"
            />
          </SettingsRowV2>

          <SettingsRowV2
            label={t('appearanceSettings.uiDesign.mobileToolbar.label') || 'Show Mobile Toolbar'}
            description={t('appearanceSettings.uiDesign.mobileToolbar.description') || 'Show the bottom navigation toolbar on mobile devices'}
          >
            <SettingsToggleV2
              checked={preferences.showMobileToolbar}
              onChange={(value) => setPreference('showMobileToolbar', value)}
              ariaLabel="Show Mobile Toolbar"
            />
          </SettingsRowV2>
        </SettingsCardV2>
      </SettingsSectionV2>

      <SettingsSectionV2 title={t('appearanceSettings.darkMode.label')}>
        <SettingsCardV2>
          <SettingsRowV2
            label={t('appearanceSettings.darkMode.label')}
            description={t('appearanceSettings.darkMode.description')}
          >
            <DarkModeToggle ariaLabel={t('appearanceSettings.darkMode.label')} />
          </SettingsRowV2>
        </SettingsCardV2>
      </SettingsSectionV2>

      <SettingsSectionV2 title={t('mainTabs.appearance')}>
        <SettingsCardV2>
          <LanguageSelector />
        </SettingsCardV2>
      </SettingsSectionV2>

      <SettingsSectionV2 title={t('appearanceSettings.projectSorting.label')}>
        <SettingsCardV2>
          <SettingsRowV2
            label={t('appearanceSettings.projectSorting.label')}
            description={t('appearanceSettings.projectSorting.description')}
          >
            <select
              value={projectSortOrder}
              onChange={(event) => onProjectSortOrderChange(event.target.value as ProjectSortOrder)}
              className="v2-select w-full sm:w-36"
            >
              <option value="name">{t('appearanceSettings.projectSorting.alphabetical')}</option>
              <option value="date">{t('appearanceSettings.projectSorting.recentActivity')}</option>
            </select>
          </SettingsRowV2>
        </SettingsCardV2>
      </SettingsSectionV2>

      <SettingsSectionV2 title={t('appearanceSettings.codeEditor.title')}>
        <SettingsCardV2 divided>
          <SettingsRowV2
            label={t('appearanceSettings.codeEditor.theme.label')}
            description={t('appearanceSettings.codeEditor.theme.description')}
          >
            <DarkModeToggle
              checked={codeEditorSettings.theme === 'dark'}
              onToggle={(enabled) => onCodeEditorSettingChange('theme', enabled ? 'dark' : 'light')}
              ariaLabel={t('appearanceSettings.codeEditor.theme.label')}
            />
          </SettingsRowV2>

          <SettingsRowV2
            label={t('appearanceSettings.codeEditor.wordWrap.label')}
            description={t('appearanceSettings.codeEditor.wordWrap.description')}
          >
            <SettingsToggleV2
              checked={codeEditorSettings.wordWrap}
              onChange={(value) => onCodeEditorSettingChange('wordWrap', value)}
              ariaLabel={t('appearanceSettings.codeEditor.wordWrap.label')}
            />
          </SettingsRowV2>

          <SettingsRowV2
            label={t('appearanceSettings.codeEditor.showMinimap.label')}
            description={t('appearanceSettings.codeEditor.showMinimap.description')}
          >
            <SettingsToggleV2
              checked={codeEditorSettings.showMinimap}
              onChange={(value) => onCodeEditorSettingChange('showMinimap', value)}
              ariaLabel={t('appearanceSettings.codeEditor.showMinimap.label')}
            />
          </SettingsRowV2>

          <SettingsRowV2
            label={t('appearanceSettings.codeEditor.lineNumbers.label')}
            description={t('appearanceSettings.codeEditor.lineNumbers.description')}
          >
            <SettingsToggleV2
              checked={codeEditorSettings.lineNumbers}
              onChange={(value) => onCodeEditorSettingChange('lineNumbers', value)}
              ariaLabel={t('appearanceSettings.codeEditor.lineNumbers.label')}
            />
          </SettingsRowV2>

          <SettingsRowV2
            label={t('appearanceSettings.codeEditor.fontSize.label')}
            description={t('appearanceSettings.codeEditor.fontSize.description')}
          >
            <select
              value={codeEditorSettings.fontSize}
              onChange={(event) => onCodeEditorSettingChange('fontSize', event.target.value)}
              className="v2-select w-full sm:w-28"
            >
              <option value="10">10px</option>
              <option value="11">11px</option>
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="15">15px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </SettingsRowV2>
        </SettingsCardV2>
      </SettingsSectionV2>
    </div>
  );
}
