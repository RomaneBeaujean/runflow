/**
 * Structures pour le vélo
 * (modèle simple pour l'instant, extensible plus tard)
 */
export type BikeWorkoutStructure = BikeWorkoutBasic;

export interface BikeWorkoutBasic {
  type: 'basic';
  description: string;
  distance: number;
  duration: number;
}
