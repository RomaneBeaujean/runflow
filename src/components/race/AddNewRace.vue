<template>
  <div>
    <Button
      label="Ajouter un plan de course"
      icon="pi pi-plus"
      rounded
      @click="visible = true"
    />

    <Dialog v-model:visible="visible" modal class="md:w-4xl max-w-[90%]">
      <template #header>
        <span class="font-bold">Ajouter un plan de course</span>
      </template>
      <div class="max-w-full">
        <Stepper :value="currentStep" :linear="gpxFile == null">
          <!-- STEP 1 : Upload GPX -->
          <StepItem value="1">
            <Step>Importer un fichier GPX</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div class="flex flex-col gap-4 w-full max-w-ful">
                <GpxDropzone @select="addFile" @remove="removeFile" />
              </div>
            </StepPanel>
          </StepItem>

          <!-- STEP 2 : Formulaire -->
          <StepItem value="2">
            <Step>Détails de la course</Step>
            <StepPanel v-slot="{ activateCallback }">
              <div
                class="flex flex-1 flex-col"
                v-show="gpxFile && gpxFile.content !== null"
              >
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">
                    Nom du plan de course
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

                <Divider />

                <div class="flex flex-col gap-2">
                  <div class="font-semibold text-primary-700">Objectifs</div>
                  <div class="flex flex-1">
                    <div class="flex flex-1 text-sm font-medium text-gray-700">
                      Allure moyenne
                    </div>
                    <div class="flex flex-1 text-sm font-medium text-gray-700">
                      Temps total
                    </div>
                  </div>

                  <div class="flex flex-1">
                    <InputPaceDuration
                      size="default"
                      :pace="pace"
                      :distance="totalDistance || 0"
                      @update="(newPace) => (pace = newPace.pace)"
                    ></InputPaceDuration>
                  </div>

                  <Divider />

                  <div class="flex items-center gap-2">
                    <Checkbox
                      v-model="automaticSeparators"
                      inputId="automatic_separators"
                      name="generateGpxOptions"
                      value="automatic"
                    />
                    <label for="automatic_separators" class="text-sm">
                      Détecter automatiquement les segments (montées/descentes)
                    </label>
                  </div>
                </div>
              </div>
            </StepPanel>
          </StepItem>
        </Stepper>
      </div>
      <template #footer>
        <Button label="Fermer" text severity="secondary" @click="close" />
        <Button
          label="Créer le plan de course"
          variant="outlined"
          @click="createCourse"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ClimbDetector } from '@/lib/gpx/ClimbDetector';
import { GpxParse } from '@/lib/gpx/GpxParse';
import { useInjection } from '@/lib/useInjection';
import { roundOneNumber } from '@/lib/utils';
import type { AppStores } from '@/stores/AppLoader';
import { Separator } from '@/types/entities/Separator';
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  Divider,
  InputText,
  Step,
  StepItem,
  StepPanel,
  Stepper,
} from 'primevue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import GpxDropzone from '../GpxDropzone.vue';
import InputPaceDuration from './inputs/InputPaceDuration.vue';
import InputTime from './inputs/InputTime.vue';

const currentStep = ref('1');
const visible = ref<boolean>(false);
const stores = useInjection<AppStores>('stores');
const router = useRouter();
const gpxFile = ref<{ content: string; name: string }>(null);
const raceName = ref<string | null>(null);
const raceDate = ref<Date | null>(null);
const startTime = ref<Date | null>(null);
const automaticSeparators = ref<string>(null);
const pace = ref<string>(null);

const removeFile = () => {
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  automaticSeparators.value = null;
  pace.value = null;
};

const addFile = async (file: File) => {
  const content = await file.text();
  const name = file.name;
  gpxFile.value = { content, name };

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
  visible.value = false;
  raceName.value = null;
  gpxFile.value = null;
  raceDate.value = null;
  startTime.value = null;
  automaticSeparators.value = null;
  pace.value = null;
}

async function createCourse() {
  if (!gpxFile.value || !raceName.value) return;

  const gpxParser = new GpxParse(gpxFile.value.content);

  const transitions =
    automaticSeparators.value == 'automatic'
      ? new ClimbDetector(gpxFile.value.content).separators
      : [roundOneNumber(gpxParser.totalDistance)];

  if (!transitions.includes(gpxParser.totalDistance)) {
    transitions.push(gpxParser.totalDistance);
  }

  const splits = [];

  transitions.forEach((distance: number, index: number) => {
    const startDistance = index === 0 ? 0 : splits[index - 1].endDistance;
    const endDistance = distance;
    const splitPace = pace.value || '06:30';
    splits.push({ startDistance, endDistance, pace: splitPace });
  });

  const separators = splits
    .map((el) => el.endDistance)
    .map((it) => new Separator({ distance: it }));

  const id = await stores.races.addRace({
    name: raceName.value,
    gpxContent: gpxFile.value.content,
    date: raceDate.value,
    startTime: startTime.value,
    splits,
    separators,
  });

  goToCourse(id);
}

function goToCourse(id: string) {
  router.push(`/races/${id}`);
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
