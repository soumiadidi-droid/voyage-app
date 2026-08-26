export type PresetId = "minimalist" | "terracotta-mood" | "carnet";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "minimalist", label: "Citation Minimalist" },
  { id: "terracotta-mood", label: "Terracotta Mood" },
  { id: "carnet", label: "Carnet d'Adresse" },
];
