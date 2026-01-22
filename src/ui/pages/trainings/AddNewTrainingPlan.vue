<template>
  <div>
    <Button label="Ajouter un plan d'entrainement" icon="pi pi-plus" rounded @click="dialogOpened = true" />

    <Dialog v-model:visible="dialogOpened" modal :style="{ width: '30vw' }"
      :breakpoints="{ '1199px': '50vw', '575px': '90vw' }">
      <template #header>
        <span class="font-bold">Ajouter un plan d'entrainement</span>
      </template>
      <div class="flex flex-col gap-2">
        <FloatLabel variant="in">
          <InputText id="name" v-model="trainingPlanName" :invalid="isNameExist" />
          <label for="name">Nom du plan d'entrainement</label>
        </FloatLabel>
        <Message v-if="isNameExist" severity="error" variant="simple">
          Ce nom de plan d'entrainement existe déjà. Veuillez en choisir un autre.
        </Message>
      </div>
      <template #footer>
        <Button label="Fermer" text severity="secondary" @click="close" />
        <Button label="Créer" :disabled="isButtonDisabled" @click="handleCreateTrainingPlan" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useTrainingPlans } from '@/ui/composables/useTrainingPlans';
import { Button, Dialog, FloatLabel, InputText, Message } from 'primevue';
import { computed, ref } from 'vue';

const dialogOpened = ref<boolean>(false);
const trainingPlanName = ref<string | null>(null);
const startDate = ref<Date | null>(null);
const { isTrainingPlanNameExist, navigateToTrainingPlan, createTrainingPlan } = useTrainingPlans();

const isNameExist = computed(() => {
  return isTrainingPlanNameExist(trainingPlanName.value)
});

const isButtonDisabled = computed(() => {
  return isNameExist.value || !trainingPlanName.value
})

const close = () => {
  dialogOpened.value = false;
  trainingPlanName.value = null;
  startDate.value = null;
}

const handleCreateTrainingPlan = async () => {
  const id = await createTrainingPlan(trainingPlanName.value);
  navigateToTrainingPlan(id);
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
