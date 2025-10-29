<template>
  <div id="recap" class="inline-flex flex-col items-center"></div>
</template>

<script setup lang="ts">
export interface RecapParams {
  param: boolean;
}

const props = defineProps<{
  params: RecapParams;
}>();
</script>

<style scoped lang="scss">
#recap {
  background: white;
  padding: 8px;
  font-size: 12px;
}

.table {
  display: table;
  border-collapse: collapse;
  table-layout: auto;
  border-collapse: collapse;
  width: max-content; /* optionnel, et très utile */
}

.header {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
}

.row {
  display: table-row;
}

.cell {
  display: table-cell;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
  font-size: 14px;
}

.xsmall {
  font-size: 10px;
}
</style>
