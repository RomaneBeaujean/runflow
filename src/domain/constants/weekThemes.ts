import { WeekTheme } from "../types/WeekTheme";

export const DEFAULT_WEEK_THEMES: WeekTheme[] = [
  {
    id: 'ppg',
    label: 'PPG - Préparation physique',
    color: 'amber',
  },
  {
    id: 'foncier',
    label: 'Foncier / Endurance',
    color: 'bright-green',
  },
  {
    id: 'vitesse',
    label: 'Vitesse / VMA',
    color: 'pink',
  },
  {
    id: 'spe',
    label: 'Travail spécifique',
    color: 'deep-orange',
  },
  {
    id: 'affutage',
    label: 'Affûtage',
    color: 'brown',
  },
  {
    id: 'recup',
    label: 'Récupération',
    color: 'primary',
  },
];
