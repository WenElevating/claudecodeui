import { useTranslation } from 'react-i18next';
import { shouldShowGithubAuthentication } from '../../utils/pathUtils';
import type { GithubTokenCredential, TokenMode, WorkspaceType } from '../../types';
import GithubAuthCardV2 from './GithubAuthCardV2';
import WorkspacePathFieldV2 from './WorkspacePathFieldV2';

type StepConfigurationV2Props = {
  workspaceType: WorkspaceType;
  workspacePath: string;
  githubUrl: string;
  tokenMode: TokenMode;
  selectedGithubToken: string;
  newGithubToken: string;
  availableTokens: GithubTokenCredential[];
  loadingTokens: boolean;
  tokenLoadError: string | null;
  isCreating: boolean;
  onWorkspacePathChange: (workspacePath: string) => void;
  onGithubUrlChange: (githubUrl: string) => void;
  onTokenModeChange: (tokenMode: TokenMode) => void;
  onSelectedGithubTokenChange: (tokenId: string) => void;
  onNewGithubTokenChange: (tokenValue: string) => void;
  onAdvanceToConfirm: () => void;
};

export default function StepConfigurationV2({
  workspaceType,
  workspacePath,
  githubUrl,
  tokenMode,
  selectedGithubToken,
  newGithubToken,
  availableTokens,
  loadingTokens,
  tokenLoadError,
  isCreating,
  onWorkspacePathChange,
  onGithubUrlChange,
  onTokenModeChange,
  onSelectedGithubTokenChange,
  onNewGithubTokenChange,
  onAdvanceToConfirm,
}: StepConfigurationV2Props) {
  const { t } = useTranslation();
  const showGithubAuth = shouldShowGithubAuthentication(workspaceType, githubUrl);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
          {workspaceType === 'existing'
            ? t('projectWizard.step2.existingPath')
            : t('projectWizard.step2.newPath')}
        </label>

        <WorkspacePathFieldV2
          workspaceType={workspaceType}
          value={workspacePath}
          disabled={isCreating}
          onChange={onWorkspacePathChange}
          onAdvanceToConfirm={onAdvanceToConfirm}
        />

        <p className="mt-1.5 text-xs text-[hsl(var(--claude-text-muted))]">
          {workspaceType === 'existing'
            ? t('projectWizard.step2.existingHelp')
            : t('projectWizard.step2.newHelp')}
        </p>
      </div>

      {workspaceType === 'new' && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
              {t('projectWizard.step2.githubUrl')}
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => onGithubUrlChange(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full rounded-xl border border-[hsl(var(--claude-border-default))] bg-[hsl(var(--claude-bg))] px-3 py-2 text-sm text-[hsl(var(--claude-text))] placeholder:text-[hsl(var(--claude-text-muted))] focus:border-[hsl(var(--claude-accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--claude-accent)/0.2)]"
              disabled={isCreating}
            />
            <p className="mt-1.5 text-xs text-[hsl(var(--claude-text-muted))]">
              {t('projectWizard.step2.githubHelp')}
            </p>
          </div>

          {showGithubAuth && (
            <GithubAuthCardV2
              tokenMode={tokenMode}
              selectedGithubToken={selectedGithubToken}
              newGithubToken={newGithubToken}
              availableTokens={availableTokens}
              loadingTokens={loadingTokens}
              tokenLoadError={tokenLoadError}
              onTokenModeChange={onTokenModeChange}
              onSelectedGithubTokenChange={onSelectedGithubTokenChange}
              onNewGithubTokenChange={onNewGithubTokenChange}
            />
          )}
        </>
      )}
    </div>
  );
}
