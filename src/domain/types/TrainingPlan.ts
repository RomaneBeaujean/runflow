import { Sport } from './Sport';
import { WeekTheme } from './WeekTheme';
import { Workout } from './Workout';

export interface TrainingPlan {
  id: string | null;
  name: string | null;
  description: string;
  createdAt: string | null;
  startDate: Date | null;
  weeks: TrainingWeek[];
  weekThemes: WeekTheme[];
  sports: Sport[];
  workoutModels: Workout[];
}

export interface TrainingWeek {
  weekNumber: number;
  theme: string | null;
  days: TrainingDay[];
}

export interface TrainingDay {
  dayNumber: number;
  weekNumber: number;
  workouts: Workout[];
}
