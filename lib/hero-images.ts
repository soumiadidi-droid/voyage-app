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
  // Le coucher de soleil avec surfeurs (Frederic Christian, photo-1670278365321-1f205b318ab3) a été
  // mis en ligne puis retiré le 12/09/2026 : Soumia préfère finalement le phare. Ne pas le
  // reproposer au nom de la lumière chaude, c'est un choix assumé.
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
  // Vieux-Port de Marseille (basilique Notre-Dame de la Garde en arrière-plan) — Elisa Schmidt,
  // https://unsplash.com/photos/-jGQaEA3YC0. Destination renommée carry-le-rouet → marseille le
  // 30/08/2026 (demande Soumia) : cette photo, prise à l'origine en approximation faute de photo
  // libre de droit du village exact de Carry-le-Rouet, colle maintenant pile au nouveau nom.
  marseille:
    "https://images.unsplash.com/photo-1566838217578-1903568a76d9?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Big Ben et Westminster Bridge — Alex Ghiurau, https://unsplash.com/photos/big-ben-clock-tower-and-westminster-bridge-over-river-thames-A94gGLeFd68
  londres:
    "https://images.unsplash.com/photo-1758543144598-9d954f44799a?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Skyline de Hong Kong depuis le Victoria Peak au coucher du soleil — Manson,
  // https://unsplash.com/photos/4vf1KEkD7Gc
  "chine-urbaine":
    "https://images.unsplash.com/photo-1620015092538-e33c665fc181?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Piliers de grès de Zhangjiajie dans la brume ("les montagnes d'Avatar") — Robynne O,
  // https://unsplash.com/photos/sandstone-pillars-in-zhangjiajie-national-park-CRvaC071ZXo
  "chine-nature":
    "https://images.unsplash.com/photo-1567266565245-c08dc046815f?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Pin penché sur une plage déserte d'Ibiza, ciel voilé — Dave Dunlop,
  // https://unsplash.com/photos/SP1gHd_62oI (choisie par Soumia : correspond à son séjour de
  // février, hors saison, plutôt qu'une crique turquoise de carte postale)
  ibiza:
    "https://images.unsplash.com/photo-1756968169980-846ac2e81430?fm=jpg&q=80&w=2400&auto=format&fit=crop",
  // Lac de Serris — Lipton1989, Wikimedia Commons, CC BY-SA 4.0 :
  // https://commons.wikimedia.org/wiki/File:Lac_de_Serris_77.jpg — aucune photo Unsplash de Serris
  // n'existe. Licence à attribution obligatoire : crédit visible via HERO_IMAGE_CREDIT ci-dessous.
  // La photo de Soumia (vol d'oies au lever du jour, oies-serris.jpg) a été essayée puis remplacée
  // le 13/09/2026 ; elle reste dans le dossier, sans GPS, pour Instagram.
  // Photo de Soumia (15/09/2026, choix définitif après un aller-retour avec la photo Wikimedia) :
  // les résidences et le lac de Serris par un matin de ciel bleu. lac-serris.jpg (Wikimedia, crédit
  // obligatoire) reste dans le dossier. Métadonnées GPS retirées.
  "val-d-europe": "/images/voyages/val-d-europe/serris-soumia.jpg",
  // Façade avant du Palais Garnier et ses statues dorées — Francesco Zivoli,
  // https://unsplash.com/photos/OYSKRsmgpmg (14/09/2026). Remplace la vue depuis le toit des Galeries
  // Lafayette (Nathan Staz) : l'Opéra y était en bas à gauche, pile sous le bloc de texte. Ici le
  // sujet est dans le haut de l'image, visible au-dessus du bloc sur ordinateur comme sur téléphone.
  paris:
    "https://images.unsplash.com/photo-1645956734722-ac84c86fa4da?fm=jpg&q=80&w=2400&auto=format&fit=crop",
};

// Crédit affiché sur la photo quand sa licence l'exige (CC BY-SA, etc.). Les photos Unsplash n'en
// ont pas besoin et n'ont pas d'entrée ici.
export const HERO_IMAGE_CREDIT: Partial<Record<string, { texte: string; lien: string }>> = {
};

// Couvertures dont le sujet est à gauche : le bloc de texte passe à droite sur ordinateur
// (relecture du 14/09/2026 : sur Paris, le bloc cachait l'Opéra Garnier).
// Val d'Europe (15/09/2026) : les résidences et le lac sont à gauche de la photo.
export const HERO_PANNEAU_A_DROITE = new Set<string>(["val-d-europe"]);
// Paris retiré le 14/09/2026 : Soumia préfère la photo telle qu'elle était, bloc à gauche.

// Cadrage de la couverture quand le sujet n'est pas au centre (14/09/2026) : sur téléphone, l'écran
// étroit ne garde qu'une bande verticale de la photo, et l'Opéra Garnier (à gauche) disparaissait.
export const HERO_POSITION: Partial<Record<string, string>> = {
};
