import { useTranslation } from 'react-i18next';

interface TerminalSessionBannerProps {
  maxWidthClass?: string;
}

export default function TerminalSessionBanner({ maxWidthClass = 'max-w-4xl' }: TerminalSessionBannerProps) {
  const { t } = useTranslation('chat');

  return (
    <div className={`mx-auto mb-3 ${maxWidthClass}`}>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">
            {t('sessionInTerminal.title', { defaultValue: 'This session is running in a terminal' })}
          </span>
        </div>
        <p className="ml-6 mt-1 text-xs opacity-80">
          {t('sessionInTerminal.description', { defaultValue: 'Messages and permission requests from the terminal session are not visible here. You can browse conversation history in read-only mode.' })}
        </p>
      </div>
    </div>
  );
}
