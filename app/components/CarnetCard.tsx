import Link from "next/link";
import { Camera, MapPin } from "lucide-react";
import type { AuthenticityBadge } from "@/lib/travel-match/types";

// Carte de carnet (03/09/2026) — partagée par la liste complète (/carnets) et la section "à la
// une" de l'accueil, pour qu'une destination ait exactement la même apparence aux deux endroits.
// Traitement visuel repris des cartes de /resultat et de Favoris (titre posé sur la photo, sans
// voile, lisibilité par text-shadow — décidé le 29/08/2026) plutôt qu'un 3e style de carte.

// Le site ne promet publiquement que deux niveaux (cf. le manifeste de l'accueil : "Testée" /
// "Curatée"), alors que la base en distingue trois. bucket_list et discovery tombent donc tous
// deux dans "Curatée" — ne pas inventer un 3e libellé public que le manifeste ne mentionne pas.
export const BADGE_LABEL: Record<AuthenticityBadge, string> = {
  tested_approved: "Testée",
  bucket_list: "Curatée",
  discovery: "Curatée",
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
  photoCount: number;
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
        <div className="flex items-center gap-4 font-mono-lve text-xs text-lve-charcoal/55">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.75} />
            {carnet.addressCount} adresses
          </span>
          {/* Compteur photo masqué à 0 (03/09/2026) : deux carnets en base (Londres, Marseille)
              n'ont pas encore de galerie — annoncer "0 photos" sur la carte d'un site qui vend du
              contenu visuel est pire que ne rien annoncer. */}
          {carnet.photoCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Camera size={13} strokeWidth={1.75} />
              {carnet.photoCount} photos
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
