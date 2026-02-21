import { Sport } from '../types/Sport';

export const DEFAULT_SPORTS: Sport[] = [
  {
    id: 'course-a-pied',
    label: 'Course à pied',
    icon: 'fa-solid fa-person-running',
    color: 'primary',
    background: 'bg-primary-500',
  },
  {
    id: 'velo',
    label: 'Vélo',
    icon: 'fa-solid fa-person-biking',
    color: 'purple',
    background: 'bg-purple-500',
  },
  {
    id: 'natation',
    label: 'Natation',
    icon: 'fa-solid fa-person-swimming',
    color: 'teal',
    background: 'bg-teal-500',
  },
  {
    id: 'musculation',
    label: 'Musculation',
    icon: 'fa-solid fa-dumbbell',
    color: 'orange',
    background: 'bg-orange-500',
  },
  {
    id: 'randonnee',
    label: 'Randonnée',
    icon: 'fa-solid fa-person-walking',
    color: 'green',
    background: 'bg-green-500',
  },
];
