"use client";

import { useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, Grid2X2, List, Mountain, Route, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { categoryLabels, filterEvents } from "@/lib/events";
import { usePublicEvents } from "./public-events-provider";
import { EventCard } from "./event-card";
import { useSavedEvents } from "./saved-events";
import { gsap, motionAllowed, useGSAP } from "@/lib/motion";

export function EventCatalog({ home = false, savedOnly = false }: { home?: boolean; savedOnly?: boolean }) {
  const { events, loading, error: loadError, retry, provinces } = usePublicEvents();
  const scope = useRef<HTMLElement>(null);
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPanelId = useId();
  const { saved } = useSavedEvents();
  const filters = { query: params.get("q") || "", province: params.get("province") || "", month: params.get("month") || "", distance: params.get("distance") || "", category: params.get("category") || "", status: params.get("status") || "" };
  const sort = params.get("sort") || "recommended";
  const activeFilters = [filters.query, filters.province, filters.month, filters.distance, filters.category, filters.status].filter(Boolean).length;
  const update = (key: string, value: string) => {
    // Update the URL immediately so quick successive selections keep each
    // other. Next's history integration updates useSearchParams without an
    // unnecessary server navigation for this browser-local catalogue.
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value); else next.delete(key);
    startTransition(() => window.history.replaceState(null, "", `${savedOnly ? "/saved" : home ? "/" : "/events"}${next.size ? `?${next}` : ""}`));
  };
  const clear = () => startTransition(() => window.history.replaceState(null, "", savedOnly ? "/saved" : home ? "/#discover" : "/events"));
  const source = savedOnly ? events.filter((event) => saved.includes(event.id)) : events;
  const filtered = filterEvents(source, filters).sort((a, b) => sort === "date" ? a.date.localeCompare(b.date) : sort === "price" ? Math.min(...a.races.map((r) => r.price)) - Math.min(...b.races.map((r) => r.price)) : ["open", "upcoming", "closed"].indexOf(a.status) - ["open", "upcoming", "closed"].indexOf(b.status));
  const months = Array.from(new Set(events.map((event) => event.date.slice(0, 7)))).sort();
  const resultKey = filtered.map((event) => event.id).join(",");
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionAllowed, () => {
      const results = scope.current?.querySelector(".events-grid, .empty-state");
      if (results) gsap.fromTo(results, { opacity: 0.6, y: 8 }, {
        opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity",
      });
    }, scope);
    return () => media.revert();
  }, { scope, dependencies: [resultKey, view], revertOnUpdate: true });

  const Heading = home ? "h2" : "h1";
  return <section className={`catalog container ${home ? "home-catalog" : "page-catalog"}`} id="discover" ref={scope}><div className="section-heading"><div><Heading className={home ? "section-title" : "page-title"}>{savedOnly ? "งานวิ่งที่คุณบันทึกไว้" : home ? "ค้นหาเส้นทางครั้งต่อไป" : "ค้นหางานวิ่ง"}</Heading><p>{savedOnly ? "รวมงานที่สนใจไว้ในที่เดียว พร้อมเมื่อไหร่ก็กลับมาดูได้" : "งานวิ่งทั่วไทย เลือกได้ตามสไตล์ของคุณ"}</p></div>{home && <Link href="/events" className="text-link">งานวิ่งทั้งหมด <ArrowRight size={18} /></Link>}</div>
    {loading && <p role="status">กำลังโหลดงานวิ่ง…</p>}{loadError && <div role="alert"><p>{loadError}</p><button className="button button-outline" onClick={() => retry()}>ลองอีกครั้ง</button></div>}
    {events.length > 0 && <>
    <div className="catalog-controls"><div className="category-tabs" role="group" aria-label="ประเภทงานวิ่ง">{[{ key: "", name: "ทั้งหมด", Icon: Grid2X2 }, { key: "road", name: categoryLabels.road, Icon: Route }, { key: "trail", name: categoryLabels.trail, Icon: Mountain }, { key: "fun", name: categoryLabels.fun, Icon: Users }].map(({ key, name, Icon }) => <button key={key} className={filters.category === key ? "selected" : ""} onClick={() => update("category", key)} aria-pressed={filters.category === key}><Icon size={18} />{name}{!key && <span>{source.length}</span>}</button>)}</div>
    <button type="button" className="catalog-filter-toggle" aria-expanded={filtersOpen} aria-controls={filterPanelId} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} aria-hidden="true" /><span>ค้นหาและกรองงานวิ่ง</span>{activeFilters > 0 && <span className="filter-active-count">{activeFilters}</span>}</button></div><div className="filter-panel" id={filterPanelId} hidden={!filtersOpen}><form className="catalog-search" key={filters.query} onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); update("q", String(values.get("q") || "").trim()); }}><label className="sr-only" htmlFor="catalog-query">ค้นหาชื่องานหรือสถานที่</label><Search size={19} /><input id="catalog-query" name="q" defaultValue={filters.query} placeholder="ค้นหาชื่องาน หรือสถานที่" /><button type="submit" className="search-submit" aria-label="ค้นหา">ค้นหา</button></form><div className="filter-selects"><label><span>จังหวัด</span><select aria-label="กรองจังหวัด" value={filters.province} onChange={(e) => update("province", e.target.value)}><option value="">ทุกจังหวัด</option>{provinces.map((province) => <option key={province}>{province}</option>)}</select></label><label><span>เดือนที่จัดงาน</span><select aria-label="กรองเดือน" value={filters.month} onChange={(e) => update("month", e.target.value)}><option value="">ทุกเดือน</option>{months.map((month) => <option value={month} key={month}>{new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(`${month}-01T12:00:00+07:00`))}</option>)}</select></label><label><span>ระยะวิ่ง</span><select aria-label="กรองระยะวิ่ง" value={filters.distance} onChange={(e) => update("distance", e.target.value)}><option value="">ทุกระยะ</option>{Array.from(new Set(events.flatMap((event) => event.races.map((race) => race.name)))).sort().map((distance) => <option key={distance}>{distance}</option>)}</select></label><label><span>สถานะรับสมัคร</span><select aria-label="กรองสถานะ" value={filters.status} onChange={(e) => update("status", e.target.value)}><option value="">ทุกสถานะ</option><option value="open">เปิดรับสมัคร</option><option value="upcoming">เร็ว ๆ นี้</option><option value="closed">ปิดรับสมัครแล้ว</option></select></label></div></div>
    <div className="results-toolbar"><div className="results-count"><p role="status" aria-live="polite">{pending ? "กำลังค้นหา…" : <>พบ <strong>{filtered.length}</strong> งานวิ่ง{filters.query && <> สำหรับ “{filters.query}”</>}</>}</p>{activeFilters > 0 && <button type="button" className="clear-filters" onClick={clear}><X size={14} aria-hidden="true" />ล้างตัวกรอง ({activeFilters})</button>}</div><div className="result-options"><label><span className="sort-label">เรียงตาม</span><select aria-label="เรียงลำดับงานวิ่ง" value={sort} onChange={(e) => update("sort", e.target.value)}><option value="recommended">แนะนำ</option><option value="date">วันที่จัดใกล้ที่สุด</option><option value="price">ค่าสมัครต่ำสุด</option></select></label><div className="view-toggle" role="group" aria-label="รูปแบบการแสดงผล"><button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="แสดงแบบการ์ด" aria-pressed={view === "grid"}><Grid2X2 size={17} /></button><button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="แสดงแบบรายการ" aria-pressed={view === "list"}><List size={18} /></button></div></div></div>
    </>}
    {filtered.length > 0 && !home && <h2 className="sr-only">รายการงานวิ่ง</h2>}
    {!loading && !loadError && (filtered.length ? <div className={`events-grid ${view === "list" ? "events-list" : ""}`} aria-busy={pending}>{filtered.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="empty-state">{savedOnly && !saved.length ? <Bookmark size={35} /> : <Search size={35} />}<h2>{savedOnly && !saved.length ? "ยังไม่มีงานที่บันทึกไว้" : !events.length ? "ยังไม่มีงานวิ่งที่เผยแพร่" : "ยังไม่พบงานวิ่งที่ตรงกัน"}</h2><p>{savedOnly && !saved.length ? "กดสัญลักษณ์บันทึกบนการ์ดงานวิ่ง เพื่อเก็บงานที่สนใจไว้ที่นี่" : !events.length ? "เมื่อผู้จัดเผยแพร่งานแล้ว รายการจะแสดงที่นี่" : "ลองเปลี่ยนคำค้น หรือเลือกจังหวัด เดือน และระยะวิ่งอื่น"}</p>{savedOnly && !saved.length ? <Link className="button button-primary" href="/events">ค้นหางานวิ่ง</Link> : !events.length ? <button className="button button-outline" onClick={retry}>ตรวจสอบงานล่าสุด</button> : activeFilters > 0 ? <button className="button button-primary" onClick={clear}>ล้างตัวกรอง</button> : <Link className="button button-outline" href="/how-to-register">ดูขั้นตอนการสมัคร</Link>}</div>)}
  </section>;
}
