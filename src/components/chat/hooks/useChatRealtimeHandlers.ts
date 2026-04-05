import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { PendingPermissionRequest } from '../types/types';
import type { ProjectSession, SessionProvider } from '../../../types/app';
import { getSessionStoreKey } from '../../../stores/useSessionStore';
import type { SessionStore, NormalizedMessage } from '../../../stores/useSessionStore';

type PendingViewSession = {
  sessionId: string | null;
  startedAt: number;
};

type LatestChatMessage = {
  type?: string;
  kind?: string;
  data?: any;
  message?: any;
  delta?: string;
  sessionId?: string;
  session_id?: string;
  requestId?: string;
  toolName?: string;
  input?: unknown;
  context?: unknown;
  error?: string;
  tool?: any;
  toolId?: string;
  result?: any;
  exitCode?: number;
  isProcessing?: boolean;
  actualSessionId?: string;
  event?: string;
  status?: any;
  isNewSession?: boolean;
  resultText?: string;
  isError?: boolean;
  success?: boolean;
  reason?: string;
  provider?: string;
  content?: string;
  text?: string;
  tokens?: number;
  canInterrupt?: boolean;
  tokenBudget?: unknown;
  newSessionId?: string;
  aborted?: boolean;
  [key: string]: any;
};

interface UseChatRealtimeHandlersArgs {
  latestMessage: LatestChatMessage | null;
  provider: SessionProvider;
  selectedSession: ProjectSession | null;
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setCanAbortSession: (canAbort: boolean) => void;
  setSessionInTerminal: Dispatch<SetStateAction<{ active: boolean; provider: string | null }>>;
  setClaudeStatus: (status: { text: string; tokens: number; can_interrupt: boolean } | null) => void;
  setTokenBudget: (budget: Record<string, unknown> | null) => void;
  setPendingPermissionRequests: Dispatch<SetStateAction<PendingPermissionRequest[]>>;
  pendingViewSessionRef: MutableRefObject<PendingViewSession | null>;
  streamBufferRef: MutableRefObject<string>;
  streamTimerRef: MutableRefObject<number | null>;
  accumulatedStreamRef: MutableRefObject<string>;
  thinkingTimerRef: MutableRefObject<number | null>;
  accumulatedThinkingRef: MutableRefObject<string>;
  onSessionInactive?: (sessionId?: string | null) => void;
  onSessionProcessing?: (sessionId?: string | null) => void;
  onSessionNotProcessing?: (sessionId?: string | null) => void;
  onReplaceTemporarySession?: (sessionId?: string | null) => void;
  onNavigateToSession?: (sessionId: string) => void;
  onWebSocketReconnect?: () => void;
  sessionStore: SessionStore;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useChatRealtimeHandlers({
  latestMessage,
  provider,
  selectedSession,
  currentSessionId,
  setCurrentSessionId,
  setIsLoading,
  setCanAbortSession,
  setSessionInTerminal,
  setClaudeStatus,
  setTokenBudget,
  setPendingPermissionRequests,
  pendingViewSessionRef,
  streamBufferRef,
  streamTimerRef,
  accumulatedStreamRef,
  thinkingTimerRef,
  accumulatedThinkingRef,
  onSessionInactive,
  onSessionProcessing,
  onSessionNotProcessing,
  onReplaceTemporarySession,
  onNavigateToSession,
  onWebSocketReconnect,
  sessionStore,
}: UseChatRealtimeHandlersArgs) {
  const lastProcessedMessageRef = useRef<LatestChatMessage | null>(null);
  const getStoreKey = useCallback(
    (sessionId: string, sessionProvider?: string | null) =>
      getSessionStoreKey(sessionId, (sessionProvider as SessionProvider) || selectedSession?.__provider || provider),
    [provider, selectedSession?.__provider],
  );

  useEffect(() => {
    if (!latestMessage) return;
    if (lastProcessedMessageRef.current === latestMessage) return;
    lastProcessedMessageRef.current = latestMessage;

    const activeViewSessionId =
      selectedSession?.id || currentSessionId || pendingViewSessionRef.current?.sessionId || null;
    const isVisibleSession = (sessionId?: string | null) =>
      Boolean(sessionId) && (
        sessionId === selectedSession?.id ||
        sessionId === currentSessionId ||
        sessionId === pendingViewSessionRef.current?.sessionId ||
        sessionId === activeViewSessionId
      );

    /* ---------------------------------------------------------------- */
    /*  Legacy messages (no `kind` field) — handle and return           */
    /* ---------------------------------------------------------------- */

    const msg = latestMessage as any;

    if (!msg.kind) {
      const messageType = String(msg.type || '');

      switch (messageType) {
        case 'websocket-reconnected':
          onWebSocketReconnect?.();
          return;

        case 'pending-permissions-response': {
          const permSessionId = msg.sessionId;
          const isCurrentPermSession = isVisibleSession(permSessionId);
          if (permSessionId && !isCurrentPermSession) return;
          setPendingPermissionRequests(msg.data || []);
          return;
        }

        case 'session-status': {
          const statusSessionId = msg.sessionId;
          if (!statusSessionId) return;
          const isCurrentSession = isVisibleSession(statusSessionId);

          // Handle PTY (terminal) session detection
          if (isCurrentSession) {
            const isActive = msg.hasPtySession === true;
            setSessionInTerminal((prev: { active: boolean; provider: string | null }) => {
              if (prev.active === isActive && prev.provider === (msg.ptyProvider || null)) return prev;
              return { active: isActive, provider: msg.ptyProvider || null };
            });
          }

          const status = msg.status;
          if (status) {
            if (!isCurrentSession) return;
            const statusInfo = {
              text: status.text || 'Working...',
              tokens: status.tokens || 0,
              can_interrupt: status.can_interrupt !== undefined ? status.can_interrupt : true,
            };
            setClaudeStatus(statusInfo);
            setIsLoading(true);
            setCanAbortSession(statusInfo.can_interrupt);
            return;
          }

          // Legacy isProcessing format from check-session-status
          if (msg.isProcessing) {
            onSessionProcessing?.(statusSessionId);
            if (isCurrentSession) { setIsLoading(true); setCanAbortSession(true); }
            return;
          }
          onSessionInactive?.(statusSessionId);
          onSessionNotProcessing?.(statusSessionId);
          if (isCurrentSession) {
            setIsLoading(false);
            setCanAbortSession(false);
            setClaudeStatus(null);
          }
          return;
        }

        default:
          // Unknown legacy message type — ignore
          return;
      }
    }

    /* ---------------------------------------------------------------- */
    /*  NormalizedMessage handling (has `kind` field)                    */
    /* ---------------------------------------------------------------- */

    const sid = msg.sessionId || activeViewSessionId;
    const messageProvider = (typeof msg.provider === 'string' ? msg.provider : null) || selectedSession?.__provider || provider;
    const storeKey = sid ? getStoreKey(sid, messageProvider) : null;
    const isCurrentMessageSession = isVisibleSession(sid);

    // --- Thinking stream: buffer for performance ---
    if (msg.kind === 'thinking_start') {
      // Clear any previous thinking state
      accumulatedThinkingRef.current = '';
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      return;
    }

    if (msg.kind === 'thinking_delta') {
      const thinkingContent = msg.content || '';
      if (!thinkingContent) return;
      accumulatedThinkingRef.current += thinkingContent;
      if (!thinkingTimerRef.current) {
        thinkingTimerRef.current = window.setTimeout(() => {
          thinkingTimerRef.current = null;
          if (sid) {
            sessionStore.updateThinkingStream(storeKey || getStoreKey(sid, messageProvider), accumulatedThinkingRef.current, messageProvider as SessionProvider);
          }
        }, 50); // Faster updates for thinking (feels more responsive)
      }
      // Also route to store for non-active sessions
      if (sid && sid !== activeViewSessionId) {
        sessionStore.appendRealtime(storeKey || getStoreKey(sid, messageProvider), msg as NormalizedMessage);
      }
      return;
    }

    if (msg.kind === 'thinking_end' || (msg.kind === 'stream_end' && msg.blockType === 'thinking')) {
      // Check if this is the end of a thinking block
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      if (sid && accumulatedThinkingRef.current) {
        const targetStoreKey = storeKey || getStoreKey(sid, messageProvider);
        sessionStore.updateThinkingStream(targetStoreKey, accumulatedThinkingRef.current, messageProvider as SessionProvider);
        sessionStore.finalizeThinking(targetStoreKey);
      }
      accumulatedThinkingRef.current = '';
      return;
    }

    // --- Streaming: buffer for performance ---
    if (msg.kind === 'stream_delta') {
      const text = msg.content || '';
      if (!text) return;
      streamBufferRef.current += text;
      accumulatedStreamRef.current += text;
      if (!streamTimerRef.current) {
        streamTimerRef.current = window.setTimeout(() => {
          streamTimerRef.current = null;
          if (sid) {
            sessionStore.updateStreaming(storeKey || getStoreKey(sid, messageProvider), accumulatedStreamRef.current, messageProvider as SessionProvider);
          }
        }, 100);
      }
      // Also route to store for non-active sessions
      if (sid && sid !== activeViewSessionId) {
        sessionStore.appendRealtime(storeKey || getStoreKey(sid, messageProvider), msg as NormalizedMessage);
      }
      return;
    }

    if (msg.kind === 'stream_end') {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      if (sid) {
        const targetStoreKey = storeKey || getStoreKey(sid, messageProvider);
        if (accumulatedStreamRef.current) {
          sessionStore.updateStreaming(targetStoreKey, accumulatedStreamRef.current, messageProvider as SessionProvider);
        }
        sessionStore.finalizeStreaming(targetStoreKey);
      }
      accumulatedStreamRef.current = '';
      streamBufferRef.current = '';
      return;
    }

    // --- UI side effects for specific kinds ---
    switch (msg.kind) {
      case 'text':
      case 'tool_use':
      case 'tool_result':
      case 'thinking':
      case 'interactive_prompt':
      case 'task_notification':
      case 'error': {
        if (sid) {
          sessionStore.appendRealtime(storeKey || getStoreKey(sid, messageProvider), msg as NormalizedMessage);
        }
        if (msg.kind !== 'error') {
          break;
        }
        if (isCurrentMessageSession) {
          setIsLoading(false);
          setCanAbortSession(false);
          setClaudeStatus(null);
        }
        onSessionInactive?.(sid);
        onSessionNotProcessing?.(sid);
        break;
      }

      case 'session_created': {
        const newSessionId = msg.newSessionId;
        if (!newSessionId) break;

        if (!currentSessionId || currentSessionId.startsWith('new-session-')) {
          if (currentSessionId && currentSessionId.startsWith('new-session-') && currentSessionId !== newSessionId) {
            sessionStore.migrateSession(
              getStoreKey(currentSessionId, messageProvider),
              getStoreKey(newSessionId, messageProvider),
            );
          }
          sessionStorage.setItem('pendingSessionId', newSessionId);
          if (pendingViewSessionRef.current && !pendingViewSessionRef.current.sessionId) {
            pendingViewSessionRef.current.sessionId = newSessionId;
          }
          setCurrentSessionId(newSessionId);
          onReplaceTemporarySession?.(newSessionId);
          setPendingPermissionRequests((prev) =>
            prev.map((r) => (r.sessionId ? r : { ...r, sessionId: newSessionId })),
          );
        }
        onNavigateToSession?.(newSessionId);
        break;
      }

      case 'complete': {
        // Flush any remaining streaming state
        if (streamTimerRef.current) {
          clearTimeout(streamTimerRef.current);
          streamTimerRef.current = null;
        }
        if (sid && accumulatedStreamRef.current) {
          const targetStoreKey = storeKey || getStoreKey(sid, messageProvider);
          sessionStore.updateStreaming(targetStoreKey, accumulatedStreamRef.current, messageProvider as SessionProvider);
          sessionStore.finalizeStreaming(targetStoreKey);
        }
        accumulatedStreamRef.current = '';
        streamBufferRef.current = '';

        // Flush any remaining thinking state
        if (thinkingTimerRef.current) {
          clearTimeout(thinkingTimerRef.current);
          thinkingTimerRef.current = null;
        }
        if (sid && accumulatedThinkingRef.current) {
          const targetStoreKey = storeKey || getStoreKey(sid, messageProvider);
          sessionStore.updateThinkingStream(targetStoreKey, accumulatedThinkingRef.current, messageProvider as SessionProvider);
          sessionStore.finalizeThinking(targetStoreKey);
        }
        accumulatedThinkingRef.current = '';
  
        if (isCurrentMessageSession) {
          setIsLoading(false);
          setCanAbortSession(false);
          setClaudeStatus(null);
          setPendingPermissionRequests([]);
        }
        onSessionInactive?.(sid);
        onSessionNotProcessing?.(sid);

        // Handle aborted case
        if (msg.aborted) {
          // Abort was requested — the complete event confirms it
          // No special UI action needed beyond clearing loading state above
          // The backend already sent any abort-related messages
          break;
        }

        // Clear pending session
        const pendingSessionId = sessionStorage.getItem('pendingSessionId');
        if (currentSessionId && currentSessionId.startsWith('new-session-') && msg.actualSessionId && currentSessionId !== msg.actualSessionId) {
          sessionStore.migrateSession(
            getStoreKey(currentSessionId, messageProvider),
            getStoreKey(msg.actualSessionId, messageProvider),
          );
        }
        if (pendingSessionId && !currentSessionId && msg.exitCode === 0) {
          const actualId = msg.actualSessionId || pendingSessionId;
          setCurrentSessionId(actualId);
          if (msg.actualSessionId) {
            onNavigateToSession?.(actualId);
          }
          sessionStorage.removeItem('pendingSessionId');
          if (window.refreshProjects) {
            setTimeout(() => window.refreshProjects?.(), 500);
          }
        }
        break;
      }

      case 'permission_request': {
        if (!msg.requestId || !isCurrentMessageSession) break;
        setPendingPermissionRequests((prev) => {
          if (prev.some((r: PendingPermissionRequest) => r.requestId === msg.requestId)) return prev;
          return [...prev, {
            requestId: msg.requestId,
            toolName: msg.toolName || 'UnknownTool',
            input: msg.input,
            context: msg.context,
            sessionId: sid || null,
            receivedAt: new Date(),
          }];
        });
        setIsLoading(true);
        setCanAbortSession(true);
        setClaudeStatus({ text: 'Waiting for permission', tokens: 0, can_interrupt: true });
        break;
      }

      case 'permission_cancelled': {
        if (msg.requestId && isCurrentMessageSession) {
          setPendingPermissionRequests((prev) => prev.filter((r: PendingPermissionRequest) => r.requestId !== msg.requestId));
        }
        break;
      }

      case 'status': {
        if (msg.text === 'token_budget' && msg.tokenBudget) {
          if (!isCurrentMessageSession) break;
          setTokenBudget(msg.tokenBudget as Record<string, unknown>);
        } else if (msg.text) {
          if (!isCurrentMessageSession) break;
          setClaudeStatus({
            text: msg.text,
            tokens: msg.tokens || 0,
            can_interrupt: msg.canInterrupt !== undefined ? msg.canInterrupt : true,
          });
          setIsLoading(true);
          setCanAbortSession(msg.canInterrupt !== false);
        }
        break;
      }

      default:
        break;
    }
  }, [
    latestMessage,
    provider,
    selectedSession,
    currentSessionId,
    setCurrentSessionId,
    setIsLoading,
    setCanAbortSession,
    setSessionInTerminal,
    setClaudeStatus,
    setTokenBudget,
    setPendingPermissionRequests,
    pendingViewSessionRef,
    streamBufferRef,
    streamTimerRef,
    accumulatedStreamRef,
    thinkingTimerRef,
    accumulatedThinkingRef,
    onSessionInactive,
    onSessionProcessing,
    onSessionNotProcessing,
    onReplaceTemporarySession,
    onNavigateToSession,
    onWebSocketReconnect,
    getStoreKey,
    sessionStore,
  ]);
}
