import { ChevronDown, ChevronRight, Edit3, Folder, FolderOpen, Star, Trash2 } from 'lucide-react';
import type { TFunction } from 'i18next';
import { cn } from '../../../../lib/utils';
import type { Project, ProjectSession, SessionProvider } from '../../../../types/app';
import type { MCPServerStatus, SessionWithProvider } from '../../types/types';
import { getTaskIndicatorStatus } from '../../utils/utils';
import TaskIndicator from './TaskIndicator';
import SidebarProjectSessions from './SidebarProjectSessions';
import ContextMenu from './ContextMenu';

type SidebarProjectItemProps = {
  project: Project;
  smartDisplayName: string;
  formattedPath: string;
  selectedProject: Project | null;
  selectedSession: ProjectSession | null;
  isExpanded: boolean;
  isDeleting: boolean;
  isStarred: boolean;
  editingProject: string | null;
  editingName: string;
  sessions: SessionWithProvider[];
  initialSessionsLoaded: boolean;
  isLoadingSessions: boolean;
  currentTime: Date;
  editingSession: string | null;
  editingSessionName: string;
  tasksEnabled: boolean;
  mcpServerStatus: MCPServerStatus;
  onEditingNameChange: (name: string) => void;
  onToggleProject: (projectName: string) => void;
  onProjectSelect: (project: Project) => void;
  onToggleStarProject: (projectName: string) => void;
  onStartEditingProject: (project: Project) => void;
  onCancelEditingProject: () => void;
  onSaveProjectName: (projectName: string) => void;
  onDeleteProject: (project: Project) => void;
  onSessionSelect: (session: SessionWithProvider, projectName: string) => void;
  onDeleteSession: (
    projectName: string,
    sessionId: string,
    sessionTitle: string,
    provider: SessionProvider,
  ) => void;
  onLoadMoreSessions: (project: Project) => void;
  onNewSession: (project: Project) => void;
  onEditingSessionNameChange: (value: string) => void;
  onStartEditingSession: (sessionId: string, initialName: string) => void;
  onCancelEditingSession: () => void;
  onSaveEditingSession: (projectName: string, sessionId: string, summary: string, provider: SessionProvider) => void;
  t: TFunction;
};

const getSessionCountDisplay = (sessions: SessionWithProvider[], hasMoreSessions: boolean): string => {
  const sessionCount = sessions.length;
  if (hasMoreSessions && sessionCount >= 5) {
    return `${sessionCount}+`;
  }
  return `${sessionCount}`;
};

export default function SidebarProjectItemV2({
  project,
  smartDisplayName,
  formattedPath,
  selectedProject,
  selectedSession,
  isExpanded,
  isDeleting,
  isStarred,
  editingProject,
  editingName,
  sessions,
  initialSessionsLoaded,
  isLoadingSessions,
  currentTime,
  editingSession,
  editingSessionName,
  tasksEnabled,
  mcpServerStatus,
  onEditingNameChange,
  onToggleProject,
  onProjectSelect,
  onToggleStarProject,
  onStartEditingProject,
  onCancelEditingProject,
  onSaveProjectName,
  onDeleteProject,
  onSessionSelect,
  onDeleteSession,
  onLoadMoreSessions,
  onNewSession,
  onEditingSessionNameChange,
  onStartEditingSession,
  onCancelEditingSession,
  onSaveEditingSession,
  t,
}: SidebarProjectItemProps) {
  const isSelected = selectedProject?.name === project.name;
  const isEditing = editingProject === project.name;
  const hasMoreSessions = project.sessionMeta?.hasMore === true;
  const sessionCountDisplay = getSessionCountDisplay(sessions, hasMoreSessions);
  const taskStatus = getTaskIndicatorStatus(project, mcpServerStatus);
  const fullPath = project.fullPath || project.path || '';
  const showPath = formattedPath !== smartDisplayName && fullPath;

  const toggleProject = () => onToggleProject(project.name);

  const saveProjectName = () => {
    onSaveProjectName(project.name);
  };

  const selectAndToggleProject = () => {
    if (selectedProject?.name !== project.name) {
      onProjectSelect(project);
    }
    toggleProject();
  };

  const contextMenuItems = [
    {
      label: isStarred ? t('tooltips.removeFromFavorites', { defaultValue: 'Remove from Favorites' }) : t('tooltips.addToFavorites', { defaultValue: 'Add to Favorites' }),
      icon: <Star className={cn('h-4 w-4', isStarred && 'fill-amber-500 text-amber-500')} />,
      onClick: () => onToggleStarProject(project.name),
    },
    {
      label: t('tooltips.renameProject', { defaultValue: 'Rename Project' }),
      icon: <Edit3 className="h-4 w-4" />,
      onClick: () => onStartEditingProject(project),
    },
    {
      label: t('tooltips.deleteProject', { defaultValue: 'Delete Project' }),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDeleteProject(project),
      variant: 'danger' as const,
    },
  ];

  return (
    <div className={cn('space-y-0.5', isDeleting && 'opacity-50 pointer-events-none')}>
      {/* V2 Mobile card */}
      <div className="md:hidden">
        <ContextMenu items={contextMenuItems}>
          <div
            className={cn(
              'v2-project-card',
              isSelected && 'selected',
              isStarred && !isSelected && 'bg-amber-50/50 border-amber-100',
            )}
            onClick={toggleProject}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'v2-sidebar-item-icon',
                  isExpanded && 'bg-amber-100 text-amber-600',
                )}
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(event) => onEditingNameChange(event.target.value)}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    placeholder={t('projects.projectNamePlaceholder')}
                    autoFocus
                    autoComplete="off"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveProjectName();
                      if (event.key === 'Escape') onCancelEditingProject();
                    }}
                    style={{ fontSize: '16px' }}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="v2-sidebar-item-title" title={fullPath || project.displayName}>
                        {smartDisplayName}
                      </h3>
                      {isStarred && (
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                      )}
                      {tasksEnabled && (
                        <TaskIndicator status={taskStatus} size="xs" className="flex-shrink-0" />
                      )}
                    </div>
                    <p className="v2-sidebar-item-meta">
                      {sessionCountDisplay} {sessions.length === 1 ? 'session' : 'sessions'}
                    </p>
                  </>
                )}
              </div>

              {/* Expand indicator */}
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </ContextMenu>
      </div>

      {/* V2 Desktop item */}
      <div className="hidden md:block">
        <ContextMenu items={contextMenuItems}>
          <div
            className={cn(
              'flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all duration-150',
              isSelected ? 'bg-amber-50/80 text-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
              isStarred && !isSelected && 'bg-amber-50/30 hover:bg-amber-100/50',
            )}
            onClick={selectAndToggleProject}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                isExpanded ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400',
              )}>
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(event) => onEditingNameChange(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
                    placeholder={t('projects.projectNamePlaceholder')}
                    autoFocus
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveProjectName();
                      if (event.key === 'Escape') onCancelEditingProject();
                    }}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100" title={fullPath || project.displayName}>
                        {smartDisplayName}
                      </span>
                      {isStarred && (
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                      )}
                      {tasksEnabled && (
                        <TaskIndicator status={taskStatus} size="xs" className="flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 min-w-0">
                      <span className="flex-shrink-0">{sessionCountDisplay}</span>
                      {showPath && (
                        <span className="opacity-60 truncate" title={fullPath}>
                          • {formattedPath}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Expand indicator */}
            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </ContextMenu>
      </div>

      <SidebarProjectSessions
        project={project}
        isExpanded={isExpanded}
        sessions={sessions}
        selectedSession={selectedSession}
        initialSessionsLoaded={initialSessionsLoaded}
        isLoadingSessions={isLoadingSessions}
        currentTime={currentTime}
        editingSession={editingSession}
        editingSessionName={editingSessionName}
        onEditingSessionNameChange={onEditingSessionNameChange}
        onStartEditingSession={onStartEditingSession}
        onCancelEditingSession={onCancelEditingSession}
        onSaveEditingSession={onSaveEditingSession}
        onProjectSelect={onProjectSelect}
        onSessionSelect={onSessionSelect}
        onDeleteSession={onDeleteSession}
        onLoadMoreSessions={onLoadMoreSessions}
        onNewSession={onNewSession}
        t={t}
      />
    </div>
  );
}
