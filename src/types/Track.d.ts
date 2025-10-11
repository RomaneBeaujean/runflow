export interface Track {
  id: string;
  name: string;
  gpxUrl?: string; // URL vers un fichier GPX (servi par le back ou mock)
  gpxContent?: string; // contenu GPX (texte) — utile pour le mock/dev
  createdAt: string;
}
