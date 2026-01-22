<!-- WorkoutForm.vue -->
<template>
  <div class="flex flex-col gap-3" v-if="workout && !readonly">


    <SelectSport v-model:selectedSport="internalWorkout.sport" v-if="!readonly" />
    <FloatLabel variant="in" v-if="!readonly">
      <InputText id="title" v-model="internalWorkout.title" class="w-full"
        :invalid="titleMessage?.severity == 'error'" />
      <label for="title">Titre de la séance</label>

      <Message v-if="titleMessage" :severity="titleMessage.severity" variant="simple">
        {{ titleMessage.message }}
      </Message>
    </FloatLabel>


    <FloatLabel variant="in">
      <Textarea id="description" v-model="internalWorkout.description" rows="5" class="w-full" />
      <label for="description">Description</label>
    </FloatLabel>

    <div class="flex items-center gap-2">
      <FloatLabel variant="in" class="flex-1">
        <InputNumber v-model="internalWorkout.distance" mode="decimal" placeholder="0" showButtons :min="0"
          :step="0.1" />
        <label for="distance">Distance prévue (km)</label>
      </FloatLabel>

      <FloatLabel variant="in" class="flex-1">
        <InputDuration id="duration" v-model:duration="internalWorkout.duration" />
        <label for="duration">Durée prévue</label>
      </FloatLabel>
    </div>
  </div>

  <div v-if="workout && readonly" class="flex flex-col gap-2">
    <div class="flex justify-between">
      <div class="text-md font-bold"> {{ workout.title }}</div>
      <div class="flex gap-2">
        <ColorTag :label="workout.sport?.label" :icon="workout.sport?.icon"
          :color="createSportTagColor(workout.sport?.color)" />
        <ColorTag color="primary" v-if="workout.distance">{{ workout.distance }} <small>km</small></ColorTag>
        <ColorTag color="green" icon="pi pi-stopwatch" v-if="workout.duration">
          {{ minutesToFormattedDuration(workout.duration) }}
        </ColorTag>
      </div>
    </div>
    <div class="text-sm text-gray-700">
      {{ workout.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSportTagColor } from '@/domain/factories/WorkoutFactory';
import { minutesToFormattedDuration } from '@/domain/helpers/Time.helper';
import { Workout } from '@/domain/types/TrainingPlan';
import { FloatLabel, InputNumber, InputText, Message, Textarea } from 'primevue';
import { computed } from 'vue';
import InputDuration from '../inputs/InputDuration.vue';
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