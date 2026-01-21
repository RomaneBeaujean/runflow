import {
  createSport,
  createTrainingPlan,
  createTrainingWeek,
  createWeekTheme,
} from '@/domain/factories/TrainingPlanFactory';
import { Sport } from '@/domain/types/Sport';
import {
  TrainingDay,
  TrainingPlan,
  TrainingWeek,
  WeekTheme,
  Workout,
} from '@/domain/types/TrainingPlan';
import { computed, ref } from 'vue';
import { useTrainingPlanWatchers } from './useTrainingPlanWatchers';

const id = ref();
const weeks = ref<TrainingWeek[]>([]);
const weekThemes = ref<WeekTheme[]>([]);
const sports = ref<Sport[]>([]);
const workoutModels = ref<Workout[]>([]);
const name = ref<string>('');

export function useTrainingPlan() {
  // Computed values
  const totalWeeks = computed(() => weeks.value.length);
  const totalWorkouts = computed(() =>
    weeks.value.reduce(
      (total, week) =>
        total +
        week.days.reduce((dayTotal, day) => dayTotal + day.workouts.length, 0),
      0
    )
  );

  // Helper: Trouve et met à jour une semaine
  const updateWeek = (
    weekNumber: number,
    updater: (week: TrainingWeek) => TrainingWeek
  ): void => {
    weeks.value = weeks.value.map((week) =>
      week.weekNumber === weekNumber ? updater(week) : week
    );
  };

  // Helper: Trouve et met à jour un jour dans une semaine
  const updateDay = (
    weekNumber: number,
    dayNumber: number,
    updater: (day: TrainingDay) => TrainingDay
  ): void => {
    updateWeek(weekNumber, (week) => ({
      ...week,
      days: week.days.map((day) =>
        day.dayNumber === dayNumber ? updater(day) : day
      ),
    }));
  };

  // Helper: Met à jour tous les workouts correspondant à un ID
  const updateWorkoutById = (
    workoutId: string,
    updater: (workout: Workout) => Workout
  ): void => {
    weeks.value = weeks.value.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        workouts: day.workouts.map((workout) =>
          workout.id === workoutId ? updater(workout) : workout
        ),
      })),
    }));
  };

  const init = (tp: TrainingPlan): void => {
    try {
      const trainingPlan = createTrainingPlan(tp);
      id.value = trainingPlan.id;
      name.value = trainingPlan.name;
      weeks.value = trainingPlan.weeks;
      weekThemes.value = trainingPlan.weekThemes;
      sports.value = trainingPlan.sports;
      workoutModels.value = trainingPlan.workoutModels;

      useTrainingPlanWatchers();
    } catch (error) {
      console.error('Failed to initialize training plan:', error);
      throw error;
    }
  };

  const addNewWeek = (): void => {
    const weekNumber = weeks.value.length + 1;
    const newWeek = createTrainingWeek({ weekNumber });
    weeks.value.push(newWeek);
  };

  const planifyWorkout = (wo: Workout, day: TrainingDay): void => {
    updateDay(day.weekNumber, day.dayNumber, (currentDay) => ({
      ...currentDay,
      workouts: [...currentDay.workouts, wo],
    }));
  };

  const updatePlannedWorkout = (day: TrainingDay, updated: Workout): void => {
    updateDay(day.weekNumber, day.dayNumber, (currentDay) => ({
      ...currentDay,
      workouts: currentDay.workouts.map((workout) =>
        workout.id === updated.id ? updated : workout
      ),
    }));
  };

  const updateWorkoutModel = (updated: Workout): void => {
    // Met à jour dans les modèles
    workoutModels.value = workoutModels.value.map((model) =>
      model.id === updated.id ? updated : model
    );

    // Met à jour dans toutes les semaines
    updateWorkoutById(updated.id, () => updated);
  };

  const updateWorkoutsOnDay = (wos: Workout[], day: TrainingDay): void => {
    updateDay(day.weekNumber, day.dayNumber, (currentDay) => ({
      ...currentDay,
      workouts: wos,
    }));
  };

  const removeWorkout = (wo: Workout, day: TrainingDay): void => {
    updateDay(day.weekNumber, day.dayNumber, (currentDay) => ({
      ...currentDay,
      workouts: currentDay.workouts.filter((workout) => workout.id !== wo.id),
    }));
  };

  const removeWorkoutModel = (toDelete: Workout): void => {
    workoutModels.value = workoutModels.value.filter(
      (wo) => wo.id !== toDelete.id
    );
  };

  const addWorkoutModel = (wo: Workout): void => {
    workoutModels.value.push(wo);
  };

  const addWeekTheme = (wt: Partial<WeekTheme>): void => {
    const newWeekTheme = createWeekTheme(wt);
    weekThemes.value.push(newWeekTheme);
  };

  const addSport = (newItem: Partial<Sport>): void => {
    const newSport = createSport(newItem);
    sports.value.push(newSport);
  };

  const deleteWeek = (weekNumber: number): void => {
    weeks.value = weeks.value
      .filter((week) => week.weekNumber !== weekNumber)
      .map((week, index) => {
        const newWeekNumber = index + 1;
        return {
          ...week,
          weekNumber: newWeekNumber,
          days: week.days.map((day) => ({
            ...day,
            weekNumber: newWeekNumber,
          })),
        };
      });
  };

  const updateWeekTheme = (weekNumber: number, weekTheme: WeekTheme): void => {
    updateWeek(weekNumber, (week) => ({
      ...week,
      theme: weekTheme,
    }));
  };

  return {
    init,
    addNewWeek,
    deleteWeek,
    addWeekTheme,
    updateWeekTheme,
    addSport,
    planifyWorkout,
    addWorkoutModel,
    updateWorkoutsOnDay,
    updateWorkoutModel,
    removeWorkout,
    updatePlannedWorkout,
    removeWorkoutModel,
    weeks,
    id,
    name,
    weekThemes,
    workoutModels,
    sports,
  };
}
