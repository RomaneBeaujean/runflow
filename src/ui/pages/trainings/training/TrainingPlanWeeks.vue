<template>
  <div class="mx-auto">
    <div class="overflow-x-auto">
      <div class="min-w-max">
        <!-- En-tête des jours -->
        <div class="grid grid-cols-8 gap-2 mb-2">
          <div class="font-semibold text-gray-700 text-center py-3"></div>
          <div
            v-for="(day, index) in daysOfWeek"
            :key="index"
            class="font-semibold text-gray-700 text-center py-3"
          >
            {{ day }}
          </div>
          <div></div>
        </div>

        <!-- Lignes des semaines -->
        <div
          v-for="week in trainingWeeks"
          :key="week.id"
          class="grid grid-cols-8 gap-2 mb-2 group"
        >
          <div
            class="flex items-center justify-center font-medium text-gray-700"
          >
            <div class="relative h-[24px]">
              Semaine {{ week.week_number }}

              <div
                class="absolute left-[100%] top-0"
                v-if="week.week_number > 1"
              >
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  size="small"
                  @click="deleteWeek(week.week_number)"
                />
              </div>
            </div>
          </div>

          <div
            v-for="day in week.training_days"
            :key="day.day_number"
            class="min-h-24 cursor-pointer rounded-sm"
          >
            <Textarea
              class="w-full h-full text-center resize-none border-0 focus:ring-0"
              v-model="day.training"
              @input="
                (e) =>
                  updateDay(day.day_number, week.week_number, e.target.value)
              "
            >
            </Textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center p-4">
      <Button
        label="Ajouter une semaine"
        @click="addNewWeek"
        icon="pi pi-plus"
      />
    </div>
  </div>
</template>

<script setup>
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { Button, Textarea } from 'primevue';

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const { trainingWeeks, updateDay, addNewWeek, deleteWeek } = useTrainingPlan();
</script>

<style scoped>
/* Styles supplémentaires si nécessaire */
.p-card {
  border-radius: 12px;
}

/* Personnalisation du Textarea pour qu'il remplisse toute la cellule */
:deep(.p-inputtextarea) {
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
