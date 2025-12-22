<template>
  <FileUpload
    name="gpx[]"
    accept=".gpx"
    ref="fileUploadRef"
    :multiple="false"
    :customUpload="true"
    @select="onSelect"
    @upload="onUpload"
    @clear="onClear"
    @remove="onRemove"
    class="w-full"
  >
    <template #header="{ files, chooseCallback }">
      <template v-if="files?.length == 0">
        <div
          class="flex flex-col items-center justify-center gap-3 border-2 border-dashed p-8 rounded-xl cursor-pointer transition-colors w-full"
          :class="{
            'border-primary bg-primary-50': dragActive,
            'border-surface-300 bg-surface-50 dark:bg-surface-900': !dragActive,
          }"
          @click="chooseCallback()"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="handleDrop"
        >
          <i class="pi pi-upload text-4xl text-surface-400"></i>
          <p class="m-0 font-medium text-center">
            Déposez votre fichier GPX ici
          </p>
          <p class="text-sm text-surface-500 -mt-2">ou</p>

          <Button
            label="Choisir un fichier"
            icon="pi pi-file-import"
            @click.stop="chooseCallback()"
          />
        </div>
      </template>
      <template v-else>
        <div
          class="flex flex-col items-center justify-center gap-3 w-full h-full"
        >
          <div class="text-sm mb-2 font-medium">Fichier sélectionné :</div>
          <ColorTag color="neutral">
            <div class="max-w-[250px] min-w-0 truncate">
              {{ files[0].name }}
            </div>
            <button
              type="button"
              class="m-1 text-grey-600 hover:text-grey-900 font-bold cursor-pointer"
              @click="removeFile(files[0], $event)"
            >
              ×
            </button>
          </ColorTag>
        </div>
      </template>
    </template>
    <template #content="{ files }">
      <div></div>
    </template>
  </FileUpload>
</template>

<script setup lang="ts">
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import { ref } from 'vue';

const fileUploadRef = ref();
const dragActive = ref(false);

const emit = defineEmits(['select', 'upload', 'clear', 'remove']);

function handleDrop(event: DragEvent) {
  dragActive.value = false;

  if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;

  const file = event.dataTransfer.files[0];

  onSelect({ files: [file] });
}

function onSelect(event: any) {
  const newFile = event.files[event.files.length - 1];

  if (event.files.length > 1) {
    const oldFile = fileUploadRef.value.files[0];
    fileUploadRef.value.remove(event, oldFile);
  }

  fileUploadRef.value.files = [newFile];

  emit('select', newFile);
}

function onUpload(event: any) {
  emit('upload', event);
}

function onClear() {
  emit('clear');
}

function onRemove(event: any) {
  emit('remove', event.file);
}

function removeFile(file: any, event: Event) {
  event.stopPropagation();
  fileUploadRef.value.remove(event, file);
  emit('remove', file);
}
</script>

<style scoped></style>
