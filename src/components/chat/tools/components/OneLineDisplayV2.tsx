import React, { useState, useCallback, useEffect, useRef } from 'react';
import { copyTextToClipboard } from '../../../../utils/clipboard';
import { useOverflowExpand } from '../../../../hooks/useOverflowExpand';

type ActionType = 'copy' | 'open-file' | 'jump-to-results' | 'none';

interface OneLineDisplayV2Props {
  toolName: string;
  icon?: string;
  label?: string;
  value: string;
  secondary?: string;
  action?: ActionType;
  onAction?: () => void;
  style?: string;
  wrapText?: boolean;
  colorScheme?: {
    primary?: string;
    secondary?: string;
    background?: string;
    border?: string;
    icon?: string;
  };
  resultId?: string;
  toolResult?: any;
  toolId?: string;
}

const ExpandableText: React.FC<{
  value: string;
  className?: string;
  wrapText?: boolean;
}> = ({ value, className = '', wrapText = false }) => {
  const { ref, isExpanded, isOverflowing, toggle } = useOverflowExpand<HTMLSpanElement>([value]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOverflowing || isExpanded) toggle();
  };

  return (
    <div className={`min-w-0 flex-1 ${isExpanded ? '' : 'overflow-hidden'}`}>
      <span
        ref={ref}
        onClick={handleClick}
        className={`${className} inline-block ${isExpanded ? (wrapText ? 'whitespace-pre-wrap break-all' : 'whitespace-pre-wrap break-words') : 'whitespace-nowrap'} ${(isOverflowing || isExpanded) ? 'cursor-pointer' : ''}`}
        title={!isExpanded && isOverflowing ? value : undefined}
      >
        {value}
        {isOverflowing && !isExpanded && (
          <span className="ml-1 text-[hsl(var(--claude-text-muted))]">…</span>
        )}
      </span>
    </div>
  );
};

const ExpandableTerminalCode: React.FC<{
  value: string;
  wrapText?: boolean;
}> = ({ value, wrapText = false }) => {
  const { ref, isExpanded, isOverflowing, toggle } = useOverflowExpand<HTMLElement>([value]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOverflowing || isExpanded) toggle();
  };

  return (
    <div className={`min-w-0 flex-1 ${isExpanded ? '' : 'overflow-hidden'}`}>
      <code
        ref={ref}
        onClick={handleClick}
        className={`font-mono text-[13px] leading-relaxed text-[hsl(var(--claude-text))] inline-block ${isExpanded ? (wrapText ? 'whitespace-pre-wrap break-all' : 'whitespace-pre-wrap break-words') : 'whitespace-nowrap'} ${(isOverflowing || isExpanded) ? 'cursor-pointer' : ''}`}
      >
        <span className="select-none font-semibold text-[hsl(var(--claude-accent))]">$ </span>
        <span className="text-[hsl(var(--claude-text-secondary))]">{value}</span>
        {isOverflowing && !isExpanded && (
          <span className="text-[hsl(var(--claude-text-muted))]">…</span>
        )}
      </code>
    </div>
  );
};

const ExpandableFilePath: React.FC<{
  value: string;
  onClick?: () => void;
}> = ({ value, onClick }) => {
  const { ref, isExpanded, isOverflowing, toggle } = useOverflowExpand<HTMLButtonElement>([value]);
  const displayName = value.split('/').pop() || value;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOverflowing || isExpanded) {
      toggle();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`min-w-0 flex-1 ${isExpanded ? '' : 'overflow-hidden'}`}>
      <button
        ref={ref}
        onClick={handleClick}
        className={`font-mono text-xs text-[hsl(var(--claude-blue))] transition-colors hover:underline inline-block text-left ${isExpanded ? 'whitespace-pre-wrap break-all' : 'whitespace-nowrap'} ${(isOverflowing || isExpanded) ? 'cursor-pointer' : ''}`}
        title={!isExpanded ? value : undefined}
      >
        {isExpanded ? value : displayName}
        {isOverflowing && !isExpanded && (
          <span className="ml-1 text-[hsl(var(--claude-text-muted))]">…</span>
        )}
      </button>
    </div>
  );
};

/**
 * V2-styled one-line display for simple tool inputs and results
 * Matches Claude Code Mobile design system with warm amber accents
 */
export const OneLineDisplayV2: React.FC<OneLineDisplayV2Props> = ({
  toolName,
  icon,
  label,
  value,
  secondary,
  action = 'none',
  onAction,
  style,
  wrapText = false,
  toolResult,
  toolId
}) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTerminal = style === 'terminal';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAction = useCallback(async () => {
    if (action === 'copy' && value) {
      const didCopy = await copyTextToClipboard(value);
      if (!didCopy) {
        return;
      }
      setCopied(true);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } else if (onAction) {
      onAction();
    }
  }, [action, value, onAction]);

  const renderCopyButton = () => (
    <button
      onClick={handleAction}
      className="ml-2 flex-shrink-0 rounded-md p-1.5 text-[hsl(var(--claude-text-muted))] opacity-0 transition-all hover:bg-[hsl(var(--claude-tertiary))] hover:text-[hsl(var(--claude-text))] group-hover:opacity-100"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5 text-[hsl(var(--claude-green))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  // V2 Terminal style: warm surface with amber accent
  if (isTerminal) {
    return (
      <div className="group my-2 max-w-full overflow-hidden">
        <div className="flex items-start gap-2.5">
          <div className="flex flex-shrink-0 items-center gap-1.5 pt-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[hsl(var(--claude-accent)/0.15)]">
              <svg className="h-3 w-3 text-[hsl(var(--claude-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className="min-w-0 flex-1 rounded-lg bg-[hsl(var(--claude-surface))] px-3 py-2 ring-1 ring-[hsl(var(--claude-border))]">
              <ExpandableTerminalCode value={value} wrapText={wrapText} />
            </div>
            {action === 'copy' && renderCopyButton()}
          </div>
        </div>

        {secondary && (
          <div className="ml-9 mt-1.5">
            <span className="text-xs text-[hsl(var(--claude-text-muted))]">
              {secondary}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (action === 'open-file') {
    return (
      <div className="group my-1.5 flex max-w-full items-center gap-2 overflow-hidden rounded-lg py-1 pl-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[hsl(var(--claude-blue)/0.15)]">
          <svg className="h-3 w-3 text-[hsl(var(--claude-blue))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-[hsl(var(--claude-text-secondary))]">{label || toolName}</span>
        <span className="text-[10px] text-[hsl(var(--claude-text-muted))]">/</span>
        <ExpandableFilePath value={value} onClick={handleAction} />
      </div>
    );
  }

  // Search / jump-to-results style
  if (action === 'jump-to-results') {
    return (
      <div className="group my-1.5 flex max-w-full items-center gap-2 overflow-hidden rounded-lg py-1 pl-3">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[hsl(var(--claude-accent)/0.15)]">
          <svg className="h-3 w-3 text-[hsl(var(--claude-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-[hsl(var(--claude-text-secondary))]">{label || toolName}</span>
        <span className="text-[10px] text-[hsl(var(--claude-text-muted))]">/</span>
        <ExpandableText
          value={value}
          className="font-mono text-xs text-[hsl(var(--claude-text))]"
        />
        {secondary && (
          <span className="flex-shrink-0 text-xs text-[hsl(var(--claude-text-muted))]">
            {secondary}
          </span>
        )}
        {toolResult && (
          <a
            href={`#tool-result-${toolId}`}
            className="flex flex-shrink-0 items-center gap-0.5 text-xs text-[hsl(var(--claude-blue))] transition-colors hover:underline"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        )}
      </div>
    );
  }

  // Default one-line style
  return (
    <div className="group my-1.5 flex max-w-full items-center gap-2 overflow-hidden rounded-lg py-1 pl-3">
      {icon && icon !== 'terminal' && (
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[hsl(var(--claude-tertiary))]">
          <span className="text-xs text-[hsl(var(--claude-text-secondary))]">{icon}</span>
        </div>
      )}
      {!icon && (label || toolName) && (
        <span className="flex-shrink-0 text-xs font-medium text-[hsl(var(--claude-text-secondary))]">{label || toolName}</span>
      )}
      {(icon || label || toolName) && (
        <span className="text-[10px] text-[hsl(var(--claude-text-muted))]">/</span>
      )}
      <ExpandableText
        value={value}
        wrapText={wrapText}
        className="font-mono text-xs text-[hsl(var(--claude-text))]"
      />
      {secondary && (
        <span className="flex-shrink-0 text-xs text-[hsl(var(--claude-text-muted))]">
          {secondary}
        </span>
      )}
      {action === 'copy' && renderCopyButton()}
    </div>
  );
};
