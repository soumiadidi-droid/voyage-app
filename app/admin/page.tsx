import Link from "next/link";

export const metadata = {
  title: "L.V.E — Backoffice",
};

const TOOLS = [
  {
    href: "/studio",
    title: "Insta Studio",
    description: "Générateur de posts/cards Instagram (3 presets, export PNG).",
  },
  {
    href: "/admin/social-agent",
    title: "Agent Social Media",
    description: "Génère des posts (carousel, LinkedIn, Reel, newsletter) à partir des destinations.",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <span className="font-title text-3xl tracking-[0.35em] text-lve-charcoal">L.V.E</span>
        <span className="ml-4 font-mono-lve text-xs uppercase tracking-[0.2em] text-lve-terracotta">
          Backoffice
        </span>
      </header>

      <div className="flex flex-col gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-lg border border-lve-border p-5 no-underline transition-colors hover:border-lve-terracotta"
          >
            <h2 className="font-display text-lg font-medium text-lve-charcoal">{tool.title}</h2>
            <p className="mt-1 text-sm text-lve-charcoal/70">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
