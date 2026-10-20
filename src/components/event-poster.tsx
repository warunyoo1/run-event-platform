"use client";
import { UiImg, UiText } from '@/i18n/client';

import { useState } from "react";
import type { RunningEvent } from "@/lib/events";
const artwork: Record<RunningEvent["theme"], {
    title: string;
    subtitle: string;
}> = {
    orange: { title: "BANGKOK", subtitle: "MORNING RUN" },
    green: { title: "KHAO YAI", subtitle: "TRAIL & RUN" },
    blue: { title: "PATTAYA", subtitle: "SEASIDE HALF MARATHON" },
    pink: { title: "LITTLE HEARTS", subtitle: "RUN TOGETHER" },
    sand: { title: "AYUTTHAYA", subtitle: "HERITAGE RUN" },
    navy: { title: "CHIANG MAI", subtitle: "NIGHT RUN" },
};
export function EventPoster({ event, large = false }: {
    event: RunningEvent;
    large?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const images = [...(event.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const cover = images.find((image) => image.kind === "cover") ?? images.find((image) => image.kind === "poster") ?? images[0];
    if (cover && !failed)
        return <div className={`event-poster poster-${event.theme} ${large ? "poster-large" : ""}`}><UiImg src={cover.url} alt={cover.alt || event.name} onError={() => setFailed(true)} style={{ width: "100%", height: "auto", objectFit: "contain" }}/></div>;
    const text = { title: event.name, subtitle: new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(`${event.date}T12:00:00+07:00`)) };
    return <div className={`event-poster poster-${event.theme} ${large ? "poster-large" : ""}`} aria-hidden="true">
    <div className="poster-top"><span>Run Event presents</span></div>
    <div className="poster-title"><strong><UiText>{text.title}</UiText></strong><span><UiText>{text.subtitle}</UiText></span></div>
    <svg className="poster-landscape" viewBox="0 0 640 230" fill="none">
      <circle cx={event.theme === "navy" ? 500 : 480} cy="70" r="43" fill="currentColor" opacity=".65"/>
      <UiText>{event.theme === "green" ? <><path d="M0 195 150 35 280 160 365 75 550 220H0Z" fill="currentColor" opacity=".4"/><path d="m210 230 190-150 240 150H210Z" fill="currentColor" opacity=".7"/></> : event.theme === "blue" ? <><path d="M0 140q80-25 160 0t160 0 160 0 160 0v90H0Z" fill="currentColor" opacity=".3"/><path d="M0 180q80-25 160 0t160 0 160 0 160 0v50H0Z" fill="currentColor" opacity=".4"/><path transform="translate(-40 70)" d="m80 95 12-67 12 67M91 35q-25-27-49-9m50 8q22-25 44-7" stroke="currentColor" strokeWidth="5"/></> : event.theme === "sand" ? <path d="M0 200h85v-55h20v-22h12V85l13-35 13 35v38h12v22h20v55h60v-35h20v-30h15V93l15-38 15 38v42h15v30h20v35h65v-52h18v-24h12V78l13-33 13 33v46h12v24h18v52h140v30H0Z" fill="currentColor" opacity=".5"/> : event.theme === "pink" ? <><path d="M320 160s-92-51-92-102c0-52 66-63 92-17 26-46 92-35 92 17 0 51-92 102-92 102Z" fill="currentColor" opacity=".23"/><path d="M0 213q130-70 265-15t375-10v42H0Z" fill="currentColor" opacity=".25"/></> : <path d="M0 210h65v-50h35v-45h28v95h30v-90h25V50h15v70h25v90h30v-65h50v65h35v-105h20V72h20v33h25v105h30v-40h45v40h30v-95h35v95h30v-50h45v50h52v20H0Z" fill="currentColor" opacity=".3"/>}</UiText>
      <path d="M40 230C180 145 345 265 610 155" stroke="currentColor" strokeWidth="3" opacity=".5"/>
      <g transform="translate(294 103) rotate(-8)"><circle cx="42" cy="5" r="10" fill="currentColor"/><path d="m35 24-14 32 30 19-7 37M29 40 6 51l-19-7m48-21 26 21 21-9M21 56 7 81l-34 5" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/></g>
    </svg><div className="poster-bottom"><span><UiText>{event.races.map((r) => r.name.replace(" KM", "K")).join("  /  ")}</UiText></span></div>
  </div>;
}
