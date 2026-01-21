import { DEFAULT_SPORTS } from '../constants/sports';
import { DEFAULT_WEEK_THEMES } from '../constants/weekThemes';
import { Sport } from '../types/Sport';
import {
  TrainingDay,
  TrainingPlan,
  TrainingWeek,
  WeekTheme,
} from '../types/TrainingPlan';
import { createWorkout } from './WorkoutFactory';

export function createTrainingPlan(data?: Partial<TrainingPlan>): TrainingPlan {
  const plan: TrainingPlan = {
    id: data?.id ?? null,
    name: data?.name ?? null,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    startDate: data?.startDate ?? null,
    weeks: data?.weeks ?? [createTrainingWeek({ weekNumber: 1 })],
    weekThemes: createWeekThemes(data.weekThemes),
    sports: createSports(data?.sports),
    workoutModels: data?.workoutModels?.map((el) => createWorkout(el)) || [],
  };
  return plan;
}

export function createTrainingWeek(data?: Partial<TrainingWeek>): TrainingWeek {
  const week: TrainingWeek = {
    weekNumber: data?.weekNumber ?? 1,
    theme: data?.theme ?? null,
    days: data?.days ?? [],
  };

  if (week.days.length < 7) {
    for (let i = week.days.length; i < 7; i++) {
      week.days.push(
        createTrainingDay({
          dayNumber: i + 1,
          weekNumber: week.weekNumber,
        })
      );
    }
  }

  return week;
}

export function createTrainingDay(data?: Partial<TrainingDay>): TrainingDay {
  return {
    dayNumber: data?.dayNumber ?? 1,
    weekNumber: data?.weekNumber ?? 1,
    workouts: data?.workouts ?? [],
  };
}

export function createWeekThemes(data?: WeekTheme[]): WeekTheme[] {
  return [...new Set([...(data || []), ...DEFAULT_WEEK_THEMES])];
}

export function createSports(data?: Sport[]): Sport[] {
  return [...new Set([...(data || []), ...DEFAULT_SPORTS])];
}

export function createWeekTheme(data?: Partial<WeekTheme>): WeekTheme {
  return {
    label: data.label ?? '',
    color: data.color ?? null,
  };
}

export function createSport(data?: Partial<Sport>): Sport {
  return {
    label: data.label ?? '',
    color: data.color ?? null,
    icon: data.icon ?? '',
  };
}
