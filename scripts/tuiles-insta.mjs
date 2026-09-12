// Fabrique les tuiles Instagram d'un cycle, à la taille réelle (12/09/2026).
//
// Le Studio (/studio) dessine ces mêmes tuiles dans le navigateur, mais son export part d'un clic :
// personne ne peut le déclencher à la place de Soumia. Ce script reproduit exactement les mêmes
// modèles en HTML et les capture avec le même pilote Chrome que l'agent relecteur, pour qu'un cycle
// complet sorte d'une seule commande.
//
// Usage :
//   node scripts/tuiles-insta.mjs <spec.json> [dossier de sortie]
//   (dossier par défaut : ~/Downloads/insta-<destination>)
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
    return {
      h: 1080,
      corps: `<div class="col" style="background:${fond}">
        <div></div>
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
    const serre = (tuile.adresses ?? []).length >= 4;
    const liste = (tuile.adresses ?? [])
      .map(
        ([nom, detail]) => `<div style="display:flex;flex-direction:column;gap:4px">
          <p class="titre" style="font-size:${serre ? 21 : 24}px;line-height:1.15;color:${COULEURS.ivoire}">${nom}</p>
          ${detail ? `<p class="corps" style="font-size:${serre ? 12 : 14}px;line-height:1.3;color:${COULEURS.ivoire}bf">${detail}</p>` : ""}
        </div>`
      )
      .join("");
    return {
      h: 1350,
      corps: `<div style="position:relative;width:100%;height:100%;background:${COULEURS.obsidienne}">
        <img src="file://${tuile.photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:${AMBIANCE_SABLE}">
        <div style="position:absolute;inset:0;background:#E8DFC8;opacity:.07"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.55) 45%, transparent)"></div>
        <div style="position:absolute;left:40px;right:40px;bottom:40px;display:flex;flex-direction:column;gap:${serre ? 16 : 20}px">
          ${surtitre(tuile.surtitre ?? "", COULEURS.terracotta, COULEURS.ivoire)}
          <div style="display:flex;flex-direction:column;gap:${serre ? 12 : 16}px">${liste}</div>
          ${signature(COULEURS.ivoire + "99")}
        </div>
      </div>`,
    };
  }

  if (tuile.type === "fin") {
    const fondFin = tuile.fond === "terracotta" ? COULEURS.terracotta : COULEURS.sable;
    const surSable = fondFin === COULEURS.sable;
    const encre = surSable ? COULEURS.charcoal : "#ffffff";
    return {
      h: 1350,
      corps: `<div class="col" style="background:${fondFin}">
        ${surtitre("Fin du carnet", surSable ? COULEURS.ink : COULEURS.sable, surSable ? COULEURS.ink : COULEURS.sable)}
        <div style="display:flex;flex-direction:column;gap:8px">
          ${(tuile.lignes ?? []).map((l) => `<p class="titre" style="font-size:26px;line-height:1.35;color:${encre}">${l}</p>`).join("")}
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <span class="filet" style="background:${surSable ? COULEURS.charcoal + "26" : "#ffffff33"}"></span>
          <p class="corps" style="font-size:14px;line-height:1.4;color:${encre}bf">${tuile.cta ?? ""}</p>
          ${signature(encre + "99")}
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
  join(homedir(), "Downloads", `insta-${spec.destination.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`);
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
