import {
  WorkoutRecoveryStep,
  WorkoutStep,
  WorkoutWarmupStep,
  WorkoutWorkStep,
} from '@/domain/types/Workout';

const isWorkStepValid = (step: WorkoutWorkStep) => {
  return (
    step.repeat >= 0 &&
    !!step.phases.effort.metricValue.value &&
    step.phases.effort.metricValue.value > 0
  );
};

const isOtherStepValid = (step: WorkoutRecoveryStep | WorkoutWarmupStep) => {
  return !!step.phase.metricValue.value && step.phase.metricValue.value > 0;
};

const isStepValid = (step: WorkoutStep) => {
  return step.type === 'work' ? isWorkStepValid(step) : isOtherStepValid(step);
};

export const areStepsValid = (steps: WorkoutStep[]) => {
  return steps.reduce((valid, step) => {
    if (!valid) return false;
    return isStepValid(step);
  }, true);
};
