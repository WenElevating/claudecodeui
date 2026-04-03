import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isSshGitUrl } from '../../utils/pathUtils';
import type { WizardFormState } from '../../types';

type StepReviewV2Props = {
  formState: WizardFormState;
  selectedTokenName: string | null;
  isCreating: boolean;
  cloneProgress: string;
};

function getInfoText(formState: WizardFormState, t: (key: string) => string): string {
  if (formState.workspaceType === 'existing') {
    return t('projectWizard.step3.existingInfo');
  }
  if (formState.githubUrl) {
    return t('projectWizard.step3.newWithClone');
  }
  return t('projectWizard.step3.newEmpty');
}

export default function StepReviewV2({
  formState,
  selectedTokenName,
  isCreating,
  cloneProgress,
}: StepReviewV2Props) {
  const { t } = useTranslation();

  const authenticationLabel = useMemo(() => {
    if (formState.tokenMode === 'stored' && formState.selectedGithubToken) {
      return `${t('projectWizard.step3.usingStoredToken')} ${selectedTokenName || 'Unknown'}`;
    }

    if (formState.tokenMode === 'new' && formState.newGithubToken.trim()) {
      return t('projectWizard.step3.usingProvidedToken');
    }

    if (isSshGitUrl(formState.githubUrl)) {
      return t('projectWizard.step3.sshKey', { defaultValue: 'SSH Key' });
    }

    return t('projectWizard.step3.noAuthentication');
  }, [formState, selectedTokenName, t]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-surface))] p-4">
        <h4 className="mb-3 text-sm font-semibold text-[hsl(var(--claude-text))]">
          {t('projectWizard.step3.reviewConfig')}
        </h4>

        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--claude-text-secondary))]">
              {t('projectWizard.step3.workspaceType')}
            </span>
            <span className="font-medium text-[hsl(var(--claude-text))]">
              {formState.workspaceType === 'existing'
                ? t('projectWizard.step3.existingWorkspace')
                : t('projectWizard.step3.newWorkspace')}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-sm">
            <span className="flex-shrink-0 text-[hsl(var(--claude-text-secondary))]">
              {t('projectWizard.step3.path')}
            </span>
            <span className="break-all font-mono text-xs text-[hsl(var(--claude-text))]">
              {formState.workspacePath}
            </span>
          </div>

          {formState.workspaceType === 'new' && formState.githubUrl && (
            <>
              <div className="flex justify-between gap-4 text-sm">
                <span className="flex-shrink-0 text-[hsl(var(--claude-text-secondary))]">
                  {t('projectWizard.step3.cloneFrom')}
                </span>
                <span className="break-all font-mono text-xs text-[hsl(var(--claude-text))]">
                  {formState.githubUrl}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="flex-shrink-0 text-[hsl(var(--claude-text-secondary))]">
                  {t('projectWizard.step3.authentication')}
                </span>
                <span className="text-xs text-[hsl(var(--claude-text))]">{authenticationLabel}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--claude-accent)/0.2)] bg-[hsl(var(--claude-accent)/0.05)] p-4">
        {isCreating && cloneProgress ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--claude-accent))]">
              {t('projectWizard.step3.cloningRepository', { defaultValue: 'Cloning repository...' })}
            </p>
            <code className="block whitespace-pre-wrap break-all font-mono text-xs text-[hsl(var(--claude-accent-light))]">
              {cloneProgress}
            </code>
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--claude-text-secondary))]">
            {getInfoText(formState, t)}
          </p>
        )}
      </div>
    </div>
  );
}
