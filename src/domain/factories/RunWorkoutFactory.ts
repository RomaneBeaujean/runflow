import { createDefaultMetricValue } from '@/domain/helpers/metrics';
import { TagColor } from '@/domain/types/TagColor';
import {
  RunStepPhase,
  RunWorkoutRecoveryStep,
  RunWorkoutStep,
  RunWorkoutStructure,
  RunWorkoutStructureWithSteps,
  RunWorkoutWarmupStep,
  RunWorkoutWorkStep,
} from '@/domain/types/workout/RunWorkoutStructure';
import { Workout, WorkoutStructure } from '@/domain/types/workout/Workout';
import { nanoid } from 'nanoid';

export function createSportTagColor(color: string): TagColor {
  return color as TagColor;
}

export function createRunWorkout(data?: Partial<Workout>): Workout {
  const workout: Workout = {
    id: data?.id || nanoid(),
    title: data?.title || null,
    sportId: data?.sportId || null,
    structure: createWorkoutStructure(data?.structure as RunWorkoutStructure),
  };
  return workout;
}

export function createWorkoutStructure(
  data?: Partial<RunWorkoutStructure>
): WorkoutStructure {
  if (!data || data.type === 'steps') {
    const stepsData = (data as RunWorkoutStructureWithSteps)?.steps ?? [];
    return {
      type: 'steps',
      steps: createRunWorkoutSteps(stepsData),
    };
  }
  return {
    type: 'basic',
    description: data?.description || null,
    distance: data?.distance || null,
    duration: data?.duration || null,
  };
}

export function createRunWorkoutSteps(
  data?: Partial<RunWorkoutStep[]>
): RunWorkoutStep[] {
  if (!data || data?.length === 0) return [createWorkoutStep()];
  return data.map((s) => createWorkoutStep(s));
}

export function createWorkoutStep(
  data?: Partial<RunWorkoutStep>
): RunWorkoutStep {
  if (!data || data.type === 'work')
    return createRunWorkoutWorkStep(data as Partial<RunWorkoutWorkStep>);
  if (data.type === 'warmup')
    return createWorkoutWarmupStep(data as Partial<RunWorkoutWarmupStep>);
  return createWorkoutRecoveryStep(data as Partial<RunWorkoutRecoveryStep>);
}

export function createRunWorkoutWorkStep(
  data?: Partial<RunWorkoutWorkStep>
): RunWorkoutWorkStep {
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
  data?: Partial<RunWorkoutWarmupStep>
): RunWorkoutWarmupStep {
  return {
    type: 'warmup',
    phase: createStepPhase(data?.phase),
    comment: data?.comment,
  };
}

export function createWorkoutRecoveryStep(
  data?: Partial<RunWorkoutRecoveryStep>
): RunWorkoutRecoveryStep {
  return {
    type: 'recovery',
    phase: createStepPhase(data?.phase),
    comment: data?.comment,
  };
}

export function createStepPhase(data?: Partial<RunStepPhase>): RunStepPhase {
  return {
    metricValue: data?.metricValue ?? createDefaultMetricValue(),
    target: data?.target,
  };
}
