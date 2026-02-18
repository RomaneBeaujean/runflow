import { DEFAULT_SPORTS } from "@/domain/constants/sports";
import { Sport } from "@/domain/types/Sport";
import { TrainingWeek, Workout } from "@/domain/types/TrainingPlan";
import { useTrainingPlan } from "./useTrainingPlan";

const { weekThemes } = useTrainingPlan();

export function useTrainingPlanHelper() {

  const getWeekTheme = (id: string) => {
    return weekThemes.value.find((el) => el.id === id);
  }

  const isSameWorkout = (workout1: Workout, workout2: Workout) => {
    if (!workout1 || !workout2) return false;
    return workout1.title === workout2.title &&
      workout1.description === workout2.description &&
      workout1.distance === workout2.distance &&
      workout1.duration === workout2.duration &&
      workout1.sport?.label === workout2.sport?.label
  }

  const getSportStat = (sport: Sport, week: TrainingWeek) => {
    const totalDistance = week.days.reduce((sum, day) => {
      const dayDistance = day.workouts.reduce((sum, wo) => {
        if (wo.sport.id === sport.id) return sum += wo.distance || 0
        return sum;
      }, 0);
      return sum += dayDistance;
    }, 0);

    const totalDuration = week.days.reduce((sum, day) => {
      const duration = day.workouts.reduce((sum, wo) => {
        if (wo.sport.id === sport.id) return sum += wo.duration || 0
        return sum;
      }, 0);
      return sum += duration;
    }, 0);

    return { sport, totalDistance, totalDuration }
  }


  const getWeekStats = (week: TrainingWeek) => {
    return DEFAULT_SPORTS.map((sport) => {
      return getSportStat(sport, week);
    }) 
  }

  return {
    isSameWorkout,
    getWeekStats,
    getWeekTheme
  }
}