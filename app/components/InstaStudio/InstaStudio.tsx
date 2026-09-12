"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus } from "lucide-react";
import {
  PRESETS,
  FORMATS,
  FILTRES,
  FACES,
  ENVIES,
  type PresetId,
  type FormatId,
  type FiltreId,
  type FaceId,
} from "./presets";

// Le compte Instagram, écrit une seule fois (11/09/2026) : la carte "minimalist" affichait
// "@voyagedesemotions" alors que le pied de page du site pointe vers "@levoyagedesemotions".
// Une signature fausse sur un visuel publié ne se rattrape pas.
const HANDLE = "@levoyagedesemotions";

export function InstaStudio() {
  const [preset, setPreset] = useState<PresetId>("minimalist");
  const [format, setFormat] = useState<FormatId>("square");
  const [filtre, setFiltre] = useState<FiltreId>("sable");
  const [quote, setQuote] = useState(
    "Un pays, une histoire, une photo à la fois."
  );
  const [moodWord, setMoodWord] = useState("Farniente");
  const [moodDetail, setMoodDetail] = useState("Côte Basque · Été 2026");
  const [face, setFace] = useState<FaceId>("mot");
  const [envie, setEnvie] = useState(0);
  const [emotionVerbe, setEmotionVerbe] = useState(ENVIES[0].verbe);
  const [emotionPhrase, setEmotionPhrase] = useState(ENVIES[0].phrase);

  // Choisir une envie remplit le verbe, la phrase et la couleur d'un coup : douze images à sortir
  // (six posts, deux faces), personne ne retape ça à la main.
  function choisirEnvie(i: number) {
    setEnvie(i);
    setEmotionVerbe(ENVIES[i].verbe);
    setEmotionPhrase(ENVIES[i].phrase);
    setEmotionSurtitre(`Une envie par jour · ${i + 1} / 6`);
  }
  const [coverSurtitre, setCoverSurtitre] = useState("Nouveau carnet");
  const [coverDestination, setCoverDestination] = useState("Côte Basque");
  const [coverVilles, setCoverVilles] = useState("Biarritz, Saint-Jean-de-Luz");
  const [coverPromesse, setCoverPromesse] = useState("13 adresses testées");
  const [addressName, setAddressName] = useState("Loco Polo");
  const [addressCity, setAddressCity] = useState("Saint-Jean-de-Luz");
  // Surtitre de la tuile Émotion, libre depuis le 12/09/2026 : la mention "Une envie par jour · n/6"
  // était écrite en dur, donc fausse dès qu'on sort la tuile de la série des six (c'est le cas du
  // post 1 d'un carnet, qui est une image seule). Même raison pour "Fais défiler →", désormais
  // optionnel : sur une image seule, il n'y a rien à faire défiler.
  const [emotionSurtitre, setEmotionSurtitre] = useState("Une envie par jour · 1 / 6");
  // Face "définition" : les lignes longues passent en Cormorant, la dernière ligne en corps de
  // texte sert de respiration. Vide par défaut — ce texte s'écrit, il ne se devine pas.
  const [emotionDefinition, setEmotionDefinition] = useState("");
  const [emotionDefiler, setEmotionDefiler] = useState(true);
  // Slides d'adresses du carrousel d'un carnet. Une adresse par ligne, "Nom | ce qu'on en dit" —
  // le format le plus rapide à coller depuis un texte préparé, sans quatre champs par adresse.
  const [adressesSurtitre, setAdressesSurtitre] = useState("Le matin");
  const [adressesListe, setAdressesListe] = useState(
    "École de surf Lagoondy | Une heure, planche et combinaison fournies\nThe New Me | Pilates très tôt, et un matcha en sortant\nCafé Loky | Le premier café, avant d'aller voir la mer"
  );
  const [finCitation, setFinCitation] = useState(
    "Treize adresses, trois jours,\net une ville qui se lève tôt."
  );
  const [finCta, setFinCta] = useState("Huit questions, et le site te dit où aller.");
  const [finFond, setFinFond] = useState<"sable" | "terracotta">("sable");
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
      // La carte est affichée à ~420 px : on calcule la finesse d'export pour tomber sur la
      // largeur réelle du gabarit (1080 px pour Instagram) plutôt que sur un simple ×2.
      const gabarit = FORMATS.find((f) => f.id === format)!;
      const affichee = cardRef.current.offsetWidth || 420;
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: Math.max(2, gabarit.largeur / affichee),
        cacheBust: true,
      });
      const link = document.createElement("a");
      // Les deux faces d'une émotion s'exportent l'une après l'autre : sans le suffixe, le second
      // téléchargement écrasait le premier.
      const suffixe =
        preset === "emotion"
          ? `-${envie + 1}-${ENVIES[envie].verbe.toLowerCase().replace(/\s+/g, "-")}-${face}`
          : "";
      link.download = `lve-${preset}${suffixe}-${format}.png`;
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
            <span className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
              Format
            </span>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  title={f.hint}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    format === f.id
                      ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                      : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

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

          {preset === "emotion" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Envie
              </label>
              <div className="flex flex-wrap gap-2">
                {ENVIES.map((e, i) => (
                  <button
                    key={e.verbe}
                    onClick={() => choisirEnvie(i)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      envie === i
                        ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                        : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: e.fond }}
                    />
                    {e.verbe}
                  </button>
                ))}
              </div>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Face
              </label>
              <div className="flex flex-wrap gap-2">
                {FACES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFace(f.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      face === f.id
                        ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                        : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Surtitre
              </label>
              <input
                value={emotionSurtitre}
                onChange={(e) => setEmotionSurtitre(e.target.value)}
                placeholder="Laisser vide pour ne rien afficher"
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-lve-charcoal">
                <input
                  type="checkbox"
                  checked={emotionDefiler}
                  onChange={(e) => setEmotionDefiler(e.target.checked)}
                  className="accent-[var(--lve-terracotta)]"
                />
                Afficher « Fais défiler → »
              </label>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Verbe
              </label>
              <input
                value={emotionVerbe}
                onChange={(e) => setEmotionVerbe(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Phrase
              </label>
              <input
                value={emotionPhrase}
                onChange={(e) => setEmotionPhrase(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              {face === "definition" && (
                <>
                  <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                    Définition — une phrase par ligne, la dernière en petit
                  </label>
                  <textarea
                    value={emotionDefinition}
                    onChange={(e) => setEmotionDefinition(e.target.value)}
                    rows={5}
                    placeholder={"Ce n'est pas cocher des kilomètres.\nC'est se réveiller avec une envie dans les jambes.\nSortir avant que la rue soit pleine."}
                    className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
                  />
                </>
              )}
              {face === "photo" && (
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
              )}
              <p className="font-body text-xs leading-relaxed text-lve-charcoal/50">
                Les six verbes sont ceux du questionnaire : Flâner, Déguster, Respirer, Lâcher
                prise, Vibrer, Bouger. Les reprendre mot pour mot, c’est ce qui fait que la série
                prépare l’écran que les gens verront ensuite.
              </p>
            </div>
          )}

          {preset === "couverture" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Surtitre
              </label>
              <input
                value={coverSurtitre}
                onChange={(e) => setCoverSurtitre(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Destination
              </label>
              <input
                value={coverDestination}
                onChange={(e) => setCoverDestination(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Villes
              </label>
              <input
                value={coverVilles}
                onChange={(e) => setCoverVilles(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Promesse
              </label>
              <input
                value={coverPromesse}
                onChange={(e) => setCoverPromesse(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <p className="font-body text-xs leading-relaxed text-lve-charcoal/50">
                Recompte les adresses sur la fiche en ligne avant d’écrire la promesse : c’est le
                seul chiffre du carrousel, et c’est celui qui fait défiler.
              </p>
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

          {preset === "adresses" && (
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-lve-border bg-lve-bg p-4 text-sm text-lve-charcoal/60 hover:border-lve-terracotta">
                <ImagePlus size={16} />
                {photo ? "Changer la photo" : "Ajouter une photo"}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Surtitre (le moment)
              </label>
              <input
                value={adressesSurtitre}
                onChange={(e) => setAdressesSurtitre(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Adresses — une par ligne, « Nom | ce qu&apos;on en dit »
              </label>
              <textarea
                value={adressesListe}
                onChange={(e) => setAdressesListe(e.target.value)}
                rows={6}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <p className="font-body text-xs leading-relaxed text-lve-charcoal/50">
                Trois adresses respirent, quatre tiennent encore. Au-delà, la slide devient une
                liste de courses et personne ne la lit.
              </p>
            </div>
          )}

          {preset === "fin" && (
            <div className="flex flex-col gap-3">
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Fond
              </label>
              <div className="flex flex-wrap gap-2">
                {(["sable", "terracotta"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinFond(f)}
                    className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${
                      finFond === f
                        ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-ink"
                        : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Phrase de conclusion (une ligne par retour à la ligne)
              </label>
              <textarea
                value={finCitation}
                onChange={(e) => setFinCitation(e.target.value)}
                rows={3}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Appel au Travel Match
              </label>
              <input
                value={finCta}
                onChange={(e) => setFinCta(e.target.value)}
                className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
              />
              <p className="font-body text-xs leading-relaxed text-lve-charcoal/50">
                Le sable ferme le carrousel comme la couverture l&apos;ouvre. Le terracotta est
                possible, mais il appartient d&apos;abord à la tuile qui révèle la destination.
              </p>
            </div>
          )}

          {photo && (
            <div className="flex flex-col gap-2">
              <span className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
                Ambiance de la photo
              </span>
              <div className="flex flex-wrap gap-2">
                {FILTRES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFiltre(f.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      filtre === f.id
                        ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                        : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
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
            className="relative w-full max-w-[420px] overflow-hidden rounded-sm shadow-lg"
            style={{ aspectRatio: FORMATS.find((f) => f.id === format)!.ratio }}
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

            {/* Série des six envies (12/09/2026). Deux faces pour un même post.

                Face 1, le mot : fond obsidienne, et c'est délibérément la seule tuile sombre de
                tout le compte. L'ivoire est pris par le teaser 1, le terracotta par le teaser 3,
                le sable par la page de garde d'un carnet — réutiliser l'un des trois aurait fait
                passer la série pour un carnet de plus. Les six mots posés sur deux rangées pleines
                de la grille forment un bloc qu'on lit d'un coup : c'est le manifeste du compte.

                Face 2, la photo : elle ne se voit qu'au swipe. Le verbe reste écrit en petit en
                haut, pour qu'une capture de la seule deuxième image garde son sens. */}
            {preset === "emotion" && face === "mot" && (
              <div
                className="flex h-full w-full flex-col justify-between p-12"
                style={{ background: ENVIES[envie].fond }}
              >
                <div className="flex items-center gap-3">
                  {emotionSurtitre.trim() && (
                    <>
                      <span className="h-px w-8 bg-lve-sand" />
                      {/* Ivoire à 75 % et pas sable : le sable tombe à 4,3 de contraste sur la sauge,
                          sous le seuil de 4,5 pour du petit texte. Une seule règle pour les six fonds
                          vaut mieux qu'une exception à retenir. */}
                      <span className="font-mono-lve text-[10px] uppercase tracking-[0.28em] text-lve-ivory/75">
                        {emotionSurtitre}
                      </span>
                    </>
                  )}
                </div>

                <p className="font-title text-6xl leading-[1.02] text-lve-ivory">
                  {emotionVerbe}
                </p>

                <div className="flex flex-col gap-4">
                  <span className="h-px w-full bg-lve-ivory/20" />
                  <div className="flex items-end justify-between gap-6">
                    <p className="font-title text-[10px] uppercase tracking-[0.3em] text-lve-ivory/60">
                      {HANDLE}
                    </p>
                    {emotionDefiler && (
                      <span className="whitespace-nowrap font-mono-lve text-[10px] uppercase tracking-[0.2em] text-lve-ivory/60">
                        Fais défiler →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Face 2 d'un post d'envie : la définition, au swipe. Même fond que le mot — c'est le
                même post, on ne change pas de matière en route. Le verbe reste écrit en petit en
                haut pour qu'une capture de cette seule image garde son sens. */}
            {preset === "emotion" && face === "definition" && (
              <div
                className="flex h-full w-full flex-col justify-between p-12"
                style={{ background: ENVIES[envie].fond }}
              >
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-lve-sand" />
                  <span className="font-mono-lve text-[10px] uppercase tracking-[0.28em] text-lve-ivory/75">
                    {emotionVerbe}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {(() => {
                    const lignes = emotionDefinition.split("\n").map((l) => l.trim()).filter(Boolean);
                    return lignes.map((ligne, i) => (
                      <p
                        key={i}
                        className={
                          i === lignes.length - 1 && lignes.length > 1
                            ? "font-body text-sm leading-relaxed text-lve-ivory/75"
                            : "font-title text-2xl leading-snug text-lve-ivory"
                        }
                      >
                        {ligne}
                      </p>
                    ));
                  })()}
                </div>

                <div className="flex flex-col gap-4">
                  <span className="h-px w-full bg-lve-ivory/20" />
                  <p className="font-title text-[10px] uppercase tracking-[0.3em] text-lve-ivory/60">
                    {HANDLE}
                  </p>
                </div>
              </div>
            )}

            {preset === "emotion" && face === "photo" && (
              <div className="relative h-full w-full bg-lve-obsidian">
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: FILTRES.find((f) => f.id === filtre)!.css }}
                    />
                    {(() => {
                      const voile = FILTRES.find((f) => f.id === filtre)!.voile;
                      return voile ? (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: voile.couleur, opacity: voile.opacite }}
                        />
                      ) : null;
                    })()}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono-lve text-xs uppercase tracking-wide text-white/40">
                    Ajoute une photo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                {/* Second voile, en haut : le verbe est posé sur la partie la plus claire d'une
                    photo de paysage (le ciel), où le sable seul devient illisible. */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
                <span className="absolute left-12 top-12 font-mono-lve text-[10px] uppercase tracking-[0.28em] text-lve-ivory">
                  {emotionVerbe}
                </span>
                <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-4">
                  <p className="font-title text-3xl leading-snug text-lve-ivory">
                    {emotionPhrase}
                  </p>
                  <p className="font-title text-[10px] uppercase tracking-[0.3em] text-lve-ivory/60">
                    {HANDLE}
                  </p>
                </div>
              </div>
            )}

            {/* Page de garde (12/09/2026). Troisième tuile unie, fond sable : posée entre
                l'ivoire du teaser 1 et le terracotta du teaser 3, elle complète la gradation de la
                semaine au lieu de la casser. Aucune photo — dans un carrousel de carnet, les images
                se méritent en défilant, la couverture ne fait qu'annoncer. Trois blocs seulement :
                le rituel en haut, la destination au milieu, la promesse et la signature en bas. */}
            {preset === "couverture" && (
              <div className="flex h-full w-full flex-col justify-between bg-lve-sand p-12">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-lve-terracotta-ink" />
                  <span className="font-mono-lve text-[10px] uppercase tracking-[0.28em] text-lve-terracotta-ink">
                    {coverSurtitre}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="font-title text-5xl leading-[1.05] text-lve-charcoal">
                    {coverDestination}
                  </p>
                  <p className="font-body text-sm text-lve-charcoal/70">{coverVilles}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="h-px w-full bg-lve-charcoal/15" />
                  <div className="flex items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      {/* La promesse en Bricolage mono, comme le détail de la tuile terracotta :
                          Cormorant dessine des chiffres en style ancien, et un « 13 » plus bas que
                          les capitales qui l'entourent se lit mal dans une ligne espacée. */}
                      <p className="font-mono-lve text-[11px] uppercase tracking-[0.22em] text-lve-terracotta-ink">
                        {coverPromesse}
                      </p>
                      <p className="font-title text-[10px] uppercase tracking-[0.3em] text-lve-charcoal/60">
                        {HANDLE}
                      </p>
                    </div>
                    {/* L'invitation à défiler : sans elle, une tuile unie ressemble à un post
                        simple et personne ne sait qu'il y a six images derrière. */}
                    <span className="whitespace-nowrap font-mono-lve text-[10px] uppercase tracking-[0.2em] text-lve-charcoal/60">
                      Fais défiler →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {preset === "carnet" && (
              <div className="relative h-full w-full bg-lve-obsidian">
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: FILTRES.find((f) => f.id === filtre)!.css }}
                    />
                    {(() => {
                      const voile = FILTRES.find((f) => f.id === filtre)!.voile;
                      return voile ? (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: voile.couleur, opacity: voile.opacite }}
                        />
                      ) : null;
                    })()}
                  </>
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

            {/* Slide d'adresses du carrousel d'un carnet (12/09/2026). Photo en fond, voile sombre
                remonté haut : ici le texte occupe les deux tiers de l'image, pas seulement le bas.
                Le nom en Cormorant, la ligne de commentaire en corps de texte — même hiérarchie que
                sur une carte d'adresse du site, pour qu'on reconnaisse la maison. */}
            {preset === "adresses" && (
              <div className="relative h-full w-full bg-lve-obsidian">
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: FILTRES.find((f) => f.id === filtre)!.css }}
                    />
                    {(() => {
                      const voile = FILTRES.find((f) => f.id === filtre)!.voile;
                      return voile ? (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: voile.couleur, opacity: voile.opacite }}
                        />
                      ) : null;
                    })()}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono-lve text-xs uppercase tracking-wide text-white/40">
                    Ajoute une photo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent" />
                <div className="absolute inset-x-10 bottom-10 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-lve-terracotta" />
                    <span className="font-mono-lve text-[10px] uppercase tracking-[0.28em] text-lve-ivory">
                      {adressesSurtitre}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {adressesListe
                      .split("\n")
                      .map((ligne) => ligne.trim())
                      .filter(Boolean)
                      .map((ligne, i) => {
                        const [nom, ...reste] = ligne.split("|");
                        const detail = reste.join("|").trim();
                        return (
                          <div key={i} className="flex flex-col gap-1">
                            <p className="font-title text-2xl leading-tight text-lve-ivory">
                              {nom.trim()}
                            </p>
                            {detail && (
                              <p className="font-body text-sm leading-snug text-lve-ivory/75">
                                {detail}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <p className="font-title text-[10px] uppercase tracking-[0.3em] text-lve-ivory/60">
                    {HANDLE}
                  </p>
                </div>
              </div>
            )}

            {/* Dernière slide d'un carnet (12/09/2026). Même matière que la couverture : le
                carrousel s'ouvre et se ferme sur une tuile unie. Aucun "Fais défiler →" — il n'y a
                plus rien après. Le renvoi au Travel Match est discret par construction : une ligne
                en bas, pas un bouton. */}
            {preset === "fin" && (
              <div
                className={`flex h-full w-full flex-col justify-between p-12 ${
                  finFond === "sable" ? "bg-lve-sand" : "bg-lve-terracotta"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-px w-8 ${finFond === "sable" ? "bg-lve-terracotta-ink" : "bg-lve-sand"}`}
                  />
                  <span
                    className={`font-mono-lve text-[10px] uppercase tracking-[0.28em] ${
                      finFond === "sable" ? "text-lve-terracotta-ink" : "text-lve-sand"
                    }`}
                  >
                    Fin du carnet
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {finCitation
                    .split("\n")
                    .filter(Boolean)
                    .map((ligne, i) => (
                      <p
                        key={i}
                        className={`font-title text-3xl leading-snug ${
                          finFond === "sable" ? "text-lve-charcoal" : "text-white"
                        }`}
                      >
                        {ligne}
                      </p>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                  <span
                    className={`h-px w-full ${finFond === "sable" ? "bg-lve-charcoal/15" : "bg-white/20"}`}
                  />
                  <p
                    className={`font-body text-sm leading-snug ${
                      finFond === "sable" ? "text-lve-charcoal/75" : "text-white/85"
                    }`}
                  >
                    {finCta}
                  </p>
                  <p
                    className={`font-title text-[10px] uppercase tracking-[0.3em] ${
                      finFond === "sable" ? "text-lve-charcoal/60" : "text-white/70"
                    }`}
                  >
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
