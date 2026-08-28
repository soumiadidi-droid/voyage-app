// Image Hero par content_slug (décidé le 26/08/2026, démarré sur New York puis étendu à toutes
// les destinations une fois les assets confirmés dans public/images/heros/). Extrait de
// app/voyages/[slug]/page.tsx le 26/08/2026 pour être réutilisé par l'Agent Social Media
// (app/admin/social-agent/page.tsx), qui a besoin du même visuel de couverture.
//
// Remplacées le 28/08/2026 par des photos libres de droit (licence Unsplash, lieu vérifié pour
// chacune avant utilisation) à la demande de Soumia — anciens fichiers locaux (public/images/
// heros/*.jpg) laissés en place mais plus référencés ici. Chaque destination a maintenant sa
// propre photo distincte (avant : plusieurs partageaient une image générique par pays/région —
// japon.jpg, grece.jpg, italie.jpg, portugal.jpg).
export const DESTINATION_HERO_IMAGE: Partial<Record<string, string>> = {
  // Phare de Biarritz — Dani Fuentes Ortiz, https://unsplash.com/photos/IUCa8juTvjM
  "cote-basque":
    "https://images.unsplash.com/photo-1451159289881-10709108b343?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Manhattan Bridge au crépuscule — Maxim Klimashin, https://unsplash.com/photos/manhattan-bridge-and-new-york-city-skyline-at-dusk-CDQRLACxIzw
  "new-york":
    "https://images.unsplash.com/photo-1761233139114-def1098bf2b5?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Vieux-Port de Montréal — Olivier Devillers, https://unsplash.com/photos/a-body-of-water-with-buildings-along-it-AzHrzWtmp1A
  montreal:
    "https://images.unsplash.com/photo-1659618486174-245686c0aac4?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Rue de Shinjuku, Tokyo, de nuit — Johan Mouchet, https://unsplash.com/photos/nighttime-scene-of-a-bustling-street-in-tokyo-wZLX8vQqa08
  "japon-urbain":
    "https://images.unsplash.com/photo-1749813482475-3c12a8c4a5bd?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Pagode Chureito et mont Fuji — Manuel Cosentino, https://unsplash.com/photos/mt-fuji-n--CMLApjfI
  "japon-tradition-nature":
    "https://images.unsplash.com/photo-1528164344705-47542687000d?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Balos Beach, Crète (remplace le phare de La Canée du 28/08, pas au goût de Soumia) —
  // Ignacio Correia, https://unsplash.com/photos/green-and-brown-mountain-beside-blue-sea-under-blue-sky-during-daytime-C5eXdxCS74c
  crete:
    "https://images.unsplash.com/photo-1585320806322-db6d9f35b0c8?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Moulin de Mykonos — Jason Mavrommatis, https://unsplash.com/photos/white-and-black-windmill-tc5z7vlztuY
  mykonos:
    "https://images.unsplash.com/photo-1494356830678-78f6cd754f1a?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Duomo de Florence au lever du jour — Henrique Ferreira, https://unsplash.com/photos/florence-cityscape-with-duomo-cathedral-at-sunrise-zMFxCtkn9vI
  "italie-nord-culture":
    "https://images.unsplash.com/photo-1776377231754-d36928e6ee4d?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Falaises colorées d'Amalfi — Tom Podmore, https://unsplash.com/photos/colorful-buildings-on-amalfi-cliffside-1zkHXas1GIo
  "italie-sorrente-amalfe":
    "https://images.unsplash.com/photo-1612698093158-e07ac200d44e?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Polignano a Mare, Pouilles — Vincenzo De Simone, https://unsplash.com/photos/yAn892ej5kQ
  "italie-pouilles":
    "https://images.unsplash.com/photo-1600160805984-2d44e4a1a903?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Burj Khalifa et Downtown Dubaï — Nejc Soklič, https://unsplash.com/photos/the-burj-khalifa-towers-over-dubais-cityscape-bVblbt3tGxM
  dubai:
    "https://images.unsplash.com/photo-1748373448914-1d7f882700e2?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Tram jaune, Lisbonne — Aayush Gupta, https://unsplash.com/photos/yellow-tram-in-historic-lisbon-street-ljhCEaHYWJ8
  lisbonne:
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Pont Dom Luís I sur le Douro, Porto — Dorian Mongel, https://unsplash.com/photos/dom-luis-i-bridge-over-the-douro-river-in-porto-zllGA-8RW5M
  porto:
    "https://images.unsplash.com/photo-1762294946283-6921938e9937?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // ATTENTION : Vieux-Port de MARSEILLE (basilique Notre-Dame de la Garde reconnaissable en
  // arrière-plan), pas Carry-le-Rouet lui-même — aucune photo libre de droit du village exact
  // trouvée. Accepté explicitement par Soumia le 28/08/2026 ("carry marseille") en connaissance
  // de cause après l'avoir signalé. Elisa Schmidt, https://unsplash.com/photos/-jGQaEA3YC0
  "carry-le-rouet":
    "https://images.unsplash.com/photo-1566838217578-1903568a76d9?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Big Ben et Westminster Bridge — Alex Ghiurau, https://unsplash.com/photos/big-ben-clock-tower-and-westminster-bridge-over-river-thames-A94gGLeFd68
  londres:
    "https://images.unsplash.com/photo-1758543144598-9d954f44799a?fm=jpg&q=80&w=2400&auto=format&fit=crop",
};
