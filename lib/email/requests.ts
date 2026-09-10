// Enregistrement des demandes d'envoi et limitation d'abus (10/09/2026).
//
// Décidé au grillage du 09/09/2026 :
//   - toute demande est comptée (ligne anonyme), pour pouvoir dire à un partenaire combien de
//     personnes ont demandé le carnet de telle destination ;
//   - l'adresse n'est conservée QUE si la personne a coché la case de recontact ;
//   - protection anti-robot volontairement légère : piège invisible dans le formulaire + limite
//     d'envois par visiteur. Pas de service externe (pas de compte à ouvrir) — Turnstile reste en
//     réserve si des envois anormaux apparaissent un jour.
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// 5 envois par heure et par visiteur : très au-dessus d'un usage normal (on demande son itinéraire
// une fois, éventuellement deux si on s'est trompé d'adresse), très en dessous de ce qui rendrait
// le formulaire intéressant pour envoyer en masse.
const MAX_SENDS_PER_HOUR = 5;

// L'empreinte ne sert qu'à reconnaître deux envois du même visiteur pendant une heure. Le sel évite
// qu'elle soit re-calculable depuis une liste d'adresses IP connues ; sa valeur exacte importe peu,
// les lignes vivent moins d'une heure.
const IP_SALT = "lve-throttle-2026";

async function currentIpHash(): Promise<string> {
  const h = await headers();
  // x-forwarded-for peut contenir une chaîne de relais : la première adresse est celle du visiteur.
  const raw = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "inconnu";
  return createHash("sha256").update(`${IP_SALT}:${raw}`).digest("hex");
}

// true = l'envoi peut partir. Purge au passage les lignes de plus d'une heure : pas de tâche
// planifiée à maintenir, et rien ne s'accumule.
export async function allowSend(): Promise<boolean> {
  const ipHash = await currentIpHash();
  await sql.query(`delete from send_throttle where created_at < now() - interval '1 hour'`);
  const rows = (await sql.query(
    `select count(*)::int as n from send_throttle where ip_hash = $1 and created_at > now() - interval '1 hour'`,
    [ipHash]
  )) as unknown as { n: number }[];
  if (rows[0].n >= MAX_SENDS_PER_HOUR) return false;
  await sql.query(`insert into send_throttle (ip_hash) values ($1)`, [ipHash]);
  return true;
}

export type RecordedRequest = { unsubscribeToken: string | null };

// Enregistre la demande. `email` n'est écrit en base que si `consent` est vrai — la contrainte
// email_requests_consent_requires_email l'impose aussi côté base, pour que ça reste vrai même si
// un futur appel oublie la règle.
export async function recordRequest(input: {
  kind: "itinerary" | "carnet";
  destinationSlugs: string[];
  email: string;
  consent: boolean;
}): Promise<RecordedRequest> {
  if (!input.consent) {
    await sql.query(`insert into email_requests (kind, destination_slugs) values ($1, $2)`, [
      input.kind,
      input.destinationSlugs,
    ]);
    return { unsubscribeToken: null };
  }

  // Personne déjà inscrite : on ne crée pas de doublon, on rafraîchit son ancienneté (la durée de
  // conservation de 3 ans court à partir de la dernière activité) et on réactive si elle s'était
  // désinscrite puis réinscrite volontairement.
  const existing = (await sql.query(
    `select unsubscribe_token from email_requests where email = $1 and consent = true limit 1`,
    [input.email]
  )) as unknown as { unsubscribe_token: string }[];

  if (existing.length > 0) {
    await sql.query(
      `update email_requests set last_activity_at = now(), unsubscribed_at = null where email = $1 and consent = true`,
      [input.email]
    );
    // La demande elle-même reste comptée, séparément de l'inscription.
    await sql.query(`insert into email_requests (kind, destination_slugs) values ($1, $2)`, [
      input.kind,
      input.destinationSlugs,
    ]);
    return { unsubscribeToken: existing[0].unsubscribe_token };
  }

  const token = randomBytes(24).toString("base64url");
  await sql.query(
    `insert into email_requests (kind, destination_slugs, email, consent, unsubscribe_token)
     values ($1, $2, $3, true, $4)`,
    [input.kind, input.destinationSlugs, input.email, token]
  );
  return { unsubscribeToken: token };
}

// Désinscription depuis le lien présent dans le mail. Idempotente : recliquer sur un lien déjà
// utilisé ne casse rien et réaffiche la même confirmation.
export async function unsubscribeByToken(token: string): Promise<{ ok: boolean }> {
  const rows = (await sql.query(
    `update email_requests set unsubscribed_at = coalesce(unsubscribed_at, now()), email = null, consent = false
     where unsubscribe_token = $1 returning id`,
    [token]
  )) as unknown as { id: string }[];
  return { ok: rows.length > 0 };
}

export type RequestStats = {
  total: number;
  last30Days: number;
  subscribers: number;
  byDestination: { slug: string; n: number }[];
};

export async function getRequestStats(): Promise<RequestStats> {
  const [totals, subs, byDest] = await Promise.all([
    sql.query(`select count(*)::int as total,
                      count(*) filter (where created_at > now() - interval '30 days')::int as last30
               from email_requests`) as unknown as Promise<{ total: number; last30: number }[]>,
    sql.query(`select count(*)::int as n from email_requests
               where consent = true and unsubscribed_at is null`) as unknown as Promise<{ n: number }[]>,
    sql.query(`select slug, count(*)::int as n
               from email_requests, unnest(destination_slugs) as slug
               group by slug order by n desc`) as unknown as Promise<{ slug: string; n: number }[]>,
  ]);

  return {
    total: totals[0].total,
    last30Days: totals[0].last30,
    subscribers: subs[0].n,
    byDestination: byDest,
  };
}
