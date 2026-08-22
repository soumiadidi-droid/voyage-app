"use client";

import { useSyncExternalStore } from "react";

// Favoris 100% côté navigateur (localStorage) — pas de compte, pas de backend. Privé par nature :
// personne d'autre que la personne sur ce navigateur n'y a accès. Décidé le 22/08/2026, voir
// CLAUDE.md. Les favoris ne suivent pas d'un appareil/navigateur à l'autre — accepté pour la V1.
//
// useSyncExternalStore plutôt que useState+useEffect : évite le anti-pattern "setState synchrone
// dans un effect" et gère proprement le mismatch SSR/client (le serveur ne connaît jamais les
// favoris, seul le navigateur les a).
const STORAGE_KEY = "lve-favoris";

let cache: string[] = [];
let hydrated = false;

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) listener();
}

function getSnapshot(): string[] {
  if (!hydrated) {
    cache = readFromStorage();
    hydrated = true;
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return cache; // toujours [] côté serveur, jamais hydraté là-bas
}

function persist(next: string[]) {
  cache = next;
  hydrated = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponible (navigation privée, quota plein...) — le like reste actif pour
    // la session en cours via le cache en mémoire, juste non persisté.
  }
  emitChange();
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle(id: string) {
    const current = getSnapshot();
    const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
    persist(next);
  }

  return { favorites, isFavorite: (id: string) => favorites.includes(id), toggle };
}
