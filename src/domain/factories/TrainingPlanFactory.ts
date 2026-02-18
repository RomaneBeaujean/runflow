import { nanoid } from 'nanoid';
import { DEFAULT_SPORTS } from '../constants/sports';
import { DEFAULT_WEEK_THEMES } from '../constants/weekThemes';
import { Sport } from '../types/Sport';
import {
  TrainingDay,
  TrainingPlan,
  TrainingWeek,
} from '../types/TrainingPlan';
import { WeekTheme } from '../types/WeekTheme';
import { createWorkout } from './WorkoutFactory';

export function createTrainingPlan(data?: Partial<TrainingPlan>): TrainingPlan {
  const plan: TrainingPlan = {
    id: data?.id ?? nanoid(),
    name: data?.name ?? null,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    startDate: data?.startDate ?? null,
    weeks: data?.weeks ?? [createTrainingWeek({ weekNumber: 1 })],
    weekThemes: data.weekThemes || [...DEFAULT_WEEK_THEMES],
    sports: data?.sports || [...DEFAULT_SPORTS],
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
  const combined = [...data];
  const seen = new Map<string | null, WeekTheme>();
  
  combined.forEach(weekTheme => {
    const key = weekTheme.label;
    if (!seen.has(key)) {
      seen.set(key, weekTheme);
    }
  });

  return Array.from(seen.values());
}

export function createSports(data?: Sport[]): Sport[] {
  const combined = [...(data || [])];
  const seen = new Map<string | null, Sport>();
  
  combined.forEach(sport => {
    const key = sport.id ?? sport.label; // Utiliser id ou label comme clé unique
    if (!seen.has(key)) {
      seen.set(key, sport);
    }
  });
  
  return Array.from(seen.values());
}
export function createWeekTheme(data?: Partial<WeekTheme>): WeekTheme {
  return {
    id: nanoid(),
    label: data.label ?? '',
    color: data.color ?? null,
  };
}

export function createSport(data?: Partial<Sport>): Sport {
  return {
    id: data.id ?? nanoid(),
    label: data.label ?? '',
    color: data.color ?? null,
    icon: data.icon ?? '',
  };
}
