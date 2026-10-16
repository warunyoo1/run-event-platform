"use client";
import { useSyncExternalStore } from "react";

const key = "run-event:saved:v1";
const changed = "run-event:saved-changed";
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener(changed, notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener(changed, notify); };
};
const snapshot = () => { try { return localStorage.getItem(key) || "[]"; } catch { return "[]"; } };
const serverSnapshot = () => "[]";

export function useSavedEvents() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  let saved: string[] = [];
  try { const value: unknown = JSON.parse(raw); if (Array.isArray(value)) saved = value.filter((id): id is string => typeof id === "string"); } catch { /* Ignore invalid browser-local data. */ }
  const toggle = (id: string) => {
    try {
      const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(changed));
      return true;
    } catch { return false; }
  };
  return { saved, toggle };
}
