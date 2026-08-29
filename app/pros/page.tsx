import { Camera, Link2 } from "lucide-react";

export const metadata = {
  title: "Espace Pros — Le Voyage des Émotions",
};

// (29/08/2026, "plus de peps/plus de terracotta") : la page n'avait quasi aucune couleur de
// marque (labels gris, bordures grises, "aurora" vert sur les options) — texte strictement
// inchangé, seul l'habillage visuel change pour aligner la page sur le reste du site.
export default function ProsPage() {
  return (
    <div>
      <div
        className="px-6 sm:px-8 py-16 sm:py-24"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <div className="max-w-3xl mx-auto">
          <span
            className="inline-block text-xs uppercase tracking-[0.25em] text-white bg-lve-terracotta font-semibold rounded-full px-4 py-1.5 mb-5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hôtels &amp; marques de voyage
          </span>
          <h1
            className="font-extrabold mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}
          >
            Espace Pros
          </h1>
          <p
            className="italic mb-8 border-l-4 border-lve-terracotta pl-4 text-lve-charcoal/90"
            style={{ fontSize: "1.15rem" }}
          >
            Du contenu éditorial honnête, jamais du placement de produit déguisé en récit de voyage.
          </p>
          <p className="leading-relaxed">
            Le Voyage des Émotions raconte des voyages réels, avec une règle qui ne bouge jamais :
            chaque adresse est marquée <em>testée</em> quand elle a été vécue, <em>recherchée</em>{" "}
            quand elle a été sélectionnée sans encore avoir été visitée. Cette distinction est
            affichée sur chaque fiche du site — c&apos;est elle qui fait la confiance des lecteurs, et
            c&apos;est elle que je ne romps jamais, même pour un partenariat.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <span
          className="inline-block text-xs uppercase tracking-[0.25em] text-lve-terracotta font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ce que je propose
        </span>
        <h2
          className="font-extrabold mb-8"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
        >
          Deux façons de collaborer
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4">
              <Camera size={18} strokeWidth={1.75} />
            </div>
            <p
              className="mono mb-1 text-xs uppercase tracking-widest"
              style={{ color: "var(--lve-terracotta-dark)" }}
            >
              Option 1
            </p>
            <h3
              className="font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
            >
              Contenu pour vos canaux
            </h3>
            <p className="leading-relaxed">
              Vous m&apos;accueillez, je vis le séjour normalement, et vous repartez avec un lot de
              photos originales (et, selon l&apos;accord, de courtes vidéos) à utiliser librement sur
              votre site et vos réseaux. Je publie aussi mon propre récit sur mon site, marqué{" "}
              <em>testé</em> — en bonus, pas en échange.
            </p>
          </div>
          <div className="rounded-2xl bg-lve-terracotta-bg border border-lve-terracotta/20 p-6 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-lve-terracotta text-white flex items-center justify-center mb-4">
              <Link2 size={18} strokeWidth={1.75} />
            </div>
            <p
              className="mono mb-1 text-xs uppercase tracking-widest"
              style={{ color: "var(--lve-terracotta-dark)" }}
            >
              Option 2
            </p>
            <h3
              className="font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}
            >
              Mise en avant + réservation
            </h3>
            <p className="leading-relaxed">
              Votre établissement apparaît dans les fiches « Où dormir » du site, avec un lien de
              réservation trackable. Commission sur les ventes générées, mention affiliée
              transparente affichée à côté du lien — jamais cachée.
            </p>
          </div>
        </div>
      </div>

      <div
        className="text-center py-16 sm:py-20 px-6"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, var(--lve-terracotta-bg), var(--lve-ivory))" }}
      >
        <h2
          className="font-extrabold mb-3"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
        >
          On en parle ?
        </h2>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          Écrivez-moi directement, avec votre établissement et l&apos;option qui vous intéresse.
          Portfolio et exemples de récits transmis directement sur demande.
        </p>
        <a
          href="mailto:levoyagedesemotions@gmail.com"
          className="inline-block rounded-lg px-6 py-3 mono no-underline shadow-md transition-all hover:-translate-y-0.5"
          style={{ background: "var(--lve-terracotta)", color: "#fff" }}
        >
          levoyagedesemotions@gmail.com
        </a>
      </div>
    </div>
  );
}
