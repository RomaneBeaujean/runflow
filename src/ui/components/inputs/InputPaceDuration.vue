<template>
  <InputMask
    v-model="currentPace"
    mask="99:99 (min/km)"
    placeholder="Allure (min/km)"
    class="input-pace mr-2"
    :size="props.size || 'small'"
    style="width: 125px"
  />
  <InputMask
    v-model="currentDuration"
    mask="99h99"
    placeholder="__h__"
    class="input-duration"
    :size="props.size || 'small'"
    style="width: 75px"
  />
</template>

<script setup lang="ts">
import {
  durationFromPaceAndDistance,
  formattedDurationToMinutes,
  minutesToFormattedDuration,
  paceFromMinutesAndDistance,
} from '@/domain/helpers/Time.helper';
import { InputMask } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{
  pace: string | null;
  distance: number;
  size?: string;
}>();

const currentPace = ref<string>(props.pace);

const currentDurationMinutes = ref<number>(
  durationFromPaceAndDistance(props.pace, props.distance)
);

const currentDuration = ref<string>(
  minutesToFormattedDuration(currentDurationMinutes.value)
);

watch(currentPace, (newPace, oldPace) => {
  if (!newPace?.match(/^\d{1,2}:\d{2}/) || newPace === oldPace) return;
  const newPaceCleaned = newPace.slice(0, 5);

  const newDurationMinutes = durationFromPaceAndDistance(
    newPaceCleaned,
    props.distance
  );

  if (newDurationMinutes !== currentDurationMinutes.value) {
    currentDurationMinutes.value = newDurationMinutes;
    currentDuration.value = minutesToFormattedDuration(newDurationMinutes);
  }
});

watch(currentDurationMinutes, (newDuration, oldDuration) => {
  if (
    !currentDuration.value?.match(/^\d{1,2}h\d{2}$/) ||
    newDuration === oldDuration
  )
    return;
  const newPace = paceFromMinutesAndDistance(newDuration, props.distance);
  const oldPace = currentPace.value;

  if (!oldPace || !oldPace.match(newPace)) {
    currentPace.value = newPace;
  }
});

watch(currentDuration, (newDuration, oldDuration) => {
  if (
    !currentDuration.value?.match(/^\d{1,2}h\d{2}$/) ||
    newDuration === oldDuration
  )
    return;

  const inMinutes = formattedDurationToMinutes(newDuration);
  if (Math.round(currentDurationMinutes.value) !== Math.round(inMinutes)) {
    currentDurationMinutes.value = inMinutes;
  }
});

watch([currentPace, currentDuration], () => {
  emit('update', {
    pace: currentPace.value.slice(0, 5),
  });
});
</script>

<style lang="scss" scoped></style>
