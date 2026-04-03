import { Key, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GithubTokenCredential, TokenMode } from '../../types';

type GithubAuthCardV2Props = {
  tokenMode: TokenMode;
  selectedGithubToken: string;
  newGithubToken: string;
  availableTokens: GithubTokenCredential[];
  loadingTokens: boolean;
  tokenLoadError: string | null;
  onTokenModeChange: (tokenMode: TokenMode) => void;
  onSelectedGithubTokenChange: (tokenId: string) => void;
  onNewGithubTokenChange: (tokenValue: string) => void;
};

export default function GithubAuthCardV2({
  tokenMode,
  selectedGithubToken,
  newGithubToken,
  availableTokens,
  loadingTokens,
  tokenLoadError,
  onTokenModeChange,
  onSelectedGithubTokenChange,
  onNewGithubTokenChange,
}: GithubAuthCardV2Props) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--claude-accent)/0.1)]">
          <Key className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
        </div>
        <div className="flex-1">
          <h5 className="mb-1 font-medium text-[hsl(var(--claude-text))]">
            {t('projectWizard.step2.githubAuth')}
          </h5>
          <p className="text-sm text-[hsl(var(--claude-text-secondary))]">
            {t('projectWizard.step2.githubAuthHelp')}
          </p>
        </div>
      </div>

      {loadingTokens && (
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--claude-text-muted))]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('projectWizard.step2.loadingTokens')}
        </div>
      )}

      {!loadingTokens && tokenLoadError && (
        <p className="mb-3 text-sm text-[hsl(var(--claude-red))]">{tokenLoadError}</p>
      )}

      {!loadingTokens && availableTokens.length > 0 && (
        <>
          <div className="v2-toggle-pills mb-4">
            <button
              onClick={() => onTokenModeChange('stored')}
              className={`v2-toggle-pill ${tokenMode === 'stored' ? 'active' : ''}`}
            >
              {t('projectWizard.step2.storedToken')}
            </button>
            <button
              onClick={() => onTokenModeChange('new')}
              className={`v2-toggle-pill ${tokenMode === 'new' ? 'active' : ''}`}
            >
              {t('projectWizard.step2.newToken')}
            </button>
            <button
              onClick={() => {
                onTokenModeChange('none');
                onSelectedGithubTokenChange('');
                onNewGithubTokenChange('');
              }}
              className={`v2-toggle-pill ${tokenMode === 'none' ? 'active' : ''}`}
            >
              {t('projectWizard.step2.nonePublic')}
            </button>
          </div>

          {tokenMode === 'stored' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
                {t('projectWizard.step2.selectToken')}
              </label>
              <select
                value={selectedGithubToken}
                onChange={(event) => onSelectedGithubTokenChange(event.target.value)}
                className="v2-select"
              >
                <option value="">{t('projectWizard.step2.selectTokenPlaceholder')}</option>
                {availableTokens.map((token) => (
                  <option key={token.id} value={String(token.id)}>
                    {token.credential_name}
                  </option>
                ))}
              </select>
            </div>
          ) : tokenMode === 'new' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
                {t('projectWizard.step2.newToken')}
              </label>
              <input
                type="password"
                value={newGithubToken}
                onChange={(event) => onNewGithubTokenChange(event.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-bg))] px-3 py-2 text-sm text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-text-muted))] focus:border-[hsl(var(--claude-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--claude-accent)/0.2)]"
              />
              <p className="mt-1 text-xs text-[hsl(var(--claude-text-muted))]">
                {t('projectWizard.step2.tokenHelp')}
              </p>
            </div>
          ) : null}
        </>
      )}

      {!loadingTokens && availableTokens.length === 0 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--claude-accent)/0.2)] bg-[hsl(var(--claude-accent)/0.05)] p-3">
            <p className="text-sm text-[hsl(var(--claude-accent))]">
              {t('projectWizard.step2.publicRepoInfo')}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
              {t('projectWizard.step2.optionalTokenPublic')}
            </label>
            <input
              type="password"
              value={newGithubToken}
              onChange={(event) => {
                const tokenValue = event.target.value;
                onNewGithubTokenChange(tokenValue);
                onTokenModeChange(tokenValue.trim() ? 'new' : 'none');
              }}
              placeholder={t('projectWizard.step2.tokenPublicPlaceholder')}
              className="w-full rounded-xl border border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-bg))] px-3 py-2 text-sm text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-text-muted))] focus:border-[hsl(var(--claude-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--claude-accent)/0.2)]"
            />
            <p className="mt-1 text-xs text-[hsl(var(--claude-text-muted))]">
              {t('projectWizard.step2.noTokensHelp')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
