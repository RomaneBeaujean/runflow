import { nanoid } from 'nanoid';
import { DEFAULT_SPORTS } from '../constants/sports';
import { DEFAULT_WEEK_THEMES } from '../constants/weekThemes';
import { Sport } from '../types/Sport';
import { TrainingDay, TrainingPlan, TrainingWeek } from '../types/TrainingPlan';
import { WeekTheme } from '../types/WeekTheme';
import { createRunWorkout } from './RunWorkoutFactory';

export function createTrainingPlan(data?: Partial<TrainingPlan>): TrainingPlan {
  const plan: TrainingPlan = {
    id: data?.id ?? nanoid(),
    name: data?.name ?? null,
    description: data?.description ?? null,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    startDate: data?.startDate ?? null,
    weeks: data?.weeks ?? [createTrainingWeek({ weekNumber: 1 })],
    weekThemes: createWeekThemes(data?.weekThemes || DEFAULT_WEEK_THEMES),
    sports: createSports(DEFAULT_SPORTS),
    workoutModels: data?.workoutModels?.map((el) => createRunWorkout(el)) || [],
  };
  return plan;
}

export function createTrainingPlanWeeks(numberOfWeeks: number): TrainingWeek[] {
  const weeks = [];
  for (let i = 1; i <= numberOfWeeks; i++) {
    weeks.push(createTrainingWeek({ weekNumber: i }));
  }
  return weeks;
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

  combined.forEach((weekTheme) => {
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

  combined.forEach((sport) => {
    const key = sport.id ?? sport.label;
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
    color: data.color ?? 'primary',
  };
}

export function createSport(data?: Partial<Sport>): Sport {
  return {
    id: data.id ?? nanoid(),
    label: data.label ?? '',
    color: data.color ?? null,
    background: data.background ?? null,
    icon: data.icon ?? '',
  };
}
