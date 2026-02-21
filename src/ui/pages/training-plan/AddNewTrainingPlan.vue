<template>
  <div>
    <Button label="Ajouter un plan d'entrainement" icon="pi pi-plus" rounded @click="dialogOpened = true" />

    <Dialog v-model:visible="dialogOpened" modal :style="{ width: '30vw' }"
      :breakpoints="{ '1199px': '50vw', '575px': '90vw' }">
      <template #header>
        <span class="font-bold">Ajouter un plan d'entrainement</span>
      </template>
      <div>
        <div class="flex flex-col gap-2">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-semibold">Nom du plan d'entrainement</label>
            <InputText v-model="trainingPlanName" :invalid="isNameExist" />
          </div>
          <Message v-if="isNameExist" severity="error" variant="simple">
            Ce nom de plan d'entrainement existe déjà. Veuillez en choisir un autre.
          </Message>
        </div>
        <Divider />

        <div class="flex gap-2">
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-semibold">Durée (semaines)</label>
            <InputNumber id="weeks" v-model="numberOfWeeks" :min="1" showButtons />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="font-semibold">Description <span class="font-normal text-gray-500">(facultatif)</span></label>
            <Textarea v-model="description" />
          </div>

        </div>

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
import { Button, Dialog, Divider, InputNumber, InputText, Message, Textarea } from 'primevue';
import { computed, ref } from 'vue';

const dialogOpened = ref<boolean>(false);
const trainingPlanName = ref<string | null>(null);
const description = ref(null);
const numberOfWeeks = ref<number>(12);
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
  const id = await createTrainingPlan({ name: trainingPlanName.value, description: description.value }, numberOfWeeks.value);
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
