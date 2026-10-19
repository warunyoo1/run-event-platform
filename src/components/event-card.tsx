"use client";
import { useUiTranslation, UiLink, UiText } from '@/i18n/client';

import { ArrowUpRight, CalendarDays, Flag, MapPin } from "lucide-react";
import { displayName, themeLabels, categoryLabels, formatDate, price, statusLabels, type RunningEvent } from "@/lib/events";
import { EventPoster } from "./event-poster";
export function EventCard({ event }: {
    event: RunningEvent;
}) {
    const { language } = useUiTranslation();
    return <article className="event-card">
    <UiLink className="card-link" href={`/events/${event.slug}`} aria-label={`ดูรายละเอียด ${displayName(event, language)}`}>
    <div className="card-visual">
      <EventPoster event={event}/>
    </div>
    <div className="card-body">
      <h3>{displayName(event, language)}</h3>
      <div className="card-facts">
        <div className="card-info-row card-event-date"><CalendarDays size={17} aria-hidden="true"/><time dateTime={event.date}><UiText>{formatDate(event.date)}</UiText></time></div>
        <div className="card-info-row"><MapPin size={17} aria-hidden="true"/><div className="card-info-copy"><span className="card-info-label"><UiText>ชื่อสถานที่:</UiText></span><span>{event.venue}</span>{event.province && <small><UiText>{event.province}</UiText></small>}</div></div>
        {event.startPoint?.trim() && <div className="card-info-row"><Flag size={17} aria-hidden="true"/><div className="card-info-copy"><span className="card-info-label"><UiText>จุดปล่อยตัว:</UiText></span><span>{event.startPoint}</span></div></div>}
      </div>
      <div className="card-races"><span className="event-category"><UiText>{categoryLabels[event.category]}</UiText></span><div className="distance-tags"><UiText>{event.races.map((race) => <span key={race.name}>{race.name}</span>)}</UiText></div></div>
      <UiText>{themeLabels[event.theme] && <p className="card-theme"><UiText>{"ธีมสี: "}</UiText><UiText>{themeLabels[event.theme]}</UiText></p>}</UiText>
      <div className="card-availability"><span className={`status-badge status-${event.status}`}><span /><UiText>{statusLabels[event.status]}</UiText></span></div>
      <div className="card-bottom"><span className="card-price"><UiText>{"ค่าสมัครเริ่มต้น "}</UiText><strong><UiText>{"฿ "}</UiText><UiText>{price(Math.min(...event.races.map((r) => r.price)))}</UiText></strong></span><span className="card-detail" aria-hidden="true"><UiText>{"ดูรายละเอียด "}</UiText><ArrowUpRight size={18}/></span></div>
    </div>
    </UiLink>
  </article>;
}
