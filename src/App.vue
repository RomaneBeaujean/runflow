<template>
  <div id="menu">
    <MainMenu />
  </div>
  <div id="content">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import MainMenu from './components/menus/MainMenu.vue';
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
  padding: 16px;
  flex: 1 1 auto;
  overflow: auto;
}
</style>
