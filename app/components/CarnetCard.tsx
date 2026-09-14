import Link from "next/link";
import { CreditPhoto } from "./CreditPhoto";
import { HERO_IMAGE_CREDIT } from "@/lib/hero-images";
import { MapPin } from "lucide-react";
import type { AuthenticityBadge } from "@/lib/travel-match/types";

// Carte de carnet (03/09/2026) — partagée par la liste complète (/carnets) et la section "à la
// une" de l'accueil, pour qu'une destination ait exactement la même apparence aux deux endroits.
// Traitement visuel repris des cartes de /resultat et de Favoris (titre posé sur la photo, sans
// voile, lisibilité par text-shadow — décidé le 29/08/2026) plutôt qu'un 3e style de carte.

// Le site ne promet publiquement que deux niveaux, alors que la base en distingue trois.
// bucket_list et discovery tombent donc tous deux dans "Sur mon radar" — ne pas inventer un 3e
// libellé public que le manifeste ne mentionne pas. Mêmes mots que les étiquettes des adresses
// depuis la relecture du 11/09/2026 (c'était "Testée / Curatée").
export const BADGE_LABEL: Record<AuthenticityBadge, string> = {
  tested_approved: "J'ai testé",
  bucket_list: "Sur mon radar",
  discovery: "Sur mon radar",
};

// Ordre d'affichage : les destinations vécues d'abord (c'est la preuve de crédibilité qui compte
// pour un partenaire), puis les curatées.
export const BADGE_RANK: Record<AuthenticityBadge, number> = {
  tested_approved: 0,
  bucket_list: 1,
  discovery: 2,
};

export type Carnet = {
  slug: string;
  title: string;
  tagline: string;
  country: string;
  badge: AuthenticityBadge;
  image: string;
  addressCount: number;
};

// headingLevel : sur /carnets le titre de carte est un h2 (sous le h1 "Les carnets") ; dans la
// section "à la une" de l'accueil il est un h3 (sous le h2 de la section). Éviter de sauter un
// niveau de titre, pour l'accessibilité comme pour l'indexation.
export function CarnetCard({
  carnet,
  headingLevel = "h3",
}: {
  carnet: Carnet;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/voyages/${carnet.slug}`}
      className="group block no-underline overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md h-full"
    >
      <div className="relative h-52">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            backgroundImage: `url('${carnet.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Dégradé limité au bas de la photo (relecture du 11/09/2026) : sur une photo claire,
            le pays et le titre ne se lisaient plus malgré l'ombre portée. */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        <CreditPhoto credit={HERO_IMAGE_CREDIT[carnet.slug]} className="right-2 top-2" sansLien />
        <span
          className="absolute left-4 top-4 inline-block rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md"
          style={{
            background:
              carnet.badge === "tested_approved" ? "var(--lve-terracotta)" : "rgba(26,23,20,0.72)",
            fontFamily: "var(--font-display)",
          }}
        >
          {BADGE_LABEL[carnet.badge]}
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <span
            className="block text-[11px] uppercase tracking-[0.2em] text-white/85 mb-1"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
          >
            {carnet.country}
          </span>
          <Heading
            className="font-semibold text-white m-0"
            style={{
              fontFamily: "var(--font-title)",
              fontSize: "1.6rem",
              textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            }}
          >
            {carnet.title}
          </Heading>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p
          className="text-sm text-lve-charcoal/75 leading-relaxed line-clamp-3 m-0"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {carnet.tagline}
        </p>
        {/* Compteur photo retiré le 03/09/2026 : les photos ne sont pas l'argument de vente (dans
            l'offre de /pros, elles sont ce que Soumia LIVRE au partenaire, pas ce qu'elle montre
            pour décrocher le séjour), et le chiffre affiché était le plus faible du lot — deux ou
            trois sur plusieurs carnets. Pour le remettre : rajouter photoCount au type Carnet et
            le remplir dans lib/carnets.ts avec v.gallery.length. */}
        <div className="flex items-center gap-4 font-display text-xs text-lve-charcoal/70">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.75} />
            {carnet.addressCount} adresses
          </span>
        </div>
      </div>
    </Link>
  );
}
