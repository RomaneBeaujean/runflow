<template>
  <CardColor color="bg-amber-400">
    <div class="flex flex-col">
      <div class="font-semibold text-amber-800 flex justify-center">
        Echauffement
      </div>
      <Divider />
      <div class="flex flex-col items-center gap-1">
        <div>
          <ColorTag :icon="step.phase.metricValue.metric.icon" color="amber">
            <span class="flex gap-1">
              <span>{{ step.phase.metricValue.value }}</span>
              <span>{{ step.phase.metricValue.unit }}</span>
            </span>
          </ColorTag>
        </div>
        <div>
          <MetricTargetTag v-if="step.phase.target" :target="step.phase.target" />
        </div>
      </div>
    </div>
    <template v-if="step.comment">
      <Divider />
      <div class="p-2 pt-0 text-gray-700">
        <span>
          <Icon icon="fa-regular fa-comment" size="small" />
        </span>
        {{ step.comment }}
      </div>
    </template>
  </CardColor>
</template>

<script setup lang="ts">
import type { WorkoutWarmupStep } from '@/domain/types/workout/Workout';
import CardColor from '@/ui/components/card/CardColor.vue';
import Icon from '@/ui/components/Icon.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import MetricTargetTag from '@/ui/components/tags/MetricTargetTag.vue';
import { Divider } from 'primevue';

const props = defineProps<{
  step: WorkoutWarmupStep
}>();
</script>