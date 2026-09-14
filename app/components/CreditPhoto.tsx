// Crédit d'une photo sous licence à attribution obligatoire (13/09/2026, lac de Serris en CC BY-SA).
// Petit, posé dans un coin de la photo, lien vers la page de la licence et de l'auteur.
export function CreditPhoto({ credit, className = "", sansLien = false }: { credit?: { texte: string; lien: string }; className?: string; sansLien?: boolean }) {
  if (!credit) return null;
  // Dans une carte déjà cliquable (carte de carnet), un lien dans le lien est interdit : simple mention.
  if (sansLien)
    return (
      <span className={`absolute z-20 rounded px-1.5 py-0.5 text-[10px] leading-none text-white/85 ${className}`} style={{ background: "rgba(0,0,0,0.35)" }}>
        {credit.texte}
      </span>
    );
  return (
    <a
      href={credit.lien}
      target="_blank"
      rel="noopener noreferrer"
      className={`absolute z-20 rounded px-1.5 py-0.5 text-[10px] leading-none text-white/85 hover:text-white ${className}`}
      style={{ background: "rgba(0,0,0,0.35)" }}
    >
      {credit.texte}
    </a>
  );
}
