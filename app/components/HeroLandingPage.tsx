"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, animate, useMotionValue } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

const AUTOPLAY_INTERVAL_MS = 5000;
const MAIN_CTA_TEXT = "Lancer le Travel Match (2 min) →";
const SCORE_COUNT_UP_DURATION = 1.2;

export type DemoItem = {
  id: string;
  label: string;
  tag: string;
  badge: string;
  matchScore: number;
  destinationTitle: string;
  heroImage?: string;
};

// Compteur animé 0 → score (1er septembre 2026, demande Soumia — "le pourcentage de match monte
// dynamiquement de 0% jusqu'à son score"). Repart de 0 à chaque changement de `target` (pas une
// interpolation entre deux scores) : `motionValue.set(0)` n'est pas un setState React (une
// MotionValue vit hors du cycle de rendu), seul l'appel `setDisplay` dans `onUpdate` déclenche un
// rendu, de façon asynchrone à chaque frame — pas de setState synchrone dans le corps de l'effect.
// `done` (check "Votre Match" validé) est dérivé de `display === target`, pas un état séparé à
// réinitialiser à la main.
function useCountUpScore(target: number) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(0);
    const controls = animate(motionValue, target, {
      duration: SCORE_COUNT_UP_DURATION,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { display, done: display === target };
}

// Hero de la landing page (1er septembre 2026, 5e reprise — carte "épurée" : compteur de match
// animé + CTA unique, remplacent le score statique/la ligne transport/la ligne "tout-en-un" des
// versions précédentes, jugées trop chargées). Reconstruit sur la Charte Graphique officielle
// ~/Downloads/Charte Graphique & Design System — Le Voyage des Émotions.docx (palette terre/sable/
// terracotta, Cormorant en titres, Bricolage en corps — voir tokens dans app/globals.css), pas sur
// les mockups sombres slate/ambre proposés en brief. Fusionne hero + démo interactive : la photo de
// fond change avec l'archétype sélectionné (même traitement dégradé que DestinationHero.tsx), la
// carte résultat reprend le style "Profil Voyageur" du charte (fond sable/crème translucide,
// bordure terracotta). Les 5 onglets restent les vrais "profils voyageur" (mêmes archétypes/textes
// validés que TravelerProfileCard.tsx), chacun pointant vers la vraie destination du catalogue qui
// le représente le mieux (calculée côté serveur dans app/page.tsx, jamais choisie/inventée à la
// main) — seule la photo en est tirée, jamais son nom ni son adresse exacte (teaser). Seul
// `matchScore` reste décoratif (pas de vrai calcul, pas de réponses utilisateur dans cette démo).
export function HeroLandingPage({ items }: { items: DemoItem[] }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const activeProfile = items.find((item) => item.id === selectedId) ?? items[0];

  // Auto-play : rotation automatique toutes les 5s, en pause au survol de la carte, arrêtée
  // définitivement dès qu'on clique un onglet à la main (on laisse le contrôle total à
  // l'utilisateur plutôt que de reprendre derrière son dos).
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const isPlaying = autoplayEnabled && !isHovering;

  useEffect(() => {
    if (!isPlaying || items.length === 0) return;
    const timer = setInterval(() => {
      setSelectedId((current) => {
        const index = items.findIndex((item) => item.id === current);
        return items[(index + 1) % items.length].id;
      });
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPlaying, items]);

  function handleTabClick(id: string) {
    setAutoplayEnabled(false);
    setSelectedId(id);
  }

  const { display: animatedScore, done: scoreValidated } = useCountUpScore(activeProfile?.matchScore ?? 0);

  if (!activeProfile) return null;

  return (
    <div className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      <AnimatePresence mode="wait">
        {activeProfile.heroImage && (
          <motion.div
            key={activeProfile.heroImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${activeProfile.heroImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </AnimatePresence>
      {/* Même dégradé que DestinationHero.tsx (transparent en haut → sombre en bas), pour rester
          cohérent avec le reste du site plutôt que d'inventer un nouveau traitement photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

      <div className="relative z-10 px-6 sm:px-14 pt-28 pb-10 sm:pb-14">
        <span
          className="inline-flex items-center gap-2 text-[11px] tracking-widest font-medium uppercase text-white rounded-full px-3.5 py-1.5 mb-5"
          style={{ background: "var(--lve-terracotta)", fontFamily: "var(--font-display)" }}
        >
          <Sparkles size={12} strokeWidth={2} />
          Voyage des Émotions × Travel Match
        </span>

        <h1
          className="text-white font-extrabold leading-[1.05] mb-3 max-w-2xl"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)" }}
        >
          Le voyage qui vous ressemble existe déjà.
        </h1>
        <p
          className="italic text-white/90 max-w-xl mb-8"
          style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1rem, 1.6vw, 1.15rem)" }}
        >
          De l&apos;inspiration initiale aux plus belles adresses locales, l&apos;hôtel, les tables
          et les expériences s&apos;accordent à vos émotions en un seul endroit. Découvrez votre
          match idéal et nos adresses exclusives.
        </p>

        {/* Onglets archétypes */}
        <div className="flex flex-wrap gap-2 mb-6">
          {items.map((item) => {
            const active = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className="relative overflow-hidden rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                style={
                  active
                    ? { background: "var(--lve-terracotta)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600 }
                    : {
                        background: "rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.92)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        fontFamily: "var(--font-display)",
                        backdropFilter: "blur(6px)",
                      }
                }
              >
                {item.label}
                {/* Barre de progression avant le prochain basculement auto — visible seulement sur
                    l'onglet actif, tant que l'auto-play tourne (pas encore arrêté par un clic). */}
                {active && isPlaying && (
                  <motion.span
                    key={selectedId}
                    className="absolute bottom-0 left-0 h-[2px] bg-white/80"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_INTERVAL_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Carte résultat — même traitement que la carte "Profil Voyageur" (TravelerProfileCard.tsx) :
            fond sable/crème translucide, bordure terracotta, coins très arrondis. Épurée (1er
            septembre 2026) : compteur de match animé, plus de ligne transport ni de pictos
            "tout-en-un" (la promesse tout-en-un vit déjà dans le sous-titre du hero). */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProfile.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="max-w-xl rounded-2xl p-6 sm:p-7 shadow-xl"
            style={{ background: "rgba(250,246,240,0.95)", border: "1px solid var(--lve-terracotta)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center gap-1.5 uppercase tracking-[0.2em]"
                style={{ color: "var(--lve-terracotta-dark)", fontSize: "0.7rem", fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                Votre Match
                <AnimatePresence>
                  {scoreValidated && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span style={{ color: "var(--lve-terracotta-dark)", fontFamily: "var(--font-title)", fontSize: "1.3rem", fontWeight: 700 }}>
                {animatedScore}% Match
              </span>
            </div>

            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium mb-3 bg-white"
              style={{ color: "var(--lve-terracotta-dark)", fontFamily: "var(--font-display)" }}
            >
              {activeProfile.tag}
            </span>

            <h2
              className="font-semibold mb-1"
              style={{ fontFamily: "var(--font-title)", fontSize: "1.7rem", color: "var(--lve-charcoal)" }}
            >
              {activeProfile.destinationTitle}
            </h2>
            <p className="text-sm font-medium mb-6" style={{ color: "var(--lve-terracotta-dark)", fontFamily: "var(--font-display)" }}>
              {activeProfile.badge}
            </p>

            <Link
              href="/questionnaire"
              className="inline-block bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-xs uppercase tracking-widest font-medium px-6 py-3.5 rounded-lg shadow-md transition-all hover:-translate-y-0.5 no-underline"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {MAIN_CTA_TEXT}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
