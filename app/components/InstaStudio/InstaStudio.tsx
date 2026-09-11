"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus } from "lucide-react";
import { PRESETS, type PresetId } from "./presets";

// Le compte Instagram, écrit une seule fois (11/09/2026) : la carte "minimalist" affichait
// "@voyagedesemotions" alors que le pied de page du site pointe vers "@levoyagedesemotions".
// Une signature fausse sur un visuel publié ne se rattrape pas.
const HANDLE = "@levoyagedesemotions";

export function InstaStudio() {
  const [preset, setPreset] = useState<PresetId>("minimalist");
  const [quote, setQuote] = useState(
    "Un pays, une histoire, une photo à la fois."
  );
  const [moodWord, setMoodWord] = useState("Farniente");
  const [moodDetail, setMoodDetail] = useState("Côte Basque · Été 2026");
  const [addressName, setAddressName] = useState("Loco Polo");
  const [addressCity, setAddressCity] = useState("Saint-Jean-de-Luz");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleExport() {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `lve-${preset}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 flex items-baseline gap-4">
        <span className="font-title text-3xl tracking-[0.35em] text-lve-charcoal">
          L.V.E
        </span>
        <span className="font-mono-lve text-xs uppercase tracking-[0.2em] text-lve-terracotta">
          Studio
        </span>
      </header>

      <div className="grid gap-10 md:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                  preset === p.id
                    ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                    : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === "minimalist" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Citation
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
            </div>
          )}

          {preset === "editorial" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Phrase (une ligne par retour à la ligne)
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
            </div>
          )}

          {preset === "terracotta-mood" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Mot / ambiance
              </label>
              <input
                value={moodWord}
                onChange={(e) => setMoodWord(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Détail
              </label>
              <input
                value={moodDetail}
                onChange={(e) => setMoodDetail(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
            </div>
          )}

          {preset === "carnet" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Photo
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-lve-border bg-lve-bg p-4 text-sm text-lve-charcoal/60 hover:border-lve-terracotta">
                <ImagePlus size={16} />
                {photo ? "Changer la photo" : "Ajouter une photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Adresse
              </label>
              <input
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Ville
              </label>
              <input
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-full bg-lve-terracotta px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-lve-terracotta-dark disabled:opacity-50"
          >
            <Download size={16} />
            {isExporting ? "Export en cours..." : "Télécharger l'image"}
          </button>
        </div>

        <div className="flex items-start justify-center">
          <div
            ref={cardRef}
            className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-sm shadow-lg"
          >
            {/* Refonte du 11/09/2026, après comparaison avec la référence apportée par Soumia
                (le compte Slow Studio) : une seule typographie sur toute la carte — la signature
                était en écriture manuscrite, d'un registre étranger au reste et qui annulait
                l'élégance de la citation. Le bloc de texte est ancré en bas plutôt que flottant au
                milieu, et le monogramme apparaît en haut : c'est lui qui tient la grille quand les
                publications se suivent. */}
            {preset === "minimalist" && (
              <div className="flex h-full w-full flex-col justify-between bg-lve-ivory p-12">
                <span className="font-title text-sm tracking-[0.4em] text-lve-charcoal/70">
                  LVE
                </span>
                <div className="flex flex-col gap-6">
                  <p className="font-title text-3xl leading-snug text-lve-charcoal">
                    {quote}
                  </p>
                  <p className="font-title text-[11px] uppercase tracking-[0.3em] text-lve-terracotta">
                    {HANDLE}
                  </p>
                </div>
              </div>
            )}

            {/* Monogramme débordant (11/09/2026) : "LVE" écrit à la verticale, volontairement
                rogné par le bord gauche, la phrase calée à droite. Chaque ligne de la phrase est
                affichée séparément, ce qui permet le procédé de répétition de la référence. */}
            {preset === "editorial" && (
              <div className="relative h-full w-full overflow-hidden bg-lve-sand">
                <span
                  className="pointer-events-none absolute -left-[0.12em] top-1/2 -translate-y-1/2 font-title leading-none text-white"
                  style={{ fontSize: "clamp(9rem, 42vw, 17rem)", writingMode: "vertical-rl" }}
                >
                  LVE
                </span>
                <div className="absolute inset-y-0 right-0 flex w-[58%] flex-col justify-center gap-2 pr-10">
                  {quote.split("\n").filter(Boolean).map((line, i) => (
                    <p
                      key={i}
                      className="font-title text-[13px] uppercase tracking-[0.28em] text-lve-charcoal"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <p className="absolute bottom-8 right-10 font-title text-[10px] uppercase tracking-[0.3em] text-lve-charcoal/60">
                  {HANDLE}
                </p>
              </div>
            )}

            {preset === "terracotta-mood" && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-lve-terracotta p-12 text-center">
                <p className="font-title text-5xl text-white">{moodWord}</p>
                <div className="h-px w-16 bg-lve-sand" />
                <p className="font-mono-lve text-xs uppercase tracking-[0.2em] text-lve-sand">
                  {moodDetail}
                </p>
                <p className="mt-6 font-title text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {HANDLE}
                </p>
              </div>
            )}

            {preset === "carnet" && (
              <div className="relative h-full w-full bg-lve-obsidian">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono-lve text-xs uppercase tracking-wide text-white/40">
                    Ajoute une photo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute left-6 top-6 rounded-full bg-lve-terracotta px-3 py-1 font-mono-lve text-[10px] uppercase tracking-[0.15em] text-white">
                  J’ai testé
                </span>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-title text-2xl text-white">
                    {addressName}
                  </p>
                  <p className="font-body text-sm text-lve-sand">
                    {addressCity}
                  </p>
                  <p className="mt-4 font-title text-[10px] uppercase tracking-[0.3em] text-white/70">
                    {HANDLE}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
