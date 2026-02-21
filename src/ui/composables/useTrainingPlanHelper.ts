import { DEFAULT_SPORTS } from '@/domain/constants/sports';
import { areStepsValid } from '@/domain/helpers/workout-form';
import { Sport } from '@/domain/types/Sport';
import { TrainingWeek } from '@/domain/types/TrainingPlan';
import { WeekTheme } from '@/domain/types/WeekTheme';
import { Workout } from '@/domain/types/Workout';
import { useTrainingPlan } from './useTrainingPlan';

const { weekThemes, sports, workoutModels } = useTrainingPlan();

export function useTrainingPlanHelper() {
  const getWeekTheme = (id: string): WeekTheme => {
    return weekThemes.value.find((el) => el.id === id);
  };

  const getSport = (id: string) => {
    return sports.value.find((s) => s.id === id);
  };

  const isSameWorkout = (workout1: Workout, workout2: Workout) => {
    if (!workout1 || !workout2) return false;

    return (
      workout1.title === workout2.title &&
      workout1.sportId === workout2.sportId &&
      JSON.stringify(workout1.structure) === JSON.stringify(workout2.structure)
    );
  };

  const getSportStat = (sport: Sport, week: TrainingWeek) => {
    // const totalDistance = week.days.reduce((sum, day) => {
    //   const dayDistance = day.workouts.reduce((sum, wo) => {
    //     if (wo.sportId === sport.id) return (sum += wo.distance || 0);
    //     return sum;
    //   }, 0);
    //   return (sum += dayDistance);
    // }, 0);

    // const totalDuration = week.days.reduce((sum, day) => {
    //   const duration = day.workouts.reduce((sum, wo) => {
    //     if (wo.sportId.id === sport.id) return (sum += wo.duration || 0);
    //     return sum;
    //   }, 0);
    //   return (sum += duration);
    // }, 0);
    const totalDistance = 0;
    const totalDuration = 0;

    return { sport, totalDistance, totalDuration };
  };

  const getWeekStats = (week: TrainingWeek) => {
    return DEFAULT_SPORTS.map((sport) => {
      return getSportStat(sport, week);
    });
  };

  const isTitleExist = (workout: Workout) => {
    const otherTitles = workoutModels.value
      .filter((el) => el.id !== workout.id)
      .map((el) => el.title);
    const exist = otherTitles.includes(workout.title);
    return exist;
  };

  const isFormValid = (workout: Workout, initial?: Workout) => {
    const noModifications = initial ? isSameWorkout(workout, initial) : false;
    if (noModifications) return false;

    const hasSport = !!workout.sportId;
    const hasTitle = !!workout.title;
    const titleExist = isTitleExist(workout);

    let isStructureValid = false;

    if (workout.structure.type === 'steps') {
      isStructureValid = areStepsValid(workout.structure.steps);
    } else {
      isStructureValid = !!workout.structure.description;
    }

    const isValid = hasTitle && !titleExist && hasSport && isStructureValid;

    return isValid;
  };

  return {
    isSameWorkout,
    getWeekStats,
    getWeekTheme,
    getSport,
    isFormValid,
    isTitleExist,
  };
}
