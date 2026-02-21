<template>
  <div class="text-sm font-regular text-gray-700">
    {{ workout.description }}
  </div>
  <div class="flex items-center">
    <ColorTag v-if="workout.distance" :label="`${workout.distance}km`" icon="pi pi-arrows-h" color="brown" />
    <ColorTag v-if="workout.duration" :label="minutesToFormattedDuration(workout.duration)" icon="pi pi-stopwatch"
      color="amber" />
  </div>
</template>

<script setup lang="ts">
import { minutesToFormattedDuration } from '@/domain/helpers/time';
import { WorkoutBasic } from '@/domain/types/Workout';
import ColorTag from '@/ui/components/tags/ColorTag.vue';

const props = defineProps<{
  workout: WorkoutBasic
}>();

</script>