<template>
  <div class="p-4">
    <h2>Plans de course</h2>
    <Button label="Nouveau plan" @click="addRace" />
    <DataTable :value="races" @row-click="openRace">
      <Column field="name" header="Nom" />
      <Column field="createdAt" header="Créé le" />
    </DataTable>
  </div>
</template>

<script setup>
import { useRaceStore } from '@/stores/raceStore'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { useRouter } from 'vue-router'

const raceStore = useRaceStore()
const races = raceStore.races
const router = useRouter()

// function addRace() {
//   const race = raceStore.addRace('Nouveau plan de course')
//   router.push(`/races/${race.id}`)
// }

function openRace({ data }) {
  router.push(`/races/${data.id}`)
}
</script>
