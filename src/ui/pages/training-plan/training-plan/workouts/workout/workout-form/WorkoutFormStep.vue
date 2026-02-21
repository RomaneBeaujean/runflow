<!-- WorkoutForm.vue -->
<template>
  <CardColor :color="primaryBgColor">
    <div class="flex justify-between">
      <!-- Workout Type -->
      <div class="inline-flex p-2">
        <div v-for="option in stepTypeOptions" :class="[
          'p-1 pl-2 pr-2 rounded-sm cursor-pointer font-semibold',
          isStepTypeSelected(option.type) ? primaryBgColor + ' text-white' : 'bg-gray-100 text-gray-400'
        ]" @click="stepType = option.type">
          {{ option.label }}
        </div>
      </div>

      <!-- Repeat -->
      <div class="inline-flex items-center gap-2" v-if="stepType == 'work'">
        <div> Répéter </div>
        <div class="w-[70px]">
          <InputNumber v-model="workoutWorkStep.repeat" :step="1" :min="1" :max="100" showButtons />
        </div>
        <div> fois </div>
      </div>
    </div>

    <div class="mt-5">
      <template v-if="stepType === 'work'">
        <div class="flex flex-row">
          <div class="flex-1 flex flex-col gap-1">
            <div class="font-bold text-sm mb-2 h-[20px] inline-flex items-center justify-between">
              <div>Effort</div>
              <Icon icon="fa-solid fa-crosshairs" action
                v-tooltip.bottom="showEffortTarget ? 'Supprimer la cible' : 'Ajouter une cible'"
                :active="showEffortTarget" @click="showEffortTarget = !showEffortTarget" />
            </div>
            <InputMetric v-model:value="workoutWorkStep.phases.effort.metricValue" />
            <InputTarget v-if="showEffortTarget" v-model:target="workoutWorkStep.phases.effort.target" />
          </div>
          <Divider layout="vertical" />
          <div class="flex-1 flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <div class="inline-flex items-center font-bold text-sm gap-2 mb-2">
                <ToggleSwitch v-model="showCounterEffort" />
                <div @click="showCounterEffort = !showCounterEffort" :class="[
                  'cursor-pointer font-bold text-sm',
                  showCounterEffort ? 'text-neutral-900' : 'text-neutral-300'
                ]">Contre-effort</div>
              </div>
              <Icon icon="fa-solid fa-crosshairs" action v-if="showCounterEffort"
                v-tooltip.bottom="showCounterEffortTarget ? 'Supprimer la cible' : 'Ajouter une cible'"
                :active="showCounterEffortTarget" @click="showCounterEffortTarget = !showCounterEffortTarget" />
            </div>
            <InputMetric v-if="showCounterEffort && workoutWorkStep.phases.counterEffort"
              v-model:value="workoutWorkStep.phases.counterEffort.metricValue" />
            <InputTarget v-if="showCounterEffortTarget && showCounterEffort"
              v-model:target="workoutWorkStep.phases.counterEffort.target" />
          </div>
        </div>
        <div class="flex flex-row justify-center mt-2">
          <Icon icon="fa-regular fa-comment" action size="small"
            v-tooltip.bottom="!showComment ? 'Ajouter une note' : 'Supprimer la note'" :active="showComment"
            @click="showComment = !showComment" />
        </div>
        <div v-if="showComment">
          <Textarea placeholder="Notes" fluid class="mt-2" autoResize rows="2" v-model="internalStep.comment" />
        </div>
      </template>
      <template v-else>
        <div class="w-full">
          <div class="font-bold text-sm mb-2 h-[20px] flex items-center justify-between">
            <div>Récupération</div>
            <Icon icon="fa-solid fa-crosshairs" action
              v-tooltip.bottom="showRecoveryTarget ? 'Supprimer la cible' : 'Ajouter une cible'"
              :active="showRecoveryTarget" @click="showRecoveryTarget = !showRecoveryTarget" />
          </div>
          <div class="flex flex-col gap-2">
            <InputMetric v-model:value="workoutRecoveryStep.phase.metricValue" />
            <InputTarget v-if="showRecoveryTarget" v-model:target="workoutRecoveryStep.phase.target" />
            <div class="flex flex-row justify-center">
              <Icon icon="fa-regular fa-comment" action size="small"
                v-tooltip.bottom="!showComment ? 'Ajouter une note' : 'Supprimer la note'" :active="showComment"
                @click="showComment = !showComment" />
            </div>
            <div v-if="showComment">
              <Textarea placeholder="Notes" fluid class="mt-2" autoResize rows="2" v-model="internalStep.comment" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </CardColor>
</template>

<script setup lang="ts">
import { createStepPhase, createWorkoutRecoveryStep, createWorkoutWorkStep } from '@/domain/factories/WorkoutFactory';
import { WorkoutRecoveryStep, WorkoutStep, WorkoutStepType, WorkoutWorkStep } from '@/domain/types/Workout';
import CardColor from '@/ui/components/card/CardColor.vue';
import Icon from '@/ui/components/Icon.vue';
import InputMetric from '@/ui/components/inputs/InputMetric.vue';
import InputTarget from '@/ui/components/inputs/InputTarget.vue';
import { Divider, InputNumber, Textarea, ToggleSwitch } from 'primevue';
import { computed, ref, watch } from 'vue';

interface Props {
  step: WorkoutStep,
}

const props = defineProps<Props>();

const stepTypeOptions: { type: WorkoutStepType, label: string }[] = [{
  type: "work",
  label: "Exercice",
}, {
  type: "recovery",
  label: "Récupération"
}];


const getStepWork = (step: WorkoutStep): WorkoutWorkStep => {
  if (step.type === 'work') return createWorkoutWorkStep({ ...step });
  return createWorkoutWorkStep();
}

const getStepRecovery = (step: WorkoutStep): WorkoutRecoveryStep => {
  if (step.type === 'recovery') return createWorkoutRecoveryStep({ ...step });
  return createWorkoutRecoveryStep();
}

const emit = defineEmits(["update:step"]);

const internalStep = ref(props.step);
const stepType = ref<WorkoutStepType>(props.step.type);
const workoutWorkStep = ref<WorkoutWorkStep>(getStepWork(props.step));
const workoutRecoveryStep = ref<WorkoutRecoveryStep>(getStepRecovery(props.step));

const showCounterEffort = ref(!!workoutWorkStep.value.phases.counterEffort);
const showEffortTarget = ref<boolean>(!!workoutWorkStep.value.phases.effort.target);
const showCounterEffortTarget = ref<boolean>(!!workoutWorkStep.value.phases.counterEffort?.target);
const showRecoveryTarget = ref(!!workoutRecoveryStep.value.phase.target);
const showComment = ref(!!props.step.comment);

const primaryBgColor = computed(() => {
  return stepType.value === 'work' ? 'bg-primary-500' : 'bg-amber-500'
});

const effortPhase = computed(() => {
  return workoutWorkStep.value.phases.effort;
})

const isStepTypeSelected = (value: string) => {
  return stepType.value == value;
}

watch(showCounterEffort, () => {
  workoutWorkStep.value = {
    ...workoutWorkStep.value,
    phases: {
      effort: effortPhase.value,
      counterEffort: showCounterEffort.value ? createStepPhase() : null,
    }
  }

  if (!showCounterEffort.value) {
    showCounterEffortTarget.value = false;
  }
});

watch(stepType, () => {
  if (stepType.value === 'work') {
    internalStep.value = workoutWorkStep.value;
  } else {
    internalStep.value = workoutRecoveryStep.value;
  }
})

watch(workoutWorkStep, () => {
  if (stepType.value === 'work') internalStep.value = workoutWorkStep.value;
}, { deep: true });

watch(workoutRecoveryStep, () => {
  if (stepType.value === 'recovery') internalStep.value = workoutRecoveryStep.value;
}, { deep: true });

watch(internalStep, () => {
  emit('update:step', internalStep.value);
}, { deep: true });
</script>