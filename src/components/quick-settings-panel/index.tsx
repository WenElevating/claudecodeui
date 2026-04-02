import { useUiVersion } from '../../hooks/useUiVersion';
import QuickSettingsPanelView from './view/QuickSettingsPanelView';
import QuickSettingsPanelV2View from './view/v2/QuickSettingsPanelV2View';

/**
 * QuickSettingsPanel automatically renders the V1 or V2 variant
 * based on the user's UI version preference.
 */
export function QuickSettingsPanel() {
  const { useNewUi } = useUiVersion();
  return useNewUi ? <QuickSettingsPanelV2View /> : <QuickSettingsPanelView />;
}
