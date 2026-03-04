<template>
  <Drawer v-model:opened="showAddWorkout" position="right" overlay showCloseButton id="addWorkout" width="564px">
    <template #header v-if="showAddWorkout">
      <div class="font-bold text-xl">Ajouter une séance</div>
      <div class="font-regular text-md mt-2 flex gap-2">
        <ColorTag color="primary"
          :label="'Semaine ' + showAddWorkoutDay.weekNumber + ' · ' + getWeekDayLabel(showAddWorkoutDay)" />
        <ColorTag color="orange" :label="'J' + getRealDayNumber(showAddWorkoutDay)" />
      </div>

    </template>

    <div class="flex flex-col h-full" v-if="showAddWorkout">
      <WorkoutForm v-model:workout="workout" :titleMessage="titleMessage" />
    </div>

    <template #footer>
      <div class="flex flex-col gap-3">
        <div class="flex gap-2 items-center" v-if="!isSubmitButtonDisabled">
          <Checkbox v-model="saveModelOnLibrary" inputId="saveModel" binary :disabled="isSaveModelDisabled" />
          <label for="saveModel" class="font-semibold cursor-pointer">
            Ajouter cette séance à la bibliothèque de modèles
            <Message v-show="isSaveModelDisabled" variant="simple" size="small">
              Ce modèle de séance est déjà enregistré
            </Message>
          </label>
        </div>

        <div class="flex justify-end gap-2">
          <Button label="Annuler" variant="outlined" @click="handleCloseAddWorkout" />
          <Button :label="validateButtonLabel" @click="handleAddWorkout" :disabled="isSubmitButtonDisabled" />
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { createRunWorkout } from '@/domain/factories/RunWorkoutFactory';
import type { Workout } from '@/domain/types/workout/Workout';
import Drawer from '@/ui/components/drawer/Drawer.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { useTrainingPlanHelper } from '@/ui/composables/useTrainingPlanHelper';
import { useTrainingPlanParams } from '@/ui/composables/useTrainingPlanParams';
import WorkoutForm from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/WorkoutForm.vue';
import {
  Button,
  Checkbox,
  Message
} from 'primevue';
import { computed, ref, watch } from 'vue';

const { showAddWorkout, showAddWorkoutDay, getRealDayNumber, getWeekDayLabel, handleCloseAddWorkout } =
  useTrainingPlanParams();
const { planifyWorkout, addWorkoutModel, workoutModels } = useTrainingPlan();
const { isFormValid, isTitleExist } = useTrainingPlanHelper();

const workoutModelId = ref<string>(null);
const workout = ref<Workout>(createRunWorkout({ sportId: 'course-a-pied' }));
const saveModelOnLibrary = ref<boolean>(true);

/**
 * Computed
 */


const isSaveModelDisabled = computed(() => {
  return workoutFromModelId.value !== null;
})

const workoutFromModelId = computed(() => {
  return workoutModelId.value ? workoutModels.value.find((el) => el.id === workoutModelId.value) : null;
})

const titleMessage = computed(() => {
  if (!workoutModelId.value && isTitleExist(workout.value)) return {
    severity: 'error',
    message: 'Ce titre de séance est déjà utilisé pour ce sport'
  }
  return null;
});

const isSubmitButtonDisabled = computed(() => {
  return !isFormValid(workout.value, workoutFromModelId.value)
});

const validateButtonLabel = computed(() => {
  if (workoutModelId.value) return 'Planifier la séance'
  if (workout.value.title && workout.value.sportId && saveModelOnLibrary.value) return 'Planifier la séance & enregistrer le modèle'
  return 'Planifier la séance'
});

/**
 * Functions
 */

const initForm = (data: Partial<Workout> | null) => {
  workout.value = createRunWorkout(data);
  saveModelOnLibrary.value = true;
}

const handleAddWorkout = () => {
  const newWorkout: Workout = createRunWorkout({
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
  initForm({ sportId: 'course-a-pied' });
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

    const isSame = createRunWorkout(newWorkout) == createRunWorkout(model)
    if (!isSame) {
      workoutModelId.value = null;
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped></style>
