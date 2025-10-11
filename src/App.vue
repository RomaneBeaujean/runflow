<template>
  <MainMenu />
  <div id="content">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import MainMenu from './components/menus/MainMenu.vue';
</script>

<style lang="scss">
#content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 16px;
}
</style>
