/**
 * Structures pour la musculation
 * Modèle ultra simple pour l'instant.
 */
export type BodybuildingWorkoutStructure = BodybuildingWorkoutStructureBasic;

export interface BodybuildingWorkoutStructureBasic {
  type: 'strength_basic';
  description: string;
  duration: number;
}
