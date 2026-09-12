import { Camera, Link2 } from "lucide-react";
import { BlocOrange, EnTetePage } from "../components/EnTetePage";

export const metadata = {
  title: "On collabore ? — Le Voyage des Émotions",
  description:
    "Deux façons de collaborer : je viens, je vis et je raconte, ou votre établissement rejoint mes fiches « Où dormir ».",
  alternates: { canonical: "/pros" },
};

// (29/08/2026, "plus de peps/plus de terracotta") : la page n'avait quasi aucune couleur de
// marque — habillage visuel aligné sur le reste du site.
// (29/08/2026, ton "je suis une personne pas une entreprise") : le texte sonnait trop pro/corporate
// par endroits (vocabulaire type "vos canaux", "trackable", options numérotées comme une grille
// tarifaire) — réécrit plus proche de comment Soumia en parlerait elle-même, en gardant les faits
// exacts (mêmes deux façons de collaborer, même règle testé/recherché, même commission). Espacement
// entre sections resserré au même geste (py- réduits partout, plainte "trop d'espace haut/bas").
export default function ProsPage() {
  return (
    // Fond et encre claires fixes (relecture du 11/09/2026) : les sections sont sur des couleurs de
    // marque qui ne changent pas en mode sombre, le texte, lui, passait en crème.
    <div className="surface-claire bg-lve-bg">
      {/* En-tête commun (13/09/2026) — mêmes mots qu'avant, dans le modèle de Ma philosophie. */}
      <EnTetePage
        pastille="Hôtels & marques de voyage"
        titre="On collabore ?"
        citation="Du contenu éditorial honnête, jamais du placement de produit déguisé en récit de voyage."
      />

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <BlocOrange className="mb-10 sm:mb-14">
        {/* Réécrit par Soumia (29/08/2026) — remplace le paragraphe précédent. */}
        <p className="leading-relaxed">
          Je fonctionne à la sincérité : si j&apos;ai vécu l&apos;expérience, c&apos;est écrit ;
          si c&apos;est une pépite repérée, aussi. Cette ligne éditoriale claire, c&apos;est ce qui
          garantit un engagement réel auprès des voyageurs qui me suivent.
        </p>
        </BlocOrange>
        <span
          className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta-ink font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ce que je propose
        </span>
        <h2
          className="mb-8 leading-tight text-lve-charcoal"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
        >
          Deux façons de collaborer
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4">
              <Camera size={18} strokeWidth={1.75} />
            </div>
            <p
              className="font-display mb-1 text-xs uppercase tracking-widest"
              style={{ color: "var(--lve-terracotta-ink)" }}
            >
              Option 1
            </p>
            <h3
              className="font-semibold mb-3 leading-tight text-lve-terracotta-dark"
              style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem" }}
            >
              Je viens, je vis, je raconte
            </h3>
            <p className="leading-relaxed">
              Vous m&apos;accueillez, je vis le séjour normalement, et vous repartez avec un lot de
              photos originales (et, si on est d&apos;accord, quelques vidéos courtes) à utiliser
              librement de votre côté. Je publie aussi mon propre récit sur mon site, marqué{" "}
              <em>testé</em> — en bonus, pas en échange.
            </p>
          </div>
          <div className="rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4">
              <Link2 size={18} strokeWidth={1.75} />
            </div>
            <p
              className="font-display mb-1 text-xs uppercase tracking-widest"
              style={{ color: "var(--lve-terracotta-ink)" }}
            >
              Option 2
            </p>
            <h3
              className="font-semibold mb-3 leading-tight text-lve-terracotta-dark"
              style={{ fontFamily: "var(--font-title)", fontSize: "1.6rem" }}
            >
              Je vous recommande vraiment
            </h3>
            {/* Refonte (29/08/2026, demande explicite de Soumia — "comme le reste de la charte")
                : même ton sincère/direct que l'intro réécrite juste au-dessus, mêmes faits
                (fiche « Où dormir », lien perso, commission annoncée). */}
            <p className="leading-relaxed">
              Votre établissement rejoint mes fiches « Où dormir » — une vraie recommandation, pas
              un encart publicitaire. Je touche une commission sur ce qui est réservé via votre
              lien, toujours affichée en clair à côté, jamais dissimulée. Même sincérité que
              partout ailleurs sur le site.
            </p>
          </div>
        </div>
      </div>

      <div
        className="text-center py-10 sm:py-14 px-6"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <h2
          className="mb-3 leading-tight text-lve-charcoal"
          style={{ fontFamily: "var(--font-title)", fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}
        >
          On en parle ?
        </h2>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          Écrivez-moi directement : dites-moi qui vous êtes et ce qui vous tente. Je vous envoie mon
          portfolio et des exemples de récits sans problème.
        </p>
        <a
          href="mailto:contact@levoyagedesemotions.fr"
          className="btn-principal px-6 py-3.5 text-sm normal-case tracking-normal"
        >
          contact@levoyagedesemotions.fr
        </a>
      </div>
    </div>
  );
}
