// Domaine canonique du site (03/09/2026) — nom de domaine acheté par Soumia. Isolé ici plutôt que
// dans app/layout.tsx pour que sitemap.ts / robots.ts ne tirent pas tout le layout (polices,
// globals.css) juste pour lire une URL. next.config.ts garde sa propre copie : il est chargé hors
// du graphe de l'app et ne peut pas importer ce module.
export const SITE_URL = "https://levoyagedesemotions.fr";
