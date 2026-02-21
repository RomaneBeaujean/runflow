<template>
  <InputGroup>
    <InputGroupAddon>
      <div class="flex gap-1 items-center">
        <div v-for="metric in METRICS" class="flex items-center cursor-pointer"
          @click="selectedMetricType = metric.type">
          <Icon :icon="metric.icon" size="xsmall"
            :color="selectedMetricType == metric.type ? 'primary-900' : 'gray-200'" />
        </div>
      </div>
    </InputGroupAddon>

    <InputText v-if="selectedUnit == 'min'" placeholder="Durée" @input="handleInput" v-model="timeInput"
      @blur="handleBlur" />

    <InputNumber v-else v-model="metricValue" showButtons :min="inputNumberConfig?.min" :max="inputNumberConfig?.max"
      :step="inputNumberConfig?.step" :minFractionDigits="inputNumberConfig?.minFractionDigits"
      :maxFractionDigits="inputNumberConfig?.maxFractionDigits"
      :placeholder="selectedMetricType === 'distance' ? 'Distance' : 'Durée'" />

    <InputGroupAddon>
      <div class="flex gap-1 items-center w-[35px]">
        <div v-for="unit in getMetricUnits(getMetric(selectedMetricType))" class="flex items-center cursor-pointer"
          @click="selectedUnit = unit" :class="[
            'font-semibold',
            selectedUnit == unit ? 'text-primary-900' : 'text-gray-200'
          ]">
          {{ unit }}
        </div>
      </div>

    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import { METRICS } from '@/domain/constants/metrics';
import { getMetric, getMetricUnits } from '@/domain/helpers/metrics';
import { MetricType, MetricValue } from '@/domain/types/Metric';
import { InputGroup, InputGroupAddon, InputNumber, InputText } from 'primevue';
import { computed, ref, watch } from 'vue';
import Icon from '../Icon.vue';

const timeToMinutes = (time: string) => {
  const parts = time.split(':');
  const minutes = parseInt(parts[0] || '0', 10);
  const secondes = parseInt(parts[1] || '0', 10);
  return minutes + secondes / 60;
}

const minutesToTime = (time: number) => {
  if (!time || time === 0) return null;
  const minutes = Math.floor(time);
  const seconds = Math.round((time - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const getDefaultUnit = (metricId: string) => {
  if (metricId === 'distance') return 'm'
  else return 's';
}

const props = defineProps<{ value?: MetricValue }>();

const selectedMetricType = ref<MetricType>(props.value?.metric.type || 'distance');
const selectedUnit = ref(props.value?.unit || getDefaultUnit(selectedMetricType.value));
const metricValue = ref(props.value?.value || null);
const timeInput = ref(props.value?.unit === 'min' ? minutesToTime(props.value?.value || null) : null);
const emit = defineEmits(['update:value']);

const handleInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value;

  const cleaned = input
    .replace(/[., ]/g, ':')
    .replace(/[^0-9:]/g, '');

  if (cleaned !== input) timeInput.value = cleaned;
}

const handleBlur = (event: Event) => {
  const input = (event.target as HTMLInputElement).value;

  const cleaned = input.replace(/:(\d)$/g, ':$10');

  if (cleaned !== input) {
    timeInput.value = cleaned;
  }
}

const inputNumberConfig = computed(() => {
  if (selectedMetricType.value === 'distance') {
    if (selectedUnit.value === 'm') {
      return {
        min: 1,
        max: 9999,
        step: 50,
        minFractionDigits: 0,
        maxFractionDigits: 0
      }
    }

    if (selectedUnit.value === 'km') {
      return {
        min: 0.1,
        max: 99,
        step: 0.1,
        minFractionDigits: 0,
        maxFractionDigits: 1
      }
    }
  }

  if (selectedMetricType.value === 'duration') {
    if (selectedUnit.value === 'min') {
      return {
        min: 1,
        max: 999,
        step: 1,
        minFractionDigits: 0,
        maxFractionDigits: 1
      }
    }

    if (selectedUnit.value === 's') {
      return {
        min: 1,
        max: 999,
        step: 10,
        minFractionDigits: 0,
        maxFractionDigits: 0
      }
    }
  }

  return null;
});

watch(selectedMetricType, () => {
  selectedUnit.value = getDefaultUnit(selectedMetricType.value);
});

watch([selectedMetricType, selectedUnit, metricValue], () => {
  const newMetricValue = {
    metric: getMetric(selectedMetricType.value),
    value: metricValue.value,
    unit: selectedUnit.value,
  }

  emit('update:value', newMetricValue);
})

watch(timeInput, () => {
  metricValue.value = timeToMinutes(timeInput.value);
})

watch(metricValue, () => {
  if (selectedUnit.value === 'min') return;

  const toTime = minutesToTime(metricValue.value);
  if (toTime !== timeInput.value) timeInput.value = toTime;
})
</script>

<style lang="scss" scoped></style>
