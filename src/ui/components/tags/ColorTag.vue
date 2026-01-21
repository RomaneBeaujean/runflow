<template>
  <div class="tag inline-flex min-w-0 max-w-full items-center gap-2 truncate" :style="tagStyle">
    <div class="left flex-0 flex items-center flex-shrink-0 empty:hidden">
      <i :class="icon" v-if="icon" />
      <slot name="left"></slot>
    </div>
    <div class="middle flex-1 min-w-0">
      {{ label }}
      <slot></slot>
    </div>
    <div class="right flex-0 flex-shrink-0 flex items-center empty:hidden">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type TagColor =
  'primary'
  | 'neutral'
  | 'red'
  | 'pink'
  | 'purple'
  | 'deep-purple'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'bright-green'
  | 'lime'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'deep-orange'
  | 'brown'
  | 'white';

interface TagPalette {
  background: string;
  color: string;
}

const props = defineProps<{
  label?: string;
  color?: TagColor;
  icon?: string;
  fluid?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  variant?: 'soft' | 'strong';
}>();

const palette: Record<TagColor, Record<'soft' | 'strong', TagPalette>> = {
  primary: {
    soft: {
      background: '#e6f2f8', // primary-50
      color: '#024264', // primary-800
    },
    strong: {
      background: '#8cc1dd', // primary-200
      color: '#02324c', // primary-900
    },
  },
  neutral: {
    soft: {
      background: '#dee1e3', // neutral-40
      color: '#152833', // neutral-800
    },
    strong: {
      background: '#c3c8cb', // neutral-50
      color: '#091e2a', // neutral-900
    },
  },
  white: {
    soft: {
      background: '#ffffff', // neutral-0
      color: '#354750', // neutral-600
    },
    strong: {
      background: '#ffffff', // neutral-0
      color: '#354750', // neutral-600
    },
  },
  red: {
    soft: {
      background: '#FEE2E2', // semantic red-50
      color: '#82181A', // semantic red-800
    },
    strong: {
      background: '#e6a8ae', // semantic red-200
      color: '#541c21', // semantic red-900
    },
  },
  pink: {
    soft: {
      background: '#f9eef4', // accent pink-50
      color: '#8d3a68', // accent pink-800
    },
    strong: {
      background: '#e5afcd', // accent pink-200
      color: '#54223e', // accent pink-900
    },
  },
  purple: {
    soft: {
      background: '#f7eff6', // accent purple-50
      color: '#61325c', // accent purple-800
    },
    strong: {
      background: '#dbb3d7', // accent purple-200
      color: '#4a2646', // accent purple-900
    },
  },
  'deep-purple': {
    soft: {
      background: '#f4f0f8', // accent deep-purple-50
      color: '#513764', // accent deep-purple-800
    },
    strong: {
      background: '#cdb8dd', // accent deep-purple-200
      color: '#3e2a4c', // accent deep-purple-900
    },
  },
  cyan: {
    soft: {
      background: '#e6f8ff', // accent cyan-50
      color: '#014d6b', // accent cyan-900
    },
    strong: {
      background: '#8bdeff', // accent cyan-200
      color: '#014d6b', // accent cyan-900
    },
  },
  teal: {
    soft: {
      background: '#e6f8f9', // accent teal-50
      color: '#004e51', // accent teal-900
    },
    strong: {
      background: '#8adfe2', // accent teal-200
      color: '#004e51', // accent teal-900
    },
  },
  green: {
    soft: {
      background: '#e7f7f3', // semantic green-50
      color: '#054b3a', // semantic green-900
    },
    strong: {
      background: '#90dcca', // semantic green-200
      color: '#054b3a', // semantic green-900
    },
  },
  'bright-green': {
    soft: {
      background: '#e7fbf6', // accent bright-green-50
      color: '#055946', // accent bright-green-900
    },
    strong: {
      background: '#8fecd6', // accent bright-green-200
      color: '#055946', // accent bright-green-900
    },
  },
  lime: {
    soft: {
      background: '#f5fdf3', // accent lime-50
      color: '#406337', // accent lime-900
    },
    strong: {
      background: '#d0f6c6', // accent lime-200
      color: '#406337', // accent lime-900
    },
  },
  yellow: {
    soft: {
      background: '#F7E788', // accent yellow-50
      color: '#894B00', // accent yellow-900
    },
    strong: {
      background: '#fcfcbe', // accent yellow-200
      color: '#69682f', // accent yellow-900
    },
  },
  amber: {
    soft: {
      background: '#fffaea', // accent amber-50
      color: '#6b5511', // accent amber-900
    },
    strong: {
      background: '#ffe79c', // accent amber-200
      color: '#6b5511', // accent amber-900
    },
  },
  orange: {
    soft: {
      background: '#fcf5e9', // semantic orange-50
      color: '#CA3500', // semantic orange-900
    },
    strong: {
      background: '#f2d299', // semantic orange-200
      color: '#5f420e', // semantic orange-900
    },
  },
  'deep-orange': {
    soft: {
      background: '#FFEDD4', // accent deep-orange-50
      color: '#C2410C', // accent deep-orange-800
    },
    strong: {
      background: '#FFD7A8', // accent deep-orange-200
      color: '#CA3500', // accent deep-orange-900
    },
  },
  brown: {
    soft: {
      background: '#f4f1ef', // accent brown-50
      color: '#733E0A', // accent brown-800
    },
    strong: {
      background: '#cbbcb7', // accent brown-200
      color: '#3b2e2a', // accent brown-900
    },
  },
};

const colorKey = computed(() => props.color ?? 'neutral');
const fontSize = computed(() =>
  props.size === 'medium' ? '14px' : props.size === 'xsmall' ? '10px' : '12px'
);
const variantKey = computed(() => props.variant ?? 'soft');

const tagStyle = computed(() => {
  const cfg = palette[colorKey.value][variantKey.value];
  return {
    backgroundColor: cfg.background,
    color: cfg.color,
    fontSize: fontSize.value,
    width: props.fluid ? '100%' : 'auto',
  };
});
</script>

<style scoped lang="scss">
.tag {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
</style>
