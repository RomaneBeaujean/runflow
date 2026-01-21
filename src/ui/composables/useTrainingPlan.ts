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
import { ref } from 'vue';
import { useTrainingPlanWatchers } from './useTrainingPlanWatchers';

const id = ref();
const weeks = ref<TrainingWeek[]>([]);
const weekThemes = ref<WeekTheme[]>([]);
const sports = ref<Sport[]>([]);
const workoutModels = ref<Workout[]>([]);
const name = ref<string>('');

export function useTrainingPlan() {
  const init = (_tp: TrainingPlan) => {
    const tp = createTrainingPlan(_tp);
    id.value = tp.id;
    name.value = tp.name;
    weeks.value = tp.weeks;
    weekThemes.value = tp.weekThemes;
    sports.value = tp.sports;
    workoutModels.value = tp.workoutModels;

    useTrainingPlanWatchers();
  };

  const addNewWeek = () => {
    const weekNumber = weeks.value.length + 1;
    const newWeek = createTrainingWeek({ weekNumber });
    weeks.value = [...weeks.value, newWeek];
  };

  const planifyWorkout = (wo: Workout, day: TrainingDay) => {
    weeks.value = weeks.value.map((w: TrainingWeek) => {
      if (w.weekNumber === day.weekNumber) {
        const days = w.days.map((d) => {
          if(d.dayNumber === day.dayNumber) {
            return {
              ...d, 
              workouts: [...d.workouts, wo]
            }
          }
          return d;
        })
        return { ...w, days }
      }
      return w;
    });
  };

  const updatePlannedWorkout = (day: TrainingDay, updated: Workout) => {
    weeks.value = weeks.value.map((w: TrainingWeek) => {
      if (w.weekNumber === day.weekNumber) {
        const days = w.days.map((d) => {
          if(d.dayNumber === day.dayNumber) {
            const workouts = d.workouts.map((el) => {
              if(el.id === updated.id) {
                return updated;
              }
              return el;
            });

            return {
              ...d, 
              workouts
            }
          }
          return d;
        })
        return { ...w, days }
      }
      return w;
    });
  };

  const updateWorkoutModel = (updated: Workout) => {
    workoutModels.value = [...workoutModels.value].map((el) => {
      if(el.id === updated.id) {
        return updated;
      } else return el
    });
    weeks.value = weeks.value.map((week: TrainingWeek) => {
      return {
        ...week,
        days: week.days.map((day) => {
          return {
            ...day,
            workouts: day.workouts.map((workout) => {
               if(workout.id === updated.id) {
                return updated;
              }
              return workout
            })
          }
        })
      }
    });
  }

  const updateWorkoutsOnDay = (wos: Workout[], day: TrainingDay) => {
    weeks.value = weeks.value.map((w: TrainingWeek) => {
      if (w.weekNumber === day.weekNumber) {
        const days = w.days.map((d) => {
          if(d.dayNumber === day.dayNumber) {
            const workouts = wos;

            return {
              ...d, 
              workouts
            }
          }
          return d;
        })
        return { ...w, days }
      }
      return w;
    });
  };

  const removeWorkout = (wo: Workout, day: TrainingDay) => {
    weeks.value = weeks.value.map((w: TrainingWeek) => {
      if (w.weekNumber === day.weekNumber) {
        const days = w.days.map((d) => {
          if(d.dayNumber === day.dayNumber) {
            
            const workoutIndex = d.workouts.findIndex((el) => el.title == wo.title);
            const workouts = d.workouts.filter((el, idx) => idx !== workoutIndex);

            return {
              ...d, 
              workouts
            }
          }
          return d;
        })
        return { ...w, days }
      }
      return w;
    });
  };

  const addWorkoutModel = (wo: Workout) => {
    workoutModels.value = [...workoutModels.value, wo];
  };

  const addWeekTheme = (wt: Partial<WeekTheme>) => {
    const newWeekTheme = createWeekTheme(wt);
    weekThemes.value.push(newWeekTheme);
  };

  const addSport = (newItem: Partial<Sport>) => {
    const newSport = createSport(newItem);
    sports.value.push(newSport);
  };

  const deleteWeek = (weekNumber: number) => {
    weeks.value = [...weeks.value]
      .filter((el) => el.weekNumber !== weekNumber)
      .map((el: TrainingWeek, index: number) => {
        return {
          ...el,
          days: el.days.map((td) => {
            return { ...td, weekNumber: index + 1 };
          }),
          weekNumber: index + 1,
        };
      });
  };

  const updateWeekTheme = (weekNumber: number, weekTheme: WeekTheme) => {
    weeks.value = weeks.value.map((w: TrainingWeek) => {
      if (w.weekNumber === weekNumber) {
        return { ...w, theme: weekTheme };
      }
      return w;
    });
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
    weeks,
    id,
    name,
    weekThemes,
    workoutModels,
    sports,
  };
}
