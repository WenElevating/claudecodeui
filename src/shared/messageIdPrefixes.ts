/**
 * Message ID prefixes used for identifying message types in realtime streams.
 */

/** Streaming thinking message (still being updated) */
export const THINKING_STREAM_PREFIX = '__thinking_';

/** Finalized thinking message (completed thinking block) */
export const THINKING_FINAL_PREFIX = 'thinking_';

/** Streaming text message (still being updated) */
export const TEXT_STREAM_PREFIX = '__streaming_';

/** Finalized text message */
export const TEXT_FINAL_PREFIX = 'text_';

/**
 * Check if a message ID indicates a streaming thinking message.
 */
export function isStreamingThinking(id: string | undefined): boolean {
  return id?.startsWith(THINKING_STREAM_PREFIX) ?? false;
}

/**
 * Check if a message ID indicates a finalized thinking message.
 */
export function isFinalizedThinking(id: string | undefined): boolean {
  return id?.startsWith(THINKING_FINAL_PREFIX) ?? false;
}

/**
 * Check if a message ID indicates a streaming text message.
 */
export function isStreamingText(id: string | undefined): boolean {
  return id?.startsWith(TEXT_STREAM_PREFIX) ?? false;
}

/**
 * Check if a message ID indicates a finalized text message.
 */
export function isFinalizedText(id: string | undefined): boolean {
  return id?.startsWith(TEXT_FINAL_PREFIX) ?? false;
}
