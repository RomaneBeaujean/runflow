<template>
  <div class="w-full h-[37px] flex items-center" ref="el">
    <div class="cursor-pointer w-full" @click="opened = !opened">
      <ColorTag v-if="selected" :color="getSport(selected).color" :icon="getSport(selected).icon"
        :label="getSport(selected).label" size="medium">
        <template #right>
          <Icon size="xsmall" icon="pi pi-times" @click.stop="selected = null" />
        </template>
      </ColorTag>
      <div v-else>
        <ColorTag label="Sélectionner un sport" color="neutral" size="medium">
          <template #right>
            <Icon size="xsmall" icon="pi pi-chevron-down" />
          </template>
        </ColorTag>
      </div>
    </div>
    <Popup v-model:opened="opened" placement="bottom-start">
      <div class="w-full bg-white p-2 shadow-2xl rounded-md border-1 border-gray-200 mt-[8px]">
        <div v-for="option in sports" class="flex items-center h-[40px] p-[4px]">
          <div class="hover:bg-gray-100 flex-1 h-full flex items-center rounded-md cursor-pointer"
            @click="handleSelect(option)">
            <ColorTag :color="option.color" :icon="option.icon" :label="option.label"></ColorTag>
          </div>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup lang="ts">
import { Sport } from '@/domain/types/Sport';
import Icon from '@/ui/components/Icon.vue';
import Popup from '@/ui/components/Popup.vue';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';
import { onBeforeUnmount, ref, watch } from 'vue';

const { sports } = useTrainingPlan();
const props = defineProps<{
  selected: string | null;
}>();
const emit = defineEmits(['update:selected']);

const opened = ref(false);
const selected = ref<string>(props.selected);
const el = ref();

const getSport = (value: string): Sport => {
  return sports.value.find((el) => el.id === value);
}

const handleSelect = (sport: Sport) => {
  selected.value = sport.id;
  opened.value = false;
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!el?.value.contains(target)) {
    opened.value = false;
  }
}

watch(selected, () => {
  if (props.selected !== selected.value) {
    emit('update:selected', selected.value);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
})

watch(opened, () => {
  if (opened) {
    document.addEventListener("click", handleClickOutside, true);
  } else {
    document.removeEventListener("click", handleClickOutside, true);
  }
})
</script>

<style scoped></style>