<template>
  <InputMask
    v-model="currentPace"
    mask="99:99"
    placeholder="mm:ss"
    class="mr-2"
  />
  <InputMask v-model="currentDuration" mask="99h99" placeholder="hh:mm" />
</template>

<script setup lang="ts">
import {
  durationFromPaceAndDistance,
  formattedDurationToMinutes,
  minutesToFormattedDuration,
  paceFromMinutesAndDistance,
} from '@/lib/time';
import { InputMask } from 'primevue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update']);

const props = defineProps<{ pace: string; distance: number }>();

const currentPace = ref<string>(props.pace);

const currentDurationMinutes = ref<number>(
  durationFromPaceAndDistance(props.pace, props.distance)
);

const currentDuration = ref<string>(
  minutesToFormattedDuration(currentDurationMinutes.value)
);

watch(
  () => currentPace.value,
  (newPace, oldPace) => {
    if (!newPace?.match(/^\d{1,2}:\d{2}$/) || newPace === oldPace) return;
    const newDurationMinutes = durationFromPaceAndDistance(
      newPace,
      props.distance
    );

    if (newDurationMinutes !== currentDurationMinutes.value) {
      currentDurationMinutes.value = newDurationMinutes;
      currentDuration.value = minutesToFormattedDuration(newDurationMinutes);
    }
  }
);

watch(
  () => currentDurationMinutes.value,
  (newDuration, oldDuration) => {
    if (
      !currentDuration.value?.match(/^\d{1,2}h\d{2}$/) ||
      newDuration === oldDuration
    )
      return;
    const newPace = paceFromMinutesAndDistance(newDuration, props.distance);
    const oldPace = currentPace.value;

    if (!oldPace.match(newPace)) {
      currentPace.value = newPace;
    }
  }
);

watch(
  () => currentDuration.value,
  (newDuration, oldDuration) => {
    if (
      !currentDuration.value?.match(/^\d{1,2}h\d{2}$/) ||
      newDuration === oldDuration
    )
      return;

    const inMinutes = formattedDurationToMinutes(newDuration);
    if (Math.round(currentDurationMinutes.value) !== Math.round(inMinutes)) {
      currentDurationMinutes.value = inMinutes;
    }
  }
);

watch([currentPace, currentDuration], () => {
  emit('update', {
    pace: currentPace.value,
  });
});
</script>

<style lang="scss" scoped></style>
