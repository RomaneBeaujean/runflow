<template>
  <ColorTag :icon="icon" :color="color">
    {{ label }}
  </ColorTag>
</template>

<script setup lang="ts">
import { ZONES_FC } from '@/domain/constants/zones';
import { PhaseTarget } from '@/domain/types/Workout';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { computed } from 'vue';

const props = defineProps<{ target?: PhaseTarget }>();

const icon = computed(() => {
  return props.target.type === 'pace' ? 'pi pi-bolt' : 'fa-solid fa-heart-pulse';
});

const label = computed(() => {
  if (props.target.type === 'zone') {
    const zone = getZone(props.target.value);
    return `${zone.zone} (${zone.fc})`
  }
  return `${props.target.value} min/km`
});

const color = computed(() => {
  if (props.target.type === 'zone') {
    const zone = getZone(props.target.value);
    return zone.color;
  }
  return 'neutral';
})

const getZone = (value: string) => {
  return ZONES_FC.find((el) => el.zone == value);
}
</script>

<style lang="scss" scoped></style>
