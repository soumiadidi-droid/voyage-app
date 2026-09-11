import Link from "next/link";
import { unsubscribeByToken } from "@/lib/email/requests";

// Page de désinscription (10/09/2026) — atteinte par le lien présent en bas des mails envoyés aux
// personnes qui ont coché la case de recontact.
//
// La désinscription est faite dès l'ouverture de la page, sans bouton à cliquer : un lien de
// désinscription qui demande une confirmation supplémentaire est le meilleur moyen de récolter un
// signalement en indésirable à la place. L'adresse est effacée de la base, pas seulement marquée.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Désinscription — Le Voyage des Émotions",
  robots: { index: false, follow: false },
};

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await unsubscribeByToken(token) : { ok: false };

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
      <h1
        className="font-light mb-6 text-3xl md:text-4xl"
        style={{ fontFamily: "var(--font-title)" }}
      >
        {result.ok ? "C'est fait" : "Lien introuvable"}
      </h1>
      <p className="text-base leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
        {result.ok ? (
          <>
            Ton adresse a été supprimée. Tu ne recevras plus rien de ma part — et je n&apos;en
            garde aucune trace.
          </>
        ) : (
          <>
            Ce lien n&apos;est plus valide, ou ton adresse a déjà été supprimée. Dans les deux cas,
            tu ne recevras plus rien.
          </>
        )}
      </p>
      <Link href="/" className="btn-principal px-7 py-3.5">
        Retour au site
      </Link>
    </div>
  );
}
