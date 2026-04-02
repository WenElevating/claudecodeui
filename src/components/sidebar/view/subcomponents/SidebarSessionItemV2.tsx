import { Check, Clock, Edit2, Trash2, X } from 'lucide-react';
import type { TFunction } from 'i18next';
import { Badge } from '../../../../shared/view/ui';
import { cn } from '../../../../lib/utils';
import { formatTimeAgo } from '../../../../utils/dateUtils';
import type { Project, ProjectSession, SessionProvider } from '../../../../types/app';
import type { SessionWithProvider } from '../../types/types';
import { createSessionViewModel } from '../../utils/utils';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';

type SidebarSessionItemProps = {
  project: Project;
  session: SessionWithProvider;
  selectedSession: ProjectSession | null;
  currentTime: Date;
  editingSession: string | null;
  editingSessionName: string;
  onEditingSessionNameChange: (value: string) => void;
  onStartEditingSession: (sessionId: string, initialName: string) => void;
  onCancelEditingSession: () => void;
  onSaveEditingSession: (projectName: string, sessionId: string, summary: string, provider: SessionProvider) => void;
  onProjectSelect: (project: Project) => void;
  onSessionSelect: (session: SessionWithProvider, projectName: string) => void;
  onDeleteSession: (
    projectName: string,
    sessionId: string,
    sessionTitle: string,
    provider: SessionProvider,
  ) => void;
  t: TFunction;
};

export default function SidebarSessionItemV2({
  project,
  session,
  selectedSession,
  currentTime,
  editingSession,
  editingSessionName,
  onEditingSessionNameChange,
  onStartEditingSession,
  onCancelEditingSession,
  onSaveEditingSession,
  onProjectSelect,
  onSessionSelect,
  onDeleteSession,
  t,
}: SidebarSessionItemProps) {
  const sessionView = createSessionViewModel(session, currentTime, t);
  const isSelected = selectedSession?.id === session.id;

  const selectMobileSession = () => {
    onProjectSelect(project);
    onSessionSelect(session, project.name);
  };

  const saveEditedSession = () => {
    onSaveEditingSession(project.name, session.id, editingSessionName, session.__provider);
  };

  const requestDeleteSession = () => {
    onDeleteSession(project.name, session.id, sessionView.sessionName, session.__provider);
  };

  return (
    <div className="group relative">
      {/* Active indicator dot */}
      {sessionView.isActive && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        </div>
      )}

      {/* V2 Mobile card */}
      <div className="md:hidden">
        <div
          className={cn(
            'v2-session-card',
            isSelected && 'selected',
            !isSelected && sessionView.isActive && 'border-emerald-200 bg-emerald-50/50',
          )}
          onClick={selectMobileSession}
        >
          <div className="flex items-center gap-2.5">
            {/* Provider logo */}
            <div className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0',
              isSelected ? 'bg-amber-100' : 'bg-gray-100',
            )}>
              <SessionProviderLogo provider={session.__provider} className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-800">
                {sessionView.sessionName}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(sessionView.sessionTime, currentTime, t)}
                </span>
                {sessionView.messageCount > 0 && (
                  <span className="v2-badge v2-badge-muted ml-auto">
                    {sessionView.messageCount}
                  </span>
                )}
              </div>
            </div>

            {/* Delete button */}
            {!sessionView.isCursorSession && (
              <button
                className="v2-icon-btn h-7 w-7 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); requestDeleteSession(); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* V2 Desktop item */}
      <div className="hidden md:block">
        <button
          className={cn(
            'w-full flex items-start gap-2.5 p-2 rounded-lg transition-colors text-left',
            isSelected ? 'bg-amber-50/80' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
          )}
          onClick={() => onSessionSelect(session, project.name)}
        >
          <SessionProviderLogo provider={session.__provider} className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
              {sessionView.sessionName}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(sessionView.sessionTime, currentTime, t)}
              </span>
              {sessionView.messageCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-auto px-1.5 py-0 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 transition-opacity group-hover:opacity-0"
                >
                  {sessionView.messageCount}
                </Badge>
              )}
              <span className="ml-1 opacity-70 transition-opacity group-hover:opacity-0">
                <SessionProviderLogo provider={session.__provider} className="h-3 w-3" />
              </span>
            </div>
          </div>
        </button>

        {/* Hover actions */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
          {editingSession === session.id ? (
            <>
              <input
                type="text"
                value={editingSessionName}
                onChange={(event) => onEditingSessionNameChange(event.target.value)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === 'Enter') saveEditedSession();
                  else if (event.key === 'Escape') onCancelEditingSession();
                }}
                onClick={(event) => event.stopPropagation()}
                className="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
                autoFocus
              />
              <button
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600"
                onClick={(event) => { event.stopPropagation(); saveEditedSession(); }}
                title={t('tooltips.save')}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500"
                onClick={(event) => { event.stopPropagation(); onCancelEditingSession(); }}
                title={t('tooltips.cancel')}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500"
                onClick={(event) => { event.stopPropagation(); onStartEditingSession(session.id, sessionView.sessionName); }}
                title={t('tooltips.editSessionName')}
              >
                <Edit2 className="h-3 w-3" />
              </button>
              {!sessionView.isCursorSession && (
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500"
                  onClick={(event) => { event.stopPropagation(); requestDeleteSession(); }}
                  title={t('tooltips.deleteSession')}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
