import { BikeWorkoutStructure } from '@/domain/types/workout/BikeWorkoutStructure';
import { BodybuildingWorkoutStructure } from '@/domain/types/workout/BodybuildingWorkoutStructure';
import { HikeWorkoutStructure } from '@/domain/types/workout/HikeWorkoutStructure';
import { RunWorkoutStructure } from '@/domain/types/workout/RunWorkoutStructure';
import { SwimWorkoutStructure } from '@/domain/types/workout/SwimWorkoutStructure';

export interface Workout {
  id: string;
  title: string;
  sportId: string;
  structure: WorkoutStructure;
}

export type WorkoutStructure =
  | RunWorkoutStructure
  | BikeWorkoutStructure
  | SwimWorkoutStructure
  | BodybuildingWorkoutStructure
  | HikeWorkoutStructure;

export type WorkoutType = 'basic' | 'steps';
