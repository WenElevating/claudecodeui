import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGitSettings } from '../../../hooks/useGitSettings';
import SettingsCardV2 from '../../v2/SettingsCardV2';
import SettingsSectionV2 from '../../v2/SettingsSectionV2';

export default function GitSettingsTabV2() {
  const { t } = useTranslation('settings');
  const {
    gitName,
    setGitName,
    gitEmail,
    setGitEmail,
    isLoading,
    isSaving,
    saveStatus,
    saveGitConfig,
  } = useGitSettings();

  return (
    <div className="space-y-8">
      <SettingsSectionV2
        title={t('git.title')}
        description={t('git.description')}
      >
        <SettingsCardV2 className="p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="v2-settings-git-name" className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text))]">
                {t('git.name.label')}
              </label>
              <div className="v2-input-wrapper">
                <input
                  id="v2-settings-git-name"
                  type="text"
                  value={gitName}
                  onChange={(event) => setGitName(event.target.value)}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="v2-input-field"
                />
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--claude-text-secondary))]">{t('git.name.help')}</p>
            </div>

            <div>
              <label htmlFor="v2-settings-git-email" className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text))]">
                {t('git.email.label')}
              </label>
              <div className="v2-input-wrapper">
                <input
                  id="v2-settings-git-email"
                  type="email"
                  value={gitEmail}
                  onChange={(event) => setGitEmail(event.target.value)}
                  placeholder="john@example.com"
                  disabled={isLoading}
                  className="v2-input-field"
                />
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--claude-text-secondary))]">{t('git.email.help')}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveGitConfig}
                disabled={isSaving || !gitName.trim() || !gitEmail.trim()}
                className="v2-btn v2-btn-primary"
              >
                {isSaving ? t('git.actions.saving') : t('git.actions.save')}
              </button>

              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--claude-accent))]">
                  <Check className="h-4 w-4" />
                  {t('git.status.success')}
                </div>
              )}
            </div>
          </div>
        </SettingsCardV2>
      </SettingsSectionV2>
    </div>
  );
}
