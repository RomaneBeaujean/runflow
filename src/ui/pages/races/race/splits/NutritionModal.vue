<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :header="`Nutrition — Segment #${split.index} (${split.splitDistance} km, ${Math.round(split.splitDuration)} min)`"
    class="w-[1050px] max-w-[95vw]"
  >
    <div class="flex flex-col gap-6">

      <!-- Objectifs -->
      <div class="flex flex-col gap-3">
        <div class="section-title">Objectifs nutrition</div>
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div class="flex flex-col gap-1 flex-shrink-0">
            <label class="input-label">Glucides (g/h)</label>
            <InputNumber
              v-model="localObjective.carbsGPerHour"
              :min="0" :max="200" :step="5"
              show-buttons size="small" class="w-[160px]"
            />
          </div>
          <div class="w-full flex-1 min-w-0">
            <NutritionGauge label="Glucides" :current="Math.round(totalCarbsG)" :target="targetCarbsG" unit="g" />
          </div>
        </div>
      </div>

      <!-- Produits ajoutés + Catalogue -->
      <div class="flex flex-col md:flex-row gap-6">

        <!-- Gauche : produits ajoutés -->
        <div class="flex flex-col gap-2 md:w-1/3 flex-shrink-0">
          <div class="section-title">Produits ajoutés</div>
          <div v-if="localProducts.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="item in localProducts"
              :key="item.productId"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              :style="productTagStyle(item.productId)"
            >
              <span>{{ getProduct(item.productId)?.name ?? '?' }}</span>
              <span class="inline-flex items-center bg-black/10 rounded-full px-1.5 text-[10px] font-bold leading-4">{{ formatQty(item.quantity) }}</span>
              <span class="text-[10px] opacity-60">{{ Math.round((getProduct(item.productId)?.carbsG ?? 0) * item.quantity) }}g</span>
              <button class="ml-1 opacity-60 hover:opacity-100 leading-none" @click="removeAddedProduct(item.productId)">×</button>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 italic">Aucun produit ajouté</div>
        </div>

        <!-- Droite : catalogue (2/3) -->
        <div class="flex flex-col gap-2 flex-1 min-w-0">
          <div class="section-title">Catalogue de produits</div>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="Rechercher un produit..." size="small" class="w-full" />
          </IconField>

          <div v-if="products.length === 0" class="text-sm text-gray-400 italic">Aucun produit dans le catalogue</div>
          <div v-else-if="filteredProducts.length === 0" class="text-sm text-gray-400 italic">Aucun résultat pour « {{ searchQuery }} »</div>
          <div v-else class="flex flex-col divide-y divide-gray-100 max-h-[240px] overflow-y-auto">
            <template v-for="product in filteredProducts" :key="product.id">

              <!-- Ligne édition -->
              <div v-if="editingProductId === product.id" class="flex items-end gap-2 py-2 flex-wrap">
                <div class="flex flex-col gap-1">
                  <label class="input-label">Nom</label>
                  <InputText v-model="editForm.name" size="small" class="w-[120px]" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="input-label">Glucides (g)</label>
                  <InputNumber v-model="editForm.carbsG" :min="0" :max="500" size="small" class="w-[80px]" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="input-label">Catégorie</label>
                  <Select v-model="editForm.category" :options="categoryOptions" option-label="label" option-value="value" size="small" class="w-[100px]" />
                </div>
                <div class="flex gap-1 pb-0.5">
                  <Button icon="pi pi-check" text rounded size="small" @click="saveEdit(product.id)" />
                  <Button icon="pi pi-times" text rounded size="small" severity="secondary" @click="cancelEdit" />
                </div>
              </div>

              <!-- Ligne normale -->
              <div v-else class="flex items-center gap-2 py-1.5">
                <ColorTag :color="NUTRITION_CATEGORY_COLORS[product.category]" class="flex-shrink-0 w-[68px] justify-center text-[10px]">
                  {{ NUTRITION_CATEGORY_LABELS[product.category] }}
                </ColorTag>
                <span class="flex-1 text-sm font-medium truncate">{{ product.name }}</span>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ product.carbsG }}g</span>

                <!-- Quantité -->
                <div class="flex items-center flex-shrink-0">
                  <template v-if="getQty(product.id) === 0">
                    <button class="qty-add-pill" @click="addProductToSegment(product.id)">+</button>
                  </template>
                  <template v-else>
                    <div class="qty-control">
                      <button @click="adjustQty(product.id, -0.5)">−</button>
                      <input
                        type="number" min="0" step="0.5"
                        :value="getQty(product.id)"
                        @change="onQtyInput(product.id, ($event.target as HTMLInputElement).value)"
                        @blur="($event.target as HTMLInputElement).value = String(getQty(product.id))"
                      />
                      <button @click="adjustQty(product.id, 0.5)">+</button>
                    </div>
                  </template>
                </div>

                <Button icon="pi pi-pencil" text rounded size="small" class="flex-shrink-0" @click="startEdit(product)" />
                <Button v-if="!isProductUsed(product.id)" icon="pi pi-trash" text rounded size="small" severity="danger" class="flex-shrink-0" @click="removeProduct(product.id)" />
                <span v-else class="w-[28px] flex-shrink-0" />
              </div>

            </template>
          </div>

          <!-- Formulaire nouveau produit -->
          <div v-if="showNewProductForm" class="border-t border-gray-100 pt-3">
            <div class="flex items-end gap-3">
              <div class="flex flex-col gap-1 flex-shrink-0">
                <label class="input-label">Catégorie</label>
                <Select v-model="newForm.category" :options="categoryOptions" option-label="label" option-value="value" size="small" class="w-[110px]" />
              </div>
              <div class="flex flex-col gap-1 flex-shrink-0">
                <label class="input-label">Nom</label>
                <InputText v-model="newForm.name" placeholder="ex: Gel Maurten" size="small" class="w-[150px]" />
              </div>
              <div class="flex flex-col gap-1 flex-shrink-0">
                <div class="flex items-center gap-3">
                  <label class="input-label">Glucides</label>
                  <div class="flex items-center gap-1 text-[10px] font-medium">
                    <button :class="newForm.carbsMode === 'per-unit' ? 'text-primary-600 font-bold' : 'text-gray-400 hover:text-gray-600'" @click="newForm.carbsMode = 'per-unit'">g/unité</button>
                    <span class="text-gray-300">|</span>
                    <button :class="newForm.carbsMode === 'per-100g' ? 'text-primary-600 font-bold' : 'text-gray-400 hover:text-gray-600'" @click="newForm.carbsMode = 'per-100g'">pour 100g</button>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <template v-if="newForm.carbsMode === 'per-unit'">
                    <InputNumber v-model="newForm.carbsG" :min="0" :max="500" size="small" placeholder="25" :input-style="{ width: '56px', minWidth: '0' }" />
                  </template>
                  <template v-else>
                    <div class="inline-flex items-center border border-gray-300 rounded-md overflow-hidden bg-white h-[32px] focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
                      <input type="number" min="0" max="2000" placeholder="40" :value="newForm.weightG ?? ''" @change="newForm.weightG = ($event.target as HTMLInputElement).valueAsNumber || null" class="w-[38px] px-2 text-sm outline-none border-none bg-transparent" />
                      <span class="text-[11px] text-gray-400 pr-1 select-none">g</span>
                      <div class="w-px self-stretch bg-gray-200" />
                      <input type="number" min="0" max="100" placeholder="60" :value="newForm.carbsPer100g ?? ''" @change="newForm.carbsPer100g = ($event.target as HTMLInputElement).valueAsNumber || null" class="w-[38px] px-2 text-sm outline-none border-none bg-transparent" />
                      <span class="text-[11px] text-gray-400 pr-2 select-none whitespace-nowrap">/100g</span>
                    </div>
                    <span class="text-xs text-gray-400 whitespace-nowrap">= {{ computedCarbsG != null ? computedCarbsG + 'g' : '—' }}</span>
                  </template>
                </div>
              </div>
              <div class="flex gap-1 pb-0.5 flex-shrink-0">
                <Button icon="pi pi-check" text rounded size="small" :disabled="!canCreateProduct" @click="createProduct" />
                <Button icon="pi pi-times" text rounded size="small" severity="secondary" @click="showNewProductForm = false" />
              </div>
            </div>
          </div>
          <div v-else class="pt-1">
            <Button icon="pi pi-plus" text rounded size="small" label="Nouveau produit" @click="showNewProductForm = true" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Annuler" icon="pi pi-times" severity="secondary" variant="outlined" size="small" @click="cancel" />
      <Button label="Valider" icon="pi pi-check" size="small" @click="confirm" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {
  AddedProduct,
  NutritionCategory,
  NutritionProduct,
  NUTRITION_CATEGORY_COLORS,
  NUTRITION_CATEGORY_LABELS,
  SegmentNutrition,
} from '@/domain/types/NutritionProduct';
import { Separator } from '@/domain/types/Separator';
import { SplitItem } from '@/domain/types/SplitItem';
import { TagColor } from '@/domain/types/TagColor';
import { getTagColor } from '@/domain/services/TagColors';
import { useNutrition } from '@/ui/composables/useNutrition';
import { useRace } from '@/ui/composables/useRace';
import ColorTag from '@/ui/components/tags/ColorTag.vue';
import { Button, Dialog, IconField, InputIcon, InputNumber, InputText, Select } from 'primevue';
import { computed, reactive, ref, watch } from 'vue';
import NutritionGauge from './NutritionGauge.vue';

const props = defineProps<{ split: SplitItem; visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>();

const { products, addProduct, removeProduct, updateProduct, getProduct } = useNutrition();
const { separators, updateSeparator } = useRace();

// ── Quantity helpers ─────────────────────────────────────────────────────────

const FRAC_LABELS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

const formatQty = (qty: number): string => String(parseFloat(qty.toFixed(2)));

const getQty = (productId: string) =>
  localProducts.value.find((p) => p.productId === productId)?.quantity ?? 0;

const setQty = (productId: string, newQty: number) => {
  const qty = Math.max(0, Math.round(newQty * 100) / 100);
  if (qty <= 0) {
    localProducts.value = localProducts.value.filter((p) => p.productId !== productId);
  } else if (localProducts.value.find((p) => p.productId === productId)) {
    localProducts.value = localProducts.value.map((p) =>
      p.productId === productId ? { ...p, quantity: qty } : p,
    );
  } else {
    localProducts.value = [...localProducts.value, { productId, quantity: qty }];
  }
};

const adjustQty = (productId: string, delta: number) =>
  setQty(productId, getQty(productId) + delta);

const onQtyInput = (productId: string, value: string) => {
  const parsed = parseFloat(value);
  if (!isNaN(parsed)) setQty(productId, parsed);
};

// ── Local state ──────────────────────────────────────────────────────────────

const separator = computed<Separator | undefined>(() =>
  separators.value.find((s) => s.distance === props.split.distance),
);

const currentNutrition = computed<SegmentNutrition>(() =>
  separator.value?.nutrition ?? { objective: { carbsGPerHour: 0 }, products: [] },
);

const localObjective = reactive({ carbsGPerHour: 0 });
const localProducts = ref<AddedProduct[]>([]);
const searchQuery = ref('');
const editingProductId = ref<string | null>(null);

const syncFromSeparator = () => {
  const n = currentNutrition.value;
  let carbsGPerHour = n.objective.carbsGPerHour;
  if (!carbsGPerHour) {
    const sorted = [...separators.value].sort((a, b) => a.distance - b.distance);
    const idx = sorted.findIndex((s) => s.distance === props.split.distance);
    if (idx > 0) carbsGPerHour = sorted[idx - 1]?.nutrition?.objective?.carbsGPerHour ?? 0;
    if (!carbsGPerHour && idx < sorted.length - 1)
      carbsGPerHour = sorted[idx + 1]?.nutrition?.objective?.carbsGPerHour ?? 0;
  }
  localObjective.carbsGPerHour = carbsGPerHour;
  localProducts.value = n.products.map((p) => ({ ...p }));
  searchQuery.value = '';
  editingProductId.value = null;
};

watch(() => props.visible, (v) => { if (v) syncFromSeparator(); }, { immediate: true });

// ── Persist / confirm / cancel ───────────────────────────────────────────────

const persistNutrition = () => {
  if (!separator.value) return;
  const updated: SegmentNutrition = {
    objective: { ...localObjective },
    products: localProducts.value.map((p) => ({ ...p })),
  };
  updateSeparator(separator.value, { ...separator.value, nutrition: updated });
};

const confirm = () => { persistNutrition(); emit('update:visible', false); };
const cancel = () => { syncFromSeparator(); emit('update:visible', false); };

// ── Gauge ────────────────────────────────────────────────────────────────────

const targetCarbsG = computed(() => {
  if (!localObjective.carbsGPerHour || !props.split.splitDuration) return 0;
  return Math.round((localObjective.carbsGPerHour / 60) * props.split.splitDuration);
});

const totalCarbsG = computed(() =>
  localProducts.value.reduce((sum, item) => {
    const p = getProduct(item.productId);
    return sum + (p?.carbsG ?? 0) * item.quantity;
  }, 0),
);

// ── Catalog ──────────────────────────────────────────────────────────────────

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return q ? products.value.filter((p) => p.name.toLowerCase().includes(q)) : products.value;
});

const isProductUsed = (productId: string) =>
  localProducts.value.some((p) => p.productId === productId) ||
  separators.value.some((s) => s.nutrition?.products?.some((p) => p.productId === productId));

const addProductToSegment = (productId: string) => setQty(productId, 1);

const removeAddedProduct = (productId: string) => {
  localProducts.value = localProducts.value.filter((p) => p.productId !== productId);
};

const productTagStyle = (productId: string) => {
  const product = getProduct(productId);
  if (!product) return {};
  const color: TagColor = NUTRITION_CATEGORY_COLORS[product.category];
  const cfg = getTagColor(color, 'soft');
  return { backgroundColor: cfg.background, color: cfg.color };
};

// ── Inline edit ──────────────────────────────────────────────────────────────

const editForm = reactive<{ name: string; carbsG: number | null; category: NutritionCategory }>({
  name: '', carbsG: null, category: 'gel',
});

const startEdit = (product: NutritionProduct) => {
  editingProductId.value = product.id;
  editForm.name = product.name;
  editForm.carbsG = product.carbsG;
  editForm.category = product.category;
};

const saveEdit = (id: string) => {
  if (!editForm.name.trim() || editForm.carbsG == null) return;
  updateProduct(id, { name: editForm.name.trim(), carbsG: editForm.carbsG, category: editForm.category });
  editingProductId.value = null;
};

const cancelEdit = () => { editingProductId.value = null; };

// ── New product form ─────────────────────────────────────────────────────────

const categoryOptions = (Object.keys(NUTRITION_CATEGORY_LABELS) as NutritionCategory[]).map((k) => ({
  value: k, label: NUTRITION_CATEGORY_LABELS[k],
}));

const showNewProductForm = ref(false);

const newForm = reactive<{
  name: string; carbsG: number | null; carbsMode: 'per-unit' | 'per-100g';
  weightG: number | null; carbsPer100g: number | null; category: NutritionCategory;
}>({ name: '', carbsG: null, carbsMode: 'per-unit', weightG: null, carbsPer100g: null, category: 'gel' });

const computedCarbsG = computed<number | null>(() =>
  newForm.weightG != null && newForm.carbsPer100g != null
    ? Math.round((newForm.weightG * newForm.carbsPer100g) / 100)
    : null,
);

const effectiveCarbsG = computed<number | null>(() =>
  newForm.carbsMode === 'per-unit' ? newForm.carbsG : computedCarbsG.value,
);

const canCreateProduct = computed(
  () => newForm.name.trim().length > 0 && effectiveCarbsG.value != null && effectiveCarbsG.value >= 0,
);

const createProduct = () => {
  if (!canCreateProduct.value) return;
  addProduct({ name: newForm.name.trim(), carbsG: effectiveCarbsG.value!, category: newForm.category });
  Object.assign(newForm, { name: '', carbsG: null, weightG: null, carbsPer100g: null, category: 'gel' });
  showNewProductForm.value = false;
};
</script>

<style scoped lang="scss">
.section-title {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-variant: small-caps;
}

.input-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.qty-add-pill {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid #d1d5db;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  line-height: 1;

  &:hover {
    border-color: var(--p-primary-500, #0ea5e9);
    color: var(--p-primary-600, #0284c7);
    background: var(--p-primary-50, #f0f9ff);
  }
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  height: 28px;
  background: white;

  button {
    width: 26px;
    height: 100%;
    font-size: 15px;
    font-weight: 500;
    color: #6b7280;
    background: #f9fafb;
    transition: background 0.12s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover { background: #f3f4f6; color: #111827; }
    &:first-child { border-right: 1.5px solid #e5e7eb; }
    &:last-child  { border-left:  1.5px solid #e5e7eb; }
  }

  input {
    width: 44px;
    text-align: center;
    border: none;
    outline: none;
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    background: white;
    padding: 0;

    /* hide browser number arrows */
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    -moz-appearance: textfield;
  }
}
</style>
