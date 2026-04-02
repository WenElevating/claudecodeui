import { cn } from '../../../../lib/utils';

type SettingsToggleV2Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
};

export default function SettingsToggleV2({ checked, onChange, ariaLabel, disabled }: SettingsToggleV2Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 flex-shrink-0 touch-manipulation cursor-pointer items-center rounded-full border-2 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--claude-accent)/0.3)] focus-visible:ring-offset-2',
        checked
          ? 'border-[hsl(var(--claude-accent))] bg-[hsl(var(--claude-accent))]'
          : 'border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-tertiary))]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px] bg-white' : 'translate-x-[2px] bg-[hsl(var(--claude-text-muted))]',
        )}
      />
    </button>
  );
}
