<template>
  <CardColor :color="primaryBgColor">
    <div class="flex justify-between">
      <div class="inline-flex p-2">
        <div :class="[
          'p-1 pl-2 pr-2 rounded-sm font-semibold text-white',
          primaryBgColor,
        ]">
          Echauffement
        </div>
      </div>
    </div>

    <div class="p-2">
      <div class="w-full">
        <div class="flex flex-col gap-2">
          <InputMetric v-model:value="workoutRecoveryStep.phase.metricValue" />

          <div>
            <div
              class="flex gap-1 text-xs font-semibold text-primary-500 cursor-pointer mt-1 hover:text-primary-800 group"
              v-if="!showRecoveryTarget" @click="showRecoveryTarget = true">
              <Icon icon="fa-solid fa-crosshairs" />
              <span class="group-hover:underline">
                Ajouter une allure / FC cible
              </span>
            </div>
            <div class="flex gap-1 items-center" v-if="showRecoveryTarget">
              <InputTarget v-if="showRecoveryTarget" v-model:target="workoutRecoveryStep.phase.target" />
              <Icon action icon="pi pi-trash" size="xsmall" @click="showRecoveryTarget = false" />
            </div>
          </div>
          <Divider v-if="showComment" />
          <div class="flex justify-end">
            <Icon :icon="showComment ? 'pi pi-trash' : 'pi pi-pen-to-square'" action size="small"
              v-tooltip.bottom="!showComment ? 'Ajouter une note' : 'Supprimer la note'"
              @click="showComment = !showComment" />
          </div>
          <div v-if="showComment">
            <Textarea placeholder="Notes" fluid class="mt-2" autoResize rows="2"
              v-model="workoutRecoveryStep.comment" />
          </div>
        </div>
      </div>
    </div>
  </CardColor>
</template>

<script setup lang="ts">
import { RunWorkoutRecoveryStep } from '@/domain/types/workout/RunWorkoutStructure';
import CardColor from '@/ui/components/card/CardColor.vue';
import Icon from '@/ui/components/Icon.vue';
import InputMetric from '@/ui/components/inputs/InputMetric.vue';
import InputTarget from '@/ui/components/inputs/InputTarget.vue';
import { Divider, Textarea } from 'primevue';
import { computed, ref, watch } from 'vue';

interface Props {
  step: RunWorkoutRecoveryStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{ 'update:step': [step: RunWorkoutRecoveryStep] }>();

const workoutRecoveryStep = ref<RunWorkoutRecoveryStep>(props.step);
const showRecoveryTarget = ref(!!workoutRecoveryStep.value.phase.target);
const showComment = ref(!!props.step.comment);

const primaryBgColor = computed(() => {
  return 'bg-amber-500';
});

watch(showComment, () => {
  if (!showComment.value) {
    workoutRecoveryStep.value.comment = null;
  }
});

watch(
  workoutRecoveryStep,
  () => {
    emit('update:step', workoutRecoveryStep.value);
  },
  { deep: true }
);
</script>
