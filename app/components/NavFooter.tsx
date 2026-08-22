import Link from "next/link";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/questionnaire", label: "Trouver mon voyage" },
  { href: "/favoris", label: "Favoris" },
  { href: "/partenariats", label: "Notre offre" },
];

export function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between gap-6 px-5 py-3 sm:px-8 border-b backdrop-blur-md"
      style={{ background: "var(--nav-bg)", borderColor: "var(--border)" }}
    >
      <Link aria-label="Le Voyage des Émotions — accueil" href="/">
        <Logo height={32} />
      </Link>
      <ul className="hidden sm:flex gap-6 list-none m-0 p-0">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="mono no-underline"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer
      className="px-5 sm:px-8 py-10 max-w-6xl mx-auto w-full flex flex-wrap justify-between gap-8 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        <Link className="block mb-3" href="/">
          <Logo height={28} />
        </Link>
        <p className="max-w-xs" style={{ color: "var(--text-secondary)" }}>
          Un pays, une histoire, une photo à la fois.
        </p>
      </div>
      <ul className="flex flex-col gap-2 list-none m-0 p-0">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="mono no-underline"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <p
        className="w-full mt-4 pt-4 border-t mono"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        © Le Voyage des Émotions — toutes les photographies sont originales et sous licence de
        l&apos;auteure.
      </p>
    </footer>
  );
}
