import { TagColor } from './TagColor';

export type NutritionCategory = 'gel' | 'barre' | 'compote' | 'boisson' | 'autre';

export const NUTRITION_CATEGORY_LABELS: Record<NutritionCategory, string> = {
  gel: 'Gel',
  barre: 'Barre',
  compote: 'Compote',
  boisson: 'Boisson',
  autre: 'Autre',
};

export const NUTRITION_CATEGORY_COLORS: Record<NutritionCategory, TagColor> = {
  gel: 'primary',
  barre: 'amber',
  compote: 'deep-orange',
  boisson: 'teal',
  autre: 'neutral',
};

export interface NutritionProduct {
  id: string;
  name: string;
  carbsG: number;
  category: NutritionCategory;
}

export interface AddedProduct {
  productId: string;
  quantity: number; // 0.25 = ¼, 0.5 = ½, 0.75 = ¾, 1, 1.5, 2 …
}

export interface SegmentNutrition {
  objective: {
    carbsGPerHour: number;
  };
  products: AddedProduct[];
}
