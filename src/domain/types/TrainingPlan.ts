import { Sport } from './Sport';

export interface TrainingPlan {
  id: string | null;
  name: string | null;
  createdAt: string | null;
  startDate: Date | null;
  weeks: TrainingWeek[];
  weekThemes: WeekTheme[];
  sports: Sport[];
  workoutModels: Workout[];
}

export interface TrainingWeek {
  weekNumber: number;
  theme: WeekTheme | null;
  days: TrainingDay[];
}

export interface WeekTheme {
  label: string;
  color: string;
}

export interface TrainingDay {
  dayNumber: number;
  weekNumber: number;
  workouts: Workout[];
}

export interface Workout {
  id: string | null;
  title: string;
  sport: Sport | null;
  description: string;
  distance: number;
  duration: number;
}
