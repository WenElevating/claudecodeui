import { useTranslation } from 'react-i18next';
import { useTasksSettings } from '../../../../../contexts/TasksSettingsContext';
import SettingsCardV2 from '../../v2/SettingsCardV2';
import SettingsRowV2 from '../../v2/SettingsRowV2';
import SettingsSectionV2 from '../../v2/SettingsSectionV2';
import SettingsToggleV2 from '../../v2/SettingsToggleV2';

type TasksSettingsContextValue = {
  tasksEnabled: boolean;
  setTasksEnabled: (enabled: boolean) => void;
  isTaskMasterInstalled: boolean | null;
  isCheckingInstallation: boolean;
};

export default function TasksSettingsTabV2() {
  const { t } = useTranslation('settings');
  const {
    tasksEnabled,
    setTasksEnabled,
    isTaskMasterInstalled,
    isCheckingInstallation,
  } = useTasksSettings() as TasksSettingsContextValue;

  return (
    <div className="space-y-8">
      <SettingsSectionV2 title={t('mainTabs.tasks')}>
        {isCheckingInstallation ? (
          <SettingsCardV2 className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(var(--claude-accent))] border-t-transparent" />
              <span className="text-sm text-[hsl(var(--claude-text-secondary))]">{t('tasks.checking')}</span>
            </div>
          </SettingsCardV2>
        ) : (
          <>
            {!isTaskMasterInstalled && (
              <div className="rounded-xl border border-[hsl(var(--claude-accent)/0.3)] bg-[hsl(var(--claude-accent)/0.06)] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--claude-accent)/0.12)]">
                    <svg className="h-4 w-4 text-[hsl(var(--claude-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 font-medium text-[hsl(var(--claude-text))]">
                      {t('tasks.notInstalled.title')}
                    </div>
                    <div className="space-y-3 text-sm text-[hsl(var(--claude-text-secondary))]">
                      <p>{t('tasks.notInstalled.description')}</p>

                      <div className="rounded-lg bg-[hsl(var(--claude-surface))] p-3 font-mono text-sm">
                        <code>{t('tasks.notInstalled.installCommand')}</code>
                      </div>

                      <div>
                        <a
                          href="https://github.com/eyaltoledano/claude-task-master"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--claude-accent))] hover:underline"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                          {t('tasks.notInstalled.viewOnGitHub')}
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-[hsl(var(--claude-text))]">{t('tasks.notInstalled.afterInstallation')}</p>
                        <ol className="list-inside list-decimal space-y-1 text-xs text-[hsl(var(--claude-text-secondary))]">
                          <li>{t('tasks.notInstalled.steps.restart')}</li>
                          <li>{t('tasks.notInstalled.steps.autoAvailable')}</li>
                          <li>{t('tasks.notInstalled.steps.initCommand')}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isTaskMasterInstalled && (
              <SettingsCardV2>
                <SettingsRowV2
                  label={t('tasks.settings.enableLabel')}
                  description={t('tasks.settings.enableDescription')}
                >
                  <SettingsToggleV2
                    checked={tasksEnabled}
                    onChange={setTasksEnabled}
                    ariaLabel={t('tasks.settings.enableLabel')}
                  />
                </SettingsRowV2>
              </SettingsCardV2>
            )}
          </>
        )}
      </SettingsSectionV2>
    </div>
  );
}
