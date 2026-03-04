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

      <template v-if="workout.sportId === 'course-a-pied'">
        <Divider />
        <WorkoutRunForm v-model:workout="internalWorkout" />
      </template>
      <template v-else-if="workout.sportId === 'velo'">
        <Divider />
        <WorkoutBikeForm v-model:workout="internalWorkout" />
      </template>
      <template v-else-if="workout.sportId === 'natation'">
      </template>
      <template v-else-if="workout.sportId === 'musculation'">
      </template>
      <template v-else-if="workout.sportId === 'randonnee'">
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Workout } from '@/domain/types/workout/Workout';
import SelectSport from '@/ui/components/select/SelectSport.vue';
import WorkoutRunForm from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/run/WorkoutRunForm.vue';
import WorkoutBikeForm from '@/ui/pages/training-plan/training-plan/workouts/workout/workout-form/WorkoutBikeForm.vue';
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

const internalWorkout = ref(props.workout);

const emit = defineEmits(["update:workout"]);

watch(
  internalWorkout,
  () => {
    emit('update:workout', internalWorkout.value);
  },
  { deep: true }
);
</script>