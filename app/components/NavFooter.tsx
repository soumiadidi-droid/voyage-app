"use client";

import Link from "next/link";
import { Menu, Settings, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

// Bouton Backoffice discret (décidé le 26/08/2026) — visible uniquement sur le navigateur de
// Soumia, après avoir visité une fois une URL avec ?admin=1 (le flag est mémorisé dans
// localStorage, propre à cet appareil/navigateur). Ce n'est PAS une vraie protection : /studio et
// /admin/* restent accessibles à qui aurait le lien direct, comme avant — juste rien à voir pour
// un visiteur normal qui navigue le site sans connaître cette URL.
// useSyncExternalStore pour la lecture (même raison que lib/favorites.ts : évite le anti-pattern
// "setState synchrone dans un effect" et gère le mismatch SSR/client) ; l'effect ne fait que
// l'écriture dans localStorage quand l'URL contient ?admin=1.
const ADMIN_FLAG_KEY = "lve-admin-unlocked";

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return window.localStorage.getItem(ADMIN_FLAG_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

function useAdminUnlocked(): boolean {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1") {
      window.localStorage.setItem(ADMIN_FLAG_KEY, "true");
    }
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Compte réel de Soumia, donné le 23/08/2026 — profil public (pas le lien d'invitation ig_contact
// personnel qu'elle a collé, qui n'est pas fait pour être partagé publiquement sur le site).
const INSTAGRAM_URL = "https://www.instagram.com/levoyagedesemotions/";

// Masqué temporairement (30/08/2026, demande Soumia) — repasser à true pour réactiver.
const SHOW_NEWSLETTER = false;

// lucide-react (v1.x installé sur ce projet) n'a plus d'icônes de marque (Instagram, X, etc.),
// retirées pour des raisons de droits — icône maison au même style de trait que les icônes Lucide
// utilisées ailleurs sur le site (viewBox 24, stroke arrondi).
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Header aligné sur le Design System officiel Figma (décidé le 23/08/2026). Le CTA reste vers
// /questionnaire (pas de route /travel-match — validé avec Soumia, la page réelle du questionnaire
// ne change pas de nom juste pour coller à l'URL de la maquette). "Carnets" remplacé par "Favoris"
// le 23/08/2026 : pas de section blog sur le site, /carnets reste en place (stub) mais n'est plus
// lié dans la nav — à supprimer si elle confirme qu'il ne servira jamais.
const NAV_LINKS = [
  { href: "/favoris", label: "Favoris" },
  { href: "/philosophie", label: "Notre Philosophie" },
  // Renommé (29/08/2026) : "Espace Pros" sonnait corporate à côté de "Favoris"/"Notre
  // Philosophie" et contredisait le ton perso donné à la page elle-même ("pas de service com',
  // c'est moi") — Soumia a validé "On collabore ?".
  { href: "/pros", label: "On collabore ?" },
];

// Header sombre permanent (charcoal, comme le footer) sur toutes les pages — décidé le 23/08/2026,
// remplace l'ancien header transparent réservé à la homepage. Plus besoin de usePathname : même
// habillage partout.
export function Nav() {
  const adminUnlocked = useAdminUnlocked();
  // Menu mobile (29/08/2026) : les liens (Favoris/Notre Philosophie/Espace Pros) étaient dans un
  // <ul className="hidden sm:flex"> sans AUCUN repli en dessous de 640px — repéré par Soumia en
  // testant sur son téléphone, ils étaient juste invisibles, aucun moyen d'y accéder sur mobile.
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-lve-charcoal text-lve-ivory border-b border-lve-ivory/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-6">
        <Link
          aria-label="Le Voyage des Émotions — accueil"
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          {/* Logo tout en blanc pur (29/08/2026, demande Gemini) : text-lve-ivory (#faf6f0) → white,
              netteté max. Séparateur "|" (border-l, pas un vrai caractère) atténué à opacity-40 —
              ce projet n'a pas de token zinc-500, même effet visé. */}
          <span
            className="inline-block text-2xl tracking-[0.15em] leading-none text-white"
            style={{ fontFamily: "var(--font-title)" }}
          >
            LVE
          </span>
          <span
            className="hidden sm:inline-block text-xs uppercase tracking-[0.2em] text-white border-l border-white/40 pl-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Voyage des Émotions
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Blanc éclatant (29/08/2026, demande Gemini) : white/90 → white plein, hover
              terracotta. */}
          <ul className="hidden sm:flex items-center gap-6 list-none m-0 p-0">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="no-underline text-sm text-white hover:text-lve-terracotta transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {adminUnlocked && (
            <Link
              href="/admin"
              aria-label="Backoffice"
              title="Backoffice"
              className="hidden sm:inline-block no-underline text-lve-ivory/50 hover:text-lve-sand transition-colors"
            >
              <Settings size={18} />
            </Link>
          )}
          {/* Ghost/outline (29/08/2026, demande Gemini transmise par Soumia) : le bouton plein
              rivalisait avec le gros CTA du Hero d'accueil — garder l'impact réservé à celui-là,
              ce bouton de header reste discret. Uniquement CE bouton (validé explicitement par
              Soumia) — "Voir les disponibilités" sur les cartes d'adresses reste inchangé, en
              plein terracotta, elle a tranché pour le garder tel quel. */}
          {/* Bordure blanche par défaut, terracotta au survol (29/08/2026, demande Gemini) : plus
              de remplissage terracotta au hover, juste bordure + texte qui virent terracotta. */}
          <Link
            href="/questionnaire"
            className="no-underline border border-white text-white hover:border-lve-terracotta hover:text-lve-terracotta text-xs uppercase font-medium tracking-[0.15em] px-5 py-2.5 rounded-lg transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lancer Travel Match
          </Link>
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-lg p-2 -mr-2 text-lve-ivory/80 hover:text-lve-sand transition-colors"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-lve-ivory/10 bg-lve-charcoal">
          <ul className="flex flex-col list-none m-0 p-5 gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block no-underline py-3 text-base text-white hover:text-lve-terracotta transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {adminUnlocked && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 no-underline py-3 text-base text-lve-ivory/60 hover:text-lve-sand transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <Settings size={16} />
                  Backoffice
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

// Footer sombre (charcoal) — décidé le 23/08/2026, remplace la version claire précédente.
const DARK_COLUMN_TITLE_CLASS =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-lve-terracotta leading-none mb-3 block";
const DARK_LINK_CLASS = "text-lve-ivory/80 hover:text-lve-sand transition-colors";
const DARK_FONT = { fontFamily: "var(--font-display)" };

function DarkFooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={DARK_LINK_CLASS} style={DARK_FONT}>
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-lve-charcoal text-lve-ivory pt-16 pb-8 border-t border-lve-terracotta/20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-lve-ivory/10 items-start">
        {/* Logo en texte stylé ici (le composant <Logo/> SVG a du vide au-dessus des lettres, pour
            sa ligne de soulignement en dessous — aucun leading-none/items-start ne peut aligner
            son haut visuel sur celui des titres de colonnes voisins). Même traitement texte dans
            le header depuis le 23/08/2026, le composant SVG ne sert plus que sur les cartes
            adresses (fallback sans photo, app/voyages/[slug]/page.tsx). */}
        <div className="md:col-span-4 space-y-4 pt-0">
          <Link
            aria-label="Le Voyage des Émotions — accueil"
            href="/"
            className="inline-block text-lve-ivory leading-none"
          >
            {/* -mt-1 (-4px) : compense l'écart d'interligne résiduel entre Cormorant Garamond
                text-3xl et Bricolage Grotesque text-[11px] même avec leading-none — line-height:1
                ne rend PAS la ligne exactement flush avec le sommet du glyphe, l'écart dépend des
                métriques de chaque police (ascent/descent) et grandit avec le corps du texte.
                Calculé le 23/08/2026 à partir des fichiers woff2 réels du projet (Cormorant 300 :
                ascent 924/1000em, descent 287/1000em, cap-height L 625/1000em ; Bricolage 500 :
                ascent 930/1000em, descent 270/1000em, cap-height D 660/1000em) → écart théorique
                ≈3.9px à 30px/11px, arrondi à -mt-1. Si Soumia voit encore un poil d'écart à l'œil,
                ajuster cette seule valeur (ex. -mt-1.5). */}
            <span
              className="inline-block -mt-1 text-3xl tracking-[0.15em] leading-none"
              style={{ fontFamily: "var(--font-title)" }}
            >
              LVE
            </span>
          </Link>
          <p className="text-sm text-lve-ivory/70 leading-relaxed max-w-sm" style={DARK_FONT}>
            L&apos;art du voyage sur-mesure &amp; la curation d&apos;adresses d&apos;exception.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Le Voyage des Émotions sur Instagram"
            className="inline-flex items-center justify-center rounded-full border border-lve-ivory/20 p-2 text-lve-ivory/80 hover:text-lve-sand hover:border-lve-sand/40 transition-colors"
          >
            <InstagramIcon size={18} />
          </a>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h4 className={DARK_COLUMN_TITLE_CLASS}>Découvrir</h4>
          <ul className="space-y-2 text-sm list-none m-0 p-0">
            <li><DarkFooterLink href="/questionnaire">Trouver mon voyage</DarkFooterLink></li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h4 className={DARK_COLUMN_TITLE_CLASS}>Maison</h4>
          <ul className="space-y-2 text-sm list-none m-0 p-0">
            <li><DarkFooterLink href="/philosophie">Notre philosophie</DarkFooterLink></li>
            <li><DarkFooterLink href="/pros">On collabore ?</DarkFooterLink></li>
            <li>
              <a href="mailto:levoyagedesemotions@gmail.com" className={DARK_LINK_CLASS} style={DARK_FONT}>
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter masquée temporairement (30/08/2026, demande Soumia — "pour le moment,
            demain on règle ça") : formulaire jamais branché à un vrai service, remis à plus tard
            plutôt que laissé en l'état. SHOW_NEWSLETTER → true pour la réactiver. */}
        {SHOW_NEWSLETTER && (
          <div className="md:col-span-4 space-y-3">
            <h4 className={DARK_COLUMN_TITLE_CLASS}>Le Carnet de Route</h4>
            <p className="text-sm text-lve-ivory/70" style={DARK_FONT}>
              Recevez nos nouvelles pépites et itinéraires exclusifs.
            </p>
            {/* Formulaire visuel uniquement pour l'instant : aucun outil de newsletter (Mailchimp,
                Brevo, etc.) n'est branché sur ce projet, donc rien n'est réellement collecté ou
                stocké nulle part. preventDefault() évite juste un rechargement de page inutile —
                pas de faux message "Inscrit·e !" qui mentirait sur ce qui se passe vraiment.
                À connecter à un vrai service avant mise en prod si Soumia veut que ça fonctionne. */}
            <form className="flex items-center gap-2 pt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse e-mail"
                className="bg-lve-ivory/10 border border-lve-ivory/20 rounded-lg px-3 py-2 text-sm text-lve-ivory placeholder-lve-ivory/40 focus:outline-none focus:border-lve-terracotta w-full"
                style={DARK_FONT}
              />
              <button
                type="submit"
                className="bg-lve-terracotta hover:bg-lve-terracotta-dark text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
                style={DARK_FONT}
              >
                S&apos;abonner
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-lve-ivory/50 gap-4">
        <p>© 2026 Voyage des Émotions — Photographies originales sous licence.</p>
        <div className="flex gap-6">
          <Link href="/mentions-legales" className="hover:text-lve-ivory transition-colors">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-lve-ivory transition-colors">
            Confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
