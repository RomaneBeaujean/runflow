<template>
  <InputGroup>
    <InputGroupAddon>
      <div class="flex gap-1 items-center">
        <div v-for="target in targetTypes" class="flex items-center cursor-pointer"
          @click="selectedTargetType = target.type">
          <Icon :icon="target.icon" size="xsmall"
            :color="selectedTargetType == target.type ? 'primary-900' : 'gray-200'" />
        </div>
      </div>
    </InputGroupAddon>

    <InputMask v-show="selectedTargetType === 'pace'" v-model="paceValue" mask="99:99" :placeholder="placeholder" />
    <SelectZone v-show="selectedTargetType === 'zone'" v-model:selected="zoneValue" :placeholder="placeholder" showClear
      class="w-[160px]" />

    <InputGroupAddon v-if="selectedTargetType === 'pace'">
      <div class="flex gap-1 items-center">
        <div class="text-xs">min/km</div>
      </div>
    </InputGroupAddon>

  </InputGroup>
</template>

<script setup lang="ts">
import { Pace } from '@/domain/types/Pace';
import { PhaseTarget, PhaseTargetType } from '@/domain/types/Workout';
import { Zone } from '@/domain/types/Zone';
import SelectZone from '@/ui/components/inputs/SelectZone.vue';
import { InputGroup, InputGroupAddon, InputMask } from 'primevue';
import { computed, ref, watch } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ target?: PhaseTarget }>();

const initialZoneValue = computed(() => {
  return props.target?.type === 'zone' && props.target.value?.length > 0 ? props.target.value : null;
})

const initialPaceValue = computed(() => {
  return props.target?.type === 'pace' && props.target.value?.length > 0 ? props.target.value : null;
})

const targetTypes: { type: PhaseTargetType, label: string, icon: string }[] = [
  { type: "zone", label: "Zone", icon: "fa-solid fa-heart-pulse" },
  { type: "pace", label: "Allure", icon: "pi pi-bolt" },
]
const selectedTargetType = ref<PhaseTargetType>(props.target?.type || 'zone');
const paceValue = ref<Pace>(initialPaceValue.value);
const zoneValue = ref<Zone>(initialZoneValue.value);
const targetValue = ref<Pace | Zone>(props.target?.value || null)

const emit = defineEmits(['update:target']);

const placeholder = computed(() => {
  if (selectedTargetType.value === 'pace') return 'Allure cible';
  else return 'Zone FC cible'
})

watch(zoneValue, () => {
  if (selectedTargetType.value === 'zone') {
    targetValue.value = zoneValue.value;
  }
})

watch(paceValue, () => {
  if (selectedTargetType.value === 'pace') {
    targetValue.value = paceValue.value;
  }
})

watch([selectedTargetType, targetValue], () => {
  emit('update:target', { type: selectedTargetType.value, value: targetValue.value });
})
</script>

<style lang="scss" scoped></style>
