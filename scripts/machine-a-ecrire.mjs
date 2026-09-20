// Effet machine à écrire : fabrique la suite d'images d'un texte qui s'écrit lettre par lettre,
// au format reel (1080 × 1920), puis les assemble en vidéo avec scripts/montage.
//
// Écrit le 20/09/2026 à la demande de Soumia. Même typographie que les tuiles (Cormorant Garamond
// chargée par Chrome) : les polices de marque ne sont pas installées sur le Mac, donc tout passe
// par le rendu HTML, comme scripts/tuiles-insta.mjs.
//
// Astuce de vitesse : on ne lance pas Chrome une fois par image. On empile huit images par planche
// dans une seule page, on capture la planche, puis on la découpe avec sips. Huit fois moins de
// lancements.
//
// Usage :
//   node scripts/machine-a-ecrire.mjs <spec.json> [dossier de sortie]
//
// Spec :
// {
//   "fichier": "machine/ouverture",         // nom de la vidéo produite
//   "fond": "sable",                        // sable | ivoire | terracotta | obsidienne...
//   "surtitre": "Hors-série",
//   "lignes": ["Une journée", "dans ma ville."],
//   "signature": true,                       // @levoyagedesemotions en bas
//   "cps": 14,                               // caractères par seconde
//   "fps": 12,                               // images par seconde de la frappe
//   "maintien": 1.8                          // secondes d'arrêt sur le texte complet
// }
import { writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join, dirname } from "node:path";
import { tmpdir, homedir } from "node:os";

const COULEURS = {
  ardoise: "#47586B", cuivre: "#4A2E1F", prune: "#6B3B5E", sauge: "#4A6B48", ocean: "#2C5E73",
  obsidienne: "#22252A", terracotta: "#D27B5C", sable: "#F1DAB1", ivoire: "#FAF6F0",
  charcoal: "#1A1A1A", ink: "#8C4A32",
};
const CAPTURE = resolve(process.argv[1], "../../.claude/relecteur/capture.mjs");
const MONTAGE = resolve(process.argv[1], "../montage");

const L = 1080, H = 1920;

const spec = JSON.parse(execFileSync("cat", [process.argv[2]]).toString());
const sortie = process.argv[3] ?? join(homedir(), "Documents", "Le Voyage des Émotions", "Posts Insta");
const fond = COULEURS[spec.fond ?? "sable"] ?? spec.fond ?? COULEURS.sable;
const clair = [COULEURS.sable, COULEURS.ivoire].includes(fond);
const encre = clair ? COULEURS.charcoal : "#ffffff";
const accent = clair ? COULEURS.ink : COULEURS.sable;
const fps = spec.fps ?? 12;
const cps = spec.cps ?? 14;

// Les étapes : le texte complet est révélé caractère par caractère, lignes comprises.
const texte = spec.lignes.join("\n");
const total = texte.length;
const parImage = Math.max(1, cps / fps);
const etapes = [];
for (let n = parImage; n < total; n += parImage) etapes.push(Math.round(n));
etapes.push(total);
const maintien = Math.round((spec.maintien ?? 1.5) * fps);
for (let i = 0; i < maintien; i++) etapes.push(total);

const page = (n, curseur) => {
  const visible = texte.slice(0, n).split("\n");
  const lignes = visible
    .map((l, i) => `<p class="t">${l || "&nbsp;"}${i === visible.length - 1 && curseur ? '<span class="c"></span>' : ""}</p>`)
    .join("");
  return `<div class="cadre">
    <div>${spec.surtitre ? `<p class="s"><span class="f"></span>${spec.surtitre}</p>` : ""}
      <div class="bloc">${lignes}</div></div>
    ${spec.signature === false ? "" : `<p class="h">@levoyagedesemotions</p>`}
  </div>`;
};

const style = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000}
  .cadre{width:${L}px;height:${H}px;background:${fond};display:flex;flex-direction:column;
    justify-content:space-between;padding:150px 96px 120px;font-family:'Cormorant Garamond',serif}
  .s{font-family:'IBM Plex Mono',monospace;font-size:22px;letter-spacing:.28em;text-transform:uppercase;
    color:${accent};display:flex;align-items:center;gap:20px;margin-bottom:96px}
  .f{display:inline-block;width:70px;height:2px;background:${accent}}
  .bloc{display:flex;flex-direction:column;gap:18px}
  .t{font-size:82px;line-height:1.12;color:${encre};min-height:1px}
  .c{display:inline-block;width:6px;height:64px;background:${accent};margin-left:10px;vertical-align:-8px}
  .h{font-family:'IBM Plex Mono',monospace;font-size:19px;letter-spacing:.24em;text-transform:uppercase;color:${encre}99}
</style>`;

const travail = join(tmpdir(), `machine-${Date.now()}`);
mkdirSync(travail, { recursive: true });
const dossierImages = join(travail, "images");
mkdirSync(dossierImages, { recursive: true });

// Une capture par image. L'empilement par planches a été essayé le 20/09/2026 et abandonné :
// `capture.mjs --pleine` ne part pas du haut de la page, donc toutes les images sortaient décalées
// d'un millier de pixels. Une page = une image = un cadrage juste.
let index = 0;
for (const [i, n] of etapes.entries()) {
  const html = `<!doctype html><meta charset="utf-8">${style}<body>${page(n, i % 2 === 0)}</body>`;
  const htmlPath = join(travail, `image-${i}.html`);
  writeFileSync(htmlPath, html);
  const png = join(dossierImages, String(index).padStart(4, "0") + ".png");
  execFileSync("node", [CAPTURE, `file://${htmlPath}`, png, "--largeur", String(L), "--hauteur", String(H)], { stdio: "ignore" });
  index++;
}

console.log(`${index} images de frappe`);

const specMontage = {
  fps: 30,
  segments: readdirSync(dossierImages).sort().map((f) => ({ type: "image", fichier: join(dossierImages, f), duree: 1 / fps })),
};
const specPath = join(travail, "montage.json");
writeFileSync(specPath, JSON.stringify(specMontage));
const video = join(sortie, `${spec.fichier}.mp4`);
mkdirSync(dirname(video), { recursive: true });
execFileSync(MONTAGE, [specPath, video], { stdio: "inherit" });
rmSync(travail, { recursive: true, force: true });
console.log(`→ ${video}`);
