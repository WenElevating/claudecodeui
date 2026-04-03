import { FolderPlus, GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WorkspaceType } from '../../types';

type StepTypeSelectionV2Props = {
  workspaceType: WorkspaceType;
  onWorkspaceTypeChange: (workspaceType: WorkspaceType) => void;
};

export default function StepTypeSelectionV2({
  workspaceType,
  onWorkspaceTypeChange,
}: StepTypeSelectionV2Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h4 className="mb-3 text-sm font-medium text-[hsl(var(--claude-text-secondary))]">
        {t('projectWizard.step1.question')}
      </h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          onClick={() => onWorkspaceTypeChange('existing')}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            workspaceType === 'existing'
              ? 'border-[hsl(var(--claude-accent))] bg-[hsl(var(--claude-accent)/0.05)]'
              : 'border-[hsl(var(--claude-border))] hover:border-[hsl(var(--claude-border-default))]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--claude-green)/0.15)]">
              <FolderPlus className="h-5 w-5 text-[hsl(var(--claude-green))]" />
            </div>
            <div className="flex-1">
              <h5 className="mb-1 font-semibold text-[hsl(var(--claude-text))]">
                {t('projectWizard.step1.existing.title')}
              </h5>
              <p className="text-sm text-[hsl(var(--claude-text-secondary))]">
                {t('projectWizard.step1.existing.description')}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onWorkspaceTypeChange('new')}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            workspaceType === 'new'
              ? 'border-[hsl(var(--claude-accent))] bg-[hsl(var(--claude-accent)/0.05)]'
              : 'border-[hsl(var(--claude-border))] hover:border-[hsl(var(--claude-border-default))]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--claude-accent)/0.15)]">
              <GitBranch className="h-5 w-5 text-[hsl(var(--claude-accent))]" />
            </div>
            <div className="flex-1">
              <h5 className="mb-1 font-semibold text-[hsl(var(--claude-text))]">
                {t('projectWizard.step1.new.title')}
              </h5>
              <p className="text-sm text-[hsl(var(--claude-text-secondary))]">
                {t('projectWizard.step1.new.description')}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
