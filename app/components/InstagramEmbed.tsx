"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Embed Instagram (28/08/2026, passé en lazy-load au scroll le 28/08/2026 — remplace le
// click-to-load initial, pas apprécié). Un IntersectionObserver charge le script officiel
// embed.js et le blockquote automatiquement dès que la carte approche du viewport (rootMargin
// anticipé pour éviter un pop-in tardif), sans action de l'utilisateur — mais toujours pas TOUTES
// en même temps au premier rendu : avec ~20 adresses par fiche, ça resterait gravement lourd.
declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_ID = "instagram-embed-script";

function loadEmbedScript(onReady: () => void) {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    // Script déjà chargé (par un embed précédent sur la même page) — juste redemander le
    // traitement des blockquotes pas encore transformées.
    if (window.instgrm) onReady();
    else existing.addEventListener("load", onReady, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.addEventListener("load", onReady, { once: true });
  document.body.appendChild(script);
}

export function InstagramEmbed({ url }: { url: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" } // charge un peu avant que la carte n'entre réellement à l'écran
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Le tap/swipe démarré SUR l'iframe Instagram (cross-origin) est capté par l'iframe elle-même
    // et ne fait jamais défiler le parent — vérifié sur mobile réel le 28/08/2026, le swipe seul
    // ne marche pas. D'où la flèche cliquable ci-dessous : un vrai bouton HTML au-dessus de
    // l'iframe reçoit le tap normalement et scrolle le wrapper par programme.
    const el = scrollRef.current;
    if (!el) return;
    function updateCanScrollMore() {
      if (!el) return;
      setCanScrollMore(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    }
    updateCanScrollMore();
    const resizeObserver = new ResizeObserver(updateCanScrollMore);
    resizeObserver.observe(el);
    el.addEventListener("scroll", updateCanScrollMore, { passive: true });
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateCanScrollMore);
    };
  }, [loaded]);

  useEffect(() => {
    if (!visible) return;
    loadEmbedScript(() => window.instgrm?.Embeds.process());
  }, [visible, url]);

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;
    // Instagram remplace le contenu du blockquote par un iframe une fois le post chargé — c'est
    // le seul signal fiable de "chargé" disponible côté client.
    const observer = new MutationObserver(() => {
      if (el.querySelector("iframe")) {
        setLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [visible, url]);

  return (
    // 326px = largeur minimale documentée par Instagram pour son embed officiel — en dessous, le
    // header (avatar + bouton "Voir le profil") déborde. Plutôt que de forcer l'embed à rétrécir
    // sous ce seuil sur petit mobile (bouton coupé et inaccessible, repéré par Soumia le
    // 28/08/2026), l'embed garde toujours sa largeur fixe de 326px et le wrapper devient
    // scrollable horizontalement si la carte est plus étroite.
    <div ref={outerRef} className="relative w-full">
      <div ref={scrollRef} className="w-full overflow-x-auto">
        <div className="relative mx-auto w-[326px]">
          {!loaded && (
            // Posé par-dessus le blockquote (pas en remplacement) : le blockquote doit rester dans
            // le flux normal, avec une vraie largeur mesurable, sinon embed.js calcule mal ses
            // dimensions avant de le transformer en iframe.
            <div
              className="grain absolute inset-0 rounded-2xl animate-pulse"
              style={{ background: "var(--bg-guide)", aspectRatio: "9 / 16" }}
            />
          )}
          {visible && (
            <div ref={containerRef} className="overflow-hidden rounded-2xl">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{ margin: 0, width: "100%" }}
              />
            </div>
          )}
        </div>
      </div>
      {canScrollMore && (
        <button
          type="button"
          aria-label="Voir la suite de l'embed Instagram"
          onClick={() => scrollRef.current?.scrollBy({ left: 140, behavior: "smooth" })}
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 shadow-md"
          style={{ background: "var(--bg-elevated)", color: "var(--text)" }}
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
