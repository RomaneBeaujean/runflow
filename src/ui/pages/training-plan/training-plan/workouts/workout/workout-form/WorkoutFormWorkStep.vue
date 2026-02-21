<template>
  <CardColor :color="primaryBgColor">
    <div class="flex justify-between">
      <!-- Workout Type -->
      <div class="inline-flex p-2">
        <div :class="[
          'p-1 pl-2 pr-2 rounded-sm font-semibold text-white',
          primaryBgColor,
        ]">
          Exercice
        </div>
      </div>

      <!-- Repeat -->
      <div class="inline-flex items-center gap-2">
        <div> Répéter </div>
        <div class="w-[70px]">
          <InputNumber v-model="workoutWorkStep.repeat" :step="1" :min="1" :max="100" showButtons />
        </div>
        <div> fois </div>
      </div>
    </div>

    <Divider />

    <div class="p-2">
      <div class="flex flex-row">
        <div class="flex-1 flex flex-col gap-1">
          <div class="font-bold text-sm h-[20px] inline-flex items-center justify-between">
            Effort
          </div>
          <InputMetric v-model:value="workoutWorkStep.phases.effort.metricValue" />
          <div class="flex flex-col gap-2">
            <div
              class="flex gap-1 text-xs font-semibold text-primary-500 cursor-pointer mt-1 hover:text-primary-800 group"
              v-if="!showEffortTarget" @click="showEffortTarget = true">
              <Icon icon="fa-solid fa-crosshairs" />
              <span class="group-hover:underline">
                Ajouter une allure / FC cible
              </span>
            </div>
            <div class="flex gap-1 items-center" v-if="showEffortTarget">
              <InputTarget v-model:target="workoutWorkStep.phases.effort.target" />
              <Icon action icon="pi pi-trash" size="xsmall" @click="showEffortTarget = false" />
            </div>
          </div>
        </div>
        <Divider layout="vertical" />
        <div class="flex-1 flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center font-bold text-sm gap-2">
              <ToggleSwitch v-model="showCounterEffort" />
              <div @click="showCounterEffort = !showCounterEffort" :class="[
                'cursor-pointer font-bold text-sm',
                showCounterEffort ? 'text-neutral-900' : 'text-neutral-300'
              ]">Contre-effort</div>
            </div>
          </div>
          <InputMetric v-if="showCounterEffort && workoutWorkStep.phases.counterEffort"
            v-model:value="workoutWorkStep.phases.counterEffort.metricValue" />
          <div v-if="showCounterEffort">
            <div
              class="flex gap-1 text-xs font-semibold text-primary-500 cursor-pointer mt-1 hover:text-primary-800 group"
              v-if="!showCounterEffortTarget" @click="showCounterEffortTarget = true">
              <Icon icon="fa-solid fa-crosshairs" />
              <span class="group-hover:underline">
                Ajouter une allure / FC cible
              </span>
            </div>
            <div class="flex gap-1 items-center" v-if="showCounterEffortTarget && showCounterEffort">
              <InputTarget v-model:target="workoutWorkStep.phases.counterEffort.target" />
              <Icon action icon="pi pi-trash" size="xsmall" @click="showCounterEffortTarget = false" />
            </div>
          </div>
        </div>
      </div>
      <Divider v-if="showComment" />
      <div class="flex justify-end">
        <Icon :icon="showComment ? 'pi pi-trash' : 'pi pi-pen-to-square'" action size="small"
          v-tooltip.bottom="!showComment ? 'Ajouter une note' : 'Supprimer la note'"
          @click="showComment = !showComment" />
      </div>
      <div v-if="showComment">
        <Textarea placeholder="Notes" fluid class="mt-2" autoResize rows="2" v-model="workoutWorkStep.comment" />
      </div>
    </div>
  </CardColor>
</template>

<script setup lang="ts">
import { createStepPhase } from '@/domain/factories/WorkoutFactory';
import { WorkoutWorkStep } from '@/domain/types/Workout';
import CardColor from '@/ui/components/card/CardColor.vue';
import Icon from '@/ui/components/Icon.vue';
import InputMetric from '@/ui/components/inputs/InputMetric.vue';
import InputTarget from '@/ui/components/inputs/InputTarget.vue';
import { Divider, InputNumber, Textarea, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';

interface Props {
  step: WorkoutWorkStep,
}

const props = defineProps<Props>();

const emit = defineEmits(["update:step"]);

const workoutWorkStep = ref<WorkoutWorkStep>(props.step);
const showCounterEffort = ref(!!workoutWorkStep.value.phases.counterEffort);
const showEffortTarget = ref<boolean>(!!workoutWorkStep.value.phases.effort.target);
const showCounterEffortTarget = ref<boolean>(!!workoutWorkStep.value.phases.counterEffort?.target);
const showComment = ref(!!props.step.comment);

const primaryBgColor = computed(() => {
  return 'bg-primary-500'
});

const effortPhase = computed(() => {
  return workoutWorkStep.value.phases.effort;
})

watch(showCounterEffort, () => {
  workoutWorkStep.value = {
    ...workoutWorkStep.value,
    phases: {
      effort: effortPhase.value,
      counterEffort: showCounterEffort.value ? createStepPhase() : null,
    }
  }

  if (!showCounterEffort.value) showCounterEffortTarget.value = false;
});

watch(showComment, () => {
  if (!showComment.value) {
    workoutWorkStep.value.comment = null;
  }
})

watch(workoutWorkStep, () => {
  emit('update:step', workoutWorkStep.value);
}, { deep: true });
</script>