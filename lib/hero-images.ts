// Image Hero par content_slug (décidé le 26/08/2026, démarré sur New York puis étendu à toutes
// les destinations une fois les assets confirmés dans public/images/heros/). Extrait de
// app/voyages/[slug]/page.tsx le 26/08/2026 pour être réutilisé par l'Agent Social Media
// (app/admin/social-agent/page.tsx), qui a besoin du même visuel de couverture.
export const DESTINATION_HERO_IMAGE: Partial<Record<string, string>> = {
  "cote-basque": "/images/heros/basque.jpg",
  "new-york": "/images/heros/new-york.jpg",
  montreal: "/images/heros/montreal.jpg",
  "japon-urbain": "/images/heros/japon.jpg",
  "japon-tradition-nature": "/images/heros/japon.jpg",
  crete: "/images/heros/grece.jpg",
  mykonos: "/images/heros/grece.jpg",
  "italie-nord-culture": "/images/heros/italie.jpg",
  "italie-sorrente-amalfe": "/images/heros/italie.jpg",
  "italie-pouilles": "/images/heros/italie.jpg",
  dubai: "/images/heros/dubai.jpg",
  lisbonne: "/images/heros/portugal.jpg",
  porto: "/images/heros/portugal.jpg",
};
