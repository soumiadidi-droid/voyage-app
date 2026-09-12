// Recadre une photo au gabarit d'un post (12/09/2026). Toujours partir des `hires-` du carnet :
// les `web-` sont déjà réduites pour le site, les réétirer se voit.
//
// Usage :
//   node scripts/photos-insta.mjs <source> <largeur> <hauteur> <sortie>
//   node scripts/photos-insta.mjs public/images/voyages/cote-basque/hires-IMG_1234.jpg 1080 1350 ~/Downloads/insta-biarritz/photos-source/le-matin.jpg
//
// Le recadrage est centré : c'est un défaut raisonnable, pas un choix artistique. Regarde l'image
// après coup — une photo peut perdre son sujet dans l'opération.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [, , source, largeurArg, hauteurArg, sortie] = process.argv;
if (!source || !largeurArg || !hauteurArg || !sortie) {
  console.error("Usage : node scripts/photos-insta.mjs <source> <largeur> <hauteur> <sortie>");
  process.exit(1);
}

const largeur = Number(largeurArg);
const hauteur = Number(hauteurArg);

function dimension(fichier, propriete) {
  const sortieSips = execFileSync("sips", ["-g", propriete, fichier], { encoding: "utf8" });
  return Number(sortieSips.trim().split(/\s+/).pop());
}

const sourceLargeur = dimension(source, "pixelWidth");
const sourceHauteur = dimension(source, "pixelHeight");

// On agrandit jusqu'à ce que les DEUX côtés couvrent la cible, puis on recadre au centre : sans ça,
// une photo paysage passée en 4:5 arrive plus étroite que le cadre et sips la laisse telle quelle.
const facteur = Math.max(largeur / sourceLargeur, hauteur / sourceHauteur);
const largeurIntermediaire = Math.ceil(sourceLargeur * facteur);

mkdirSync(dirname(sortie), { recursive: true });
copyFileSync(source, sortie);
execFileSync("sips", ["-s", "format", "jpeg", "--resampleWidth", String(largeurIntermediaire), sortie], {
  stdio: "ignore",
});
// sips prend la hauteur AVANT la largeur pour un recadrage.
execFileSync("sips", ["-c", String(hauteur), String(largeur), sortie], { stdio: "ignore" });

console.log(`${sortie} — ${dimension(sortie, "pixelWidth")}×${dimension(sortie, "pixelHeight")}`);
