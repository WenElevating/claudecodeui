import { useCallback, useMemo, useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StepConfigurationV2 from './components/StepConfigurationV2';
import StepReviewV2 from './components/StepReviewV2';
import StepTypeSelectionV2 from './components/StepTypeSelectionV2';
import WizardFooterV2 from './components/WizardFooterV2';
import WizardProgressV2 from './components/WizardProgressV2';
import { useGithubTokens } from '../hooks/useGithubTokens';
import { cloneWorkspaceWithProgress, createWorkspaceRequest } from '../data/workspaceApi';
import { isCloneWorkflow, shouldShowGithubAuthentication } from '../utils/pathUtils';
import type { TokenMode, WizardFormState, WizardStep, WorkspaceType } from '../types';

type ProjectCreationWizardV2Props = {
  onClose: () => void;
  onProjectCreated?: (project?: Record<string, unknown>) => void;
};

const initialFormState: WizardFormState = {
  workspaceType: 'existing',
  workspacePath: '',
  githubUrl: '',
  tokenMode: 'stored',
  selectedGithubToken: '',
  newGithubToken: '',
};

export default function ProjectCreationWizardV2({
  onClose,
  onProjectCreated,
}: ProjectCreationWizardV2Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [formState, setFormState] = useState<WizardFormState>(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloneProgress, setCloneProgress] = useState('');

  const shouldLoadTokens =
    step === 2 && shouldShowGithubAuthentication(formState.workspaceType, formState.githubUrl);

  const autoSelectToken = useCallback((tokenId: string) => {
    setFormState((prev) => ({ ...prev, selectedGithubToken: tokenId }));
  }, []);

  const {
    tokens: availableTokens,
    loading: loadingTokens,
    loadError: tokenLoadError,
    selectedTokenName,
  } = useGithubTokens({
    shouldLoad: shouldLoadTokens,
    selectedTokenId: formState.selectedGithubToken,
    onAutoSelectToken: autoSelectToken,
  });

  const updateField = useCallback(<K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateWorkspaceType = useCallback(
    (workspaceType: WorkspaceType) => updateField('workspaceType', workspaceType),
    [updateField],
  );

  const updateTokenMode = useCallback(
    (tokenMode: TokenMode) => updateField('tokenMode', tokenMode),
    [updateField],
  );

  const handleNext = useCallback(() => {
    setError(null);

    if (step === 1) {
      if (!formState.workspaceType) {
        setError(t('projectWizard.errors.selectType'));
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formState.workspacePath.trim()) {
        setError(t('projectWizard.errors.providePath'));
        return;
      }
      setStep(3);
    }
  }, [formState.workspacePath, formState.workspaceType, step, t]);

  const handleBack = useCallback(() => {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }, []);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    setCloneProgress('');

    try {
      const shouldClone = isCloneWorkflow(formState.workspaceType, formState.githubUrl);

      if (shouldClone) {
        const project = await cloneWorkspaceWithProgress(
          {
            workspacePath: formState.workspacePath,
            githubUrl: formState.githubUrl,
            tokenMode: formState.tokenMode,
            selectedGithubToken: formState.selectedGithubToken,
            newGithubToken: formState.newGithubToken,
          },
          { onProgress: setCloneProgress },
        );
        onProjectCreated?.(project);
        onClose();
        return;
      }

      const project = await createWorkspaceRequest({
        workspaceType: formState.workspaceType,
        path: formState.workspacePath.trim(),
      });
      onProjectCreated?.(project);
      onClose();
    } catch (createError) {
      const errorMessage =
        createError instanceof Error
          ? createError.message
          : t('projectWizard.errors.failedToCreate');
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, [formState, onClose, onProjectCreated, t]);

  const shouldClone = useMemo(
    () => isCloneWorkflow(formState.workspaceType, formState.githubUrl),
    [formState.githubUrl, formState.workspaceType],
  );

  return (
    <div className="v2-wizard-backdrop">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[hsl(var(--claude-border))] bg-[hsl(var(--claude-elevated))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--claude-border))] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--claude-accent)/0.1)]">
              <FolderPlus className="h-4 w-4 text-[hsl(var(--claude-accent))]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--claude-text))]">
              {t('projectWizard.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="v2-icon-btn"
            disabled={isCreating}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <WizardProgressV2 step={step} />

        {/* Content */}
        <div className="min-h-[300px] flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--claude-red)/0.2)] bg-[hsl(var(--claude-red)/0.05)] p-4">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--claude-red))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <p className="text-sm text-[hsl(var(--claude-red))]">{error}</p>
            </div>
          )}

          {step === 1 && (
            <StepTypeSelectionV2
              workspaceType={formState.workspaceType}
              onWorkspaceTypeChange={updateWorkspaceType}
            />
          )}

          {step === 2 && (
            <StepConfigurationV2
              workspaceType={formState.workspaceType}
              workspacePath={formState.workspacePath}
              githubUrl={formState.githubUrl}
              tokenMode={formState.tokenMode}
              selectedGithubToken={formState.selectedGithubToken}
              newGithubToken={formState.newGithubToken}
              availableTokens={availableTokens}
              loadingTokens={loadingTokens}
              tokenLoadError={tokenLoadError}
              isCreating={isCreating}
              onWorkspacePathChange={(path) => updateField('workspacePath', path)}
              onGithubUrlChange={(url) => updateField('githubUrl', url)}
              onTokenModeChange={updateTokenMode}
              onSelectedGithubTokenChange={(id) => updateField('selectedGithubToken', id)}
              onNewGithubTokenChange={(token) => updateField('newGithubToken', token)}
              onAdvanceToConfirm={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepReviewV2
              formState={formState}
              selectedTokenName={selectedTokenName}
              isCreating={isCreating}
              cloneProgress={cloneProgress}
            />
          )}
        </div>

        {/* Footer */}
        <WizardFooterV2
          step={step}
          isCreating={isCreating}
          isCloneWorkflow={shouldClone}
          onClose={onClose}
          onBack={handleBack}
          onNext={handleNext}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
}
