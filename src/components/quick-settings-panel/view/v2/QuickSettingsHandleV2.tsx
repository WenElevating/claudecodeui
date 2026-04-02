import type {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { QuickSettingsHandleStyle } from '../../types';

type QuickSettingsHandleV2Props = {
  isOpen: boolean;
  isDragging: boolean;
  style: QuickSettingsHandleStyle;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onTouchStart: (event: ReactTouchEvent<HTMLButtonElement>) => void;
};

export default function QuickSettingsHandleV2({
  isOpen,
  isDragging,
  style,
  onClick,
  onMouseDown,
  onTouchStart,
}: QuickSettingsHandleV2Props) {
  const { t } = useTranslation('settings');

  const placementClass = isOpen ? 'right-72' : 'right-0';
  const borderClass = isDragging
    ? 'border-[hsl(var(--claude-accent))]'
    : 'border-[hsl(var(--claude-border))]';
  const transitionClass = isDragging
    ? ''
    : 'transition-all duration-150 ease-out';
  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-pointer';
  const ariaLabel = isDragging
    ? t('quickSettings.dragHandle.dragging')
    : isOpen
      ? t('quickSettings.dragHandle.closePanel')
      : t('quickSettings.dragHandle.openPanel');
  const title = isDragging
    ? t('quickSettings.dragHandle.draggingStatus')
    : t('quickSettings.dragHandle.toggleAndMove');

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`fixed ${placementClass} z-50 ${transitionClass} border bg-[hsl(var(--claude-elevated))] ${borderClass} rounded-l-xl p-2 shadow-[var(--shadow-md)] hover:bg-[hsl(var(--claude-tertiary))] ${cursorClass} touch-none`}
      style={{
        ...style,
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
      }}
      aria-label={ariaLabel}
      title={title}
    >
      {isDragging ? (
        <GripVertical className="h-5 w-5 text-[hsl(var(--claude-accent))]" />
      ) : isOpen ? (
        <ChevronRight className="h-5 w-5 text-[hsl(var(--claude-text-secondary))]" />
      ) : (
        <ChevronLeft className="h-5 w-5 text-[hsl(var(--claude-text-secondary))]" />
      )}
    </button>
  );
}
