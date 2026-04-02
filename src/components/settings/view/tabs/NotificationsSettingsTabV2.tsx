import { BellOff, BellRing, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NotificationPreferencesState } from '../../types/types';
import SettingsCardV2 from '../v2/SettingsCardV2';
import SettingsSectionV2 from '../v2/SettingsSectionV2';
import SettingsToggleV2 from '../v2/SettingsToggleV2';

type NotificationsSettingsTabV2Props = {
  notificationPreferences: NotificationPreferencesState;
  onNotificationPreferencesChange: (value: NotificationPreferencesState) => void;
  pushPermission: NotificationPermission | 'unsupported';
  isPushSubscribed: boolean;
  isPushLoading: boolean;
  onEnablePush: () => void;
  onDisablePush: () => void;
};

export default function NotificationsSettingsTabV2({
  notificationPreferences,
  onNotificationPreferencesChange,
  pushPermission,
  isPushSubscribed,
  isPushLoading,
  onEnablePush,
  onDisablePush,
}: NotificationsSettingsTabV2Props) {
  const { t } = useTranslation('settings');

  const pushSupported = pushPermission !== 'unsupported';
  const pushDenied = pushPermission === 'denied';

  return (
    <div className="space-y-8">
      <SettingsSectionV2 title={t('notifications.title')}>
        <p className="-mt-2 text-sm text-[hsl(var(--claude-text-secondary))]">{t('notifications.description')}</p>

        <SettingsCardV2>
          <div className="space-y-4 p-5">
            <h4 className="font-medium text-[hsl(var(--claude-text))]">{t('notifications.webPush.title')}</h4>
            {!pushSupported ? (
              <p className="text-sm text-[hsl(var(--claude-text-secondary))]">{t('notifications.webPush.unsupported')}</p>
            ) : pushDenied ? (
              <p className="text-sm text-[hsl(var(--claude-text-secondary))]">{t('notifications.webPush.denied')}</p>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isPushLoading}
                  onClick={() => {
                    if (isPushSubscribed) {
                      onDisablePush();
                    } else {
                      onEnablePush();
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isPushSubscribed
                      ? 'v2-btn v2-btn-secondary !text-red-600 dark:!text-red-400'
                      : 'v2-btn v2-btn-primary'
                  }`}
                >
                  {isPushLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPushSubscribed ? (
                    <BellOff className="h-4 w-4" />
                  ) : (
                    <BellRing className="h-4 w-4" />
                  )}
                  {isPushLoading
                    ? t('notifications.webPush.loading')
                    : isPushSubscribed
                      ? t('notifications.webPush.disable')
                      : t('notifications.webPush.enable')}
                </button>
                {isPushSubscribed && (
                  <span className="text-sm text-[hsl(var(--claude-accent))]">
                    {t('notifications.webPush.enabled')}
                  </span>
                )}
              </div>
            )}
          </div>
        </SettingsCardV2>

        <SettingsCardV2>
          <div className="space-y-4 p-5">
            <h4 className="font-medium text-[hsl(var(--claude-text))]">{t('notifications.events.title')}</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-0 py-3">
                <span className="text-sm text-[hsl(var(--claude-text))]">{t('notifications.events.actionRequired')}</span>
                <SettingsToggleV2
                  checked={notificationPreferences.events.actionRequired}
                  onChange={(checked) =>
                    onNotificationPreferencesChange({
                      ...notificationPreferences,
                      events: { ...notificationPreferences.events, actionRequired: checked },
                    })
                  }
                  ariaLabel={t('notifications.events.actionRequired')}
                />
              </div>

              <div className="flex items-center justify-between px-0 py-3">
                <span className="text-sm text-[hsl(var(--claude-text))]">{t('notifications.events.stop')}</span>
                <SettingsToggleV2
                  checked={notificationPreferences.events.stop}
                  onChange={(checked) =>
                    onNotificationPreferencesChange({
                      ...notificationPreferences,
                      events: { ...notificationPreferences.events, stop: checked },
                    })
                  }
                  ariaLabel={t('notifications.events.stop')}
                />
              </div>

              <div className="flex items-center justify-between px-0 py-3">
                <span className="text-sm text-[hsl(var(--claude-text))]">{t('notifications.events.error')}</span>
                <SettingsToggleV2
                  checked={notificationPreferences.events.error}
                  onChange={(checked) =>
                    onNotificationPreferencesChange({
                      ...notificationPreferences,
                      events: { ...notificationPreferences.events, error: checked },
                    })
                  }
                  ariaLabel={t('notifications.events.error')}
                />
              </div>
            </div>
          </div>
        </SettingsCardV2>
      </SettingsSectionV2>
    </div>
  );
}
