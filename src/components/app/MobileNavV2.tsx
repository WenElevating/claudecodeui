import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Folder,
  Terminal,
  GitBranch,
  ClipboardCheck,
  Ellipsis,
  Puzzle,
  Box,
  Database,
  Globe,
  Wrench,
  Zap,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { useTasksSettings } from '../../contexts/TasksSettingsContext';
import { usePlugins } from '../../contexts/PluginsContext';
import { AppTab } from '../../types/app';

const PLUGIN_ICON_MAP: Record<string, LucideIcon> = {
  Puzzle, Box, Database, Globe, Terminal, Wrench, Zap, BarChart3, Folder, MessageSquare, GitBranch,
};

type CoreTabId = Exclude<AppTab, `plugin:${string}` | 'preview'>;
type CoreNavItem = {
  id: CoreTabId;
  icon: LucideIcon;
  label: string;
};

type MobileNavProps = {
  activeTab: AppTab;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
  isInputFocused: boolean;
};

export default function MobileNavV2({ activeTab, setActiveTab, isInputFocused }: MobileNavProps) {
  const { t } = useTranslation(['common', 'settings']);
  const { tasksEnabled, isTaskMasterInstalled } = useTasksSettings();
  const shouldShowTasksTab = Boolean(tasksEnabled && isTaskMasterInstalled);
  const { plugins } = usePlugins();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  const enabledPlugins = plugins.filter((p) => p.enabled);
  const hasPlugins = enabledPlugins.length > 0;
  const isPluginActive = activeTab.startsWith('plugin:');

  useEffect(() => {
    if (!moreOpen) return;
    const handleTap = (e: PointerEvent) => {
      const target = e.target;
      if (moreRef.current && target instanceof Node && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleTap);
    return () => document.removeEventListener('pointerdown', handleTap);
  }, [moreOpen]);

  const selectPlugin = (name: string) => {
    const pluginTab = `plugin:${name}` as AppTab;
    setActiveTab(pluginTab);
    setMoreOpen(false);
  };

  const baseCoreItems: CoreNavItem[] = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'shell', icon: Terminal, label: 'Shell' },
    { id: 'files', icon: Folder, label: 'Files' },
    { id: 'git', icon: GitBranch, label: 'Git' },
  ];
  const coreItems: CoreNavItem[] = shouldShowTasksTab
    ? [...baseCoreItems, { id: 'tasks', icon: ClipboardCheck, label: 'Tasks' }]
    : baseCoreItems;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
        isInputFocused ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* V2 Nav - Floating pill style */}
      <div
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{
          background: 'hsl(var(--claude-bg))',
          border: '1px solid hsl(var(--claude-border))',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {coreItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onTouchStart={(e) => { e.preventDefault(); setActiveTab(item.id); }}
                className={`relative flex flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all duration-200 ${
                  isActive ? 'scale-105' : 'active:scale-95'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator - amber pill */}
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full"
                    style={{ background: 'hsl(var(--claude-accent))' }}
                  />
                )}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon
                    className={`transition-all duration-200 ${isActive ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    isActive ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button for plugins */}
          {hasPlugins && (
            <div ref={moreRef} className="relative flex-1">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                onTouchStart={(e) => { e.preventDefault(); setMoreOpen((v) => !v); }}
                className={`relative flex w-full touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all duration-200 ${
                  (isPluginActive || moreOpen) ? 'scale-105' : 'active:scale-95'
                }`}
                aria-label="More plugins"
                aria-expanded={moreOpen}
              >
                {(isPluginActive && !moreOpen) && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full"
                    style={{ background: 'hsl(var(--claude-accent))' }}
                  />
                )}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                    isPluginActive
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                      : 'text-gray-400'
                  }`}
                >
                  <Ellipsis
                    className={`transition-all duration-200 ${isPluginActive ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`}
                    strokeWidth={isPluginActive ? 2.2 : 1.8}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    isPluginActive || moreOpen ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  {t('settings:pluginSettings.morePlugins')}
                </span>
              </button>

              {/* Popover */}
              {moreOpen && (
                <div
                  className="animate-in fade-in slide-in-from-bottom-2 absolute bottom-full right-0 z-[60] mb-2 min-w-[160px] rounded-xl shadow-lg overflow-hidden"
                  style={{
                    background: 'hsl(var(--claude-elevated))',
                    border: '1px solid hsl(var(--claude-border))'
                  }}
                >
                  {enabledPlugins.map((p) => {
                    const Icon = PLUGIN_ICON_MAP[p.icon] || Puzzle;
                    const isActive = activeTab === `plugin:${p.name}`;

                    return (
                      <button
                        key={p.name}
                        onClick={() => selectPlugin(p.name)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                            isActive ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.8} />
                        </div>
                        <span className="truncate font-medium">{p.displayName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
