<template>
  <Card class="flex-1 hover:cursor-pointer" @click="nevigateToTrainingPlan(trainingPlan.id)">
    <template #title>
      <div class="full-w">
        <div class="overflow-hidden text-ellipsis whitespace-nowrap">
          {{ trainingPlan.name }}
        </div>
      </div>
    </template>
    <template #content>
      <div class="full-w full-h relative">
        <div class="absolute bottom-0 right-0 flex gap-2">
          <Button text severity="secondary" size="small" icon="pi pi-trash" aria-label="Delete"
            @click.capture.stop="deleteTrainingPlan(trainingPlan.id)" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div>
          <ColorTag color="amber">
            {{ trainingPlanDuration }} semaines
          </ColorTag>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { TrainingPlan } from '@/domain/types/TrainingPlan';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useStores } from '@/ui/composables/useStores';
import { Button, Card } from 'primevue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const stores = useStores();
const props = defineProps<{ trainingPlan: TrainingPlan }>();
const router = useRouter();
const { deleteById } = stores.training_plans_store;

const trainingPlanDuration = computed(() => {
  return props.trainingPlan.weeks.length;
})

function nevigateToTrainingPlan(id: string) {
  router.push(`/trainings/${id}`);
}

function deleteTrainingPlan(id: string) {
  deleteById(id);
}
</script>

<style scoped lang="scss"></style>
