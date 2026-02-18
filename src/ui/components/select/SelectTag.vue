<template>

  <div class="dropdown group">

    <!-- input -->
    <div :class="[
      'flex border-1 border-neutral-100 rounded-md p-[7px] group-hover:border-primary-400 group-active:border-primary-500 group-active:outline-2 group-active:outline-primary-100 items-center cursor-pointer',
      opened ? 'outline-2 outline-primary-100 border-primary-500' : 'closed']" @click="openOrCloseDropdown">
      <div class="flex flex-1 relative items-center h-[24px]">
        <template v-if="!opened">
          <ColorTag v-if="selected" :label="selected.label" :color="selected.color" :icon="selected.icon">
            <template #right>
              <Icon size="xsmall" icon="pi pi-times" @click.stop="selectedValue = null" />
            </template>
          </ColorTag>
          <span v-else class="text-neutral-400 font-normal">{{ placeholder }}</span>
        </template>
        <template v-else>
          <span v-show="!filterValue" class="text-neutral-400 font-normal">{{ placeholder }}</span>
          <input ref="inputRef" v-model="filterValue"
            class="border-0 absolute top-0 bottom-0 left-0 right-0 focus:border-0 focus:outline-0 font-normal text-neutral-800" />
        </template>
      </div>
      <div>
        <Icon size="small" :icon="opened ? 'pi pi-angle-up' : 'pi pi-angle-down'" color="neutral-500" />
      </div>
    </div>

    <!-- Popup -->
    <Popup v-model:opened="opened" fullwidth placement="bottom-start" ref="dropdownPopupRef">
      <div class="border-1 border-neutral-100 rounded-md p-[8px] mt-1 bg-white shadow-sm max-h-[288px] overflow-auto">
        <template v-for="option in filteredOptions">
          <div
            class="flex w-full min-h-[32px] p-[8px] items-center gap-3 justify-between cursor-pointer  rounded-md hover:bg-neutral-50"
            @click="handleOptionClick(option)">
            <template v-if="option.id !== 'new'">
              <div class="flex-1">
                <ColorTag size="small" :label="option.label" :color="option.color" :icon="option.icon" />
              </div>
              <div class="flex-0">
                <Icon icon="pi pi-ellipsis-h" action size="small" @click.stop="(e) => handleTogglePopup(e, option)"
                  :active="updatingOption?.id === option.id" @mousedown.stop />
              </div>
            </template>
            <div v-else class="flex gap-2 items-center">
              <span>Créer</span>
              <ColorTag size="small" :label="option.label" :color="option.color" :icon="option.icon" />
            </div>
          </div>
        </template>
      </div>
    </Popup>

    <Popover ref="popoverRef" @hide="closePopup">
      <div v-if="updatingOption" class="w-[200px]" id="select-tag-popover">
        <div class="flex flex-col gap-2">
          <InputText v-model="updatingOption.label" @input="handleUpdateOptionLabel" />
          <Button text fluid severity="secondary" icon="pi pi-trash" label="Supprimer" size="small"
            @click="handleDeleteOption" />
        </div>
        <Divider />
        <div class="flex flex-col gap-2">
          <div class="text-xs font-semibold text-neutral-500">Couleurs</div>
          <div class="max-h-[200px] overflow-y-auto">
            <div v-for="color in getAvailableTagColors()"
              class="h-[32px] hover:bg-neutral-50 cursor-pointer rounded-md items-center flex p-2 justify-between"
              @click="handleUpdateOptionColor(color)">
              <ColorTag :color="color" :label="color" />
              <div v-if="color === updatingOption.color">
                <Icon size="small" icon="pi pi-check" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { getAvailableTagColors } from '@/domain/services/TagColors';
import { TagColor } from '@/domain/types/TagColor';
import { Button, Divider, InputText, Popover } from 'primevue';
import { computed, nextTick, ref, watch } from 'vue';
import Icon from '../Icon.vue';
import Popup from '../Popup.vue';
import ColorTag from '../tags/ColorTag.vue';

export interface Item {
  id: string;
  label: string;
  icon?: string;
  color?: TagColor;
}

const props = defineProps<{
  items: Item[];
  selected?: Item | null;
  placeholder?: string;
  inputId?: string;
  showClear?: boolean;
}>();

const opened = ref(false);
const inputRef = ref();
const dropdownPopupRef = ref();
const filterValue = ref<string>(null);
const selectedValue = ref<Item | null>(props.selected);
const popoverRef = ref(null);
const updatingOption = ref(null);
const emit = defineEmits(['update:selected', 'update:item', 'delete:item']);

const newOption = computed((): Item => {
  return {
    id: "new",
    label: filterValue.value,
    color: "primary"
  }
})

const filteredOptions = computed(() => {
  if (!filterValue.value) return [...props.items];
  const filterValueSanitized = filterValue.value?.toLowerCase();

  const filteredItems = [...props.items].filter((el) => {
    return el.label.toLowerCase().match(filterValueSanitized);
  });

  const isExactItem = filteredItems.some((item) => item.label.toLowerCase() == filterValueSanitized);

  const newOptionItem = !isExactItem ? [newOption.value] : [];

  return [...filteredItems, ...newOptionItem]
});

const openOrCloseDropdown = () => {
  opened.value = !opened.value
}

const handleOptionClick = (option: Item) => {
  if (updatingOption.value) return;
  selectedValue.value = option;
  closeDropdown();
}

const handleTogglePopup = async (e: Event, option: Item) => {
  popoverRef.value.toggle(e);

  if (updatingOption.value) {
    updatingOption.value = null;
  } else {
    updatingOption.value = option;
  }
}

const closeDropdown = () => {
  opened.value = false;
  updatingOption.value = null;
}

const closePopup = () => {
  popoverRef.value.hide();
  updatingOption.value = null;
}

const handleUpdateOptionLabel = (event: InputEvent) => {
  emit('update:item', { ...updatingOption.value, label: (event.target as HTMLInputElement).value });
}

const handleUpdateOptionColor = (color: TagColor) => {
  emit('update:item', { ...updatingOption.value, color });
  closePopup();
}

const handleDeleteOption = () => {
  emit('delete:item', updatingOption.value);
  closePopup();
}

const handleClickOutside = (e: MouseEvent) => {
  const dropdownElement = dropdownPopupRef.value?.$el;
  const target = e.target as HTMLElement;

  const isInsidePopup = target.closest("#select-tag-popover") !== null;
  const isInsideDropdown = dropdownElement?.contains(target);
  if (isInsidePopup || isInsideDropdown) return;

  opened.value = false;
  updatingOption.value = null;
}

watch(opened, async () => {
  await nextTick();
  inputRef.value?.focus();

  if (opened.value) {
    document.addEventListener('mousedown', handleClickOutside, true);
  } else {
    document.removeEventListener('mousedown', handleClickOutside, true);
  }
});

watch(selectedValue, () => {
  emit('update:selected', selectedValue.value);
});

watch(props, () => {
  selectedValue.value = props.selected;
  filterValue.value = null;
});
</script>
<style scoped></style>
