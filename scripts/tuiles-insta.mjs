// Fabrique les tuiles Instagram d'un cycle, à la taille réelle (12/09/2026).
//
// Le Studio (/studio) dessine ces mêmes tuiles dans le navigateur, mais son export part d'un clic :
// personne ne peut le déclencher à la place de Soumia. Ce script reproduit exactement les mêmes
// modèles en HTML et les capture avec le même pilote Chrome que l'agent relecteur, pour qu'un cycle
// complet sorte d'une seule commande.
//
// Usage :
//   node scripts/tuiles-insta.mjs <spec.json> [dossier de sortie]
//   (dossier par défaut : ~/Documents/Le Voyage des Émotions/Posts Insta/insta-<destination>)
//
// Le fichier de spec est un JSON :
// {
//   "destination": "Biarritz",
//   "envie": "Bouger",                     // une des six, donne la couleur de fond
//   "villes": "Biarritz · Saint-Jean-de-Luz · Côte des Basques",
//   "promesse": "14 adresses testées",
//   "tuiles": [
//     { "type": "mot",        "fichier": "post-1-emotion/1-tuile-bouger" },
//     { "type": "definition", "fichier": "post-1-emotion/2-definition-bouger",
//       "lignes": ["Ce n'est pas cocher des kilomètres.", "C'est se réveiller avec une envie dans les jambes.", "Sortir avant que la rue soit pleine."] },
//     { "type": "terracotta", "fichier": "post-3-destination/1-tuile-biarritz",
//       "detail": "Saint-Jean-de-Luz · Côte des Basques" },
//     { "type": "garde",      "fichier": "post-4-carnet/1-page-de-garde" },
//     { "type": "adresses",   "fichier": "post-4-carnet/2-le-matin", "surtitre": "Le matin",
//       "photo": "/chemin/absolu/photo.jpg",
//       "adresses": [["École de surf Lagoondy", "Une heure, planche et combinaison fournies, 45 €"]] },
//     { "type": "sans-filtre", "fichier": "post-5-sans-filtre/01-page-de-garde" },
//     { "type": "story",      "fichier": "stories/03-j3-matin", "fond": "terracotta", "surtitre": "Ce soir",
//       "lignes": ["Ce soir,", "je te dis où."], "texte": "…" },
//     { "type": "rebus",      "fichier": "post-3-destination/1-rebus", "pictos": ["vague", "phare", "planche", "beret"] },
//     // "promesse" et "url" (13/09/2026) : pousser vers le site et le test Travel Match.
//     { "type": "fin",        "fichier": "post-4-carnet/6-fin-de-carnet",
//       "lignes": ["Quatorze adresses, trois jours,", "et une ville qui se lève tôt."],
//       "cta": "Huit questions, et le site te dit où aller." }
//   ]
// }
//
// Les photos de fond doivent déjà être au bon gabarit : scripts/photos-insta.mjs les recadre.
import { writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";

const COULEURS = {
  ardoise: "#47586B",
  cuivre: "#4A2E1F",
  prune: "#6B3B5E",
  sauge: "#4A6B48",
  ocean: "#2C5E73",
  obsidienne: "#22252A",
  terracotta: "#D27B5C",
  sable: "#F1DAB1",
  ivoire: "#FAF6F0",
  charcoal: "#1A1A1A",
  ink: "#8C4A32",
};

// Le code couleur des envies, identique à ENVIES (app/components/InstaStudio/presets.ts). Le
// terracotta n'est pas dans cette liste : il appartient à la tuile qui révèle la destination.
const ENVIES = {
  Flâner: COULEURS.cuivre,
  Déguster: COULEURS.prune,
  Respirer: COULEURS.sauge,
  "Lâcher prise": COULEURS.ocean,
  Vibrer: COULEURS.obsidienne,
  Bouger: COULEURS.ardoise,
};

const HANDLE = "@levoyagedesemotions";

// Pictogrammes au trait de la tuile rébus (13/09/2026). Dessinés ici plutôt que pris dans une
// bibliothèque d'icônes : aucune ne propose un phare, une planche de surf ou un béret. Même
// épaisseur de trait pour tous, pour qu'ils se lisent comme une seule famille.
const PICTOS = {
  vague: `<path d="M6 20c3-7 11-9 16-4-5 0-7 4-4 7"/><path d="M4 30c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4 4-4 8-4"/><path d="M4 38c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4 4-4 8-4"/>`,
  phare: `<path d="M19 42 21 17h6l2 25Z"/><path d="M20 17v-5h8v5"/><path d="M19 12l5-5 5 5"/><path d="M20.4 26h7.2M19.8 34h8.4"/><path d="M31 12l6-3M31 15l6 2M17 12l-6-3M17 15l-6 2"/><path d="M12 42h24"/>`,
  planche: `<g transform="rotate(35 24 24)"><path d="M24 3c8 9 8 33 0 42-8-9-8-33 0-42Z"/><path d="M24 8v33"/><path d="M24 37l-3 5"/></g>`,
  voilier: `<path d="M24 6v30"/><path d="M24 8 11 32h13"/><path d="M27 12c7 5 10 12 10 20H27"/><path d="M7 37h34l-4 5H11Z"/>`,
  savon: `<rect x="8" y="20" width="32" height="18" rx="5"/><path d="M14 20c0-4 3-6 6-6h8c3 0 6 2 6 6"/><circle cx="36" cy="10" r="3"/><circle cx="29" cy="7" r="2"/><circle cx="41" cy="16" r="1.6"/><path d="M17 29h14"/>`,
  ballon: `<circle cx="24" cy="24" r="17"/><path d="m24 16 7 5-3 8h-8l-3-8Z"/><path d="M24 16V8M31 21l8-3M28 29l5 7M20 29l-5 7M17 21l-8-3"/>`,
  poisson: `<path d="M6 24c6-9 18-12 28-4l8-6v20l-8-6C24 36 12 33 6 24Z"/><circle cx="14" cy="22" r="1.4"/><path d="M22 18c2 4 2 8 0 12"/>`,
  beret: `<g transform="rotate(-12 24 26)"><path d="M5 27c0-8 11-12 21-11 11 1 18 5 17 10-1 6-38 8-38 1Z"/><path d="M12 31c6 3 20 2 26-2"/><path d="M22 16c0-3 2-5 5-4"/></g>`,
  // Val d'Europe (13/09/2026) : le château de conte, le lac, le sac de shopping, le paddle.
  chateau: `<path d="M6 42h36"/><path d="M17 42V22h14v20"/><path d="M16 22l8-11 8 11"/><path d="M24 11V5l4 1.5-4 1.5"/><path d="M8 42V27h6v15M7 27l4-8 4 8"/><path d="M34 42V27h6v15M33 27l4-8 4 8"/><path d="M21 42v-5a3 3 0 0 1 6 0v5"/><path d="M24 26v3"/>`,
  lac: `<path d="M15 26a9 9 0 0 1 18 0"/><path d="M24 11V8M14 15l-2-2M34 15l2-2"/><path d="M5 26h38"/><path d="M11 32h26"/><path d="M16 37h16"/><path d="M21 42h6"/>`,
  sac: `<path d="M10 19h28l-2.5 23h-23Z"/><path d="M18 23v-7a6 6 0 0 1 12 0v7"/>`,
  paddle: `<path d="M4 34c0-1.6 2.5-2.6 6-2.6h17c3.5 0 6 1 6 2.6s-2.5 2.6-6 2.6H10c-3.5 0-6-1-6-2.6Z"/><path d="M40 6v28"/><path d="M37 6h6"/><path d="M38 34h4l-.5 6h-3Z"/><path d="M2 45c3.5 0 3.5-2 7-2s3.5 2 7 2 3.5-2 7-2 3.5 2 7 2 3.5-2 7-2 3.5 2 7 2"/>`,
};
const AMBIANCE_SABLE = "saturate(0.88) contrast(0.95) sepia(0.08) brightness(1.02)";
const CAPTURE = resolve(process.argv[1], "../../.claude/relecteur/capture.mjs");

function page({ h, corps }) {
  const echelle = 1080 / 420;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<style>
  * { box-sizing:border-box; margin:0; padding:0 }
  body { width:1080px; height:${h}px; overflow:hidden; background:#fff }
  .carte { width:420px; height:${Math.round(h / echelle)}px; transform:scale(${echelle}); transform-origin:top left; position:relative; overflow:hidden; display:flex }
  .titre { font-family:"Cormorant Garamond",serif }
  .mono { font-family:"IBM Plex Mono",monospace }
  .corps { font-family:"Source Serif 4",serif }
  .col { display:flex; flex-direction:column; width:100%; height:100%; padding:48px; justify-content:space-between }
  .rang { display:flex; align-items:center; gap:12px }
  .filet { height:1px }
  .bas { display:flex; align-items:flex-end; justify-content:space-between; gap:24px }
</style></head><body><div class="carte">${corps}</div></body></html>`;
}

const surtitre = (texte, couleurFilet, couleurTexte) =>
  `<div class="rang"><span class="filet" style="width:32px;background:${couleurFilet}"></span>
   <span class="mono" style="font-size:10px;text-transform:uppercase;letter-spacing:.28em;color:${couleurTexte}">${texte}</span></div>`;

const signature = (couleur) =>
  `<p class="titre" style="font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:${couleur}">${HANDLE}</p>`;

function html(tuile, spec) {
  const fond = ENVIES[spec.envie] ?? COULEURS.ardoise;

  if (tuile.type === "mot") {
    // Le haut porte le surtitre quand il y en a un (série des six envies), sinon le monogramme :
    // sur le post 1 d'un carnet il n'y a pas de surtitre, et laisser le coin vide prive la tuile de
    // la seule marque qui tient la grille d'un post à l'autre.
    const haut = tuile.surtitre
      ? surtitre(tuile.surtitre, COULEURS.sable, COULEURS.ivoire + "bf")
      : `<span class="titre" style="font-size:14px;letter-spacing:.4em;color:${COULEURS.ivoire}b3">LVE</span>`;
    return {
      h: 1080,
      corps: `<div class="col" style="background:${fond}">
        <div>${haut}</div>
        <p class="titre" style="font-size:60px;line-height:1.02;color:${COULEURS.ivoire}">${spec.envie}</p>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${COULEURS.ivoire}33"></span>
          <div class="bas">${signature(COULEURS.ivoire + "99")}</div>
        </div>
      </div>`,
    };
  }

  if (tuile.type === "definition") {
    // Dernière ligne en corps de texte : elle sert de respiration sous les phrases en Cormorant.
    const lignes = (tuile.lignes ?? []).map((l, i, all) =>
      i === all.length - 1 && all.length > 1
        ? `<p class="corps" style="font-size:14px;line-height:1.45;color:${COULEURS.ivoire}bf">${l}</p>`
        : `<p class="titre" style="font-size:24px;line-height:1.3;color:${COULEURS.ivoire}">${l}</p>`
    );
    return {
      h: 1080,
      corps: `<div class="col" style="background:${fond}">
        ${surtitre(spec.envie, COULEURS.sable, COULEURS.ivoire + "bf")}
        <div style="display:flex;flex-direction:column;gap:14px">${lignes.join("")}</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${COULEURS.ivoire}33"></span>
          ${signature(COULEURS.ivoire + "99")}
        </div>
      </div>`,
    };
  }

  if (tuile.type === "terracotta") {
    const detail = tuile.detail ?? spec.villes ?? "";
    // En capitales espacées, une ligne de plus de 33 signes passe à la ligne et laisse un mot seul
    // en dessous. On descend d'un cran plutôt que de couper le nom d'un lieu.
    const tailleDetail = detail.length > 33 ? 10 : 12;
    return {
      h: 1080,
      corps: `<div class="col" style="background:${COULEURS.terracotta};justify-content:center;align-items:center;text-align:center;gap:16px">
        <p class="titre" style="font-size:48px;color:#fff">${spec.destination}</p>
        <span class="filet" style="width:64px;background:${COULEURS.sable}"></span>
        <p class="mono" style="font-size:${tailleDetail}px;text-transform:uppercase;letter-spacing:.2em;color:${COULEURS.sable}">${detail}</p>
        <p class="titre" style="margin-top:24px;font-size:10px;text-transform:uppercase;letter-spacing:.3em;color:#ffffffb3">${HANDLE}</p>
      </div>`,
    };
  }

  if (tuile.type === "garde") {
    return {
      h: 1350,
      corps: `<div class="col" style="background:${COULEURS.sable}">
        ${surtitre(tuile.surtitre ?? "Nouveau carnet", COULEURS.ink, COULEURS.ink)}
        <div style="display:flex;flex-direction:column;gap:12px">
          <p class="titre" style="font-size:48px;line-height:1.05;color:${COULEURS.charcoal}">${spec.destination}</p>
          <p class="corps" style="font-size:14px;color:${COULEURS.charcoal}b3">${spec.villes ?? ""}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${COULEURS.charcoal}26"></span>
          <div class="bas">
            <div style="display:flex;flex-direction:column;gap:8px">
              <p class="mono" style="font-size:11px;text-transform:uppercase;letter-spacing:.22em;color:${COULEURS.ink}">${spec.promesse ?? ""}</p>
              ${signature(COULEURS.charcoal + "99")}
            </div>
            <span class="mono" style="white-space:nowrap;font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:${COULEURS.charcoal}99">Fais défiler →</span>
          </div>
        </div>
      </div>`,
    };
  }

  if (tuile.type === "adresses") {
    // Quatre adresses tiennent, un cran plus petit. Au-delà, la slide devient une liste de courses.
    // Une seule adresse : on passe en grand, sinon la slide a l'air vide plutôt qu'éditoriale.
    const nombre = (tuile.adresses ?? []).length;
    const serre = nombre >= 4;
    const seule = nombre === 1;
    const tailleNom = seule ? 32 : serre ? 21 : 24;
    const tailleDetail = seule ? 16 : serre ? 12 : 14;
    const liste = (tuile.adresses ?? [])
      .map(
        ([nom, detail]) => `<div style="display:flex;flex-direction:column;gap:${seule ? 8 : 4}px">
          <p class="titre" style="font-size:${tailleNom}px;line-height:1.15;color:${COULEURS.ivoire}">${nom}</p>
          ${detail ? `<p class="corps" style="font-size:${tailleDetail}px;line-height:1.35;color:${COULEURS.ivoire}bf">${detail}</p>` : ""}
        </div>`
      )
      .join("");
    return {
      h: 1350,
      corps: `<div style="position:relative;width:100%;height:100%;background:${COULEURS.obsidienne}">
        <!-- Photo SANS filtre (13/09/2026, Soumia : "ma photo est super belle et tu m'as mis un
             filtre bizarre, on ne voit plus la mer") : ni étalonnage Sable, ni voile crème. Seul le
             bas de l'image s'assombrit, juste ce qu'il faut sous le texte. -->
        <img src="file://${tuile.photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
        <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.45) 26%, rgba(0,0,0,0) 48%)"></div>
        <div style="position:absolute;left:40px;right:40px;bottom:40px;display:flex;flex-direction:column;gap:${serre ? 16 : 20}px;text-shadow:0 1px 2px rgba(0,0,0,.55),0 2px 14px rgba(0,0,0,.45)">
          ${surtitre(tuile.surtitre ?? "", COULEURS.terracotta, COULEURS.ivoire)}
          <div style="display:flex;flex-direction:column;gap:${serre ? 12 : 16}px">${liste}</div>
          ${signature(COULEURS.ivoire + "99")}
        </div>
      </div>`,
    };
  }

  if (tuile.type === "fin") {
    // Fond ivoire (13/09/2026) : dernière page du post 5 Sans filtre, assortie à sa page de garde.
    const fondFin = tuile.fond === "terracotta" ? COULEURS.terracotta : tuile.fond === "ivoire" ? COULEURS.ivoire : COULEURS.sable;
    const surSable = fondFin !== COULEURS.terracotta;
    const encre = surSable ? COULEURS.charcoal : "#ffffff";
    return {
      h: 1350,
      corps: `<div class="col" style="background:${fondFin}">
        ${surtitre(tuile.surtitre ?? "Fin du carnet", surSable ? COULEURS.ink : COULEURS.sable, surSable ? COULEURS.ink : COULEURS.sable)}
        <div style="display:flex;flex-direction:column;gap:8px">
          ${(tuile.lignes ?? []).map((l) => `<p class="titre" style="font-size:26px;line-height:1.35;color:${encre}">${l}</p>`).join("")}
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${surSable ? COULEURS.charcoal + "26" : "#ffffff33"}"></span>
          <p class="corps" style="font-size:14px;line-height:1.4;color:${encre}bf">${tuile.cta ?? ""}</p>
          ${tuile.promesse ? `<p class="mono" style="white-space:nowrap;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:${surSable ? COULEURS.ink : "#ffffffcc"}">${tuile.promesse}</p>` : ""}
          ${tuile.url ? `<p class="titre" style="font-size:19px;color:${encre}">${tuile.url}</p>` : ""}
          ${signature(encre + "99")}
        </div>
      </div>`,
    };
  }

  if (tuile.type === "rebus") {
    // Page de garde du post 3 (13/09/2026, demande de Soumia) : une énigme en images, la
    // destination ne se révèle qu'à la slide 2 (la tuile terracotta). Même fond terracotta : le
    // post 3 reste celui de la destination, dans la grille comme au swipe.
    const icone = (nom) =>
      `<svg viewBox="0 0 48 48" width="74" height="74" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${PICTOS[nom] ?? ""}</svg>`;
    const plus = `<span class="titre" style="font-size:30px;color:${COULEURS.sable}">+</span>`;
    const [a, b, c, d] = tuile.pictos ?? ["vague", "phare", "planche", "beret"];
    return {
      h: 1080,
      corps: `<div class="col" style="background:${COULEURS.terracotta}">
        ${surtitre(tuile.surtitre ?? "Devine où je t'emmène", COULEURS.sable, "#fff")}
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
          <div class="rang" style="gap:18px">${icone(a)}${plus}${icone(b)}${plus}</div>
          <div class="rang" style="gap:18px">${icone(c)}${plus}${icone(d)}
            <span class="titre" style="font-size:44px;line-height:1;color:#fff;margin-left:6px">= ?</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:#ffffff40"></span>
          <div class="bas">
            ${signature("#ffffffb3")}
            <span class="mono" style="white-space:nowrap;font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#ffffffcc">Fais défiler →</span>
          </div>
        </div>
      </div>`,
    };
  }

  if (tuile.type === "story") {
    // Story de transition entre deux posts (13/09/2026), format 9:16. La moitié basse reste libre :
    // c'est là que Soumia pose le sticker (sondage, quiz, compte à rebours, lien) dans l'appli.
    // "fond" : "envie" (couleur de l'envie du cycle), "terracotta", "sable" ou "ivoire".
    const fonds = { envie: fond, terracotta: COULEURS.terracotta, sable: COULEURS.sable, ivoire: COULEURS.ivoire };
    const bg = fonds[tuile.fond ?? "envie"] ?? fond;
    const clair = bg === COULEURS.sable || bg === COULEURS.ivoire;
    const encre = clair ? COULEURS.charcoal : "#ffffff";
    const accent = clair ? COULEURS.ink : COULEURS.sable;
    const lignes = (tuile.lignes ?? [])
      .map((l) => `<p class="titre" style="font-size:34px;line-height:1.12;color:${encre}">${l}</p>`)
      .join("");
    return {
      h: 1920,
      corps: `<div class="col" style="background:${bg};padding:56px 40px 64px">
        <div style="display:flex;flex-direction:column;gap:22px">
          ${surtitre(tuile.surtitre ?? "", accent, accent)}
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:40px">${lignes}</div>
          ${tuile.texte ? `<p class="corps" style="font-size:15px;line-height:1.45;color:${encre}bf;margin-top:6px">${tuile.texte}</p>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${tuile.promesse ? `<p class="mono" style="white-space:nowrap;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:${accent}">${tuile.promesse}</p>` : ""}
          ${tuile.url ? `<p class="titre" style="font-size:18px;color:${encre}">${tuile.url}</p>` : ""}
          ${signature(encre + "99")}
        </div>
      </div>`,
    };
  }

  if (tuile.type === "photo-legendee") {
    // Photo du post Sans filtre avec sa légende (13/09/2026, demande de Soumia : sur Instagram la
    // légende du post ne se voit qu'une fois). Façon tirage : la photo en haut, intacte — aucun
    // filtre, aucun texte posé dessus — et la légende dans la bande crème en dessous.
    return {
      h: 1350,
      corps: `<div style="width:100%;height:100%;background:${COULEURS.ivoire};display:flex;flex-direction:column;padding:22px 22px 0">
        <div style="flex:1;min-height:0;background:#ddd url('file://${tuile.photo}') center/cover no-repeat"></div>
        <div style="height:118px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 6px">
          <p class="mono" style="font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:${COULEURS.ink}">${tuile.numero ?? ""}</p>
          <p class="titre" style="font-size:21px;line-height:1.2;color:${COULEURS.charcoal}">${tuile.legende ?? ""}</p>
        </div>
      </div>`,
    };
  }

  if (tuile.type === "sans-filtre") {
    // Page de garde du post 5, qui referme le cycle d'un carnet (13/09/2026, demande de Soumia) :
    // ses photos telles qu'elle les a prises, comme la page /sans-filtre du site. Fond ivoire — la
    // tuile de la voix de Soumia — et "filtre" en italique terracotta, comme le titre du site.
    return {
      h: 1350,
      corps: `<div class="col" style="background:${COULEURS.ivoire}">
        ${surtitre(tuile.surtitre ?? spec.destination, COULEURS.ink, COULEURS.ink)}
        <div style="display:flex;flex-direction:column;gap:18px">
          <p class="titre" style="font-size:64px;line-height:.95;color:${COULEURS.charcoal}">Sans <em style="font-style:italic;color:#B55F42">filtre</em></p>
          <p class="corps" style="font-size:15px;line-height:1.45;color:${COULEURS.charcoal}b3">${tuile.sousTitre ?? "Mes photos telles que je les ai prises."}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${COULEURS.charcoal}26"></span>
          <div class="bas">
            ${signature(COULEURS.charcoal + "99")}
            <span class="mono" style="white-space:nowrap;font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:${COULEURS.charcoal}99">Fais défiler →</span>
          </div>
        </div>
      </div>`,
    };
  }

  throw new Error(`Type de tuile inconnu : "${tuile.type}"`);
}

const [, , specPath, dossierArg] = process.argv;
if (!specPath) {
  console.error("Donne le fichier de spec : node scripts/tuiles-insta.mjs spec.json [dossier]");
  process.exit(1);
}

const spec = JSON.parse(readFileSync(specPath, "utf8"));
if (!ENVIES[spec.envie]) {
  console.error(`Envie inconnue : "${spec.envie}". Les six sont : ${Object.keys(ENVIES).join(", ")}.`);
  process.exit(1);
}
const sortie =
  dossierArg ??
  join(homedir(), "Documents", "Le Voyage des Émotions", "Posts Insta", `insta-${spec.destination.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`);
const travail = join(tmpdir(), `lve-tuiles-${Date.now()}`);
mkdirSync(travail, { recursive: true });

for (const tuile of spec.tuiles) {
  const { h, corps } = html(tuile, spec);
  const htmlPath = join(travail, `${tuile.fichier.replace(/\//g, "_")}.html`);
  writeFileSync(htmlPath, page({ h, corps }));
  const png = join(sortie, `${tuile.fichier}.png`);
  mkdirSync(dirname(png), { recursive: true });
  execFileSync(
    "node",
    [CAPTURE, `file://${htmlPath}`, png, "--largeur", "1080", "--hauteur", String(h)],
    { stdio: "inherit" }
  );
}

rmSync(travail, { recursive: true, force: true });
console.log(`\n${spec.tuiles.length} tuiles dans ${sortie}`);
console.log("Regarde chaque image avant de la livrer : une ligne qui déborde ne se voit pas autrement.");
