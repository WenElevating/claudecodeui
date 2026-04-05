/**
 * Session-keyed message store.
 *
 * Holds per-session state in a Map keyed by sessionId.
 * Session switch = change activeSessionId pointer. No clearing. Old data stays.
 * WebSocket handler = store.appendRealtime(msg.sessionId, msg). One line.
 * No localStorage for messages. Backend JSONL is the source of truth.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { SessionProvider } from '../types/app';
import { authenticatedFetch } from '../utils/api';
import {
  THINKING_STREAM_PREFIX,
  THINKING_FINAL_PREFIX,
  TEXT_STREAM_PREFIX,
  TEXT_FINAL_PREFIX,
} from '../shared/messageIdPrefixes';

// ─── NormalizedMessage (mirrors server/adapters/types.js) ────────────────────

export type MessageKind =
  | 'text'
  | 'tool_use'
  | 'tool_result'
  | 'thinking'
  | 'thinking_start'
  | 'thinking_delta'
  | 'thinking_end'
  | 'stream_delta'
  | 'stream_end'
  | 'error'
  | 'complete'
  | 'status'
  | 'permission_request'
  | 'permission_cancelled'
  | 'session_created'
  | 'interactive_prompt'
  | 'task_notification';

export interface NormalizedMessage {
  id: string;
  sessionId: string;
  timestamp: string;
  provider: SessionProvider;
  kind: MessageKind;

  // kind-specific fields (flat for simplicity)
  role?: 'user' | 'assistant';
  content?: string;
  images?: string[];
  toolName?: string;
  toolInput?: unknown;
  toolId?: string;
  toolResult?: { content: string; isError: boolean; toolUseResult?: unknown } | null;
  isError?: boolean;
  text?: string;
  tokens?: number;
  canInterrupt?: boolean;
  tokenBudget?: unknown;
  requestId?: string;
  input?: unknown;
  context?: unknown;
  newSessionId?: string;
  status?: string;
  summary?: string;
  exitCode?: number;
  actualSessionId?: string;
  parentToolUseId?: string;
  subagentTools?: unknown[];
  isFinal?: boolean;
  // Cursor-specific ordering
  sequence?: number;
  rowid?: number;
}

// ─── Per-session slot ────────────────────────────────────────────────────────

export type SessionStatus = 'idle' | 'loading' | 'streaming' | 'error';

export interface SessionSlot {
  serverMessages: NormalizedMessage[];
  realtimeMessages: NormalizedMessage[];
  merged: NormalizedMessage[];
  /** @internal Cache-invalidation refs for computeMerged */
  _lastServerRef: NormalizedMessage[];
  _lastRealtimeRef: NormalizedMessage[];
  status: SessionStatus;
  fetchedAt: number;
  total: number;
  hasMore: boolean;
  offset: number;
  tokenUsage: unknown;
}

const EMPTY: NormalizedMessage[] = [];

export function getSessionStoreKey(sessionId: string, provider: SessionProvider | string = 'claude'): string {
  return `${provider}:${sessionId}`;
}

function createEmptySlot(): SessionSlot {
  return {
    serverMessages: EMPTY,
    realtimeMessages: EMPTY,
    merged: EMPTY,
    _lastServerRef: EMPTY,
    _lastRealtimeRef: EMPTY,
    status: 'idle',
    fetchedAt: 0,
    total: 0,
    hasMore: false,
    offset: 0,
    tokenUsage: null,
  };
}

/**
 * Compute merged messages: server + realtime, deduped by id.
 * Server messages take priority (they're the persisted source of truth).
 * Realtime messages that aren't yet in server stay (in-flight streaming).
 */
function computeMerged(server: NormalizedMessage[], realtime: NormalizedMessage[]): NormalizedMessage[] {
  if (realtime.length === 0) return server;
  if (server.length === 0) return realtime;
  const serverIds = new Set(server.map(m => m.id));
  const extra = realtime.filter(m => !serverIds.has(m.id));
  if (extra.length === 0) return server;
  return [...server, ...extra];
}

/**
 * Recompute slot.merged only when the input arrays have actually changed
 * (by reference). Returns true if merged was recomputed.
 */
function recomputeMergedIfNeeded(slot: SessionSlot): boolean {
  if (slot.serverMessages === slot._lastServerRef && slot.realtimeMessages === slot._lastRealtimeRef) {
    return false;
  }
  slot._lastServerRef = slot.serverMessages;
  slot._lastRealtimeRef = slot.realtimeMessages;
  slot.merged = computeMerged(slot.serverMessages, slot.realtimeMessages);
  return true;
}

// ─── Stale threshold ─────────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 30_000;

const MAX_REALTIME_MESSAGES = 500;

function normalizeComparableContent(content: string | undefined): string {
  return String(content || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function areEquivalentMessages(message: NormalizedMessage, serverMessage: NormalizedMessage): boolean {
  if (serverMessage.id === message.id || serverMessage.kind !== message.kind) {
    return serverMessage.id === message.id;
  }

  if (message.kind === 'text') {
    return (
      serverMessage.role === message.role &&
      normalizeComparableContent(serverMessage.content) === normalizeComparableContent(message.content)
    );
  }

  if (message.kind === 'thinking') {
    return normalizeComparableContent(serverMessage.content) === normalizeComparableContent(message.content);
  }

  if (message.kind === 'tool_use') {
    return serverMessage.toolId === message.toolId && serverMessage.toolName === message.toolName;
  }

  if (message.kind === 'tool_result') {
    return serverMessage.toolId === message.toolId && serverMessage.content === message.content;
  }

  return false;
}

function filterUnpersistedTransientMessages(
  transientMessages: NormalizedMessage[],
  previousServerMessages: NormalizedMessage[],
  nextServerMessages: NormalizedMessage[],
): NormalizedMessage[] {
  const previousServerIds = new Set(previousServerMessages.map((message) => message.id));
  const newlyPersistedMessages = nextServerMessages.filter((message) => !previousServerIds.has(message.id));
  if (newlyPersistedMessages.length === 0) {
    return transientMessages;
  }

  const unmatchedPersistedMessages = [...newlyPersistedMessages];
  return transientMessages.filter((transientMessage) => {
    const matchIndex = unmatchedPersistedMessages.findIndex((serverMessage) =>
      areEquivalentMessages(transientMessage, serverMessage),
    );
    if (matchIndex === -1) {
      return true;
    }

    unmatchedPersistedMessages.splice(matchIndex, 1);
    return false;
  });
}

function shouldPreserveRealtimeMessage(message: NormalizedMessage): boolean {
  if (message.id.startsWith('local_') && message.kind === 'text' && message.role === 'user') {
    return true;
  }

  if (message.id.startsWith(THINKING_FINAL_PREFIX) && !message.id.startsWith(THINKING_STREAM_PREFIX)) {
    return true;
  }

  if (message.id.startsWith(TEXT_FINAL_PREFIX) && !message.id.startsWith(TEXT_STREAM_PREFIX)) {
    return true;
  }

  return (
    message.kind === 'text' ||
    message.kind === 'thinking' ||
    message.kind === 'tool_use' ||
    message.kind === 'tool_result' ||
    message.kind === 'interactive_prompt' ||
    message.kind === 'task_notification' ||
    message.kind === 'error'
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSessionStore() {
  const storeRef = useRef(new Map<string, SessionSlot>());
  const activeSessionIdRef = useRef<string | null>(null);
  // Bump to force re-render — only when the active session's data changes
  const [, setTick] = useState(0);
  const notify = useCallback((sessionId: string) => {
    if (sessionId === activeSessionIdRef.current) {
      setTick(n => n + 1);
    }
  }, []);

  const setActiveSession = useCallback((sessionId: string | null) => {
    activeSessionIdRef.current = sessionId;
  }, []);

  const getSlot = useCallback((sessionId: string): SessionSlot => {
    const store = storeRef.current;
    if (!store.has(sessionId)) {
      store.set(sessionId, createEmptySlot());
    }
    return store.get(sessionId)!;
  }, []);

  const has = useCallback((sessionId: string) => storeRef.current.has(sessionId), []);
  const getSlotKey = useCallback(
    (sessionId: string, storeKey?: string) => storeKey || sessionId,
    [],
  );

  /**
   * Fetch messages from the unified endpoint and populate serverMessages.
   */
  const fetchFromServer = useCallback(async (
    sessionId: string,
    opts: {
      storeKey?: string;
      provider?: SessionProvider;
      projectName?: string;
      projectPath?: string;
      limit?: number | null;
      offset?: number;
    } = {},
  ) => {
    const slotKey = getSlotKey(sessionId, opts.storeKey);
    const slot = getSlot(slotKey);
    slot.status = 'loading';
    notify(slotKey);

    try {
      const params = new URLSearchParams();
      if (opts.provider) params.append('provider', opts.provider);
      if (opts.projectName) params.append('projectName', opts.projectName);
      if (opts.projectPath) params.append('projectPath', opts.projectPath);
      if (opts.limit !== null && opts.limit !== undefined) {
        params.append('limit', String(opts.limit));
        params.append('offset', String(opts.offset ?? 0));
      }

      const qs = params.toString();
      const url = `/api/sessions/${encodeURIComponent(sessionId)}/messages${qs ? `?${qs}` : ''}`;
      const response = await authenticatedFetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const messages: NormalizedMessage[] = data.messages || [];

      slot.serverMessages = messages;
      slot.total = data.total ?? messages.length;
      slot.hasMore = Boolean(data.hasMore);
      slot.offset = (opts.offset ?? 0) + messages.length;
      slot.fetchedAt = Date.now();
      slot.status = 'idle';
      recomputeMergedIfNeeded(slot);
      if (data.tokenUsage) {
        slot.tokenUsage = data.tokenUsage;
      }

      notify(slotKey);
      return slot;
    } catch (error) {
      console.error(`[SessionStore] fetch failed for ${sessionId}:`, error);
      slot.status = 'error';
      notify(slotKey);
      return slot;
    }
  }, [getSlot, getSlotKey, notify]);

  /**
   * Load older (paginated) messages and prepend to serverMessages.
   */
  const fetchMore = useCallback(async (
    sessionId: string,
    opts: {
      storeKey?: string;
      provider?: SessionProvider;
      projectName?: string;
      projectPath?: string;
      limit?: number;
    } = {},
  ) => {
    const slotKey = getSlotKey(sessionId, opts.storeKey);
    const slot = getSlot(slotKey);
    if (!slot.hasMore) return slot;

    const params = new URLSearchParams();
    if (opts.provider) params.append('provider', opts.provider);
    if (opts.projectName) params.append('projectName', opts.projectName);
    if (opts.projectPath) params.append('projectPath', opts.projectPath);
    const limit = opts.limit ?? 20;
    params.append('limit', String(limit));
    params.append('offset', String(slot.offset));

    const qs = params.toString();
    const url = `/api/sessions/${encodeURIComponent(sessionId)}/messages${qs ? `?${qs}` : ''}`;

    try {
      const response = await authenticatedFetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const olderMessages: NormalizedMessage[] = data.messages || [];

      // Prepend older messages (they're earlier in the conversation)
      slot.serverMessages = [...olderMessages, ...slot.serverMessages];
      slot.hasMore = Boolean(data.hasMore);
      slot.offset = slot.offset + olderMessages.length;
      recomputeMergedIfNeeded(slot);
      notify(slotKey);
      return slot;
    } catch (error) {
      console.error(`[SessionStore] fetchMore failed for ${sessionId}:`, error);
      return slot;
    }
  }, [getSlot, getSlotKey, notify]);

  /**
   * Append a realtime (WebSocket) message to the correct session slot.
   * This works regardless of which session is actively viewed.
   */
  const appendRealtime = useCallback((sessionId: string, msg: NormalizedMessage) => {
    const slot = getSlot(sessionId);
    let updated = [...slot.realtimeMessages, msg];
    if (updated.length > MAX_REALTIME_MESSAGES) {
      updated = updated.slice(-MAX_REALTIME_MESSAGES);
    }
    slot.realtimeMessages = updated;
    recomputeMergedIfNeeded(slot);
    notify(sessionId);
  }, [getSlot, notify]);

  /**
   * Append multiple realtime messages at once (batch).
   */
  const appendRealtimeBatch = useCallback((sessionId: string, msgs: NormalizedMessage[]) => {
    if (msgs.length === 0) return;
    const slot = getSlot(sessionId);
    let updated = [...slot.realtimeMessages, ...msgs];
    if (updated.length > MAX_REALTIME_MESSAGES) {
      updated = updated.slice(-MAX_REALTIME_MESSAGES);
    }
    slot.realtimeMessages = updated;
    recomputeMergedIfNeeded(slot);
    notify(sessionId);
  }, [getSlot, notify]);

  /**
   * Re-fetch serverMessages from the unified endpoint (e.g., on projects_updated).
   */
  const refreshFromServer = useCallback(async (
    sessionId: string,
    opts: {
      storeKey?: string;
      provider?: SessionProvider;
      projectName?: string;
      projectPath?: string;
    } = {},
  ) => {
    const slotKey = getSlotKey(sessionId, opts.storeKey);
    const slot = getSlot(slotKey);
    try {
      const params = new URLSearchParams();
      if (opts.provider) params.append('provider', opts.provider);
      if (opts.projectName) params.append('projectName', opts.projectName);
      if (opts.projectPath) params.append('projectPath', opts.projectPath);

      const qs = params.toString();
      const url = `/api/sessions/${encodeURIComponent(sessionId)}/messages${qs ? `?${qs}` : ''}`;
      const response = await authenticatedFetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const previousServerMessages = slot.serverMessages;
      const serverMessages = data.messages || [];
      slot.serverMessages = serverMessages;
      slot.total = data.total ?? slot.serverMessages.length;
      slot.hasMore = Boolean(data.hasMore);
      slot.fetchedAt = Date.now();
      // Preserve finalized transient messages plus optimistic local user text until
      // equivalent persisted messages arrive from the server.
      const preservedTransientMessages = slot.realtimeMessages.filter(shouldPreserveRealtimeMessage);
      const nonDupPreserved = filterUnpersistedTransientMessages(
        preservedTransientMessages,
        previousServerMessages,
        serverMessages,
      );
      slot.realtimeMessages = nonDupPreserved;
      recomputeMergedIfNeeded(slot);
      notify(slotKey);
    } catch (error) {
      console.error(`[SessionStore] refresh failed for ${sessionId}:`, error);
    }
  }, [getSlot, getSlotKey, notify]);

  /**
   * Update session status.
   */
  const setStatus = useCallback((sessionId: string, status: SessionStatus) => {
    const slot = getSlot(sessionId);
    slot.status = status;
    notify(sessionId);
  }, [getSlot, notify]);

  /**
   * Check if a session's data is stale (>30s old).
   */
  const isStale = useCallback((sessionId: string) => {
    const slot = storeRef.current.get(sessionId);
    if (!slot) return true;
    return Date.now() - slot.fetchedAt > STALE_THRESHOLD_MS;
  }, []);

  /**
   * Update or create a streaming message (accumulated text so far).
   * Uses a well-known ID so subsequent calls replace the same message.
   */
  const updateStreaming = useCallback((sessionId: string, accumulatedText: string, msgProvider: SessionProvider) => {
    const slot = getSlot(sessionId);
    const streamId = `${TEXT_STREAM_PREFIX}${sessionId}`;
    const msg: NormalizedMessage = {
      id: streamId,
      sessionId,
      timestamp: new Date().toISOString(),
      provider: msgProvider,
      kind: 'stream_delta',
      content: accumulatedText,
    };
    const idx = slot.realtimeMessages.findIndex(m => m.id === streamId);
    if (idx >= 0) {
      slot.realtimeMessages = [...slot.realtimeMessages];
      slot.realtimeMessages[idx] = msg;
    } else {
      slot.realtimeMessages = [...slot.realtimeMessages, msg];
    }
    recomputeMergedIfNeeded(slot);
    notify(sessionId);
  }, [getSlot, notify]);

  /**
   * Finalize streaming: convert the streaming message to a regular text message.
   * The well-known streaming ID is replaced with a unique text message ID.
   */
  const finalizeStreaming = useCallback((sessionId: string) => {
    const slot = storeRef.current.get(sessionId);
    if (!slot) return;
    const streamId = `${TEXT_STREAM_PREFIX}${sessionId}`;
    const idx = slot.realtimeMessages.findIndex(m => m.id === streamId);
    if (idx >= 0) {
      const stream = slot.realtimeMessages[idx];
      slot.realtimeMessages = [...slot.realtimeMessages];
      slot.realtimeMessages[idx] = {
        ...stream,
        id: `${TEXT_FINAL_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        kind: 'text',
        role: 'assistant',
      };
      recomputeMergedIfNeeded(slot);
      notify(sessionId);
    }
  }, [notify]);

  /**
   * Update or create a thinking stream message (accumulated thinking content).
   * Uses a well-known ID so subsequent calls replace the same message.
   */
  const updateThinkingStream = useCallback((sessionId: string, accumulatedThinking: string, msgProvider: SessionProvider) => {
    const slot = getSlot(sessionId);
    const thinkingId = `${THINKING_STREAM_PREFIX}${sessionId}`;
    const msg: NormalizedMessage = {
      id: thinkingId,
      sessionId,
      timestamp: new Date().toISOString(),
      provider: msgProvider,
      kind: 'thinking',
      content: accumulatedThinking,
    };
    const idx = slot.realtimeMessages.findIndex(m => m.id === thinkingId);
    if (idx >= 0) {
      slot.realtimeMessages = [...slot.realtimeMessages];
      slot.realtimeMessages[idx] = msg;
    } else {
      slot.realtimeMessages = [...slot.realtimeMessages, msg];
    }
    recomputeMergedIfNeeded(slot);
    notify(sessionId);
  }, [getSlot, notify]);

  /**
   * Finalize thinking: convert the streaming thinking message to a regular thinking message.
   * The well-known thinking ID is replaced with a unique thinking message ID.
   */
  const finalizeThinking = useCallback((sessionId: string) => {
    const slot = storeRef.current.get(sessionId);
    if (!slot) return;
    const thinkingId = `${THINKING_STREAM_PREFIX}${sessionId}`;
    const idx = slot.realtimeMessages.findIndex(m => m.id === thinkingId);
    if (idx >= 0) {
      const thinking = slot.realtimeMessages[idx];
      slot.realtimeMessages = [...slot.realtimeMessages];
      slot.realtimeMessages[idx] = {
        ...thinking,
        id: `${THINKING_FINAL_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        kind: 'thinking',
      };
      recomputeMergedIfNeeded(slot);
      notify(sessionId);
    }
  }, [notify]);

  /**
   * Clear realtime messages for a session (e.g., after stream completes and server fetch catches up).
   */
  const clearRealtime = useCallback((sessionId: string) => {
    const slot = storeRef.current.get(sessionId);
    if (slot) {
      slot.realtimeMessages = [];
      recomputeMergedIfNeeded(slot);
      notify(sessionId);
    }
  }, [notify]);

  /**
   * Move or merge an in-memory session slot to a new session id.
   * Used when the UI creates a temporary client-side session id and the backend later
   * returns the real persisted session id.
   */
  const migrateSession = useCallback((fromSessionId: string, toSessionId: string) => {
    if (!fromSessionId || !toSessionId || fromSessionId === toSessionId) {
      return;
    }

    const store = storeRef.current;
    const fromSlot = store.get(fromSessionId);
    if (!fromSlot) {
      return;
    }

    const toSlot = store.get(toSessionId) || createEmptySlot();
    toSlot.serverMessages = toSlot.serverMessages.length > 0
      ? toSlot.serverMessages
      : fromSlot.serverMessages;
    toSlot.realtimeMessages = [...fromSlot.realtimeMessages, ...toSlot.realtimeMessages];
    toSlot.total = Math.max(toSlot.total, fromSlot.total);
    toSlot.hasMore = toSlot.hasMore || fromSlot.hasMore;
    toSlot.offset = Math.max(toSlot.offset, fromSlot.offset);
    toSlot.fetchedAt = Math.max(toSlot.fetchedAt, fromSlot.fetchedAt);
    if (toSlot.tokenUsage == null && fromSlot.tokenUsage != null) {
      toSlot.tokenUsage = fromSlot.tokenUsage;
    }

    recomputeMergedIfNeeded(toSlot);
    store.set(toSessionId, toSlot);
    store.delete(fromSessionId);

    if (activeSessionIdRef.current === fromSessionId) {
      activeSessionIdRef.current = toSessionId;
    }

    notify(toSessionId);
  }, [notify]);

  /**
   * Get merged messages for a session (for rendering).
   */
  const getMessages = useCallback((sessionId: string): NormalizedMessage[] => {
    return storeRef.current.get(sessionId)?.merged ?? [];
  }, []);

  /**
   * Get session slot (for status, pagination info, etc.).
   */
  const getSessionSlot = useCallback((sessionId: string): SessionSlot | undefined => {
    return storeRef.current.get(sessionId);
  }, []);

  return useMemo(() => ({
    getSlot,
    has,
    fetchFromServer,
    fetchMore,
    appendRealtime,
    appendRealtimeBatch,
    refreshFromServer,
    setActiveSession,
    setStatus,
    isStale,
    updateStreaming,
    finalizeStreaming,
    updateThinkingStream,
    finalizeThinking,
    clearRealtime,
    migrateSession,
    getMessages,
    getSessionSlot,
  }), [
    getSlot, has, fetchFromServer, fetchMore,
    appendRealtime, appendRealtimeBatch, refreshFromServer,
    setActiveSession, setStatus, isStale, updateStreaming, finalizeStreaming,
    updateThinkingStream, finalizeThinking,
    clearRealtime, migrateSession, getMessages, getSessionSlot,
  ]);
}

export type SessionStore = ReturnType<typeof useSessionStore>;
