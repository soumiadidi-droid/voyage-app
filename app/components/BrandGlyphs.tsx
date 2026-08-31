import type { SVGProps } from "react";

// Icônes de marque maison (31/08/2026, ajout ShareModal) — lucide-react n'a plus d'icônes de
// marque (cf. leur politique de licence, déjà contourné une fois pour Instagram dans
// AddressDetailCard.tsx — InstagramGlyph déplacé ici pour être partagé avec ShareModal plutôt que
// dupliqué). Pictogrammes volontairement simples (formes géométriques), pas des reproductions
// exactes des logos officiels.

export function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M8.1 16.4l.62-2.26a5.7 5.7 0 1 1 2.1 2.06l-2.72.2z"
        fill="#fff"
      />
      <path
        d="M9.9 9.5c.14-.3.28-.3.42-.3h.35c.12 0 .27 0 .4.28.15.32.5 1.15.55 1.24.05.1.08.2 0 .34-.07.14-.1.22-.22.34-.1.11-.22.25-.31.34-.1.1-.2.2-.09.4.13.22.55.9 1.18 1.46.81.72 1.5.94 1.72 1.04.22.1.35.08.47-.05.13-.13.53-.62.67-.84.15-.21.29-.17.48-.1.2.07 1.24.58 1.45.69.22.1.36.14.41.23.06.1.06.53-.11 1.04-.18.51-1.01 1-1.4 1.04-.38.05-.72.2-2.45-.48-2.1-.82-3.42-3-3.52-3.13-.1-.14-.82-1.08-.82-2.06s.53-1.47.72-1.68z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PinterestGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M12.1 6.3c-2.8 0-4.7 2-4.7 4.3 0 1.4.76 2.6 1.9 3.05.14.05.27 0 .31-.16l.13-.53c.05-.17.03-.23-.1-.38-.28-.34-.47-.77-.47-1.4 0-1.78 1.34-3.36 3.45-3.36 1.87 0 2.9 1.14 2.9 2.68 0 2-.9 3.72-2.2 3.72-.73 0-1.28-.6-1.1-1.35.2-.9.62-1.85.62-2.49 0-.58-.31-1.06-.96-1.06-.75 0-1.36.78-1.36 1.82 0 .67.23 1.12.23 1.12s-.77 3.26-.9 3.83c-.27 1.13-.04 2.52-.02 2.65.01.09.13.11.18.04.07-.1.96-1.2 1.27-2.3.09-.3.48-1.92.48-1.92.24.46.94.86 1.68.86 2.2 0 3.7-2 3.7-4.7 0-2.04-1.72-4.42-5.05-4.42z"
        fill="#fff"
      />
    </svg>
  );
}

export function XGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function LinkedInGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
      <circle cx="7.6" cy="8.2" r="1.4" fill="#fff" />
      <rect x="6.4" y="10.8" width="2.4" height="7" fill="#fff" />
      <path
        d="M11.2 10.8h2.3v1c.4-.6 1.1-1.2 2.3-1.2 1.9 0 2.9 1.2 2.9 3.4v3.8h-2.4v-3.4c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.07.17-.09.4-.09.63v3.47h-2.4v-7z"
        fill="#fff"
      />
    </svg>
  );
}
