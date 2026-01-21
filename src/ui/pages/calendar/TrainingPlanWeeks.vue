<!-- <template>
  <div class="mx-auto">
    <div class="overflow-x-auto">
      <div class="min-w-max">
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

        <div
          v-for="week in weeks"
          :key="week.id"
          class="grid grid-cols-8 gap-2 mb-2 group"
        >
          <div
            class="flex items-center justify-center font-medium text-gray-700"
          >
            <div class="relative h-[24px]">
              Semaine {{ week.weekNumber }}

              <div
                class="absolute left-[100%] top-0"
                v-if="week.weekNumber > 1"
              >
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  size="small"
                  @click="deleteWeek(week.weekNumber)"
                />
              </div>
            </div>
          </div>

          <div
            v-for="day in week.days"
            :key="day.dayOfWeek"
            class="min-h-24 cursor-pointer rounded-sm"
          >
            <Textarea
              class="w-full h-full text-center resize-none border-0 focus:ring-0"
              v-model="day.training"
              @input="
                (e) => updateDay(day.dayOfWeek, week.weekNumber, e.target.value)
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

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const { weeks, updateDay, addNewWeek, deleteWeek } = useTrainingPlan();
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
</style> -->
