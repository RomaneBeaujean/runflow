import { TrainingDay, Workout } from '@/domain/types/TrainingPlan';
import { ref } from 'vue';

const editableMode = ref<boolean>(true);
const showAddWorkout = ref<boolean>(false);
const showAddWorkoutDay = ref<TrainingDay>(null);
const showWorkoutModels = ref<boolean>(false);
const isDragging = ref(false);
const showWorkoutDetails = ref(false);
const showWorkoutDetailsWorkout = ref<Workout>(null);
const showWorkoutDetailsDay = ref<TrainingDay>(null);

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

export function useTrainingPlanParams() {
  const getRealDayNumber = (trainingDay: TrainingDay) => {
    return (trainingDay.weekNumber - 1) * 7 + trainingDay.dayNumber;
  };

  const getWeekDayLabel = (trainingDay: TrainingDay) => {
    return daysOfWeek[trainingDay.dayNumber - 1];
  };

  const handleShowWorkoutModels = () => {
    handleCloseAddWorkout();
    handleCloseWorkoutDetails();
    showWorkoutModels.value = true;
  }
  

  const handleShowAddWorkout = (trainingDay: TrainingDay) => {
    handleCloseWorkoutDetails();
    handleCloseWorkoutModels();

    showAddWorkout.value = true;
    showAddWorkoutDay.value = trainingDay;
  }

  const handleShowWorkoutDetails = (trainingDay: TrainingDay, workout: Workout) => {
    handleCloseAddWorkout();
    handleCloseWorkoutModels();
    showWorkoutDetails.value = true;
    showWorkoutDetailsWorkout.value = workout;
    showWorkoutDetailsDay.value = trainingDay;
  }

  const handleCloseWorkoutModels = () => {
    showWorkoutModels.value = false;
  }

  const handleCloseAddWorkout = () => {
    showAddWorkout.value = false;
    showAddWorkoutDay.value = null;
  }

   const handleCloseWorkoutDetails = () => {
    showWorkoutDetails.value = false;
    showWorkoutDetailsWorkout.value = null;
    showWorkoutDetailsDay.value = null;
  }

  return {
    showAddWorkout,
    editableMode,
    showAddWorkoutDay,
    isDragging,
    daysOfWeek,
    showWorkoutModels,
    showWorkoutDetails,
    showWorkoutDetailsDay,
    showWorkoutDetailsWorkout,
    getRealDayNumber,
    getWeekDayLabel,
    handleCloseWorkoutModels,
    handleCloseWorkoutDetails,
    handleShowAddWorkout,
    handleShowWorkoutDetails,
    handleCloseAddWorkout,
    handleShowWorkoutModels
  };
}
