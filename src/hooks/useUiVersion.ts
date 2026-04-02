import { useUiPreferences } from './useUiPreferences';

/**
 * Hook to manage UI version switching between original and V2 design.
 * Uses the useNewUi preference from useUiPreferences.
 */
export function useUiVersion() {
  const { preferences, setPreference } = useUiPreferences();

  return {
    useNewUi: preferences.useNewUi ?? false,
    setUseNewUi: (value: boolean) => setPreference('useNewUi', value),
    toggleUiVersion: () => setPreference('useNewUi', !preferences.useNewUi),
  };
}
