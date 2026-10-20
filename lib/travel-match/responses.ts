// Enregistrement des questionnaires terminés (20/10/2026, demande Soumia pour son CV).
//
// La table `questionnaire_responses` existait depuis l'ancien moteur, mais plus rien n'y écrivait
// depuis la refonte Travel Match du 22/08/2026. Une ligne = un résultat affiché : les réponses, le
// profil (archétype) et la première destination proposée. Rien de personnel, pas d'adresse IP.
//
// Un rechargement de /resultat réaffiche les mêmes réponses : une ligne identique de moins de
// 10 minutes n'est pas réenregistrée, sinon chaque F5 gonflerait le compteur.
import { neon } from "@neondatabase/serverless";
import type { UserAnswers } from "./types";

const sql = neon(process.env.DATABASE_URL!);

export async function enregistrerReponse(
  answers: UserAnswers,
  profil: string,
  topDestinationSlug: string
): Promise<void> {
  try {
    const reponses = JSON.stringify(answers);
    await sql.query(
      `insert into questionnaire_responses (answers, computed_profile, top_destination_slug)
       select $1::jsonb, $2, $3
       where not exists (
         select 1 from questionnaire_responses
         where answers = $1::jsonb and created_at > now() - interval '10 minutes'
       )`,
      [reponses, profil, topDestinationSlug]
    );
  } catch (erreur) {
    // Le comptage ne doit jamais casser l'affichage du résultat.
    console.error("enregistrerReponse", erreur);
  }
}
