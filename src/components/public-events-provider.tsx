"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RunningEvent } from "@/lib/events";
import { listEvents } from "@/lib/api";

type State = { events: RunningEvent[]; loading: boolean; error: string; retry: () => void; provinces: string[] };
const Context = createContext<State | null>(null);
export function PublicEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<RunningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    listEvents(controller.signal).then((items) => { if (!controller.signal.aborted) setEvents(items); })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "โหลดงานวิ่งไม่สำเร็จ"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  const provinces = useMemo(() => [...new Set(events.map((event) => event.province).filter(Boolean))].sort((a,b) => a.localeCompare(b, "th")), [events]);
  return <Context.Provider value={{ events, loading, error, retry: () => setAttempt((value) => value + 1), provinces }}>{children}</Context.Provider>;
}
export function usePublicEvents() {
  const state = useContext(Context);
  if (!state) throw new Error("PublicEventsProvider is required");
  return state;
}
