// Moment d'un resto affiché sur sa carte (14/09/2026, demande Soumia : remplacer « Table épicurienne »
// par le moment où l'on y va). « Café » vaut aussi pour le petit-déjeuner, sans le dire.
import { Coffee, UtensilsCrossed, Moon, Wine, type LucideIcon } from "lucide-react";

export const MOMENTS_RESTO = ["Café", "Déjeuner", "Dîner", "Déjeuner & dîner", "Pour un verre"] as const;
export type MomentResto = (typeof MOMENTS_RESTO)[number];

export const MOMENT_ICON: Record<MomentResto, LucideIcon> = {
  Café: Coffee,
  Déjeuner: UtensilsCrossed,
  Dîner: Moon,
  "Déjeuner & dîner": UtensilsCrossed,
  "Pour un verre": Wine,
};

export function estMomentResto(v: string | undefined): v is MomentResto {
  return !!v && (MOMENTS_RESTO as readonly string[]).includes(v);
}
