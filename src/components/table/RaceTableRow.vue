<template>
  <tr @swmsave="saveRow">
    <td>
      <swm-table-cell width="120px">
        <swm-input-number>
          <input
            class="endDistance"
            step="0.1"
            slot="input"
            type="number"
            placeholder="Début du split"
            :disabled="isDisabled"
            :min="0"
            :max="totalDistance - 0.1"
            v-model="currentSeparator"
          />
        </swm-input-number>
      </swm-table-cell>
    </td>
    <td>
      <swm-table-cell> {{ split.endDistance }} </swm-table-cell>
    </td>
    <td>
      <swm-table-cell>{{ distance }} <small>km</small></swm-table-cell>
    </td>
    <td>
      <swm-table-cell>
        {{ getElevationFromSplit(split) }} <small>m</small>
      </swm-table-cell>
    </td>
    <td>
      <swm-table-cell>
        {{ getCumulElevationFromSplit(splits, split) }} <small>m</small>
      </swm-table-cell>
    </td>
    <SplitPaceCell v-model="currentPace" />
    <SplitDurationCell v-model="currentDuration" />
    <td>
      <swm-table-cell>
        {{ getCumulDurationFromSplit(splits, split) }}
      </swm-table-cell>
    </td>
    <td>
      <swm-table-cell>
        <swm-actions>
          <swm-action @swmactionclick="deletesplit" :disabled="isDisabled">
            <swm-icon name="trash"></swm-icon>
          </swm-action>
        </swm-actions>
      </swm-table-cell>
    </td>
  </tr>
</template>

<script setup lang="ts">
import {
  durationFromPaceAndDistance,
  formattedDurationToMinutes,
  minutesToFormattedDuration,
  paceFromMinutesAndDistance,
} from '@/lib/time';
import { roundOneNumber } from '@/lib/utils';
import { useGpxMetrics } from '@/composables/useGpxMetrics';
import { useRace } from '@/composables/useRace';
import { Split } from '@runflow/shared';
import { computed, ref, watch } from 'vue';
import SplitDurationCell from './SplitDurationCell.vue';
import SplitPaceCell from './SplitPaceCell.vue';
/**
 * Props
 */

const props = defineProps<{ split: Split }>();
const { deleteSeparator, updateSeparator, updateSplitPace, totalDistance } =
  useRace();

const {
  getCumulDurationFromSplit,
  getElevationFromSplit,
  getCumulElevationFromSplit,
} = useGpxMetrics();
const { splits } = useRace();

const distance = computed(() => {
  return roundOneNumber(props.split.endDistance - props.split.startDistance);
});

const currentSeparator = ref<number>(props.split.startDistance);
const currentPace = ref<string>(props.split.pace);
const currentDurationMinutes = ref<number>(
  durationFromPaceAndDistance(props.split.pace, distance.value)
);
const currentDuration = ref<string>(
  minutesToFormattedDuration(currentDurationMinutes.value)
);

const isPaceCorrect = () => {
  return currentPace.value?.match(/^\d{1,2}:\d{2}$/);
};

const isDisabled = computed(() => {
  return props.split.startDistance === 0;
});

const deletesplit = () => {
  deleteSeparator(props.split.startDistance);
};

const saveRow = () => {
  if (props.split.startDistance !== currentSeparator.value) {
    updateSeparator(props.split.startDistance, currentSeparator.value);
  }

  if (props.split.pace !== currentPace.value && isPaceCorrect()) {
    updateSplitPace(props.split, currentPace.value);
  } else if (!isPaceCorrect()) {
    currentPace.value = props.split.pace;
  }
};

watch(
  () => currentPace.value,
  (newPace, oldPace) => {
    if (!newPace?.match(/^\d{1,2}:\d{2}$/) || newPace === oldPace) return;
    const newDurationMinutes = durationFromPaceAndDistance(
      newPace,
      distance.value
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
    const newPace = paceFromMinutesAndDistance(newDuration, distance.value);
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
</script>

<style lang="scss" scoped></style>
