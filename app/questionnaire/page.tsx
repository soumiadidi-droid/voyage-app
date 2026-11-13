import { QuestionnaireClient } from "./QuestionnaireClient";

export const metadata = {
  title: "Travel Match : trouve ta destination en 8 questions — Le Voyage des Émotions",
  description:
    "Six envies, quelques questions pratiques, et trois destinations vécues qui te ressemblent. Sans inscription, sans e-mail, résultat immédiat.",
  alternates: { canonical: "/questionnaire" },
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
