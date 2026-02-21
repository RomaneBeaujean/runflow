<template>
  <FloatLabel variant="in">
    <Textarea id="description" v-model="workout.description" rows="5" class="w-full" />
    <label for="description">Description</label>
  </FloatLabel>
  <div class="flex items-center gap-1">
    <FloatLabel variant="in" class="flex-1">
      <InputNumber v-model="workout.distance" mode="decimal" placeholder="0" showButtons :min="0" :step="0.1" />
      <label for="distance">Distance prévue (km)</label>
    </FloatLabel>
    <FloatLabel variant="in" class="flex-1">
      <InputDuration id="duration" v-model:duration="workout.duration" />
      <label for="duration">Durée prévue</label>
    </FloatLabel>
  </div>
</template>

<script setup lang="ts">
import { WorkoutBasic } from '@/domain/types/Workout';
import InputDuration from '@/ui/components/inputs/InputDuration.vue';
import { FloatLabel, InputNumber, Textarea } from 'primevue';
import { ref, watch } from 'vue';

const props = defineProps<{
  workout: WorkoutBasic
}>();

const emit = defineEmits(["update:workout"]);

const internalWorkout = ref(props.workout);

watch(internalWorkout, () => {
  emit("update:workout", internalWorkout.value);
}, { deep: true })
</script>