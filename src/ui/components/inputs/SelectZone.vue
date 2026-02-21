<template>
  <Select v-model="selectedItem" :options="options" :inputId="inputId" optionLabel="label" :placeholder="placeholder"
    :size="size" class="w-full" ref="selectRef">
    <!-- Valeur sélectionnée -->
    <template #value="slotProps">
      <div v-if="!!slotProps.value" class="flex items-center gap-3">
        <ColorTag :color="slotProps.value.color">
          <div>
            <span class="text-sm font-semibold">{{ slotProps.value.label }}</span>
            <span class="text-xs  ml-1">({{ slotProps.value.fc.replace(/ bpm/g, '') }})</span>
          </div>
          <template #right>
            <Icon size="xsmall" icon="pi pi-times" @click.stop="selectedValue = null" />
          </template>
        </ColorTag>
      </div>
      <div v-else class="min-h-[21px]">
        {{ placeholder }}
      </div>
    </template>

    <!-- Options -->
    <template #option="{ option }">
      <div class="flex items-center gap-3">
        <span v-if="option.color" class="w-[12px] h-[12px] rounded-[50%]" :style="{ backgroundColor: option.color }" />
        <span class="text-sm font-semibold">{{ option.label }}</span>
        <span class="text-xs text-gray-500">{{ option.secondary }}</span>
      </div>
    </template>
  </Select>
</template>
<script setup lang="ts">
import { ZONES_FC } from '@/domain/constants/zones';
import { Zone } from '@/domain/types/Zone';
import Icon from '@/ui/components/Icon.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import Select from 'primevue/select';
import { computed, ref, watch } from 'vue';

export interface Item {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

const props = defineProps<{
  selected: Zone | null;
  placeholder?: string;
  inputId?: string;
  showClear?: boolean;
  size?: string;
}>();

const options = computed((): Item[] => {
  return ZONES_FC.map((el) => {
    return {
      label: `${el.zone}`,
      color: el.color,
      secondary: `(${el.fc})`,
      fc: el.fc,
      value: el.zone
    }
  })
})

const selectedValue = ref<string>(props.selected);
const selectedItem = ref<Item>(props.selected ? options.value.find((el) => el.value == props.selected) : null);

const emit = defineEmits(['update:selected']);

watch(selectedItem, () => {
  selectedValue.value = selectedItem.value.value;
})

watch(selectedValue, () => {
  emit('update:selected', selectedValue.value || null);
});

</script>
<style scoped></style>
