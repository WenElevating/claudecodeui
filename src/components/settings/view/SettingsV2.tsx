import { X, Bot, Palette, GitBranch, Key, ListChecks, Puzzle, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProviderLoginModal from '../../provider-auth/view/ProviderLoginModal';
import ClaudeMcpFormModal from '../view/modals/ClaudeMcpFormModal';
import CodexMcpFormModal from '../view/modals/CodexMcpFormModal';
import AgentsSettingsTab from '../view/tabs/agents-settings/AgentsSettingsTab';
import AppearanceSettingsTabV2 from '../view/tabs/AppearanceSettingsTabV2';
import CredentialsSettingsTab from '../view/tabs/api-settings/CredentialsSettingsTab';
import GitSettingsTabV2 from '../view/tabs/git-settings/GitSettingsTabV2';
import NotificationsSettingsTabV2 from '../view/tabs/NotificationsSettingsTabV2';
import TasksSettingsTabV2 from '../view/tabs/tasks-settings/TasksSettingsTabV2';
import PluginSettingsTab from '../../plugins/view/PluginSettingsTab';
import { useSettingsController } from '../hooks/useSettingsController';
import { useWebPush } from '../../../hooks/useWebPush';
import { cn } from '../../../lib/utils';
import type { SettingsMainTab, SettingsProps } from '../types/types';

type NavItem = {
  id: SettingsMainTab;
  labelKey: string;
  icon: typeof Bot;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'agents', labelKey: 'mainTabs.agents', icon: Bot },
  { id: 'appearance', labelKey: 'mainTabs.appearance', icon: Palette },
  { id: 'git', labelKey: 'mainTabs.git', icon: GitBranch },
  { id: 'api', labelKey: 'mainTabs.apiTokens', icon: Key },
  { id: 'tasks', labelKey: 'mainTabs.tasks', icon: ListChecks },
  { id: 'plugins', labelKey: 'mainTabs.plugins', icon: Puzzle },
  { id: 'notifications', labelKey: 'mainTabs.notifications', icon: Bell },
];

function SettingsV2({ isOpen, onClose, projects = [], initialTab = 'agents' }: SettingsProps) {
  const { t } = useTranslation('settings');
  const {
    activeTab,
    setActiveTab,
    saveStatus,
    deleteError,
    projectSortOrder,
    setProjectSortOrder,
    codeEditorSettings,
    updateCodeEditorSetting,
    claudePermissions,
    setClaudePermissions,
    notificationPreferences,
    setNotificationPreferences,
    cursorPermissions,
    setCursorPermissions,
    codexPermissionMode,
    setCodexPermissionMode,
    mcpServers,
    cursorMcpServers,
    codexMcpServers,
    mcpTestResults,
    mcpServerTools,
    mcpToolsLoading,
    showMcpForm,
    editingMcpServer,
    openMcpForm,
    closeMcpForm,
    submitMcpForm,
    handleMcpDelete,
    handleMcpTest,
    handleMcpToolsDiscovery,
    showCodexMcpForm,
    editingCodexMcpServer,
    openCodexMcpForm,
    closeCodexMcpForm,
    submitCodexMcpForm,
    handleCodexMcpDelete,
    claudeAuthStatus,
    cursorAuthStatus,
    codexAuthStatus,
    geminiAuthStatus,
    geminiPermissionMode,
    setGeminiPermissionMode,
    openLoginForProvider,
    showLoginModal,
    setShowLoginModal,
    loginProvider,
    selectedProject,
    handleLoginComplete,
  } = useSettingsController({
    isOpen,
    initialTab,
    projects,
    onClose,
  });

  const {
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
  } = useWebPush();

  const handleEnablePush = async () => {
    await pushSubscribe();
    setNotificationPreferences({
      ...notificationPreferences,
      channels: { ...notificationPreferences.channels, webPush: true },
    });
  };

  const handleDisablePush = async () => {
    await pushUnsubscribe();
    setNotificationPreferences({
      ...notificationPreferences,
      channels: { ...notificationPreferences.channels, webPush: false },
    });
  };

  if (!isOpen) {
    return null;
  }

  const authStatusMap: Record<string, { authenticated: boolean }> = {
    claude: claudeAuthStatus,
    cursor: cursorAuthStatus,
    codex: codexAuthStatus,
    gemini: geminiAuthStatus,
  };
  const isAuthenticated = authStatusMap[loginProvider ?? '']?.authenticated ?? false;

  return (
    <div className="v2-settings-backdrop">
      <div className="v2-settings-shell">
        {/* Header */}
        <div className="v2-settings-header">
          <h2 className="v2-settings-title">{t('title')}</h2>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <span className="v2-settings-save-status">{t('saveStatus.success')}</span>
            )}
            <button className="v2-icon-btn" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="v2-settings-tabs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn('v2-settings-tab', isActive && 'v2-settings-tab-active')}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="v2-settings-content">
          <div key={activeTab} className="v2-settings-content-enter space-y-6 md:space-y-8">
            {activeTab === 'agents' && (
              <AgentsSettingsTab
                claudeAuthStatus={claudeAuthStatus}
                cursorAuthStatus={cursorAuthStatus}
                codexAuthStatus={codexAuthStatus}
                geminiAuthStatus={geminiAuthStatus}
                onClaudeLogin={() => openLoginForProvider('claude')}
                onCursorLogin={() => openLoginForProvider('cursor')}
                onCodexLogin={() => openLoginForProvider('codex')}
                onGeminiLogin={() => openLoginForProvider('gemini')}
                claudePermissions={claudePermissions}
                onClaudePermissionsChange={setClaudePermissions}
                cursorPermissions={cursorPermissions}
                onCursorPermissionsChange={setCursorPermissions}
                codexPermissionMode={codexPermissionMode}
                onCodexPermissionModeChange={setCodexPermissionMode}
                geminiPermissionMode={geminiPermissionMode}
                onGeminiPermissionModeChange={setGeminiPermissionMode}
                mcpServers={mcpServers}
                cursorMcpServers={cursorMcpServers}
                codexMcpServers={codexMcpServers}
                mcpTestResults={mcpTestResults}
                mcpServerTools={mcpServerTools}
                mcpToolsLoading={mcpToolsLoading}
                onOpenMcpForm={openMcpForm}
                onDeleteMcpServer={handleMcpDelete}
                onTestMcpServer={handleMcpTest}
                onDiscoverMcpTools={handleMcpToolsDiscovery}
                onOpenCodexMcpForm={openCodexMcpForm}
                onDeleteCodexMcpServer={handleCodexMcpDelete}
                deleteError={deleteError}
              />
            )}

            {activeTab === 'appearance' && (
              <AppearanceSettingsTabV2
                projectSortOrder={projectSortOrder}
                onProjectSortOrderChange={setProjectSortOrder}
                codeEditorSettings={codeEditorSettings}
                onCodeEditorSettingChange={updateCodeEditorSetting}
              />
            )}

            {activeTab === 'git' && <GitSettingsTabV2 />}

            {activeTab === 'tasks' && <TasksSettingsTabV2 />}

            {activeTab === 'notifications' && (
              <NotificationsSettingsTabV2
                notificationPreferences={notificationPreferences}
                onNotificationPreferencesChange={setNotificationPreferences}
                pushPermission={pushPermission}
                isPushSubscribed={isPushSubscribed}
                isPushLoading={isPushLoading}
                onEnablePush={handleEnablePush}
                onDisablePush={handleDisablePush}
              />
            )}

            {activeTab === 'api' && <CredentialsSettingsTab />}

            {activeTab === 'plugins' && <PluginSettingsTab />}
          </div>
        </div>
      </div>

      <ProviderLoginModal
        key={loginProvider || 'claude'}
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        provider={loginProvider || 'claude'}
        project={selectedProject}
        onComplete={handleLoginComplete}
        isAuthenticated={isAuthenticated}
      />

      <ClaudeMcpFormModal
        isOpen={showMcpForm}
        editingServer={editingMcpServer}
        projects={projects}
        onClose={closeMcpForm}
        onSubmit={submitMcpForm}
      />

      <CodexMcpFormModal
        isOpen={showCodexMcpForm}
        editingServer={editingCodexMcpServer}
        onClose={closeCodexMcpForm}
        onSubmit={submitCodexMcpForm}
      />
    </div>
  );
}

export default SettingsV2;
