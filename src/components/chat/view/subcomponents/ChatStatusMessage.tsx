import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SessionProviderLogo from '../../../llm-logo-provider/SessionProviderLogo';
import { useUiVersion } from '../../../../hooks/useUiVersion';
import type { PendingPermissionRequest } from '../../types/types';
import { buildClaudeToolPermissionEntry, formatToolInputForDisplay } from '../../utils/chatPermissions';
import { getClaudeSettings } from '../../utils/chatStorage';
import { getPermissionPanel, registerPermissionPanel } from '../../tools/configs/permissionPanelRegistry';
import { AskUserQuestionPanel } from '../../tools/components/InteractiveRenderers';
import { cn } from '../../../../lib/utils';

registerPermissionPanel('AskUserQuestion', AskUserQuestionPanel);

type StatusOutcome = {
  kind: 'complete' | 'error' | 'aborted';
  text: string;
  timestamp: number;
} | null;

interface ChatStatusMessageProps {
  pendingPermissionRequests: PendingPermissionRequest[];
  handlePermissionDecision: (
    requestIds: string | string[],
    decision: { allow?: boolean; message?: string; rememberEntry?: string | null; updatedInput?: unknown },
  ) => void;
  handleGrantToolPermission: (suggestion: { entry: string; toolName: string }) => { success: boolean };
  status: { text?: string; tokens?: number; can_interrupt?: boolean } | null;
  isLoading: boolean;
  onAbort?: () => void;
  sessionInTerminal: { active: boolean; provider: string | null };
  provider?: string;
  outcomeStatus?: StatusOutcome;
  liveActivityText?: string | null;
}

const PROVIDER_LABEL_KEYS: Record<string, string> = {
  claude: 'messageTypes.claude',
  codex: 'messageTypes.codex',
  cursor: 'messageTypes.cursor',
  gemini: 'messageTypes.gemini',
};

const ACTION_KEYS = [
  'claudeStatus.actions.thinking',
  'claudeStatus.actions.processing',
  'claudeStatus.actions.analyzing',
  'claudeStatus.actions.working',
  'claudeStatus.actions.computing',
  'claudeStatus.actions.reasoning',
];
const DEFAULT_ACTION_WORDS = ['Thinking', 'Processing', 'Analyzing', 'Working', 'Computing', 'Reasoning'];

function formatElapsedTime(totalSeconds: number, t: (key: string, options?: Record<string, unknown>) => string) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 1) {
    return t('claudeStatus.elapsed.seconds', { count: seconds, defaultValue: '{{count}}s' });
  }

  return t('claudeStatus.elapsed.minutesSeconds', {
    minutes,
    seconds,
    defaultValue: '{{minutes}}m {{seconds}}s',
  });
}

export default function ChatStatusMessage({
  pendingPermissionRequests,
  handlePermissionDecision,
  handleGrantToolPermission,
  status,
  isLoading,
  onAbort,
  sessionInTerminal,
  provider = 'claude',
  outcomeStatus,
  liveActivityText = null,
}: ChatStatusMessageProps) {
  const { t } = useTranslation('chat');
  const { useNewUi } = useUiVersion();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const askUserQuestionRequest = pendingPermissionRequests.find((request) => request.toolName === 'AskUserQuestion');
  const activePermissionRequest = askUserQuestionRequest ? null : pendingPermissionRequests[0] ?? null;

  const permissionState = useMemo(() => {
    if (!activePermissionRequest) {
      return null;
    }

    const rawInput = formatToolInputForDisplay(activePermissionRequest.input);
    const permissionEntry = buildClaudeToolPermissionEntry(activePermissionRequest.toolName, rawInput);
    const settings = getClaudeSettings();
    const alreadyAllowed = permissionEntry ? settings.allowedTools.includes(permissionEntry) : false;
    const matchingRequestIds = permissionEntry
      ? pendingPermissionRequests
          .filter(
            (item) =>
              buildClaudeToolPermissionEntry(item.toolName, formatToolInputForDisplay(item.input)) === permissionEntry,
          )
          .map((item) => item.requestId)
      : [activePermissionRequest.requestId];

    return {
      rawInput,
      permissionEntry,
      alreadyAllowed,
      matchingRequestIds,
      requestCount: matchingRequestIds.length,
    };
  }, [activePermissionRequest, pendingPermissionRequests]);

  const providerLabelKey = PROVIDER_LABEL_KEYS[provider];
  const providerLabel = providerLabelKey
    ? t(providerLabelKey)
    : t('claudeStatus.providers.assistant', { defaultValue: 'Assistant' });

  const renderStatusShell = (content: React.ReactNode, toneClass = '') => {
    if (useNewUi) {
      return (
        <div className="chat-message px-3 sm:px-0">
          <div className="flex items-start gap-3 py-1.5">
            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80">
              <SessionProviderLogo provider={provider} className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <span>{providerLabel}</span>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className={cn('border-l border-border/60 pl-3', toneClass)}>
                {content}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="chat-message px-3 sm:px-0">
        <div className="w-full">
          <div className="flex items-start gap-3 py-1.5">
            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gray-300/70 bg-white/80 dark:border-gray-700/70 dark:bg-gray-900/80">
              <SessionProviderLogo provider={provider} className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                <span>{providerLabel}</span>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className={cn('border-l border-gray-300/70 pl-3 text-sm text-gray-700 dark:border-gray-700/70 dark:text-gray-300', toneClass)}>
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (askUserQuestionRequest) {
    const CustomPanel = getPermissionPanel(askUserQuestionRequest.toolName);
    if (!CustomPanel) {
      return null;
    }

    return renderStatusShell(
      <CustomPanel request={askUserQuestionRequest} onDecision={handlePermissionDecision} />,
    );
  }

  if (activePermissionRequest && permissionState) {
    const rememberLabel = permissionState.alreadyAllowed
      ? t('permissions.allowSaved', { defaultValue: 'Allow (saved)' })
      : t('permissions.allowRemember', { defaultValue: 'Allow & remember' });

    return renderStatusShell(
      <>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            {t('permissions.required', { defaultValue: 'Permission required' })}
          </span>
          {permissionState.requestCount > 1 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-200">
              {t('permissions.requestCount', {
                count: permissionState.requestCount,
                defaultValue: '{{count}} requests',
              })}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">
          {activePermissionRequest.toolName}
        </p>
        {permissionState.permissionEntry && (
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {t('permissions.rule', { defaultValue: 'Rule' })}: <span className="font-mono">{permissionState.permissionEntry}</span>
          </p>
        )}
        {permissionState.rawInput && (
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">
              {t('permissions.viewInput', { defaultValue: 'View tool input' })}
            </summary>
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl border border-amber-200/60 bg-background/80 p-2 dark:border-amber-800/60">
              {permissionState.rawInput}
            </pre>
          </details>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePermissionDecision(activePermissionRequest.requestId, { allow: true })}
            className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
          >
            {t('permissions.allowOnce', { defaultValue: 'Allow once' })}
          </button>
          <button
            type="button"
            onClick={() => {
              if (permissionState.permissionEntry && !permissionState.alreadyAllowed) {
                handleGrantToolPermission({
                  entry: permissionState.permissionEntry,
                  toolName: activePermissionRequest.toolName,
                });
              }
              handlePermissionDecision(permissionState.matchingRequestIds, {
                allow: true,
                rememberEntry: permissionState.permissionEntry,
              });
            }}
            disabled={!permissionState.permissionEntry}
            className={cn(
              'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
              permissionState.permissionEntry
                ? 'border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40'
                : 'cursor-not-allowed border-muted text-muted-foreground',
            )}
          >
            {rememberLabel}
          </button>
          <button
            type="button"
            onClick={() => handlePermissionDecision(activePermissionRequest.requestId, { allow: false, message: 'User denied tool use' })}
            className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
          >
            {t('permissions.deny', { defaultValue: 'Deny' })}
          </button>
        </div>
      </>,
      'border-amber-300/60'
    );
  }

  if (sessionInTerminal.active) {
    return renderStatusShell(
      <>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          {t('sessionInTerminal.title', { defaultValue: 'This session is running in a terminal' })}
        </div>
        <p className="mt-0.5 text-sm text-foreground">
          {t('sessionInTerminal.description', {
            defaultValue: 'Messages and permission requests from the terminal session are not visible here. You can browse conversation history in read-only mode.',
          })}
        </p>
      </>,
      'border-amber-300/60'
    );
  }

  const actionWords = ACTION_KEYS.map((key, index) => t(key, { defaultValue: DEFAULT_ACTION_WORDS[index] }));
  const actionIndex = Math.floor(elapsedTime / 3) % actionWords.length;
  const runningText = liveActivityText || status?.text || actionWords[actionIndex];
  const cleanRunningText = String(runningText).replace(/[.]+$/, '');
  const canInterrupt = isLoading && status?.can_interrupt !== false;
  const elapsedLabel = elapsedTime > 0
    ? t('claudeStatus.elapsed.label', {
        time: formatElapsedTime(elapsedTime, t),
        defaultValue: '{{time}} elapsed',
      })
    : t('claudeStatus.elapsed.startingNow', { defaultValue: 'Starting now' });

  if (outcomeStatus?.kind === 'complete' || outcomeStatus?.kind === 'aborted') {
    return null;
  }

  const genericState = outcomeStatus?.kind === 'error'
    ? 'error'
    : isLoading
      ? 'running'
      : null;

  if (!genericState) {
    return null;
  }

  const isOutcome = genericState === 'error';
  const title = isOutcome
    ? outcomeStatus?.text || t('claudeStatus.state.complete', { defaultValue: 'Done' })
    : cleanRunningText;

  const toneClass =
    genericState === 'error'
      ? 'border-red-300/70'
      : 'border-border/60';

  const badgeText =
    genericState === 'running'
      ? t('claudeStatus.state.live', { defaultValue: 'Live' })
      : t('messageTypes.error', { defaultValue: 'Error' });

  if (genericState === 'running') {
    if (useNewUi) {
      return (
        <div className="chat-message px-3 sm:px-0">
          <div className="flex items-center justify-center py-2">
            <div className="flex w-full max-w-[22rem] items-center gap-2 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm sm:max-w-[26rem]">
              <span className="inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
              <span className="flex-shrink-0 text-[11px] text-muted-foreground/90">{elapsedLabel}</span>
              {canInterrupt && onAbort && (
                <>
                  <span className="h-3 w-px flex-shrink-0 bg-border/70" />
                  <button
                    type="button"
                    onClick={onAbort}
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    {t('claudeStatus.controls.stopGeneration', { defaultValue: 'Stop Generation' })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="chat-message px-3 sm:px-0">
        <div className="flex items-center justify-center py-2">
          <div className="flex w-full max-w-[22rem] items-center gap-2 rounded-full border border-gray-300/70 bg-white/80 px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-400 sm:max-w-[26rem]">
            <span className="inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
            <span className="min-w-0 flex-1 truncate font-medium text-gray-800 dark:text-gray-100">{title}</span>
            <span className="flex-shrink-0 text-[11px] text-gray-500 dark:text-gray-400">{elapsedLabel}</span>
            {canInterrupt && onAbort && (
              <>
                <span className="h-3 w-px flex-shrink-0 bg-gray-300/80 dark:bg-gray-700/80" />
                <button
                  type="button"
                  onClick={onAbort}
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  {t('claudeStatus.controls.stopGeneration', { defaultValue: 'Stop Generation' })}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return renderStatusShell(
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{badgeText}</span>
      </div>
      <p className="mt-0.5 text-sm text-foreground">{title}</p>
    </>,
    toneClass
  );
}

