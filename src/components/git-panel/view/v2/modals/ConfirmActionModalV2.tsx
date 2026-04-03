import { useEffect } from 'react';
import { Check, Download, RotateCcw, Trash2, Upload } from 'lucide-react';
import {
  CONFIRMATION_ACTION_LABELS,
  CONFIRMATION_BUTTON_CLASSES,
  CONFIRMATION_ICON_CONTAINER_CLASSES,
  CONFIRMATION_TITLES,
} from '../../../constants/constants';
import type { ConfirmationRequest } from '../../../types/types';

type ConfirmActionModalV2Props = {
  action: ConfirmationRequest | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function renderConfirmActionIcon(actionType: ConfirmationRequest['type']) {
  if (actionType === 'discard' || actionType === 'delete') {
    return <Trash2 className="h-4 w-4" />;
  }

  if (actionType === 'commit') {
    return <Check className="h-4 w-4" />;
  }

  if (actionType === 'pull') {
    return <Download className="h-4 w-4" />;
  }

  if (actionType === 'revertLocalCommit') {
    return <RotateCcw className="h-4 w-4" />;
  }

  return <Upload className="h-4 w-4" />;
}

export default function ConfirmActionModalV2({ action, onCancel, onConfirm }: ConfirmActionModalV2Props) {
  const titleId = action ? `confirmation-title-${action.type}` : undefined;

  useEffect(() => {
    if (!action) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [action, onCancel]);

  if (!action) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <div className={`mr-3 rounded-full p-2 ${CONFIRMATION_ICON_CONTAINER_CLASSES[action.type]}`}>
              {renderConfirmActionIcon(action.type)}
            </div>
            <h3 id={titleId} className="text-lg font-semibold text-[hsl(var(--claude-text))]">
              {CONFIRMATION_TITLES[action.type]}
            </h3>
          </div>

          <p className="mb-6 text-sm text-[hsl(var(--claude-text-secondary))]">{action.message}</p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="v2-btn-secondary rounded-lg px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm text-white transition-colors ${CONFIRMATION_BUTTON_CLASSES[action.type]}`}
            >
              {renderConfirmActionIcon(action.type)}
              <span>{CONFIRMATION_ACTION_LABELS[action.type]}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
