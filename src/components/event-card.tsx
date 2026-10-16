"use client";
import Link from "next/link";
import { ArrowUpRight, Bookmark, CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { displayName, categoryLabels, formatDate, price, statusLabels, type RunningEvent } from "@/lib/events";
import { EventPoster } from "./event-poster";
import { useSavedEvents } from "./saved-events";

export function SaveButton({ event }: { event: RunningEvent }) {
  const { saved, toggle } = useSavedEvents();
  const [error, setError] = useState(false);
  const isSaved = saved.includes(event.id);
  return <><button className={`save-button icon-button ${isSaved ? "is-saved" : ""}`} aria-label={`${isSaved ? "ยกเลิกบันทึก" : "บันทึก"} ${displayName(event)}`} aria-pressed={isSaved} onClick={() => setError(!toggle(event.id))}><Bookmark size={19} fill={isSaved ? "currentColor" : "none"} /></button>{error && <span role="alert" className="save-error">บันทึกไม่ได้ กรุณาอนุญาตพื้นที่จัดเก็บในเบราว์เซอร์</span>}</>;
}

export function EventCard({ event }: { event: RunningEvent }) {
  return <article className="event-card"><div className="card-visual"><Link href={`/events/${event.slug}`} tabIndex={-1} aria-hidden="true"><EventPoster event={event} /></Link><span className={`status-badge status-${event.status}`}><span />{statusLabels[event.status]}</span><SaveButton event={event} /></div><div className="card-body"><span className="event-category">{categoryLabels[event.category]} · {event.province}</span><h3><Link href={`/events/${event.slug}`}>{displayName(event)}</Link></h3><p className="event-meta"><CalendarDays size={16} /><time dateTime={event.date}>{formatDate(event.date)}</time></p><p className="event-meta event-venue"><MapPin size={16} /><span>{event.venue}</span></p><div className="distance-tags">{event.races.map((race) => <span key={race.name}>{race.name}</span>)}</div><div className="card-bottom"><span>เริ่มต้น <strong>฿{price(Math.min(...event.races.map((r) => r.price)))}</strong></span><Link href={`/events/${event.slug}`} className="card-detail" aria-label={`ดูรายละเอียด ${displayName(event)}`}>ดูรายละเอียด <ArrowUpRight size={17} /></Link></div></div></article>;
}
