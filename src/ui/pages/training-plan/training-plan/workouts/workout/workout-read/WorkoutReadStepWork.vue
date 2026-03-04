<template>
  <CardColor color="bg-primary-500">
    <div class="flex gap-2 items-center justify-center">
      <div class="font-semibold text-primary-900">
        Exercice
      </div>
      <ColorTag color="primary" icon="fa-solid fa-repeat">
        <span> Répéter {{ step.repeat }} fois</span>
      </ColorTag>
    </div>

    <Divider />

    <div class="flex flex-row justify-between">
      <div class="flex-1 flex flex-col items-center gap-2">
        <div class="font-semibold">Effort</div>
        <div class="flex gap-1 flex-col items-center">
          <div>
            <ColorTag :icon="step.phases.effort.metricValue.metric.icon" color="orange">
              <span class="flex gap-1">
                <span>{{ step.phases.effort.metricValue.value }}</span>
                <span>{{ step.phases.effort.metricValue.unit }}</span>
              </span>
            </ColorTag>
          </div>
          <div>
            <MetricTargetTag v-if="step.phases.effort.target" :target="step.phases.effort.target" />
          </div>
        </div>
      </div>
      <template v-if="step.phases.effort.metricValue">
        <Divider layout="vertical" />
        <div class="flex-1 flex flex-col items-center gap-2">
          <div class="font-semibold">Contre-effort</div>
          <div class="flex gap-1 flex-col items-center">
            <div>
              <ColorTag :icon="step.phases.counterEffort.metricValue.metric.icon" color="green">
                <span class="flex gap-1">
                  <span>{{ step.phases.counterEffort.metricValue.value }}</span>
                  <span>{{ step.phases.counterEffort.metricValue.unit }}</span>
                </span>
              </ColorTag>
            </div>
            <div>
              <MetricTargetTag v-if="step.phases.counterEffort.target" :target="step.phases.counterEffort.target" />
            </div>
          </div>
        </div>
      </template>
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
import type { RunWorkoutWorkStep } from '@/domain/types/workout/Workout';
import CardColor from '@/ui/components/card/CardColor.vue';
import Icon from '@/ui/components/Icon.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import MetricTargetTag from '@/ui/components/tags/MetricTargetTag.vue';
import { Divider } from 'primevue';

const props = defineProps<{
  step: RunWorkoutWorkStep
}>();
</script>