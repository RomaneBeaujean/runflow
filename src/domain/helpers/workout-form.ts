import {
  RunWorkoutRecoveryStep,
  RunWorkoutStep,
  RunWorkoutWarmupStep,
  RunWorkoutWorkStep,
} from '@/domain/types/workout/RunWorkoutStructure';

const isWorkStepValid = (step: RunWorkoutWorkStep) => {
  return (
    step.repeat >= 0 &&
    !!step.phases.effort.metricValue.value &&
    step.phases.effort.metricValue.value > 0
  );
};

const isOtherStepValid = (
  step: RunWorkoutRecoveryStep | RunWorkoutWarmupStep
) => {
  return !!step.phase.metricValue.value && step.phase.metricValue.value > 0;
};

const isStepValid = (step: RunWorkoutStep) => {
  return step.type === 'work' ? isWorkStepValid(step) : isOtherStepValid(step);
};

export const areStepsValid = (steps: RunWorkoutStep[]) => {
  return steps.reduce((valid, step) => {
    if (!valid) return false;
    return isStepValid(step);
  }, true);
};
