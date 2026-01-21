<!-- AddWorkout.vue -->
<template>
  <Drawer v-model:opened="showAddWorkout" overlay position="right" showCloseButton id="addWorkout">
    <template #header v-if="showAddWorkout">
      <div class="font-bold text-xl">Ajouter une séance</div>
      <div class="font-regular text-md mt-2 flex gap-2">
        <ColorTag :label="'Semaine ' + showAddWorkoutDay.weekNumber" />
        <ColorTag :label="'J' + getRealDayNumber(showAddWorkoutDay)" />
        <ColorTag :label="getWeekDayLabel(showAddWorkoutDay)" />
      </div>

    </template>

    <div class="flex flex-col w-[450px]" v-if="showAddWorkout">
      <SelectWorkoutTemplate v-model:selectedModelId="workoutModelId" />
      <Divider />
      <WorkoutForm v-model:workout="workout" :titleMessage="titleMessage" />
    </div>

    <template #footer>
      <div class="flex gap-2 mb-3">
        <Checkbox v-model="saveModelOnLibrary" inputId="saveModel" binary :disabled="isSaveModelDisabled"
          class="mt-[1px]" />
        <label for="saveModel" class="font-semibold">
          Ajouter cette séance à la bibliothèque de modèles
          <Message v-show="isSaveModelDisabled" variant="simple" size="small">
            Ce modèle de séance est déjà enregistré
          </Message>
        </label>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Annuler" variant="outlined" @click="handleCloseAddWorkout" />
        <Button :label="validateButtonLabel" @click="handleAddWorkout" :disabled="validateButtonDisabled" />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { createWorkout } from '@/domain/factories/WorkoutFactory';
import { Workout } from '@/domain/types/TrainingPlan';
import Drawer from '@/ui/components/drawer/Drawer.vue';
import SelectWorkoutTemplate from '@/ui/components/select/SelectWorkoutTemplate.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import WorkoutForm from '@/ui/components/workout/WorkoutForm.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import {
  Button,
  Checkbox,
  Divider,
  Message
} from 'primevue';
import { computed, ref, watch } from 'vue';

const { showAddWorkout, showAddWorkoutDay, getRealDayNumber, getWeekDayLabel, handleCloseAddWorkout } =
  useTrainingPlanParams();

const { planifyWorkout, addWorkoutModel, workoutModels } = useTrainingPlan();

const workoutModelId = ref<string>(null);
const workout = ref<Workout>({
  id: null,
  title: null,
  description: null,
  sport: null,
  duration: null,
  distance: null,
});
const saveModelOnLibrary = ref<boolean>(true);

/**
 * Computed
 */
const isTitleExist = computed(() => {
  if (!workout.value) return false;
  return workoutModels.value.some((model) => model.title === workout.value.title && model.sport.label === workout.value.sport?.label);
})

const isSaveModelDisabled = computed(() => {
  return workoutFromModelId.value !== null;
})

const workoutFromModelId = computed(() => {
  return workoutModelId.value ? workoutModels.value.find((el) => el.id === workoutModelId.value) : null;
})

const titleMessage = computed(() => {
  if (!workoutModelId.value && isTitleExist.value) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

const validateButtonDisabled = computed(() => {
  const titleExist = !workoutModelId.value && isTitleExist.value;
  return !workout.value.title || !workout.value.sport || titleExist;
});

const validateButtonLabel = computed(() => {
  if (workoutModelId.value) return 'Planifier la séance'
  if (workout.value.title && workout.value.sport && saveModelOnLibrary.value) return 'Planifier la séance & enregistrer le modèle'
  return 'Planifier la séance'
});
/**
 * Functions
 */

const initForm = (data: Workout | null) => {
  workout.value.title = data?.title || null;
  workout.value.description = data?.description || null;
  workout.value.sport = data?.sport || null;
  workout.value.distance = data?.distance || null;
  workout.value.duration = data?.duration || null;
  saveModelOnLibrary.value = true;
}

const handleAddWorkout = () => {
  const newWorkout: Workout = createWorkout({
    id: workoutModelId.value,
    ...workout.value
  });
  if (saveModelOnLibrary.value) addWorkoutModel(newWorkout);
  planifyWorkout(newWorkout, showAddWorkoutDay.value);
  handleCloseAddWorkout();
};

/**
 * Watchers
 */

watch(showAddWorkout, () => {
  initForm(null);
});

watch(workoutModelId, () => {
  const workout: Workout | null = workoutFromModelId.value;
  if (workout) initForm(workout);
})

watch(
  workout,
  (newWorkout) => {
    if (!workoutModelId.value) return;

    const model = workoutFromModelId.value;
    if (!model) return;

    const isSame =
      newWorkout.title === model.title &&
      newWorkout.description === model.description &&
      newWorkout.distance === model.distance &&
      newWorkout.duration === model.duration &&
      newWorkout.sport?.label === model.sport?.label;

    if (!isSame) {
      workoutModelId.value = null;
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped></style>
