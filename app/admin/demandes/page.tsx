import Link from "next/link";
import { getRequestStats } from "@/lib/email/requests";
import { getVoyages } from "@/lib/travel-match/data";

// Reporting des demandes d'envoi par email (10/09/2026, décidé au grillage du 09/09).
//
// Objectif concret : pouvoir dire à un hôtel ou un office de tourisme, cinq minutes avant un
// rendez-vous, combien de personnes ont demandé le carnet de leur destination — sans dépendre de
// quelqu'un pour sortir le chiffre.
//
// force-dynamic : la page lit la base à chaque ouverture, sinon elle resservirait un compte figé au
// dernier build (piège documenté dans CLAUDE.md).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "L.V.E — Demandes par email",
  robots: { index: false, follow: false },
};

export default async function DemandesPage() {
  const [stats, voyages] = await Promise.all([getRequestStats(), getVoyages()]);
  const titleBySlug = new Map(voyages.map((v) => [v.slug, v.hero.title]));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <Link href="/admin" className="font-mono-lve text-xs uppercase tracking-[0.2em] text-lve-terracotta no-underline">
          ← Backoffice
        </Link>
        <h1 className="mt-4 font-title text-3xl text-lve-charcoal">Demandes par email</h1>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Demandes au total", value: stats.total },
          { label: "Sur 30 jours", value: stats.last30Days },
          { label: "Inscrits à la liste", value: stats.subscribers },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg border border-lve-border p-5">
            <p className="font-title text-3xl text-lve-charcoal">{tile.value}</p>
            <p className="mt-1 text-sm text-lve-charcoal/70">{tile.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-lg font-medium text-lve-charcoal">Par destination</h2>
      {stats.byDestination.length === 0 ? (
        <p className="text-sm text-lve-charcoal/70">
          Aucune demande pour l&apos;instant. Le compteur démarre à la première.
        </p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {stats.byDestination.map((row) => (
              <tr key={row.slug} className="border-b border-lve-border/60">
                <td className="py-2.5 text-lve-charcoal">{titleBySlug.get(row.slug) ?? row.slug}</td>
                <td className="py-2.5 text-right font-medium text-lve-charcoal">{row.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-10 text-xs leading-relaxed text-lve-charcoal/60">
        Les adresses ne sont conservées que pour les personnes ayant coché la case de recontact.
        Toutes les autres demandes sont comptées sans qu&apos;aucune donnée personnelle ne soit
        gardée. Conservation : 3 ans après la dernière activité.
      </p>
    </div>
  );
}
