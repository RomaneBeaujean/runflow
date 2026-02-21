<!-- AddWorkout.vue -->
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

      <!-- <div class="flex flex-col h-full items-center justify-center gap-2">
        <div
          class="w-[200px] h-[100px] p-2 border-1 border-gray-200 flex items-center justify-center rounded-lg shadow-lg cursor-pointer gap-3 hover:shadow-2xl hover:bg-gray-50">
          <div alass=" h-full flex items-center justify-center flex-0">
            <Icon size="large" icon="pi pi-plus" class="" />
          </div>
          <div>
            <div class="font-bold text-sm">
              Nouvelle séance
            </div>
            <div class="text-gray-600 text-sm">Créer une nouvelle séance</div>
          </div>
        </div>
        <div>
          ou
        </div>
        <div
          class="w-[200px] h-[100px] p-2 border-1 border-gray-200 flex items-center justify-center rounded-lg shadow-lg cursor-pointer gap-3 hover:shadow-2xl hover:bg-gray-50">
          <div alass="h-full flex items-center justify-center flex-0">
            <Icon size="large" icon="pi pi-book" class="" />
          </div>
          <div>
            <div class="font-bold text-sm">
              Depuis la bibliothèque
            </div>
            <div class="text-gray-600 text-sm">Copier ou planifier une séance existante </div>
          </div>
        </div>
      </div> -->

      <!-- <div>
        <div class="font-semibold">
          Depuis la bibliothèque
        </div>
        <SelectWorkoutTemplate v-model:selectedModelId="workoutModelId" />
      </div>
      <Divider /> -->
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
import { createWorkout } from '@/domain/factories/WorkoutFactory';
import { Workout } from '@/domain/types/Workout';
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
const workout = ref<Workout>(createWorkout({ sportId: 'course-a-pied' }));
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
  workout.value = createWorkout(data);
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

    const isSame = createWorkout(newWorkout) == createWorkout(model)
    if (!isSame) {
      workoutModelId.value = null;
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped></style>
