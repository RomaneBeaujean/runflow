<template>
  <Menu />
  <div id="content">
    <RouterView />
  </div>
</template>

<script setup>
import Menu from "@/components/Menu.vue";
</script>

<style lang="scss">
#content {
  flex: 1 1 auto;
  background: rgb(var(--swm-page-background));
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 16px;
}
</style>
