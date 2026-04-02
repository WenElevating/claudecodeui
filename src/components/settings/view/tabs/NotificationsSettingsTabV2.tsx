import { BellOff, BellRing, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NotificationPreferencesState } from '../../types/types';
import SettingsCardV2 from '../v2/SettingsCardV2';
import SettingsRowV2 from '../v2/SettingsRowV2';
import SettingsSectionV2 from '../v2/SettingsSectionV2';
import SettingsToggleV2 from '../v2/SettingsToggleV2';

type EventKey = 'actionRequired' | 'stop' | 'error';

const EVENT_KEYS: { key: EventKey; labelKey: string }[] = [
  { key: 'actionRequired', labelKey: 'notifications.events.actionRequired' },
  { key: 'stop', labelKey: 'notifications.events.stop' },
  { key: 'error', labelKey: 'notifications.events.error' },
];

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

  const handleEventChange = (key: EventKey, checked: boolean) => {
    onNotificationPreferencesChange({
      ...notificationPreferences,
      events: { ...notificationPreferences.events, [key]: checked },
    });
  };

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
                  onClick={isPushSubscribed ? onDisablePush : onEnablePush}
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

        <SettingsCardV2 divided>
          <div className="p-5 pb-2">
            <h4 className="font-medium text-[hsl(var(--claude-text))]">{t('notifications.events.title')}</h4>
          </div>
          {EVENT_KEYS.map(({ key, labelKey }) => (
            <SettingsRowV2 key={key} label={t(labelKey)}>
              <SettingsToggleV2
                checked={notificationPreferences.events[key]}
                onChange={(checked) => handleEventChange(key, checked)}
                ariaLabel={t(labelKey)}
              />
            </SettingsRowV2>
          ))}
        </SettingsCardV2>
      </SettingsSectionV2>
    </div>
  );
}
