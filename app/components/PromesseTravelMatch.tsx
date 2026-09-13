import { Check } from "lucide-react";

// Promesse posée sous chaque bouton Travel Match (13/09/2026, demande de Soumia) : lever le frein
// « encore un site qui va me demander mon e-mail ». C'est vrai : le questionnaire mène directement à
// /resultat, le bloc e-mail en dessous est facultatif. Si ça change un jour, retirer ce composant.
export function PromesseTravelMatch({ className = "" }: { className?: string }) {
  const points = ["Sans inscription", "Sans e-mail", "Résultat immédiat"];
  return (
    <p
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-75 ${className}`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {points.map((p) => (
        <span key={p} className="inline-flex items-center gap-1 whitespace-nowrap">
          <Check size={13} strokeWidth={2.25} aria-hidden="true" />
          {p}
        </span>
      ))}
    </p>
  );
}
