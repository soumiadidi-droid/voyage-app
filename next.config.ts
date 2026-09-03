import type { NextConfig } from "next";

// Domaine canonique du site (nom de domaine acheté par Soumia). Le projet Vercel reste joignable
// sur voyage-app-sage.vercel.app : sans redirection, les deux hôtes servent le même contenu, ce
// que Google traite comme du contenu dupliqué et qui fait remonter l'URL technique plutôt que la
// vraie. La redirection ci-dessous ne cible QUE cet hôte de production — les URLs de preview
// (voyage-<hash>-ai-product5.vercel.app) ont un autre hostname et continuent de fonctionner.
const CANONICAL_HOST = "levoyagedesemotions.fr";
const LEGACY_PROD_HOST = "voyage-app-sage.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /partenariats : URL historique de l'ancien site, la page vit sur /pros depuis le rebuild
      // du 23/08/2026. Redirigée plutôt que dupliquée (03/09/2026).
      { source: "/partenariats", destination: "/pros", permanent: true },
      // /voyages et /destinations renvoient vers le questionnaire, PAS vers /carnets (03/09/2026) :
      // /carnets n'est plus lié depuis le site, une redirection depuis une URL aussi évidente que
      // /voyages suffirait à la rendre trouvable par n'importe qui.
      { source: "/voyages", destination: "/questionnaire", permanent: true },
      { source: "/destinations", destination: "/questionnaire", permanent: true },
      // Tout le sous-domaine Vercel bascule sur le domaine canonique, chemin conservé.
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_PROD_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
