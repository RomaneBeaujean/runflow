<template>
  <div :class="drawerClasses" ref="drawerElement" :id="id">
    <div class="drawer-backdrop" v-if="overlay" @click="closeDrawer"></div>
    <div class="drawer-content-holder">
      <div class="drawer-content">

        <!-- HEADER -->
        <div class="drawer-header">
          <slot name="header" />
          <div v-if="showCloseButton" class="absolute right-[4px] top-[4px]">
            <Button icon="pi pi-times" size="small" text @click="closeDrawer" />
          </div>
        </div>

        <!-- CONTENT (scroll) -->
        <div class="drawer-body">
          <slot />
        </div>


        <!-- FOOTER -->
        <div class="drawer-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue';
import { computed } from 'vue';

const emit = defineEmits<{
  'update:opened': [value: boolean];
}>();

const props = withDefaults(
  defineProps<{
    id?: string;
    opened?: boolean;
    overlay?: boolean;
    position?: string;
    showCloseButton?: boolean;
  }>(),
  {
    id: null,
    opened: false,
    overlay: false,
    position: 'right',
    showCloseButton: false,
  }
);

const drawerClasses = computed(() => {
  return [
    'drawer',
    props.opened ? 'opened' : 'closed',
    props.position,
    props.overlay ? 'overlay' : '',
    !props.overlay && props.position === 'right' ? 'border-l border-l-gray-200' : ''
  ].join(' ');
});

const closeDrawer = () => {
  emit('update:opened', false);
};
</script>

<style scoped lang="scss">
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* HEADER */
.drawer-header {
  flex-shrink: 0;
  position: relative;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;

  &:empty {
    display: none;
  }
}

/* CONTENT SCROLLABLE */
.drawer-body {
  flex: 1;
  min-height: 0;
  /* CRUCIAL */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
}

/* FOOTER */
.drawer-footer {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;

  &:empty {
    display: none;
  }
}

/* OVERLAY */
.drawer.overlay {
  position: absolute;
  inset: 0;

  .drawer-backdrop {
    z-index: 99;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: black;
    opacity: 0.2;
  }

  .drawer-content-holder {
    min-width: 350px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: white;
    z-index: 100;
  }
}

/* NOT OVERLAY */
.drawer:not(.overlay) {
  .drawer-content-holder {
    height: 100%;
  }
}

.drawer.closed {
  display: none;
}
</style>
