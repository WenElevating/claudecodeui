import { Check, ChevronDown, ChevronRight, Edit3, Folder, FolderOpen, Star, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';
import { Button } from '../../../../shared/view/ui';
import { cn } from '../../../../lib/utils';
import type { Project, ProjectSession, SessionProvider } from '../../../../types/app';
import type { MCPServerStatus, SessionWithProvider } from '../../types/types';
import { getTaskIndicatorStatus, getProjectShortName } from '../../utils/utils';
import TaskIndicator from './TaskIndicator';
import SidebarProjectSessions from './SidebarProjectSessions';

type SidebarProjectItemProps = {
  project: Project;
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
  const shortName = getProjectShortName(project);
  const showFullPath = shortName !== project.displayName && project.fullPath;

  const toggleProject = () => onToggleProject(project.name);
  const toggleStarProject = () => onToggleStarProject(project.name);

  const saveProjectName = () => {
    onSaveProjectName(project.name);
  };

  const selectAndToggleProject = () => {
    if (selectedProject?.name !== project.name) {
      onProjectSelect(project);
    }
    toggleProject();
  };

  return (
    <div className={cn('space-y-0.5', isDeleting && 'opacity-50 pointer-events-none')}>
      {/* V2 Mobile card */}
      <div className="md:hidden">
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
                    <h3 className="v2-sidebar-item-title" title={project.fullPath || project.displayName}>{shortName}</h3>
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

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    className="v2-icon-btn h-8 w-8 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                    onClick={(e) => { e.stopPropagation(); saveProjectName(); }}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    className="v2-icon-btn h-8 w-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    onClick={(e) => { e.stopPropagation(); onCancelEditingProject(); }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={cn(
                      'v2-icon-btn h-8 w-8 rounded-lg',
                      isStarred ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100',
                    )}
                    onClick={(e) => { e.stopPropagation(); toggleStarProject(); }}
                    title={isStarred ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
                  >
                    <Star className={cn('h-4 w-4', isStarred && 'fill-current')} />
                  </button>
                  <button
                    className="v2-icon-btn h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-100"
                    onClick={(e) => { e.stopPropagation(); onStartEditingProject(project); }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    className="v2-icon-btn h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="ml-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* V2 Desktop item */}
      <div className="hidden md:block group">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-between p-2.5 h-auto font-normal rounded-xl transition-all duration-150',
            isSelected ? 'bg-amber-50/80 text-gray-800 hover:bg-amber-100/80' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
            isStarred && !isSelected && 'bg-amber-50/30 hover:bg-amber-100/50',
          )}
          onClick={selectAndToggleProject}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
              isExpanded ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200',
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
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveProjectName();
                    if (event.key === 'Escape') onCancelEditingProject();
                  }}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100" title={project.fullPath || project.displayName}>
                      {shortName}
                    </span>
                    {tasksEnabled && (
                      <TaskIndicator status={taskStatus} size="xs" className="flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 min-w-0">
                    <span className="flex-shrink-0">{sessionCountDisplay}</span>
                    {showFullPath && (
                      <span className="opacity-60 truncate" title={project.fullPath}>
                        • {project.fullPath}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-0.5 ml-2">
            {isEditing ? (
              <>
                <div
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50"
                  onClick={(e) => { e.stopPropagation(); saveProjectName(); }}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                  onClick={(e) => { e.stopPropagation(); onCancelEditingProject(); }}
                >
                  <X className="h-3.5 w-3.5" />
                </div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    'w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer flex-shrink-0',
                    isStarred ? 'text-amber-500 hover:bg-amber-50 opacity-100' : 'text-gray-400 hover:bg-gray-100',
                  )}
                  onClick={(e) => { e.stopPropagation(); toggleStarProject(); }}
                  title={isStarred ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
                >
                  <Star className={cn('h-3.5 w-3.5', isStarred && 'fill-current')} />
                </div>
                <div
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer text-gray-400 hover:bg-gray-100 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); onStartEditingProject(project); }}
                  title={t('tooltips.renameProject')}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </div>
                <div
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer text-red-400 hover:bg-red-50 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
                  title={t('tooltips.deleteProject')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-shrink-0 ml-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </>
            )}
          </div>
        </Button>
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
