<template>
  <div :class="[
    'icon-wrapper',
    `icon-${size}`,
    { 'icon-action': action }
  ]">
    <i :class="icon" />
  </div>
</template>

<script setup lang="ts">


const props = defineProps<{
  icon?: string;
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge";
  action?: boolean;
}>();

</script>

<style scoped lang="scss">
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Tailles d'icône
  &.icon-xsmall {
    width: 16px;
    height: 16px;

    >i {
      font-size: 0.75rem;
    }
  }

  &.icon-small {
    width: 20px;
    height: 20px;

    >i {
      font-size: 1rem;
    }
  }

  &.icon-medium {
    width: 24px;
    height: 24px;

    >i {
      font-size: 1.25rem;
    }
  }

  &.icon-large {
    width: 32px;
    height: 32px;

    >i {
      font-size: 1.5rem;
    }
  }

  &.icon-xlarge {
    width: 40px;
    height: 40px;

    >i {
      font-size: 2rem;
    }
  }

  // Mode action (interactif)
  &.icon-action {
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}
</style>