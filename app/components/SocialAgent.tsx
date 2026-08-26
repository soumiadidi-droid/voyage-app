"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { DESTINATIONS } from "@/lib/travel-match/destinations";
import { getVoyage } from "@/content/voyages";
import { DESTINATION_HERO_IMAGE } from "@/lib/hero-images";
import {
  FORMATS,
  ANGLES,
  generatePost,
  type SocialFormat,
  type SocialAngle,
} from "@/lib/social-agent/generate";

export function SocialAgent() {
  const [destinationId, setDestinationId] = useState(DESTINATIONS[0].id);
  const [format, setFormat] = useState<SocialFormat>("carousel");
  const [angle, setAngle] = useState<SocialAngle>("gastronomie");
  const [nonce, setNonce] = useState(0); // force une régénération même si angle/format inchangés
  const [copied, setCopied] = useState(false);

  const destination = DESTINATIONS.find((d) => d.id === destinationId) ?? DESTINATIONS[0];
  const voyage = getVoyage(destination.content_slug);
  const coverImage = DESTINATION_HERO_IMAGE[destination.content_slug];

  const post = useMemo(() => {
    if (!voyage) return null;
    return generatePost(destination, voyage, format, angle, nonce);
  }, [destination, voyage, format, angle, nonce]);

  function handleCopy() {
    if (!post) return;
    navigator.clipboard.writeText(post.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleRegenerate() {
    const currentIndex = ANGLES.findIndex((a) => a.value === angle);
    const next = ANGLES[(currentIndex + 1) % ANGLES.length];
    setAngle(next.value);
    setNonce((n) => n + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 flex items-baseline gap-4">
        <span className="font-title text-3xl tracking-[0.35em] text-lve-charcoal">L.V.E</span>
        <span className="font-mono-lve text-xs uppercase tracking-[0.2em] text-lve-terracotta">
          Agent Social Media
        </span>
      </header>

      <div className="grid gap-10 md:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
              Destination
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="rounded-lg border border-lve-border bg-lve-bg p-3 text-sm text-lve-charcoal"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
              Format
            </label>
            <div className="flex flex-col gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                    format === f.value
                      ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                      : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono-lve text-xs uppercase tracking-wide text-lve-charcoal/60">
              Angle d&apos;attaque
            </label>
            <div className="flex flex-col gap-2">
              {ANGLES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAngle(a.value)}
                  className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                    angle === a.value
                      ? "border-lve-terracotta bg-lve-terracotta-bg text-lve-terracotta-dark"
                      : "border-lve-border text-lve-charcoal hover:border-lve-terracotta"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {coverImage && (
            <div
              className="grain h-56 w-full rounded-lg"
              style={{ backgroundImage: `url('${coverImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
          )}

          <div
            className="whitespace-pre-wrap rounded-lg border border-lve-border bg-lve-bg p-6 font-body text-sm leading-relaxed text-lve-charcoal"
            style={{ minHeight: "320px" }}
          >
            {post ? post.text : "Aucun contenu disponible pour cette destination."}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              disabled={!post}
              className="flex items-center gap-2 rounded-full bg-lve-terracotta px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-lve-terracotta-dark disabled:opacity-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copié !" : "Copier dans le presse-papier"}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={!post}
              className="flex items-center gap-2 rounded-full border border-lve-border px-5 py-3 text-sm font-medium text-lve-charcoal transition-colors hover:border-lve-terracotta disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Régénérer avec un autre angle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
