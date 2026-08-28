// Bannière d'info affichée quand même le meilleur résultat n'est pas un match parfait (27/08/2026,
// refonte visuelle) — remplace l'ancien encadré bordure pleine par un fond teinté terracotta +
// barre latérale, plus chaleureux que la bordure marron plate d'avant.
export function FallbackNotice() {
  return (
    <div
      className="mb-10 rounded-r-xl py-5 pl-5 pr-6"
      style={{ background: "var(--lve-terracotta-bg)", borderLeft: "4px solid var(--lve-terracotta)" }}
    >
      <p className="leading-relaxed" style={{ color: "var(--lve-terracotta-dark)" }}>
        Aucune destination ne correspond à 100% à tous tes critères logistiques stricts, mais voici
        les voyages les plus proches de tes envies émotionnelles :
      </p>
    </div>
  );
}
