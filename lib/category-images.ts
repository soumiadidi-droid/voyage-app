export type AddressCategory = "Hôtel" | "Resto" | "Activité";

// Texture en photo systématique par catégorie (décidé le 26/08/2026) — remplace la vraie photo de
// l'adresse. Extrait de app/voyages/[slug]/page.tsx le 26/08/2026 pour être réutilisé par
// l'Agent Social Media (mêmes visuels que le site public, pour rester cohérent).
export const CATEGORY_PHOTO_OVERRIDE: Record<AddressCategory, string> = {
  Hôtel: "/images/textures/lin.jpg",
  Resto: "/images/textures/marbre.jpg",
  Activité: "/images/textures/activite.jpg",
};
