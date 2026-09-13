// Crédit d'une photo sous licence à attribution obligatoire (13/09/2026, lac de Serris en CC BY-SA).
// Petit, posé dans un coin de la photo, lien vers la page de la licence et de l'auteur.
export function CreditPhoto({ credit, className = "" }: { credit?: { texte: string; lien: string }; className?: string }) {
  if (!credit) return null;
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
