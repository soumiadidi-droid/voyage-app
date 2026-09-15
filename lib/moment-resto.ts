// Moment d'un resto affiché sur sa carte (14/09/2026, demande Soumia : remplacer « Table épicurienne »
// par le moment où l'on y va). « Café » vaut aussi pour le petit-déjeuner, sans le dire.
import { CakeSlice, Coffee, Sandwich, UtensilsCrossed, Moon, Wine, type LucideIcon } from "lucide-react";

export const MOMENTS_RESTO = ["Café", "Café & brunch", "Déjeuner", "Dîner", "Déjeuner & dîner", "Pour un verre", "Gourmandise", "Sur le pouce"] as const;
// « Sur le pouce » ajouté le 15/09/2026 (Soumia, carnet Marseille) : sandwichs, street food à emporter.
// « Gourmandise » ajouté le 15/09/2026 (Soumia, carnet Biarritz) : pâtisseries, glaces, goûters.
export type MomentResto = (typeof MOMENTS_RESTO)[number];

export const MOMENT_ICON: Record<MomentResto, LucideIcon> = {
  Café: Coffee,
  "Café & brunch": Coffee,
  Déjeuner: UtensilsCrossed,
  Dîner: Moon,
  "Déjeuner & dîner": UtensilsCrossed,
  "Pour un verre": Wine,
  Gourmandise: CakeSlice,
  "Sur le pouce": Sandwich,
};

export function estMomentResto(v: string | undefined): v is MomentResto {
  return !!v && (MOMENTS_RESTO as readonly string[]).includes(v);
}
