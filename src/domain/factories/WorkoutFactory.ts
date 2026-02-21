import { createDefaultMetricValue } from '@/domain/helpers/metrics';
import { TagColor } from '@/domain/types/TagColor';
import {
  StepPhase,
  Workout,
  WorkoutRecoveryStep,
  WorkoutStep,
  WorkoutStructure,
  WorkoutWarmupStep,
  WorkoutWithSteps,
  WorkoutWorkStep,
} from '@/domain/types/Workout';
import { nanoid } from 'nanoid';

export function createSportTagColor(color: string): TagColor {
  return color as TagColor;
}

export function createWorkout(data?: Partial<Workout>): Workout {
  const workout: Workout = {
    id: data?.id || nanoid(),
    title: data?.title || null,
    sportId: data?.sportId || null,
    structure: createWorkoutStructure(data?.structure),
  };
  return workout;
}

export function createWorkoutStructure(
  data?: Partial<WorkoutStructure>
): WorkoutStructure {
  if (!data || data.type === 'steps') {
    const stepsData = (data as WorkoutWithSteps)?.steps ?? [];
    return {
      type: 'steps',
      steps: createWorkoutSteps(stepsData),
    };
  }
  return {
    type: 'basic',
    description: data?.description || null,
    distance: data?.distance || null,
    duration: data?.duration || null,
  };
}

export function createWorkoutSteps(
  data?: Partial<WorkoutStep[]>
): WorkoutStep[] {
  if (!data || data?.length === 0) return [createWorkoutStep()];
  return data.map((s) => createWorkoutStep(s));
}

export function createWorkoutStep(data?: Partial<WorkoutStep>): WorkoutStep {
  if (!data || data.type === 'work')
    return createWorkoutWorkStep(data as Partial<WorkoutWorkStep>);
  if (data.type === 'warmup')
    return createWorkoutWarmupStep(data as Partial<WorkoutWarmupStep>);
  return createWorkoutRecoveryStep(data as Partial<WorkoutRecoveryStep>);
}

export function createWorkoutWorkStep(
  data?: Partial<WorkoutWorkStep>
): WorkoutWorkStep {
  return {
    type: 'work',
    repeat: data?.repeat ?? 1,
    phases: {
      effort: createStepPhase(data?.phases?.effort),
      counterEffort: data?.phases?.counterEffort
        ? createStepPhase(data.phases.counterEffort)
        : null,
    },
    comment: data?.comment,
  };
}
export function createWorkoutWarmupStep(
  data?: Partial<WorkoutWarmupStep>
): WorkoutWarmupStep {
  return {
    type: 'warmup',
    phase: createStepPhase(data?.phase),
    comment: data?.comment,
  };
}

export function createWorkoutRecoveryStep(
  data?: Partial<WorkoutRecoveryStep>
): WorkoutRecoveryStep {
  return {
    type: 'recovery',
    phase: createStepPhase(data?.phase),
    comment: data?.comment,
  };
}

export function createStepPhase(data?: Partial<StepPhase>): StepPhase {
  return {
    metricValue: data?.metricValue ?? createDefaultMetricValue(),
    target: data?.target,
  };
}
