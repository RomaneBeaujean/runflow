<template>
  <Select v-model="inputValue" :options="filteredOptions" :inputId="inputId" optionLabel="label" :showClear="showClear"
    :placeholder="placeholder" :editable="autocomplete" :size="size" class="w-full" ref="selectRef"
    @change="handleChange" @hide="handleHide">
    <!-- Valeur sélectionnée -->
    <template #value="slotProps">
      <div v-if="slotProps.value" class="flex items-center gap-3">
        <span v-if="slotProps.value.color" class="color-dot" :style="{
          backgroundColor: slotProps.value.color,
        }" />
        <i v-if="slotProps.value.icon" :class="slotProps.value.icon" />
        <div>{{ slotProps.value.label }}</div>
      </div>
      <div v-else class="min-h-[21px]">
        {{ placeholder }}
      </div>
    </template>

    <!-- Options -->
    <template #option="{ option }">
      <div class="flex items-center gap-3">
        <span v-if="option.color" class="w-[12px] h-[12px] rounded-[50%]" :style="{ backgroundColor: option.color }" />
        <i v-if="option.icon" :class="option.icon" />
        <span>{{ option.label }}</span>
      </div>
    </template>
  </Select>
</template>
<script setup lang="ts">
import Select from 'primevue/select';
import { computed, onMounted, ref, watch } from 'vue';

export interface Item {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

const props = defineProps<{
  selected: Item | null;
  items: Item[];
  placeholder?: string;
  autocomplete?: boolean;
  inputId?: string;
  showClear?: boolean;
  size?: string;
}>();

const selectRef = ref();
const inputValue = ref<Item | null>(props.selected);
const filterValue = ref<string>(null);
const emit = defineEmits(['update:selected']);

const filteredOptions = computed(() => {
  if (filterValue.value) {
    return [...props.items].filter((el) => {
      return el.label.match(filterValue.value);
    });
  } else {
    return [...props.items];
  }
});

onMounted(() => {
  if (props.autocomplete) {
    const input = selectRef.value?.$el?.querySelector('input');
    if (input) {
      input.addEventListener('click', () => {
        selectRef.value?.show();
      });
    }
  }
});

const handleChange = (event: any) => {
  const value = event.value;
  filterValue.value = value;
};

const handleHide = () => {
  filterValue.value = null;
  if (typeof inputValue.value === 'object') return;
  inputValue.value = props.selected;
};

watch(inputValue, () => {
  if (typeof inputValue.value === 'object') {
    emit('update:selected', inputValue.value);
  }
});

watch(props, () => {
  inputValue.value = props.selected;
  filterValue.value = null;
});
</script>
<style scoped></style>
