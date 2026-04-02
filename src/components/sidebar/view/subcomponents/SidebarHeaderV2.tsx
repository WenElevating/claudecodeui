import { Folder, FolderPlus, MessageSquare, Plus, RefreshCw, Search, X, PanelLeftClose } from 'lucide-react';
import type { TFunction } from 'i18next';
import { Button, Input } from '../../../../shared/view/ui';
import { IS_PLATFORM } from '../../../../constants/config';
import { cn } from '../../../../lib/utils';

type SearchMode = 'projects' | 'conversations';

type SidebarHeaderProps = {
  isPWA: boolean;
  isMobile: boolean;
  isLoading: boolean;
  projectsCount: number;
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  onClearSearchFilter: () => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreateProject: () => void;
  onCollapseSidebar: () => void;
  t: TFunction;
};

export default function SidebarHeaderV2({
  isPWA,
  isMobile,
  isLoading,
  projectsCount,
  searchFilter,
  onSearchFilterChange,
  onClearSearchFilter,
  searchMode,
  onSearchModeChange,
  onRefresh,
  isRefreshing,
  onCreateProject,
  onCollapseSidebar,
  t,
}: SidebarHeaderProps) {
  const LogoBlock = () => (
    <div className="v2-logo">
      <div className="v2-logo-icon">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <span className="v2-logo-text">{t('app.title')}</span>
    </div>
  );

  return (
    <div className="flex-shrink-0">
      {/* V2 Desktop header */}
      <div className="hidden px-3 py-3 md:block">
        <div className="flex items-center justify-between gap-2">
          {IS_PLATFORM ? (
            <a
              href="https://cloudcli.ai/dashboard"
              className="transition-opacity hover:opacity-80"
              title={t('tooltips.viewEnvironments')}
            >
              <LogoBlock />
            </a>
          ) : (
            <LogoBlock />
          )}

          <div className="flex items-center gap-0.5">
            <button
              className="v2-icon-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              title={t('tooltips.refresh')}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="v2-icon-btn"
              onClick={onCreateProject}
              title={t('tooltips.createProject')}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="v2-icon-btn"
              onClick={onCollapseSidebar}
              title={t('tooltips.hideSidebar')}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* V2 Search section */}
        {projectsCount > 0 && !isLoading && (
          <div className="mt-3 space-y-2">
            {/* Toggle Pills */}
            <div className="v2-toggle-pills">
              <button
                onClick={() => onSearchModeChange('projects')}
                className={cn('v2-toggle-pill', searchMode === 'projects' && 'active')}
              >
                <Folder className="h-3.5 w-3.5" />
                <span>{t('search.modeProjects')}</span>
              </button>
              <button
                onClick={() => onSearchModeChange('conversations')}
                className={cn('v2-toggle-pill', searchMode === 'conversations' && 'active')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{t('search.modeConversations')}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="v2-search-wrapper">
              <Search className="v2-search-icon h-4 w-4" />
              <input
                type="text"
                placeholder={searchMode === 'conversations' ? t('search.conversationsPlaceholder') : t('projects.searchPlaceholder')}
                value={searchFilter}
                onChange={(e) => onSearchFilterChange(e.target.value)}
                className="v2-search-input"
              />
              {searchFilter && (
                <button
                  onClick={onClearSearchFilter}
                  className="absolute right-3 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label={t('tooltips.clearSearch')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* V2 Desktop divider */}
      <div className="v2-divider hidden md:block" />

      {/* V2 Mobile header */}
      <div
        className="px-4 py-3 md:hidden"
        style={isPWA && isMobile ? { paddingTop: 'max(16px, env(safe-area-inset-top))' } : {}}
      >
        <div className="flex items-center justify-between">
          {IS_PLATFORM ? (
            <a
              href="https://cloudcli.ai/dashboard"
              className="transition-opacity active:opacity-70"
              title={t('tooltips.viewEnvironments')}
            >
              <LogoBlock />
            </a>
          ) : (
            <LogoBlock />
          )}

          <div className="flex items-center gap-2">
            <button
              className="v2-icon-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="v2-btn-primary h-9 px-3"
              onClick={onCreateProject}
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* V2 Mobile search */}
        {projectsCount > 0 && !isLoading && (
          <div className="mt-3 space-y-3">
            <div className="v2-toggle-pills">
              <button
                onClick={() => onSearchModeChange('projects')}
                className={cn('v2-toggle-pill', searchMode === 'projects' && 'active')}
              >
                <Folder className="h-3.5 w-3.5" />
                <span>{t('search.modeProjects')}</span>
              </button>
              <button
                onClick={() => onSearchModeChange('conversations')}
                className={cn('v2-toggle-pill', searchMode === 'conversations' && 'active')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{t('search.modeConversations')}</span>
              </button>
            </div>
            <div className="v2-search-wrapper">
              <Search className="v2-search-icon h-4 w-4" />
              <input
                type="text"
                placeholder={searchMode === 'conversations' ? t('search.conversationsPlaceholder') : t('projects.searchPlaceholder')}
                value={searchFilter}
                onChange={(e) => onSearchFilterChange(e.target.value)}
                className="v2-search-input"
              />
              {searchFilter && (
                <button
                  onClick={onClearSearchFilter}
                  className="absolute right-3 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label={t('tooltips.clearSearch')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* V2 Mobile divider */}
      <div className="v2-divider md:hidden" />
    </div>
  );
}
