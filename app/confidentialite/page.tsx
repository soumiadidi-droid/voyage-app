import { EnTetePage } from "../components/EnTetePage";
// Page Confidentialité (10/09/2026) — rédigée après le grillage du 09/09, qui a mis en évidence
// qu'on collectait des adresses email depuis la veille alors que cette page était restée un
// paragraphe "en cours de rédaction".
//
// Elle décrit exactement ce que fait le code : voir lib/email/requests.ts (ce qui est enregistré,
// et ce qui ne l'est pas), app/actions/sendTravelMatch.ts (l'envoi) et la table email_requests
// (contrainte qui interdit de stocker une adresse sans consentement). Toute évolution de ces
// fichiers doit être répercutée ici.
export const metadata = {
  title: "Confidentialité — Le Voyage des Émotions",
};

const SECTIONS = [
  {
    title: "Le principe",
    body: [
      "Ce site est un site personnel de récits de voyage. Il ne vend rien, n'utilise aucun outil publicitaire et ne revend aucune donnée — cette dernière phrase n'a pas d'exception.",
      "Vous me confiez une donnée personnelle dans deux situations seulement : lorsque vous demandez à recevoir un itinéraire ou un carnet d'adresses par email, et lorsque vous m'écrivez via le formulaire de la page « On collabore ? ».",
    ],
  },
  {
    title: "Ce qui est collecté, et ce qui ne l'est pas",
    body: [
      "Quand vous demandez un envoi par email : votre adresse email est utilisée pour vous envoyer le message demandé, ainsi que la ou les destinations concernées et la date de la demande.",
      "Votre adresse n'est conservée que si vous avez coché la case « je veux aussi être prévenu(e) des nouvelles destinations ». Si vous ne l'avez pas cochée, l'envoi est comptabilisé de façon anonyme — la destination et la date, rien d'autre — et votre adresse n'est enregistrée nulle part.",
      "Quand vous m'écrivez via le formulaire « On collabore ? » : votre nom, votre établissement, votre email et votre message me sont transmis par email pour que je puisse vous répondre. Rien n'est enregistré sur le site ; le message reste dans ma boîte mail le temps de notre échange.",
      "Pour éviter que les formulaires ne servent à envoyer des messages en masse, une empreinte technique de votre connexion est conservée moins d'une heure, puis effacée automatiquement. Elle ne permet pas de vous identifier et n'est utilisée pour rien d'autre.",
    ],
  },
  {
    title: "Pourquoi",
    body: [
      "Pour vous envoyer ce que vous avez demandé : c'est l'exécution de votre demande.",
      "Pour savoir combien de personnes s'intéressent à chaque destination, à partir de chiffres anonymes : c'est mon intérêt légitime à comprendre ce qui plaît, et à en discuter avec les lieux dont je parle. Aucune adresse email n'est communiquée à un partenaire, quelles que soient les circonstances.",
      "Pour vous prévenir des nouvelles destinations, uniquement si vous avez coché la case : c'est votre consentement, que vous pouvez retirer à tout moment.",
    ],
  },
  {
    title: "Qui d'autre y a accès",
    body: [
      "Trois prestataires techniques interviennent : Resend pour l'envoi des emails (serveurs en Irlande), Neon pour la base de données (Union européenne) et Vercel pour l'hébergement du site (États-Unis, encadré par les clauses contractuelles types de la Commission européenne).",
      "Ils agissent uniquement sur mes instructions et n'utilisent pas ces données pour leur compte. Personne d'autre n'y a accès.",
    ],
  },
  {
    title: "Combien de temps",
    body: [
      "Si vous êtes inscrit(e) à la liste : trois ans à compter de votre dernière activité — une nouvelle demande de votre part remet ce délai à zéro. Passé ce délai, votre adresse est supprimée.",
      "L'empreinte technique de connexion : moins d'une heure.",
      "Les statistiques anonymes sont conservées sans limite de durée, puisqu'elles ne contiennent aucune donnée permettant de vous identifier.",
    ],
  },
  {
    title: "Vos droits",
    body: [
      "Chaque email envoyé aux inscrit(e)s contient un lien de désinscription : un clic suffit, votre adresse est supprimée immédiatement, sans confirmation à donner ni justification à fournir.",
      "Vous pouvez aussi demander à consulter, corriger ou effacer vos données, ou vous opposer à leur utilisation, en écrivant à contact@levoyagedesemotions.fr. Je réponds sous un mois.",
      "Si ma réponse ne vous satisfait pas, vous pouvez saisir la CNIL (cnil.fr).",
    ],
  },
  {
    title: "Cookies et contenus extérieurs",
    body: [
      "Ce site ne dépose aucun cookie, ni publicitaire ni autre. La fréquentation des pages est mesurée par Vercel Web Analytics, un outil qui compte les visites sans cookie, sans identifiant de navigateur et sans conserver la moindre donnée permettant de vous reconnaître : je vois combien de personnes ont ouvert une page, jamais qui.",
      "Les destinations que vous mettez en favoris sont enregistrées dans la mémoire de votre navigateur, sur votre appareil. Elles ne sont jamais transmises au site, et disparaissent si vous videz les données de votre navigateur.",
      "Les publications Instagram affichées sur les fiches destination sont chargées depuis les serveurs de Meta, qui peut à cette occasion déposer ses propres traceurs. Cet affichage n'est pas de mon fait technique et obéit à la politique de confidentialité de Meta.",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <>
    {/* En-tête commun (13/09/2026). */}
    <EnTetePage pastille="Informations légales" titre="Confidentialité" />
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
      <p className="mb-12 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Responsable du traitement : Le Voyage des Émotions — contact@levoyagedesemotions.fr. Les
        informations sur l&apos;éditeur du site figurent dans les mentions légales.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-10">
          <h2
            className="mb-3 text-lg font-semibold"
            style={{ fontFamily: "var(--font-title)", color: "var(--lve-charcoal)" }}
          >
            {section.title}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-14 text-xs" style={{ color: "var(--text-secondary)" }}>
        Dernière mise à jour : 10 septembre 2026.
      </p>
    </div>
    </>
  );
}
