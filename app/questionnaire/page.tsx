import { QuestionnaireClient } from "./QuestionnaireClient";

export const metadata = {
  title: "Trouve le voyage qui te correspond — Le Voyage des Émotions",
};

// Fond et encre claires fixes sur toute la largeur (relecture du 11/09/2026) : en mode sombre, la
// colonne du questionnaire gardait son halo clair au milieu d'une page noire, titre et consigne
// devenaient illisibles.
export default function QuestionnairePage() {
  return (
    <div className="surface-claire bg-lve-bg">
      <QuestionnaireClient />
    </div>
  );
}
