<template>
  <div>
    <Button
      label="Ajouter un plan d'entrainement"
      icon="pi pi-plus"
      rounded
      @click="dialogOpened = true"
    />

    <Dialog v-model:visible="dialogOpened" modal>
      <template #header>
        <span class="font-bold">Ajouter un plan d'entrainement</span>
      </template>
      <div class="md:w-[700px] w-[85vw]">
        <InputText
          v-model="trainingPlanName"
          placeholder="Nom du plan d'entrainement"
        />
      </div>
      <template #footer>
        <Button label="Fermer" text severity="secondary" @click="close" />
        <Button
          label="Créer le plan d'entrainement"
          :disabled="!trainingPlanName"
          @click="createTrainingPlan"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useStores } from '@/ui/composables/useStores';
import { Button, Dialog, InputText } from 'primevue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const dialogOpened = ref<boolean>(false);
const stores = useStores();
const router = useRouter();
const trainingPlanName = ref<string | null>(null);
const startDate = ref<Date | null>(null);

function close() {
  dialogOpened.value = false;
  trainingPlanName.value = null;
  startDate.value = null;
}

async function createTrainingPlan() {
  if (!trainingPlanName.value) return;

  const id = await stores.training_plans_store.create({
    name: trainingPlanName.value,
    startDate: startDate.value,
  });

  navigateToTrainingPlan(id);
}

function navigateToTrainingPlan(id: string) {
  router.push(`/trainings/${id}`);
}
</script>

<style lang="scss" scoped>
:deep(.p-datepicker),
:deep(.p-datepicker-input),
:deep(input) {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
