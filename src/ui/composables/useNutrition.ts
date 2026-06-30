import { NutritionProduct } from '@/domain/types/NutritionProduct';
import { nanoid } from 'nanoid';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'runflow:nutrition_products';

const loadProducts = (): NutritionProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const products = ref<NutritionProduct[]>(loadProducts());

watch(
  products,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  },
  { deep: true }
);

export function useNutrition() {
  const addProduct = (product: Omit<NutritionProduct, 'id'>) => {
    products.value = [...products.value, { ...product, id: nanoid() }];
  };

  const removeProduct = (id: string) => {
    products.value = products.value.filter((p) => p.id !== id);
  };

  const updateProduct = (id: string, data: Omit<NutritionProduct, 'id'>) => {
    products.value = products.value.map((p) => (p.id === id ? { ...p, ...data } : p));
  };

  const getProduct = (id: string): NutritionProduct | null =>
    products.value.find((p) => p.id === id) ?? null;

  const importProducts = (incoming: NutritionProduct[]) => {
    const existingIds = new Set(products.value.map((p) => p.id));
    const toAdd = incoming.filter((p) => !existingIds.has(p.id));
    if (toAdd.length > 0) {
      products.value = [...products.value, ...toAdd];
    }
  };

  return { products, addProduct, removeProduct, updateProduct, getProduct, importProducts };
}
