<template>
  <Toolbar class="p-3">
    <template #start>
      <Button label="Parcours" icon="pi pi-map" @click="$router.push('/tracks')" text />
      <Button label="Plans de course" icon="pi pi-list" @click="$router.push('/races')" text />
    </template>
  </Toolbar>
</template>

<script setup>
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
</script>
