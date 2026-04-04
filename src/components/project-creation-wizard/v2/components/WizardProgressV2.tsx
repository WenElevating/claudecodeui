import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WizardStep } from '../../types';

type WizardProgressV2Props = {
  step: WizardStep;
};

function getStepStyle(currentStep: WizardStep, activeStep: WizardStep): string {
  if (currentStep < activeStep) {
    return 'bg-[hsl(var(--claude-green))] text-white';
  }
  if (currentStep === activeStep) {
    return 'bg-[hsl(var(--claude-accent))] text-white shadow-[0_2px_8px_hsl(var(--claude-accent)/0.3)]';
  }
  return 'bg-[hsl(var(--claude-tertiary))] text-[hsl(var(--claude-text-muted))]';
}

function getStepLabel(step: WizardStep, t: (key: string) => string): string {
  switch (step) {
    case 1:
      return t('projectWizard.steps.type');
    case 2:
      return t('projectWizard.steps.configure');
    case 3:
      return t('projectWizard.steps.confirm');
    default:
      return '';
  }
}

export default function WizardProgressV2({ step }: WizardProgressV2Props) {
  const { t } = useTranslation();
  const steps: WizardStep[] = [1, 2, 3];

  return (
    <div className="px-6 pb-2 pt-4">
      <div className="flex items-center justify-between">
        {steps.map((currentStep) => (
          <Fragment key={currentStep}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${getStepStyle(currentStep, step)}`}
              >
                {currentStep < step ? <Check className="h-4 w-4" /> : currentStep}
              </div>
              <span className="hidden text-sm font-medium text-[hsl(var(--claude-text-secondary))] sm:inline">
                {getStepLabel(currentStep, t)}
              </span>
            </div>

            {currentStep < 3 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${
                  currentStep < step
                    ? 'bg-[hsl(var(--claude-green))]'
                    : 'bg-[hsl(var(--claude-border))]'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
