import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useDeviceSettings } from '../../../../hooks/useDeviceSettings';
import { useUiPreferences } from '../../../../hooks/useUiPreferences';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useQuickSettingsDrag } from '../../hooks/useQuickSettingsDrag';
import type { PreferenceToggleKey, QuickSettingsPreferences } from '../../types';
import QuickSettingsContentV2 from './QuickSettingsContentV2';
import QuickSettingsHandleV2 from './QuickSettingsHandleV2';
import QuickSettingsPanelHeaderV2 from './QuickSettingsPanelHeaderV2';

export default function QuickSettingsPanelV2View() {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDeviceSettings({ trackPWA: false });
  const { isDarkMode } = useTheme();
  const { preferences, setPreference } = useUiPreferences();
  const {
    isDragging,
    handleStyle,
    startDrag,
    consumeSuppressedClick,
  } = useQuickSettingsDrag({ isMobile });

  const quickSettingsPreferences = useMemo<QuickSettingsPreferences>(() => ({
    autoExpandTools: preferences.autoExpandTools,
    showRawParameters: preferences.showRawParameters,
    showThinking: preferences.showThinking,
    autoScrollToBottom: preferences.autoScrollToBottom,
    sendByCtrlEnter: preferences.sendByCtrlEnter,
  }), [
    preferences.autoExpandTools,
    preferences.autoScrollToBottom,
    preferences.sendByCtrlEnter,
    preferences.showRawParameters,
    preferences.showThinking,
  ]);

  const handlePreferenceChange = useCallback(
    (key: PreferenceToggleKey, value: boolean) => {
      setPreference(key, value);
    },
    [setPreference],
  );

  const handleToggleFromHandle = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (consumeSuppressedClick()) {
        event.preventDefault();
        return;
      }

      setIsOpen((previous) => !previous);
    },
    [consumeSuppressedClick],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <QuickSettingsHandleV2
        isOpen={isOpen}
        isDragging={isDragging}
        style={handleStyle}
        onClick={handleToggleFromHandle}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      />

      <div
        className={`fixed right-0 top-0 z-40 h-full w-72 transform border-l border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-bg))] shadow-[var(--shadow-lg)] transition-transform duration-150 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isMobile ? 'h-screen' : ''}`}
      >
        <div className="flex h-full flex-col">
          <QuickSettingsPanelHeaderV2 onClose={handleClose} />
          <QuickSettingsContentV2
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            preferences={quickSettingsPreferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-[hsl(var(--claude-text)/0.3)] backdrop-blur-sm transition-opacity duration-150 ease-out"
          onClick={handleClose}
        />
      )}
    </>
  );
}
