<template>
  <div class="p-4">
    <h2>Parcours GPX</h2>
    
    <Button label="Importer un GPX" icon="pi pi-upload" @click="onImport" class="mb-3" />

    <DataTable :value="gpxFiles" stripedRows>
      <Column field="name" header="Nom" />
      <Column field="createdAt" header="Importé le" />
    </DataTable>
  </div>
</template>

<script setup>
import { useGpxStore } from '@/stores/gpxStore';
import { Button } from 'primevue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const { gpxFiles, addGpxFile } = useGpxStore();

function onImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.gpx'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    addGpxFile(file.name, text)
  }
  
  input.click();
}

</script>
