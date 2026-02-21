<!-- WorkoutForm.vue -->
<template>
  <div class="flex flex-col gap-3" v-if="workout">

    <div class="flex gap-2">

      <!-- Sport pratiqué -->
      <div class="flex flex-col gap-2">
        <div class="text-xs font-semibold">Sport pratiqué</div>
        <SelectSport v-model:selected="workout.sportId" />
      </div>

      <!-- Titre de la séance -->
      <div class="flex flex-1 flex-col gap-2" v-show="workout.sportId">
        <div class="text-xs font-semibold">Titre de la séance</div>
        <InputText id="title" v-model="workout.title" class="w-full" :invalid="titleMessage?.severity == 'error'"
          placeholder="Titre de la séance" />
        <Message v-if="titleMessage" :severity="titleMessage.severity" variant="simple">
          {{ titleMessage.message }}
        </Message>
      </div>
    </div>

    <div v-show="workout.sportId">
      <Divider />

      <template v-if="workout.sportId === 'course-a-pied'">
        <div :class="['p-2 mt-[-8px] rounded-md', basicSelected && 'bg-gray-100']">
          <div class="flex justify-center mb-2">
            <SwitchToggle label="Ajout simplifié" v-model:value="basicSelected"></SwitchToggle>
          </div>

          <WorkoutFormSteps v-if="!basicSelected" v-model:workout="stepsStructure" />
          <WorkoutFormBasic v-if="basicSelected" v-model:workout="basicStructure" />
        </div>
      </template>
      <template v-else>
        <WorkoutFormBasic v-model:workout="basicStructure" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createWorkoutStructure } from '@/domain/factories/WorkoutFactory';
import { Workout, WorkoutBasic, WorkoutWithSteps } from '@/domain/types/Workout';
import SwitchToggle from '@/ui/components/inputs/SwitchToggle.vue';
import SelectSport from '@/ui/components/select/SelectSport.vue';
import WorkoutFormBasic from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/WorkoutFormBasic.vue';
import WorkoutFormSteps from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/WorkoutFormSteps.vue';
import { Divider, InputText, Message } from 'primevue';
import { ref, watch } from 'vue';

export interface TitleMessage {
  severity: string,
  message: string,
}

const props = defineProps<{
  workout: Workout | null,
  titleMessage?: TitleMessage;
}>();

const getBasicStructure = (workout: Workout): WorkoutBasic => {
  if (workout.structure.type === 'basic') return createWorkoutStructure(workout.structure) as WorkoutBasic;
  else return createWorkoutStructure({ type: "basic" }) as WorkoutBasic;
}

const getStepsStructure = (workout: Workout): WorkoutWithSteps => {
  if (workout.structure.type === 'steps') return createWorkoutStructure(workout.structure) as WorkoutWithSteps;
  else return createWorkoutStructure({ type: 'steps' }) as WorkoutWithSteps;
}

const emit = defineEmits(["update:workout"]);

const basicSelected = ref<boolean>(props.workout.structure.type === 'basic' ? true : false)
const basicStructure = ref<WorkoutBasic>(getBasicStructure(props.workout));
const stepsStructure = ref<WorkoutWithSteps>(getStepsStructure(props.workout));
const internalWorkout = ref(props.workout);

watch(basicSelected, () => {
  if (basicSelected.value) {
    internalWorkout.value.structure = createWorkoutStructure(basicStructure.value);
  } else {
    internalWorkout.value.structure = createWorkoutStructure(stepsStructure.value);
  }
});

watch(basicStructure, () => {
  internalWorkout.value.structure = basicStructure.value;
}, { deep: true })

watch(stepsStructure, () => {
  internalWorkout.value.structure = stepsStructure.value;
}, { deep: true })

watch(() => props.workout.sportId, () => {
  if (props.workout.sportId !== 'course-a-pied') {
    internalWorkout.value.structure = basicStructure.value;
  }
})

watch(internalWorkout, () => {
  emit("update:workout", internalWorkout.value);
}, { deep: true })
</script>