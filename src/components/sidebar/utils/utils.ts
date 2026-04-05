import type { TFunction } from 'i18next';
import type { Project, ProjectSession } from '../../../types/app';
import type {
  AdditionalSessionsByProject,
  ProjectSortOrder,
  SettingsProject,
  SessionViewModel,
  SessionWithProvider,
} from '../types/types';

export const readProjectSortOrder = (): ProjectSortOrder => {
  try {
    const rawSettings = localStorage.getItem('claude-settings');
    if (!rawSettings) {
      return 'name';
    }

    const settings = JSON.parse(rawSettings) as { projectSortOrder?: ProjectSortOrder };
    return settings.projectSortOrder === 'date' ? 'date' : 'name';
  } catch {
    return 'name';
  }
};

export const loadStarredProjects = (): Set<string> => {
  try {
    const saved = localStorage.getItem('starredProjects');
    return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
};

export const persistStarredProjects = (starredProjects: Set<string>) => {
  try {
    localStorage.setItem('starredProjects', JSON.stringify([...starredProjects]));
  } catch {
    // Keep UI responsive even if storage fails.
  }
};

export const getSessionDate = (session: SessionWithProvider): Date => {
  if (session.__provider === 'cursor') {
    return new Date(session.createdAt || 0);
  }

  if (session.__provider === 'codex') {
    return new Date(session.createdAt || session.lastActivity || 0);
  }

  return new Date(session.lastActivity || session.createdAt || 0);
};

export const getSessionIdentityKey = (
  session: Pick<ProjectSession, 'id' | '__provider'>,
): string => `${session.__provider || 'claude'}:${session.id}`;

export const isSameSessionIdentity = (
  left: Pick<ProjectSession, 'id' | '__provider'> | null | undefined,
  right: Pick<ProjectSession, 'id' | '__provider'> | null | undefined,
): boolean => {
  if (!left || !right) {
    return false;
  }

  return getSessionIdentityKey(left) === getSessionIdentityKey(right);
};

export const getSessionName = (session: SessionWithProvider, t: TFunction): string => {
  if (session.__provider === 'cursor') {
    return session.summary || session.name || t('projects.untitledSession');
  }

  if (session.__provider === 'codex') {
    return session.summary || session.name || t('projects.codexSession');
  }

  if (session.__provider === 'gemini') {
    return session.summary || session.name || t('projects.newSession');
  }

  return session.summary || t('projects.newSession');
};

export const getSessionTime = (session: SessionWithProvider): string => {
  if (session.__provider === 'cursor') {
    return String(session.createdAt || '');
  }

  if (session.__provider === 'codex') {
    return String(session.createdAt || session.lastActivity || '');
  }

  return String(session.lastActivity || session.createdAt || '');
};

export const createSessionViewModel = (
  session: SessionWithProvider,
  currentTime: Date,
  t: TFunction,
): SessionViewModel => {
  const sessionDate = getSessionDate(session);
  const diffInMinutes = Math.floor((currentTime.getTime() - sessionDate.getTime()) / (1000 * 60));

  return {
    isCursorSession: session.__provider === 'cursor',
    isCodexSession: session.__provider === 'codex',
    isGeminiSession: session.__provider === 'gemini',
    isActive: diffInMinutes < 10,
    sessionName: getSessionName(session, t),
    sessionTime: getSessionTime(session),
    messageCount: Number(session.messageCount || 0),
  };
};

export const getAllSessions = (
  project: Project,
  additionalSessions: AdditionalSessionsByProject,
): SessionWithProvider[] => {
  const claudeSessions = [
    ...(project.sessions || []),
    ...(additionalSessions[project.name] || []),
  ].map((session) => ({ ...session, __provider: 'claude' as const }));

  const cursorSessions = (project.cursorSessions || []).map((session) => ({
    ...session,
    __provider: 'cursor' as const,
  }));

  const codexSessions = (project.codexSessions || []).map((session) => ({
    ...session,
    __provider: 'codex' as const,
  }));

  const geminiSessions = (project.geminiSessions || []).map((session) => ({
    ...session,
    __provider: 'gemini' as const,
  }));

  const sortedSessions = [...claudeSessions, ...cursorSessions, ...codexSessions, ...geminiSessions].sort(
    (a, b) => getSessionDate(b).getTime() - getSessionDate(a).getTime(),
  );

  const uniqueSessions = new Map<string, SessionWithProvider>();
  for (const session of sortedSessions) {
    const identityKey = getSessionIdentityKey(session);
    if (!uniqueSessions.has(identityKey)) {
      uniqueSessions.set(identityKey, session);
    }
  }

  return Array.from(uniqueSessions.values());
};

export const getProjectLastActivity = (
  project: Project,
  additionalSessions: AdditionalSessionsByProject,
): Date => {
  const sessions = getAllSessions(project, additionalSessions);
  if (sessions.length === 0) {
    return new Date(0);
  }

  return sessions.reduce((latest, session) => {
    const sessionDate = getSessionDate(session);
    return sessionDate > latest ? sessionDate : latest;
  }, new Date(0));
};

export const sortProjects = (
  projects: Project[],
  projectSortOrder: ProjectSortOrder,
  starredProjects: Set<string>,
  additionalSessions: AdditionalSessionsByProject,
): Project[] => {
  const byName = [...projects];

  byName.sort((projectA, projectB) => {
    const aStarred = starredProjects.has(projectA.name);
    const bStarred = starredProjects.has(projectB.name);

    if (aStarred && !bStarred) {
      return -1;
    }

    if (!aStarred && bStarred) {
      return 1;
    }

    if (projectSortOrder === 'date') {
      return (
        getProjectLastActivity(projectB, additionalSessions).getTime() -
        getProjectLastActivity(projectA, additionalSessions).getTime()
      );
    }

    return (projectA.displayName || projectA.name).localeCompare(projectB.displayName || projectB.name);
  });

  return byName;
};

export const filterProjects = (projects: Project[], searchFilter: string): Project[] => {
  const normalizedSearch = searchFilter.trim().toLowerCase();
  if (!normalizedSearch) {
    return projects;
  }

  return projects.filter((project) => {
    const displayName = (project.displayName || project.name).toLowerCase();
    const projectName = project.name.toLowerCase();
    return displayName.includes(normalizedSearch) || projectName.includes(normalizedSearch);
  });
};

export const getTaskIndicatorStatus = (
  project: Project,
  mcpServerStatus: { hasMCPServer?: boolean; isConfigured?: boolean } | null,
) => {
  const projectConfigured = Boolean(project.taskmaster?.hasTaskmaster);
  const mcpConfigured = Boolean(mcpServerStatus?.hasMCPServer && mcpServerStatus?.isConfigured);

  if (projectConfigured && mcpConfigured) {
    return 'fully-configured';
  }

  if (projectConfigured) {
    return 'taskmaster-only';
  }

  if (mcpConfigured) {
    return 'mcp-only';
  }

  return 'not-configured';
};

/**
 * Extract path parts from a project path
 */
const getPathParts = (path: string): string[] => {
  return path.split(/[/\\]/).filter(Boolean);
};

/**
 * Get the last folder name from a path
 */
const getLastFolderName = (path: string): string => {
  const parts = getPathParts(path);
  return parts[parts.length - 1] || path;
};

/**
 * Calculate display names for all projects, adding parent prefixes when needed to distinguish duplicates.
 * Returns a Map of project.name -> display name
 *
 * Examples:
 *   No duplicates: "my-app", "other-project"
 *   With duplicates: "work/my-app", "personal/my-app"
 */
export const calculateProjectDisplayNames = (projects: Project[]): Map<string, string> => {
  const result = new Map<string, string>();

  // Build map of short name -> projects with that name
  const shortNameToProjects = new Map<string, Project[]>();

  for (const project of projects) {
    const displayName = project.displayName || project.name;
    const shortName = getLastFolderName(displayName);

    if (!shortNameToProjects.has(shortName)) {
      shortNameToProjects.set(shortName, []);
    }
    shortNameToProjects.get(shortName)!.push(project);
  }

  // For each short name, check if there are duplicates
  for (const [shortName, projectsWithSameName] of shortNameToProjects) {
    if (projectsWithSameName.length === 1) {
      // No duplicates, use short name
      result.set(projectsWithSameName[0].name, shortName);
    } else {
      // Has duplicates, need to distinguish with parent path
      const pathPartsList = projectsWithSameName.map(project => {
        const displayName = project.displayName || project.name;
        return {
          project,
          parts: getPathParts(displayName),
        };
      });

      // Calculate how many levels needed to distinguish
      const distinguished = distinguishByPathLevels(pathPartsList);

      for (const { project, displayName } of distinguished) {
        result.set(project.name, displayName);
      }
    }
  }

  return result;
};

/**
 * Distinguish projects by adding path levels until they're unique
 */
const distinguishByPathLevels = (
  pathPartsList: Array<{ project: Project; parts: string[] }>
): Array<{ project: Project; displayName: string }> => {
  const result: Array<{ project: Project; displayName: string }> = [];
  const maxDepth = Math.max(...pathPartsList.map(p => p.parts.length));

  // Start with 1 level (just the folder name)
  let levels = 1;
  let displayNames = new Map<string, string[]>();

  // Keep increasing levels until all are unique or we hit max depth
  while (levels <= maxDepth) {
    displayNames = new Map();
    let allUnique = true;

    for (const { project, parts } of pathPartsList) {
      // Take last 'levels' parts
      const startIdx = Math.max(0, parts.length - levels);
      const displayParts = parts.slice(startIdx);
      const displayName = displayParts.join('/');

      if (!displayNames.has(displayName)) {
        displayNames.set(displayName, []);
      }
      displayNames.get(displayName)!.push(project.name);

      if (displayNames.get(displayName)!.length > 1) {
        allUnique = false;
      }
    }

    if (allUnique || levels === maxDepth) {
      break;
    }

    levels++;
  }

  // Build result
  for (const { project, parts } of pathPartsList) {
    const startIdx = Math.max(0, parts.length - levels);
    const displayParts = parts.slice(startIdx);
    result.push({
      project,
      displayName: displayParts.join('/'),
    });
  }

  return result;
};

/**
 * Format path for secondary display, truncating long paths
 * Examples:
 *   "D:\\Users\\user\\projects\\my-app" -> ".../projects/my-app"
 *   "/home/user/work/my-app" -> ".../work/my-app"
 */
export const formatPathForDisplay = (fullPath: string, maxParts: number = 3): string => {
  const parts = getPathParts(fullPath);

  if (parts.length <= maxParts) {
    return fullPath;
  }

  // Keep only the last maxParts
  const displayParts = parts.slice(-maxParts);
  return '.../' + displayParts.join('/');
};

/**
 * Extract short folder name from project display name or path (kept for backwards compatibility)
 */
export const getProjectShortName = (project: Project): string => {
  const displayName = project.displayName || project.name;
  return getLastFolderName(displayName);
};

export const normalizeProjectForSettings = (project: Project): SettingsProject => {
  const fallbackPath =
    typeof project.fullPath === 'string' && project.fullPath.length > 0
      ? project.fullPath
      : typeof project.path === 'string'
        ? project.path
        : '';

  return {
    name: project.name,
    displayName:
      typeof project.displayName === 'string' && project.displayName.trim().length > 0
        ? project.displayName
        : project.name,
    fullPath: fallbackPath,
    path:
      typeof project.path === 'string' && project.path.length > 0
        ? project.path
        : fallbackPath,
  };
};
