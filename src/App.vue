<template>
  <div id="menu">
    <MainMenu />
  </div>
  <div id="content">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import MainMenu from '@/components/MainMenu.vue';
</script>

<style lang="scss">
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

#menu {
  flex: 0 0 auto;
}

#content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}
</style>
