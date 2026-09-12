// Contraste entre une couleur de texte et une couleur de fond, selon la norme d'accessibilité WCAG
// (11/09/2026, agent relecteur).
//
// Usage : node contraste.mjs "<texte>" "<fond>" [opacité du texte, de 0 à 1]
//   node contraste.mjs "#d27b5c" "#faf7f0"
//   node contraste.mjs "#1a1a1a" "#faf7f0" 0.7     (texte charcoal à 70 %, ex. text-lve-charcoal/70)
//
// Seuils : 4,5 pour le texte courant, 3 pour le gros texte (24 px et plus, ou 19 px en gras).
const [text, background, alpha = "1"] = process.argv.slice(2);
if (!text || !background) {
  console.log('Usage : node contraste.mjs "#texte" "#fond" [opacité 0-1]');
  process.exit(1);
}

const rgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
// Un texte semi-transparent se lit avec la couleur qu'il prend réellement sur ce fond.
const blend = (fg, bg, a) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const luminance = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const bg = rgb(background);
const fg = blend(rgb(text), bg, Number(alpha));
const [light, dark] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
const ratio = (light + 0.05) / (dark + 0.05);
console.log(
  `${ratio.toFixed(2)}:1 — texte courant ${ratio >= 4.5 ? "OK" : "TROP FAIBLE"} (seuil 4,5) · gros texte ${ratio >= 3 ? "OK" : "TROP FAIBLE"} (seuil 3)`,
);
