import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasksSettings } from '../../../contexts/TasksSettingsContext';
import { QuickSettingsPanel } from '../../quick-settings-panel';
import type { ChatInterfaceProps, Provider } from '../types/types';
import type { SessionProvider } from '../../../types/app';
import { useChatProviderState } from '../hooks/useChatProviderState';
import { useChatSessionState } from '../hooks/useChatSessionState';
import { useChatRealtimeHandlers } from '../hooks/useChatRealtimeHandlers';
import { useChatComposerState } from '../hooks/useChatComposerState';
import { useSessionStore } from '../../../stores/useSessionStore';
import { useUiVersion } from '../../../hooks/useUiVersion';
import ChatMessagesPane from './subcomponents/ChatMessagesPane';
import ChatComposer from './subcomponents/ChatComposer';
import ChatComposerV2 from './subcomponents/ChatComposerV2';
import ChatStatusMessage from './subcomponents/ChatStatusMessage';
import PermissionRequestsBanner from './subcomponents/PermissionRequestsBanner';

type PendingViewSession = {
  sessionId: string | null;
  startedAt: number;
};

type StatusOutcome = {
  kind: 'complete' | 'error' | 'aborted';
  text: string;
  timestamp: number;
} | null;

const COMPLETE_REFRESH_DELAYS_MS = [300, 1200];

function getLiveActivityText(message: Record<string, unknown>, t: (key: string, options?: Record<string, unknown>) => string): string | null {
  switch (message.kind) {
    case 'thinking_start':
    case 'thinking_delta':
    case 'thinking':
      return t('claudeStatus.actions.thinking', { defaultValue: 'Thinking' });
    case 'stream_delta':
      return t('claudeStatus.actions.working', { defaultValue: 'Working' });
    case 'text':
      return message.role === 'assistant'
        ? t('claudeStatus.actions.working', { defaultValue: 'Working' })
        : null;
    case 'tool_use': {
      const toolName = typeof message.toolName === 'string' ? message.toolName : '';
      return toolName
        ? `${t('claudeStatus.actions.processing', { defaultValue: 'Processing' })} ${toolName}`
        : t('claudeStatus.actions.processing', { defaultValue: 'Processing' });
    }
    case 'tool_result':
      return t('claudeStatus.actions.reasoning', { defaultValue: 'Reasoning' });
    default:
      return null;
  }
}

function ChatInterface({
  selectedProject,
  selectedSession,
  ws,
  sendMessage,
  latestMessage,
  onFileOpen,
  onInputFocusChange,
  onSessionActive,
  onSessionInactive,
  onSessionProcessing,
  onSessionNotProcessing,
  processingSessions,
  onReplaceTemporarySession,
  onNavigateToSession,
  onShowSettings,
  autoExpandTools,
  showRawParameters,
  showThinking,
  autoScrollToBottom,
  sendByCtrlEnter,
  externalMessageUpdate,
  onShowAllTasks,
  useNewUi: useNewUiProp,
}: ChatInterfaceProps) {
  const { tasksEnabled, isTaskMasterInstalled } = useTasksSettings();
  const { t } = useTranslation('chat');
  const { useNewUi: useNewUiFromHook } = useUiVersion();
  const useNewUi = useNewUiProp ?? useNewUiFromHook;

  const sessionStore = useSessionStore();
  const streamBufferRef = useRef('');
  const streamTimerRef = useRef<number | null>(null);
  const accumulatedStreamRef = useRef('');
  const thinkingTimerRef = useRef<number | null>(null);
  const accumulatedThinkingRef = useRef('');
  const pendingViewSessionRef = useRef<PendingViewSession | null>(null);

  const resetStreamingState = useCallback(() => {
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    streamBufferRef.current = '';
    accumulatedStreamRef.current = '';
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    accumulatedThinkingRef.current = '';
  }, []);

  const {
    provider,
    setProvider,
    cursorModel,
    setCursorModel,
    claudeModel,
    setClaudeModel,
    codexModel,
    setCodexModel,
    geminiModel,
    setGeminiModel,
    permissionMode,
    pendingPermissionRequests,
    setPendingPermissionRequests,
    cyclePermissionMode,
  } = useChatProviderState({
    selectedSession,
  });

  const {
    chatMessages,
    addMessage,
    clearMessages,
    rewindMessages,
    isLoading,
    setIsLoading,
    currentSessionId,
    setCurrentSessionId,
    isLoadingSessionMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    totalMessages,
    canAbortSession,
    setCanAbortSession,
    sessionInTerminal,
    setSessionInTerminal,
    isUserScrolledUp,
    setIsUserScrolledUp,
    tokenBudget,
    setTokenBudget,
    visibleMessageCount,
    visibleMessages,
    loadEarlierMessages,
    loadAllMessages,
    allMessagesLoaded,
    isLoadingAllMessages,
    loadAllJustFinished,
    showLoadAllOverlay,
    claudeStatus,
    setClaudeStatus,
    createDiff,
    scrollContainerRef,
    scrollToBottom,
    scrollToBottomAndReset,
    isNearBottom,
    handleScroll,
  } = useChatSessionState({
    selectedProject,
    selectedSession,
    ws,
    sendMessage,
    autoScrollToBottom,
    externalMessageUpdate,
    processingSessions,
    resetStreamingState,
    pendingViewSessionRef,
    sessionStore,
  });

  const {
    input,
    setInput,
    textareaRef,
    inputHighlightRef,
    isTextareaExpanded,
    thinkingMode,
    setThinkingMode,
    slashCommandsCount,
    filteredCommands,
    frequentCommands,
    commandQuery,
    showCommandMenu,
    selectedCommandIndex,
    resetCommandMenuState,
    handleCommandSelect,
    handleToggleCommandMenu,
    showFileDropdown,
    filteredFiles,
    selectedFileIndex,
    renderInputWithMentions,
    selectFile,
    attachedImages,
    setAttachedImages,
    uploadingImages,
    imageErrors,
    getRootProps,
    getInputProps,
    isDragActive,
    openImagePicker,
    handleSubmit,
    handleInputChange,
    handleKeyDown,
    handlePaste,
    handleTextareaClick,
    handleTextareaInput,
    syncInputOverlayScroll,
    handleClearInput,
    handleAbortSession,
    handleTranscript,
    handlePermissionDecision,
    handleGrantToolPermission,
    handleInputFocusChange,
    isInputFocused,
  } = useChatComposerState({
    selectedProject,
    selectedSession,
    currentSessionId,
    setCurrentSessionId,
    provider,
    permissionMode,
    cyclePermissionMode,
    cursorModel,
    claudeModel,
    codexModel,
    geminiModel,
    isLoading,
    canAbortSession,
    tokenBudget,
    sendMessage,
    sendByCtrlEnter,
    onSessionActive,
    onSessionProcessing,
    onInputFocusChange,
    onFileOpen,
    onShowSettings,
    pendingViewSessionRef,
    scrollToBottom,
    addMessage,
    clearMessages,
    rewindMessages,
    setIsLoading,
    setCanAbortSession,
    setClaudeStatus,
    setIsUserScrolledUp,
    setPendingPermissionRequests,
  });

  const handleWebSocketReconnect = useCallback(async () => {
    if (!selectedProject || !selectedSession) return;
    const providerVal = (localStorage.getItem('selected-provider') as SessionProvider) || 'claude';
    const sessionProvider = (selectedSession.__provider || providerVal) as SessionProvider;

    await sessionStore.refreshFromServer(selectedSession.id, {
      storeKey: `${sessionProvider}:${selectedSession.id}`,
      provider: (selectedSession.__provider || providerVal) as SessionProvider,
      projectName: selectedProject.name,
      projectPath: selectedProject.fullPath || selectedProject.path || '',
    });
    sendMessage({ type: 'check-session-status', sessionId: selectedSession.id, provider: sessionProvider });
  }, [selectedProject, selectedSession, sendMessage, sessionStore]);

  useChatRealtimeHandlers({
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
    onWebSocketReconnect: handleWebSocketReconnect,
    sessionStore,
  });

  const activeViewSessionId = selectedSession?.id || currentSessionId || pendingViewSessionRef.current?.sessionId || null;
  const [outcomeStatus, setOutcomeStatus] = useState<StatusOutcome>(null);
  const lastAssistantMessageAtRef = useRef(0);
  const handledCompletionTimestampRef = useRef<number | null>(null);
  const [liveActivityText, setLiveActivityText] = useState<string | null>(null);
  const isVisibleSession = useCallback(
    (sessionId?: string | null, sessionProvider?: string | null) => {
      if (!sessionId) {
        return false;
      }

      const resolvedProvider = (sessionProvider as SessionProvider) || selectedSession?.__provider || provider;
      const selectedProvider = selectedSession?.__provider || provider;
      return (
        (sessionId === selectedSession?.id && resolvedProvider === selectedProvider) ||
        (sessionId === currentSessionId && resolvedProvider === provider) ||
        (sessionId === pendingViewSessionRef.current?.sessionId && resolvedProvider === provider) ||
        (sessionId === activeViewSessionId && resolvedProvider === selectedProvider)
      );
    },
    [activeViewSessionId, currentSessionId, pendingViewSessionRef, provider, selectedSession?.__provider, selectedSession?.id],
  );

  useEffect(() => {
    if (!latestMessage) {
      return;
    }

    const msg = latestMessage as Record<string, unknown>;
    const messageSessionId =
      (typeof msg.sessionId === 'string' ? msg.sessionId : null) ||
      (typeof msg.actualSessionId === 'string' ? msg.actualSessionId : null) ||
      activeViewSessionId;
    const messageProvider = typeof msg.provider === 'string' ? msg.provider : null;

    if (!isVisibleSession(messageSessionId, messageProvider)) {
      return;
    }

    const nextLiveActivityText = getLiveActivityText(msg, t);
    if (nextLiveActivityText) {
      setLiveActivityText(nextLiveActivityText);
    }

    if (msg.kind === 'text' && msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.trim()) {
      lastAssistantMessageAtRef.current = Date.now();
    }

    if (msg.kind === 'complete') {
      const isAborted = msg.aborted === true;
      setIsLoading(false);
      setCanAbortSession(false);
      setClaudeStatus(null);
      onSessionInactive?.(messageSessionId);
      onSessionNotProcessing?.(messageSessionId);
      setLiveActivityText(null);
      setOutcomeStatus({
        kind: isAborted ? 'aborted' : 'complete',
        text: isAborted
          ? t('claudeStatus.state.aborted', { defaultValue: 'Stopped' })
          : t('claudeStatus.state.complete', { defaultValue: 'Done' }),
        timestamp: Date.now(),
      });
      return;
    }

    if (msg.kind === 'error') {
      setIsLoading(false);
      setCanAbortSession(false);
      setClaudeStatus(null);
      onSessionInactive?.(messageSessionId);
      onSessionNotProcessing?.(messageSessionId);
      setLiveActivityText(null);
      const errorText = typeof msg.content === 'string' && msg.content.trim()
        ? msg.content.trim()
        : t('messageTypes.error', { defaultValue: 'Error' });
      setOutcomeStatus({
        kind: 'error',
        text: errorText,
        timestamp: Date.now(),
      });
    }
  }, [
    activeViewSessionId,
    currentSessionId,
    latestMessage,
    onSessionInactive,
    onSessionNotProcessing,
    isVisibleSession,
    selectedSession?.id,
    t,
  ]);

  useEffect(() => {
    if (isLoading || pendingPermissionRequests.length > 0 || sessionInTerminal.active) {
      setOutcomeStatus(null);
    }
  }, [isLoading, pendingPermissionRequests.length, sessionInTerminal.active]);

  useEffect(() => {
    setOutcomeStatus(null);
    handledCompletionTimestampRef.current = null;
    setLiveActivityText(null);
  }, [activeViewSessionId]);

  useEffect(() => {
    if (!outcomeStatus || outcomeStatus.kind !== 'complete' || !selectedProject || !activeViewSessionId) {
      return;
    }

    if (handledCompletionTimestampRef.current === outcomeStatus.timestamp) {
      return;
    }
    handledCompletionTimestampRef.current = outcomeStatus.timestamp;

    const shouldSkipRefresh = Date.now() - lastAssistantMessageAtRef.current < 3000;
    if (shouldSkipRefresh) {
      return;
    }

    const sessionProvider = (selectedSession?.__provider || provider) as SessionProvider;
    const refreshTimers = COMPLETE_REFRESH_DELAYS_MS.map((delayMs) => setTimeout(() => {
      void sessionStore.refreshFromServer(activeViewSessionId, {
        storeKey: `${sessionProvider}:${activeViewSessionId}`,
        provider: sessionProvider,
        projectName: selectedProject.name,
        projectPath: selectedProject.fullPath || selectedProject.path || '',
      }).then(() => {
        if (!isUserScrolledUp || isNearBottom()) {
          setTimeout(() => {
            scrollToBottomAndReset();
          }, 80);
        }
      });
    }, delayMs));

    return () => {
      refreshTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [
    activeViewSessionId,
    isNearBottom,
    isUserScrolledUp,
    outcomeStatus,
    provider,
    scrollToBottomAndReset,
    selectedProject,
    selectedSession?.__provider,
    sessionStore,
  ]);

  const statusMessageSlot = useMemo(() => (
    <ChatStatusMessage
      pendingPermissionRequests={[]}
      handlePermissionDecision={handlePermissionDecision}
      handleGrantToolPermission={handleGrantToolPermission}
      status={claudeStatus}
      isLoading={isLoading}
      onAbort={handleAbortSession}
      sessionInTerminal={sessionInTerminal}
      provider={provider}
      outcomeStatus={outcomeStatus}
      liveActivityText={liveActivityText}
    />
  ), [
    handlePermissionDecision,
    handleGrantToolPermission,
    claudeStatus,
    handleAbortSession,
    isLoading,
    sessionInTerminal,
    provider,
    outcomeStatus,
    liveActivityText,
  ]);

  useEffect(() => {
    if (!isLoading || !canAbortSession) {
      return;
    }

    const handleGlobalEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.repeat || event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      handleAbortSession();
    };

    document.addEventListener('keydown', handleGlobalEscape, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleGlobalEscape, { capture: true });
    };
  }, [canAbortSession, handleAbortSession, isLoading]);

  useEffect(() => {
    return () => {
      resetStreamingState();
    };
  }, [resetStreamingState]);

  if (!selectedProject) {
    const selectedProviderLabel =
      provider === 'cursor'
        ? t('messageTypes.cursor')
        : provider === 'codex'
          ? t('messageTypes.codex')
          : provider === 'gemini'
            ? t('messageTypes.gemini')
            : t('messageTypes.claude');

    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            {t('projectSelection.startChatWithProvider', {
              provider: selectedProviderLabel,
              defaultValue: 'Select a project to start chatting with {{provider}}',
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <ChatMessagesPane
          scrollContainerRef={scrollContainerRef}
          onWheel={handleScroll}
          onTouchMove={handleScroll}
          isLoadingSessionMessages={isLoadingSessionMessages}
          chatMessages={chatMessages}
          selectedSession={selectedSession}
          currentSessionId={currentSessionId}
          provider={provider}
          setProvider={(nextProvider) => setProvider(nextProvider as Provider)}
          textareaRef={textareaRef}
          claudeModel={claudeModel}
          setClaudeModel={setClaudeModel}
          cursorModel={cursorModel}
          setCursorModel={setCursorModel}
          codexModel={codexModel}
          setCodexModel={setCodexModel}
          geminiModel={geminiModel}
          setGeminiModel={setGeminiModel}
          tasksEnabled={tasksEnabled}
          isTaskMasterInstalled={isTaskMasterInstalled}
          onShowAllTasks={onShowAllTasks}
          setInput={setInput}
          isLoadingMoreMessages={isLoadingMoreMessages}
          hasMoreMessages={hasMoreMessages}
          totalMessages={totalMessages}
          sessionMessagesCount={chatMessages.length}
          visibleMessageCount={visibleMessageCount}
          visibleMessages={visibleMessages}
          loadEarlierMessages={loadEarlierMessages}
          loadAllMessages={loadAllMessages}
          allMessagesLoaded={allMessagesLoaded}
          isLoadingAllMessages={isLoadingAllMessages}
          loadAllJustFinished={loadAllJustFinished}
          showLoadAllOverlay={showLoadAllOverlay}
          createDiff={createDiff}
          onFileOpen={onFileOpen}
          onShowSettings={onShowSettings}
          onGrantToolPermission={handleGrantToolPermission}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          showThinking={showThinking}
          selectedProject={selectedProject}
          isInputFocused={isInputFocused}
          statusMessageSlot={statusMessageSlot}
          liveStatusText={isLoading ? claudeStatus?.text || null : null}
        />
        {pendingPermissionRequests.length > 0 && (
          <div className="flex-shrink-0 px-2 pt-2 sm:px-4">
            <div className="mx-auto max-w-4xl">
              <PermissionRequestsBanner
                pendingPermissionRequests={pendingPermissionRequests}
                handlePermissionDecision={handlePermissionDecision}
                handleGrantToolPermission={handleGrantToolPermission}
              />
            </div>
          </div>
        )}

        {useNewUi ? (
          <ChatComposerV2
            pendingPermissionRequests={pendingPermissionRequests}
            isLoading={isLoading}
            sessionInTerminal={sessionInTerminal}
            provider={provider}
            permissionMode={permissionMode}
            onModeSwitch={cyclePermissionMode}
            thinkingMode={thinkingMode}
            setThinkingMode={setThinkingMode}
            tokenBudget={tokenBudget}
            slashCommandsCount={slashCommandsCount}
            onToggleCommandMenu={handleToggleCommandMenu}
            hasInput={Boolean(input.trim())}
            onClearInput={handleClearInput}
            isUserScrolledUp={isUserScrolledUp}
            hasMessages={chatMessages.length > 0}
            onScrollToBottom={scrollToBottomAndReset}
            onSubmit={handleSubmit}
            isDragActive={isDragActive}
            attachedImages={attachedImages}
            onRemoveImage={(index) =>
              setAttachedImages((previous) =>
                previous.filter((_, currentIndex) => currentIndex !== index),
              )
            }
            uploadingImages={uploadingImages}
            imageErrors={imageErrors}
            showFileDropdown={showFileDropdown}
            filteredFiles={filteredFiles}
            selectedFileIndex={selectedFileIndex}
            onSelectFile={selectFile}
            filteredCommands={filteredCommands}
            selectedCommandIndex={selectedCommandIndex}
            onCommandSelect={handleCommandSelect}
            onCloseCommandMenu={resetCommandMenuState}
            isCommandMenuOpen={showCommandMenu}
            frequentCommands={commandQuery ? [] : frequentCommands}
            getRootProps={getRootProps as (...args: unknown[]) => Record<string, unknown>}
            getInputProps={getInputProps as (...args: unknown[]) => Record<string, unknown>}
            openImagePicker={openImagePicker}
            inputHighlightRef={inputHighlightRef}
            renderInputWithMentions={renderInputWithMentions}
            textareaRef={textareaRef}
            input={input}
            onInputChange={handleInputChange}
            onTextareaClick={handleTextareaClick}
            onTextareaKeyDown={handleKeyDown}
            onTextareaPaste={handlePaste}
            onTextareaScrollSync={syncInputOverlayScroll}
            onTextareaInput={handleTextareaInput}
            onInputFocusChange={handleInputFocusChange}
            isInputFocused={isInputFocused}
            placeholder={t('input.placeholder', {
              provider:
                provider === 'cursor'
                  ? t('messageTypes.cursor')
                  : provider === 'codex'
                    ? t('messageTypes.codex')
                    : provider === 'gemini'
                      ? t('messageTypes.gemini')
                      : t('messageTypes.claude'),
            })}
            sendByCtrlEnter={sendByCtrlEnter}
          />
        ) : (
          <ChatComposer
            pendingPermissionRequests={pendingPermissionRequests}
            isLoading={isLoading}
            sessionInTerminal={sessionInTerminal}
            provider={provider}
            permissionMode={permissionMode}
            onModeSwitch={cyclePermissionMode}
            thinkingMode={thinkingMode}
            setThinkingMode={setThinkingMode}
            tokenBudget={tokenBudget}
            slashCommandsCount={slashCommandsCount}
            onToggleCommandMenu={handleToggleCommandMenu}
            hasInput={Boolean(input.trim())}
            onClearInput={handleClearInput}
            isUserScrolledUp={isUserScrolledUp}
            hasMessages={chatMessages.length > 0}
            onScrollToBottom={scrollToBottomAndReset}
            onSubmit={handleSubmit}
            isDragActive={isDragActive}
            attachedImages={attachedImages}
            onRemoveImage={(index) =>
              setAttachedImages((previous) =>
                previous.filter((_, currentIndex) => currentIndex !== index),
              )
            }
            uploadingImages={uploadingImages}
            imageErrors={imageErrors}
            showFileDropdown={showFileDropdown}
            filteredFiles={filteredFiles}
            selectedFileIndex={selectedFileIndex}
            onSelectFile={selectFile}
            filteredCommands={filteredCommands}
            selectedCommandIndex={selectedCommandIndex}
            onCommandSelect={handleCommandSelect}
            onCloseCommandMenu={resetCommandMenuState}
            isCommandMenuOpen={showCommandMenu}
            frequentCommands={commandQuery ? [] : frequentCommands}
            getRootProps={getRootProps as (...args: unknown[]) => Record<string, unknown>}
            getInputProps={getInputProps as (...args: unknown[]) => Record<string, unknown>}
            openImagePicker={openImagePicker}
            inputHighlightRef={inputHighlightRef}
            renderInputWithMentions={renderInputWithMentions}
            textareaRef={textareaRef}
            input={input}
            onInputChange={handleInputChange}
            onTextareaClick={handleTextareaClick}
            onTextareaKeyDown={handleKeyDown}
            onTextareaPaste={handlePaste}
            onTextareaScrollSync={syncInputOverlayScroll}
            onTextareaInput={handleTextareaInput}
            onInputFocusChange={handleInputFocusChange}
            isInputFocused={isInputFocused}
            placeholder={t('input.placeholder', {
              provider:
                provider === 'cursor'
                  ? t('messageTypes.cursor')
                  : provider === 'codex'
                    ? t('messageTypes.codex')
                    : provider === 'gemini'
                      ? t('messageTypes.gemini')
                      : t('messageTypes.claude'),
            })}
            isTextareaExpanded={isTextareaExpanded}
            sendByCtrlEnter={sendByCtrlEnter}
            onTranscript={handleTranscript}
          />
        )}
      </div>

      <QuickSettingsPanel />
    </>
  );
}

export default React.memo(ChatInterface);
