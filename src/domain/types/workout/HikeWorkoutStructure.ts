/**
 * Structures pour la randonnée
 * Modèle ultra simple pour l'instant.
 */
export type HikeWorkoutStructure = HikeWorkoutStructureBasic;

export interface HikeWorkoutStructureBasic {
  type: 'basic';
  description: string;
  distance: number;
  duration: number;
}
