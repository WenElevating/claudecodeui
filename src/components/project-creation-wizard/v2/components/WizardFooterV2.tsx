import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WizardStep } from '../../types';

type WizardFooterV2Props = {
  step: WizardStep;
  isCreating: boolean;
  isCloneWorkflow: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
};

export default function WizardFooterV2({
  step,
  isCreating,
  isCloneWorkflow,
  onClose,
  onBack,
  onNext,
  onCreate,
}: WizardFooterV2Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-t border-[hsl(var(--claude-border))] p-6">
      <button
        onClick={step === 1 ? onClose : onBack}
        disabled={isCreating}
        className="v2-btn v2-btn-secondary rounded-lg px-4 py-2 text-sm"
      >
        {step === 1 ? (
          t('projectWizard.buttons.cancel')
        ) : (
          <>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('projectWizard.buttons.back')}
          </>
        )}
      </button>

      <button
        onClick={step === 3 ? onCreate : onNext}
        disabled={isCreating}
        className="v2-btn v2-btn-primary rounded-lg px-4 py-2 text-sm text-white"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isCloneWorkflow
              ? t('projectWizard.buttons.cloning', { defaultValue: 'Cloning...' })
              : t('projectWizard.buttons.creating')}
          </>
        ) : step === 3 ? (
          <>
            <Check className="mr-1 h-4 w-4" />
            {t('projectWizard.buttons.createProject')}
          </>
        ) : (
          <>
            {t('projectWizard.buttons.next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
