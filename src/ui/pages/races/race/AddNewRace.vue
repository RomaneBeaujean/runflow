<template>
  <div>
    <Button
      label="Ajouter un plan de course"
      icon="pi pi-plus"
      rounded
      @click="dialogOpened = true"
    />

    <Dialog v-model:visible="dialogOpened" modal>
      <template #header>
        <span class="font-bold">Ajouter un plan de course</span>
      </template>
      <div class="md:w-[700px] w-[85vw]">
        <Stepper v-model:value="currentStep" :linear="gpxFile == null">
          <!-- STEP 1 : Upload GPX -->
          <StepItem value="1">
            <Step>Importer un fichier GPX</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col gap-4">
                <GpxDropzone @select="addFile" @remove="removeFile" />
                <div class="flex justify-center">
                  <Button
                    label="Suivant"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    :disabled="!gpxFile"
                    @click="activateCallback('2')"
                  />
                </div>
              </div>
            </StepPanel>
          </StepItem>

          <!-- STEP 2 : Formulaire -->
          <StepItem value="2">
            <Step>Informations sur la course</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div
                class="flex flex-1 flex-col"
                v-show="gpxFile && gpxFile.content !== null"
              >
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">
                    Nom du plan de course *
                  </label>
                  <InputText
                    v-model="raceName"
                    type="text"
                    placeholder="Nom"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-1 gap-2 mt-2">
                  <div class="flex-1">
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                      Date de la course
                    </label>
                    <DatePicker
                      v-model="raceDate"
                      dateFormat="dd/mm/yy"
                      showIcon
                      placeholder="Date"
                      :showTime="false"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block mb-2 text-sm font-medium text-gray-700">
                      Heure de départ
                    </label>
                    <InputTime
                      :time="startTime"
                      @update="({ time }) => (startTime = time)"
                    />
                  </div>
                </div>
              </div>
              <div class="mt-8 flex justify-center">
                <Button
                  label="Suivant"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  :disabled="raceName?.length < 1"
                  @click="activateCallback('3')"
                />
              </div>
            </StepPanel>
          </StepItem>

          <StepItem value="3">
            <Step>Objectifs et temps de course</Step>
            <StepPanel>
              <div v-if="parsedFile">
                <PaceSimulator
                  :parsedFile="parsedFile"
                  v-model="splits"
                  onlyAveragePace
                />
              </div>
            </StepPanel>
          </StepItem>
        </Stepper>
      </div>
      <template #footer>
        <Button label="Fermer" text severity="secondary" @click="close" />
        <Button
          label="Créer le plan de course"
          :disabled="gpxFile == null || raceName == '' || !section3Opened"
          @click="createCourse"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { roundOneNumber } from '@/domain/helpers/RoundNumbers.helper';
import { GpxParse } from '@/domain/services/GpxParse';
import { Separator } from '@/domain/types/Separator';
import { Split } from '@/domain/types/Split';
import GpxDropzone from '@/ui/components/inputs/GpxDropzone.vue';
import InputTime from '@/ui/components/inputs/InputTime.vue';
import { useStores } from '@/ui/composables/useStores';
import {
  Button,
  DatePicker,
  Dialog,
  InputText,
  Step,
  StepItem,
  StepPanel,
  Stepper,
} from 'primevue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PaceSimulator from './PaceSimulator.vue';

const currentStep = ref('1');
const dialogOpened = ref<boolean>(false);
const stores = useStores();
const router = useRouter();
const gpxFile = ref<{ content: string; name: string }>(null);
const parsedFile = ref();
const raceName = ref<string | null>(null);
const raceDate = ref<Date | null>(null);
const startTime = ref<Date | null>(null);
const splits = ref<Split[]>([]);
const section3Opened = ref(false);

const removeFile = () => {
  currentStep.value = '1';
  section3Opened.value = false;
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  parsedFile.value = null;
};

const addFile = async (file: File) => {
  const content = await file.text();
  const name = file.name;
  gpxFile.value = { content, name };
  parsedFile.value = new GpxParse(content);

  if (raceName.value === '' || raceName.value === null) {
    raceName.value = name;
  }

  currentStep.value = '2';
};

const totalDistance = computed(() => {
  if (!gpxFile.value) return;
  const parser = new GpxParse(gpxFile.value.content);
  return parser.totalDistance;
});

function close() {
  dialogOpened.value = false;
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  currentStep.value = '1';
}

async function createCourse() {
  if (!gpxFile.value || !raceName.value) return;

  const separators = splits.value
    .map((el) => el.endDistance)
    .filter((el) => roundOneNumber(el) !== roundOneNumber(totalDistance.value))
    .map((it) => new Separator({ distance: it }));

  const id = await stores.races_store.create({
    name: raceName.value,
    gpxContent: gpxFile.value.content,
    date: raceDate.value,
    startTime: startTime.value,
    splits: splits.value,
    separators,
  });

  goToCourse(id);
}

function goToCourse(id: string) {
  router.push(`/races/${id}`);
}

watch([currentStep], () => {
  if (currentStep.value === '3') section3Opened.value = true;
});
</script>

<style lang="scss" scoped>
:deep(.p-datepicker),
:deep(.p-datepicker-input),
:deep(input) {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
