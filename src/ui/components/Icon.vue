<template>
  <div :class="[
    'icon-wrapper',
    `icon-${size}`,
    `text-${color}`,
    { 'icon-action': action },
    { 'active': active }
  ]">
    <i :class="icon" />
  </div>
</template>

<script setup lang="ts">


const props = defineProps<{
  icon?: string;
  color?: string;
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge";
  action?: boolean;
  active?: boolean;
}>();

</script>

<style scoped lang="scss">
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  i {
    color: inherit;
    line-height: 1;
    display: block;
  }

  &.icon-xsmall {
    width: 16px;
    height: 16px;

    i {
      font-size: 12px;
    }
  }

  &.icon-small {
    width: 20px;
    height: 20px;

    i {
      font-size: 14px;
    }
  }

  &.icon-medium {
    width: 24px;
    height: 24px;

    i {
      font-size: 18px;
    }
  }

  &.icon-large {
    width: 32px;
    height: 32px;

    i {
      font-size: 24px;
    }
  }

  &.icon-action {
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: var(--color-neutral-200);
    }

    &.active,
    &:active {
      background-color: var(--color-neutral-300);
    }
  }
}
</style>