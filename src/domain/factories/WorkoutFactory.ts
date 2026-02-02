import { nanoid } from "nanoid";
import { TagColor } from "../types/TagColor";
import { Workout } from "../types/TrainingPlan";

export function createWorkout(data?: Partial<Workout>): Workout {
  const workout: Workout = {
      id: data?.id || nanoid(),
      title: data?.title || null,
      sport: data?.sport || null,
      description: data?.description || null,
      duration: data?.duration || null,
      distance: data?.distance || null,
  };
  return workout;
}

export function createSportTagColor(color: string): TagColor {
  return color as TagColor;
}