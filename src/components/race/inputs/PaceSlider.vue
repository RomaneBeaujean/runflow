<template>
  <div class="pl-[20px] pr-[20px] select-none">
    <div class="w-full relative pt-10 pb-5">
      <!-- Bullette de valeur -->
      <div
        class="absolute top-0 transform -translate-x-1/2 bg-primary-400 text-white px-2 py-1 rounded"
        :style="{ left: thumbPosition + '%' }"
      >
        <span class="flex flex-nowrap whitespace-nowrap items-center">
          <b>{{ currentPace }}</b> <small class="ml-1">min/km</small>
        </span>
      </div>

      <!-- Barre + curseur -->
      <div
        class="relative h-2 cursor-pointer"
        ref="sliderRef"
        @mousedown="startDrag"
        @click="onClick"
      >
        <!-- Track -->
        <div
          class="absolute w-full h-1 bg-gray-300 top-1/2 transform -translate-y-1/2 rounded"
        ></div>

        <!-- Barre remplie (progress) -->
        <div
          class="absolute h-1 bg-primary-400 top-1/2 transform -translate-y-1/2 rounded"
          :style="{ width: thumbPosition + '%' }"
        ></div>

        <!-- Curseur -->
        <div
          class="absolute top-1/2 w-3.5 h-3.5 bg-white border-2 border-primary-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          :style="{ left: thumbPosition + '%' }"
          @mousedown.stop="startDrag"
        ></div>
      </div>

      <!-- Graduation avec valeurs -->
      <div class="flex justify-between">
        <div
          v-for="tick in ticks"
          :key="tick"
          class="text-center w-px relative"
        >
          <div class="absolute transform -translate-x-1/2">
            <span class="text-sm text-gray-600">{{ tick }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { numberToPace } from '@/lib/time';
import { computed, ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void;
}>();

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
}>();

const sliderRef = ref<HTMLElement | null>(null);
const value = ref(props.modelValue);
const min = ref(props.min);
const max = ref(props.max);
const step = ref(props.step);
const thumbPosition = ref(0);

let dragging = false;

const ticks = computed(() => {
  const result: number[] = [];
  for (let i = min.value; i <= max.value; i += 2) {
    result.push(i);
  }
  return result;
});

const currentPace = computed(() => {
  return numberToPace(value.value);
});

const updateThumbPosition = () => {
  thumbPosition.value =
    ((value.value - min.value) / (max.value - min.value)) * 100;
};

const setValueFromEvent = (event: MouseEvent) => {
  if (!sliderRef.value) return;

  const rect = sliderRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const ratio = Math.min(Math.max(x / rect.width, 0), 1);

  const raw = min.value + ratio * (max.value - min.value);
  value.value = Math.round(raw / step.value) * step.value;

  emit('update:modelValue', value.value);
  updateThumbPosition();
};

const startDrag = () => {
  dragging = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const stopDrag = () => {
  dragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (dragging) setValueFromEvent(e);
};

const onClick = (e: MouseEvent) => {
  setValueFromEvent(e);
};

watch(
  () => props.modelValue,
  (v) => {
    value.value = v;
    updateThumbPosition();
  },
  { immediate: true }
);
</script>
