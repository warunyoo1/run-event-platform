"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, Flag, MapPin, Route, Shirt, Users } from "lucide-react";
import { displayName, categoryLabels, formatDate, price, statusLabels, type RunningEvent } from "@/lib/events";
import { EventPoster } from "./event-poster";
import { EventImageSections } from "./event-image-sections";

import { gsap, motionAllowed, smoothScrollTo, useGSAP } from "@/lib/motion";

export function EventDetail({ event }: { event: RunningEvent }) {
  const [tab, setTab] = useState("overview");
  const motionScope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionAllowed, () => {
      gsap.fromTo(".detail-panel", { opacity: 0.5 }, {
        opacity: 1, duration: 0.25, ease: "power2.out", clearProps: "opacity",
      });
    }, motionScope);
    return () => media.revert();
  }, { scope: motionScope, dependencies: [tab], revertOnUpdate: true });
  return <div className="container detail-page" ref={motionScope}><nav className="breadcrumbs" aria-label="เส้นทางหน้าเว็บ"><Link href="/">หน้าหลัก</Link><ChevronRight size={14} /><Link href="/events">งานวิ่งทั้งหมด</Link><ChevronRight size={14} /><span>{displayName(event)}</span></nav><Link href="/events" className="back-link"><ArrowLeft size={17} />กลับไปค้นหางานวิ่ง</Link><div className="detail-title"><span className={`status-badge status-${event.status}`}><span />{statusLabels[event.status]}</span><span className="event-category">{categoryLabels[event.category]}</span><h1>{displayName(event)}</h1><p>{event.subtitle}</p></div><div className="detail-grid"><div className="detail-main"><EventPoster event={event} large /><div className="detail-tabs" role="tablist" aria-label="ข้อมูลงานวิ่ง">{[{ id: "overview", label: "รายละเอียดงาน" }, { id: "races", label: "ระยะวิ่งและค่าสมัคร" }, { id: "schedule", label: "กำหนดการ" }].map(({ id, label }, index) => <button id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1} key={id} className={tab === id ? "selected" : ""} onClick={() => setTab(id)} onKeyDown={(e) => { const ids = ["overview", "races", "schedule"]; if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : (index + (e.key === "ArrowRight" ? 1 : 2)) % 3; setTab(ids[next]); document.getElementById(`tab-${ids[next]}`)?.focus(); } }}>{label}</button>)}</div>
      <section className="detail-panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0}>
      {tab === "overview" && <><h2>เกี่ยวกับงานนี้</h2><p>{event.description}</p><div className="info-note">ตรวจสอบสิทธิประโยชน์และเงื่อนไขจากรายละเอียดงานหรือประกาศผู้จัด</div><h2>สถานที่จัดงาน</h2><p className="location-line"><MapPin size={19} />{event.venue}</p><a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`} target="_blank" rel="noreferrer">ค้นหาสถานที่ใน Google Maps <ArrowUpRight size={16} /></a><EventImageSections event={event} /></>}
      {tab === "races" && <><h2>ระยะวิ่งและค่าสมัคร</h2><p>เปรียบเทียบระยะ เวลาออกตัว และจำนวนรับก่อนสมัคร</p><div className="race-options">{event.races.map((race) => <article className="race-option" key={race.name}>
        <div className="race-option-heading"><div className="race-distance"><Route size={23} aria-hidden="true" /><h3>{race.name}</h3></div><div className="race-price"><span>ค่าสมัคร / คน</span><strong>฿{price(race.price)}</strong></div></div>
        <dl className="race-facts"><div><dt><Clock3 size={16} aria-hidden="true" />เวลาออกตัว</dt><dd>{race.start || "รอประกาศ"}</dd></div><div><dt><Users size={16} aria-hidden="true" />จำนวนคงเหลือ</dt><dd>{price(race.remaining ?? race.quota)} คน<small>จากทั้งหมด {price(race.quota)} คน</small></dd></div></dl>
      </article>)}</div><p className="race-availability-note">จำนวนคงเหลืออาจเปลี่ยนแปลง ระบบจะตรวจสอบอีกครั้งเมื่อยืนยันสมัคร</p></>}
      {tab === "schedule" && <><h2>กำหนดการวันงาน</h2><p>{formatDate(event.date, true)} · {event.venue}</p><ol className="schedule">{[...event.races].sort((a, b) => a.start.localeCompare(b.start)).map((race) => <li key={race.name}><div className="schedule-time"><Clock3 size={18} aria-hidden="true" />{race.start ? <time>{race.start}</time> : <span>รอประกาศเวลา</span>}</div><div className="schedule-activity"><h3>ปล่อยตัวระยะ {race.name}</h3><p>{race.start ? "กรุณามาถึงจุดปล่อยตัวล่วงหน้า 30 นาที" : "ผู้จัดยังไม่ระบุเวลาออกตัว โปรดตรวจสอบประกาศก่อนวันงาน"}</p></div></li>)}</ol></>}
      </section></div><aside className="event-summary"><h2 className="summary-heading">ข้อมูลการสมัคร</h2><dl><div><CalendarDays size={19} /><dt>วันจัดงาน</dt><dd>{formatDate(event.date, true)}</dd></div><div><MapPin size={19} /><dt>สถานที่</dt><dd>{event.venue}</dd></div><div><Clock3 size={19} /><dt>รับสมัครถึง</dt><dd>{event.status === "upcoming" ? "รอประกาศวันเปิดรับสมัคร" : event.registrationEnds ? formatDate(event.registrationEnds) : "ไม่ระบุ"}</dd></div><div><Users size={19} /><dt>ผู้จัดงาน</dt><dd>{event.organizer}</dd></div></dl><div className="summary-price"><span>ค่าสมัครเริ่มต้น</span><strong>฿{price(Math.min(...event.races.map((r) => r.price)))}</strong><small>ต่อคน</small></div>{event.status === "open" ? <Link className="button button-primary" href={`/events/${event.slug}/register`}>สมัครเข้าร่วมกิจกรรม <ChevronRight size={18} /></Link> : <button className="button button-primary" disabled>{event.status === "closed" ? "ปิดรับสมัครแล้ว" : "ยังไม่เปิดรับสมัคร"}</button>}<button className="button button-outline" onClick={() => { setTab("races"); smoothScrollTo("#tab-races"); }}>ดูระยะวิ่งและค่าสมัคร</button><p className="summary-note">{event.status === "open" ? "ตรวจสอบข้อมูลก่อนยืนยันสมัคร" : "ติดตามสถานะรับสมัครจากผู้จัด"}</p></aside></div><div className="related-heading"><h2>ยังมีอีกหลายเส้นทางให้ค้นพบ</h2><Link href="/events" className="text-link">ดูงานวิ่งทั้งหมด <ArrowUpRight size={17} /></Link></div></div>;
}
