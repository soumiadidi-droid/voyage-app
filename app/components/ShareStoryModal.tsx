"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Check, Link2, X as CloseIcon } from "lucide-react";

// Citation générique (1er septembre 2026, wireframe fourni par Soumia) — parle de l'expérience
// Travel Match elle-même, pas de la destination précise (qui reste masquée, cf. teaser du hero) :
// texte fixe, pas de donnée à récupérer.
const SHARE_QUOTE = "Mon prochain voyage a été trouvé en 2 min selon mon état d'esprit. ✨";

// Modale de partage Story Instagram (1er septembre 2026, carte reprise sur le wireframe fourni par
// Soumia — remplace l'export caché de la 1ère version puis la carte photo+badges de la 2e, jugée
// pas assez lisible). Structure : wordmark au-dessus de la photo (pas de texte flottant sur
// l'image), puis profil + score + citation sur un bandeau ivoire plein, puis rappel "lien dans ma
// Story" (Instagram ne permet pas de lien cliquable intégré à une image). Capture via html2canvas
// (demande explicite de Soumia), pas html-to-image comme le reste du site.
export function ShareStoryModal({
  isOpen,
  onClose,
  imageUrl,
  profile,
  matchScore,
  shareUrl,
  filenameSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  // Archétype réel de l'utilisateur (getArchetypeTitle) — absent hors de /resultat, la ligne
  // "Profil" ne s'affiche simplement pas dans ce cas.
  profile?: string;
  matchScore?: number;
  shareUrl: string;
  filenameSlug: string;
}) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleDownload() {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `lve-story-${filenameSlug}.png`;
      link.click();
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(26,26,26,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
        style={{ background: "var(--lve-bg)", border: "1px solid var(--lve-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
          style={{ background: "var(--lve-terracotta-bg)", color: "var(--lve-terracotta-dark)" }}
        >
          <CloseIcon size={16} />
        </button>

        <h3
          className="text-center mb-1 font-semibold"
          style={{ fontFamily: "var(--font-title)", fontSize: "1.4rem", color: "var(--lve-charcoal)" }}
        >
          Partagez votre match ✨
        </h3>
        <p className="text-xs text-center mb-6" style={{ color: "var(--text-secondary)" }}>
          Téléchargez le visuel, copiez votre lien et collez-le dans votre Story Instagram.
        </p>

        {/* Aperçu visible de la Story (format 9:16), capturé via html2canvas au clic sur
            "Télécharger". Wordmark → photo (sans texte dessus) → bandeau ivoire profil/match/
            citation → rappel lien. */}
        <div className="flex justify-center mb-6">
          <div
            ref={storyRef}
            className="relative w-[260px] h-[460px] overflow-hidden shadow-xl flex flex-col"
            style={{ background: "var(--lve-ivory)" }}
          >
            {/* Wordmark */}
            <div className="text-center pt-4 pb-3 px-4">
              <p
                className="font-display uppercase"
                style={{ fontSize: 9, letterSpacing: "0.15em", color: "var(--lve-terracotta-dark)", fontWeight: 700, lineHeight: 1.6 }}
              >
                ✨ Voyage des Émotions
                <br />x Travel Match
              </p>
            </div>

            {/* Photo — aucun texte dessus, juste le paysage */}
            <div
              style={{
                height: 210,
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Profil / Match / Citation */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4">
              {profile && (
                <p className="font-display mb-2" style={{ fontSize: 12, fontWeight: 600, color: "var(--lve-charcoal)" }}>
                  🧭 Profil : <span style={{ color: "var(--lve-terracotta-dark)" }}>{profile}</span>
                </p>
              )}
              {matchScore != null && (
                <p className="font-title mb-3" style={{ fontSize: 20, fontWeight: 700, color: "var(--lve-terracotta-dark)" }}>
                  🎯 {matchScore}% DE MATCH
                </p>
              )}
              <p className="font-body italic" style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                « {SHARE_QUOTE} »
              </p>
            </div>

            {/* Rappel lien — Instagram ne permet pas de lien cliquable dans une image, on le dit. */}
            <div className="text-center pb-4 px-4">
              <p className="font-display" style={{ fontSize: 10, fontWeight: 600, color: "var(--lve-terracotta-dark)" }}>
                🔗 Découvre ta destination idéale
              </p>
              <p className="font-display" style={{ fontSize: 8, color: "var(--text-secondary)" }}>
                (Lien dans ma Story)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            style={{ background: "var(--lve-terracotta)", fontFamily: "var(--font-display)" }}
          >
            {isGenerating ? "Création du visuel..." : "📥 1. Télécharger l'image Story"}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: "#fff",
              color: "var(--lve-charcoal)",
              border: "1px solid var(--lve-border)",
              fontFamily: "var(--font-display)",
            }}
          >
            {copied ? (
              <>
                <Check size={14} /> Lien copié !
              </>
            ) : (
              <>
                <Link2 size={14} /> 2. Copier mon lien
              </>
            )}
          </button>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl text-xs text-center block transition-all font-medium"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}
          >
            📸 3. Ouvrir Instagram →
          </a>
        </div>
      </div>
    </div>
  );
}
