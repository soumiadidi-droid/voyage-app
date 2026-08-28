"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { InstagramEmbed } from "./InstagramEmbed";

// Pop-up dédiée à l'embed Instagram (28/08/2026) — 3e écran du parcours adresse : grille (photos)
// → fiche détail (nom, description, tags...) → cette pop-up, ouverte au clic sur le badge
// "Découvrir l'ambiance Insta" dans AddressDetailModal.tsx. `autoLoad` sur InstagramEmbed : ce
// clic-là sert déjà de geste de consentement, pas besoin d'un 2e clic à l'intérieur de la pop-up.
export function InstagramPopup({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-2 top-2 z-10 rounded-full p-1.5 shadow-md"
          style={{ background: "var(--bg-elevated)", color: "var(--text)" }}
        >
          <X size={18} />
        </button>
        <InstagramEmbed url={url} autoLoad />
      </div>
    </div>
  );
}
