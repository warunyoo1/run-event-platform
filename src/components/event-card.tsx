"use client";
import Link from "next/link";
import { ArrowUpRight, Flag, MapPin } from "lucide-react";
import { displayName, themeLabels, categoryLabels, formatDate, price, statusLabels, type RunningEvent } from "@/lib/events";
import { EventPoster } from "./event-poster";

export function EventCard({ event }: { event: RunningEvent }) {
  const date = new Date(`${event.date}T12:00:00+07:00`);
  const day = new Intl.DateTimeFormat("th-TH", { day: "numeric", timeZone: "Asia/Bangkok" }).format(date);
  const month = new Intl.DateTimeFormat("th-TH", { month: "short", timeZone: "Asia/Bangkok" }).format(date);
  return <article className="event-card">
    <Link className="card-link" href={`/events/${event.slug}`} aria-label={`ดูรายละเอียด ${displayName(event)}`}>
    <div className="card-visual">
      <EventPoster event={event} />
    </div>
    <div className="card-body">
      <h3>{displayName(event)}</h3>
      <div className="card-facts">
        <div className="card-date-stamp" aria-hidden="true"><strong>{day}</strong><span>{month}</span></div>
        <div className="card-location"><time dateTime={event.date}>{formatDate(event.date)}</time><p className="event-meta event-venue"><MapPin size={15} /><span>ชื่อสถานที่: {event.venue}{event.province && ` · ${event.province}`}</span></p>{event.startPoint?.trim() && <p className="event-meta card-start-point"><Flag size={15} aria-hidden="true" /><span>จุดปล่อยตัว: {event.startPoint}</span></p>}</div>
      </div>
      <div className="card-races"><span className="event-category">{categoryLabels[event.category]}</span><div className="distance-tags">{event.races.map((race) => <span key={race.name}>{race.name}</span>)}</div></div>
      {themeLabels[event.theme] && <p className="card-theme">ธีมสี: {themeLabels[event.theme]}</p>}
      <div className="card-availability"><span className={`status-badge status-${event.status}`}><span />{statusLabels[event.status]}</span></div>
      <div className="card-bottom"><span className="card-price">ค่าสมัครเริ่มต้น<strong>฿{price(Math.min(...event.races.map((r) => r.price)))}</strong></span><span className="card-detail" aria-hidden="true">ดูรายละเอียด <ArrowUpRight size={18} /></span></div>
    </div>
    </Link>
  </article>;
}
