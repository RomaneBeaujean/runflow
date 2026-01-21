<!-- WorkoutForm.vue -->
<template>
  <div class="flex flex-col gap-3" v-if="workout && !readonly">
    <SelectSport v-model:selectedSport="internalWorkout.sport" v-if="!readonly" />
    <FloatLabel variant="in" v-if="!readonly">
      <InputText id="title" v-model="internalWorkout.title" class="w-full" :invalid="titleMessage?.severity == 'error'"
        :disabled="readonly" />
      <label for="title">Titre de la séance</label>

      <Message v-if="titleMessage" :severity="titleMessage.severity" variant="simple">
        {{ titleMessage.message }}
      </Message>
    </FloatLabel>


    <FloatLabel variant="in">
      <Textarea id="description" v-model="internalWorkout.description" rows="5" class="w-full" :disabled="readonly" />
      <label for="description">Description</label>
    </FloatLabel>

    <FloatLabel variant="in" class="flex-1">
      <InputNumber id="distance" v-model="internalWorkout.distance" class="w-full" showButtons :min="0"
        :disabled="readonly" />
      <label for="distance">Distance prévue (km)</label>
    </FloatLabel>

    <FloatLabel variant="in" class="flex-1">
      <InputNumber id="duration" v-model="internalWorkout.duration" class="w-full" showButtons :min="0"
        :disabled="readonly" />
      <label for="duration">Durée prévue (minutes)</label>
    </FloatLabel>
  </div>

  <div v-if="workout && readonly">
    <div class="flex justify-between">
      <div class="text-md font-bold"> {{ workout.title }}</div>
      <ColorTag :label="workout.sport?.label" :icon="workout.sport?.icon"
        :color="createSportTagColor(workout.sport?.color)" />
    </div>
    <div class="text-sm text-gray-700">
      {{ workout.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSportTagColor } from '@/domain/factories/WorkoutFactory';
import { Workout } from '@/domain/types/TrainingPlan';
import { FloatLabel, InputNumber, InputText, Message, Textarea } from 'primevue';
import { computed } from 'vue';
import SelectSport from '../select/SelectSport.vue';
import ColorTag from '../tags/ColorTag.vue';

interface Props {
  workout?: Workout,
  titleMessage?: TitleMessage;
  readonly?: boolean
}

export interface TitleMessage {
  severity: string,
  message: string,
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:workout': [value: Workout];
}>();

const internalWorkout = computed({
  get: () => props.workout,
  set: (value) => emit('update:workout', value),
});
</script>