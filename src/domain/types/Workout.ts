import { MetricValue } from '@/domain/types/Metric';
import { Pace } from './Pace';
import { Zone } from './Zone';

export interface Workout {
  id: string;
  title: string;
  sportId: string;
  structure: WorkoutStructure;
}

export type WorkoutStructure = WorkoutBasic | WorkoutWithSteps;

export type WorkoutType = 'basic' | 'steps';

export interface WorkoutBasic {
  type: 'basic';
  description: string;
  distance: number;
  duration: number;
}

export interface WorkoutWithSteps {
  type: 'steps';
  steps: WorkoutStep[];
}

// Step

export type WorkoutStep =
  | WorkoutWorkStep
  | WorkoutRecoveryStep
  | WorkoutWarmupStep;

export type WorkoutStepType = 'work' | 'recovery' | 'warmup';

export interface WorkoutWorkStep {
  type: 'work';
  repeat: number;
  phases: {
    effort: StepPhase;
    counterEffort?: StepPhase;
  };
  comment?: string;
}

export interface WorkoutRecoveryStep {
  type: 'recovery';
  phase: StepPhase;
  comment?: string;
}

export interface WorkoutWarmupStep {
  type: 'warmup';
  phase: StepPhase;
  comment?: string;
}

export interface StepPhase {
  metricValue: MetricValue;
  target?: PhaseTarget;
}

export type PhaseTarget = PaceTarget | ZoneTarget;

export interface PaceTarget {
  type: 'pace';
  value: Pace;
}

export interface ZoneTarget {
  type: 'zone';
  value: Zone;
}

export type PhaseTargetType = 'pace' | 'zone';
