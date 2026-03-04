/**
 * Structures pour la natation
 * (modèle simple pour l'instant, extensible plus tard)
 */
export type SwimWorkoutStructure = SwimWorkoutStructureBasic;

export interface SwimWorkoutStructureBasic {
  type: 'swim_basic';
  description: string;
  distance: number;
  duration: number;
}

