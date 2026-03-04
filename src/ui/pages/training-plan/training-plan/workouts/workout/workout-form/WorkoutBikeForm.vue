<template>
  <FloatLabel variant="in">
    <Textarea id="description" v-model="(workout.structure as BikeWorkoutStructure).description" rows="5"
      class="w-full" />
    <label for="description">Description</label>
  </FloatLabel>
  <div class="flex items-center gap-1">
    <FloatLabel variant="in" class="flex-1">
      <InputNumber v-model="(workout.structure as BikeWorkoutStructure).distance" mode="decimal" placeholder="0"
        showButtons :min="0" :step="0.1" />
      <label for="distance">Distance prévue (km)</label>
    </FloatLabel>
    <FloatLabel variant="in" class="flex-1">
      <InputDuration id="duration" v-model:duration="(workout.structure as BikeWorkoutStructure).duration" />
      <label for="duration">Durée prévue</label>
    </FloatLabel>
  </div>
</template>

<script setup lang="ts">
import { BikeWorkoutStructure } from '@/domain/types/workout/BikeWorkoutStructure';
import { Workout } from '@/domain/types/workout/Workout';
import InputDuration from '@/ui/components/inputs/InputDuration.vue';
import { FloatLabel, InputNumber, Textarea } from 'primevue';
import { ref, watch } from 'vue';

const props = defineProps<{
  workout: Workout;
}>();

const emit = defineEmits<{
  'update:workout': [workout: Workout];
}>();

const internalWorkout = ref(props.workout);

watch(
  internalWorkout,
  () => {
    emit('update:workout', internalWorkout.value);
  },
  { deep: true }
);
</script>
