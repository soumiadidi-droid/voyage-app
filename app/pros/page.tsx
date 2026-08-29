export const metadata = {
  title: "Espace Pros — Le Voyage des Émotions",
};

export default function ProsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Hôtels &amp; marques de voyage
      </p>
      <h1
        className="font-extrabold mb-6"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}
      >
        Espace Pros
      </h1>
      <p className="italic mb-8" style={{ fontSize: "1.15rem" }}>
        Du contenu éditorial honnête, jamais du placement de produit déguisé en récit de voyage.
      </p>
      <p className="mb-16 leading-relaxed">
        Le Voyage des Émotions raconte des voyages réels, avec une règle qui ne bouge jamais :
        chaque adresse est marquée <em>testée</em> quand elle a été vécue, <em>recherchée</em>{" "}
        quand elle a été sélectionnée sans encore avoir été visitée. Cette distinction est
        affichée sur chaque fiche du site — c&apos;est elle qui fait la confiance des lecteurs, et
        c&apos;est elle que je ne romps jamais, même pour un partenariat.
      </p>

      <p className="mono mb-2" style={{ color: "var(--text-secondary)" }}>
        Ce que je propose
      </p>
      <h2
        className="font-extrabold mb-8"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
      >
        Deux façons de collaborer
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 mb-20">
        <div className="border p-6" style={{ borderColor: "var(--border)" }}>
          <p className="mono mb-2" style={{ color: "var(--aurora)" }}>
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
        <div className="border p-6" style={{ borderColor: "var(--border)" }}>
          <p className="mono mb-2" style={{ color: "var(--aurora)" }}>
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

      <div
        className="text-center py-16 border-t"
        style={{ borderColor: "var(--border)" }}
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
          className="inline-block rounded-lg px-6 py-3 mono no-underline"
          style={{ background: "var(--ember)", color: "#fff" }}
        >
          levoyagedesemotions@gmail.com
        </a>
      </div>
    </div>
  );
}
