import { MetricValue } from '@/domain/types/Metric';
import { Pace } from '@/domain/types/Pace';
import { Zone } from '@/domain/types/Zone';

/**
 * Structures pour la course à pied
 */
export type RunWorkoutStructure =
  | RunWorkoutStructureBasic
  | RunWorkoutStructureWithSteps;

export interface RunWorkoutStructureBasic {
  type: 'basic';
  description: string;
  distance: number;
  duration: number;
}

export interface RunWorkoutStructureWithSteps {
  type: 'steps';
  steps: RunWorkoutStep[];
}

export type RunWorkoutStep =
  | RunWorkoutWorkStep
  | RunWorkoutRecoveryStep
  | RunWorkoutWarmupStep;

export type RunWorkoutStepType = 'work' | 'recovery' | 'warmup';

export interface RunWorkoutWorkStep {
  type: 'work';
  repeat: number;
  phases: {
    effort: RunStepPhase;
    counterEffort?: RunStepPhase;
  };
  comment?: string;
}

export interface RunWorkoutRecoveryStep {
  type: 'recovery';
  phase: RunStepPhase;
  comment?: string;
}

export interface RunWorkoutWarmupStep {
  type: 'warmup';
  phase: RunStepPhase;
  comment?: string;
}

export interface RunStepPhase {
  metricValue: MetricValue;
  target?: RunPhaseTarget;
}

export type RunPhaseTarget = RunPaceTarget | RunZoneTarget;

export interface RunPaceTarget {
  type: 'pace';
  value: Pace;
}

export interface RunZoneTarget {
  type: 'zone';
  value: Zone;
}

export type RunPhaseTargetType = 'pace' | 'zone';
