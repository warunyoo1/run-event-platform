"use client";
import { UiButton, UiDiv, UiInput, UiSelect, UiText } from '@/i18n/client';

import { useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, Grid2X2, List, Mountain, Route, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { categoryLabels, filterEvents } from "@/lib/events";
import { usePublicEvents } from "./public-events-provider";
import { EventCard } from "./event-card";
import { useSavedEvents } from "./saved-events";
import { gsap, motionAllowed, useGSAP } from "@/lib/motion";
export function EventCatalog({ home = false, savedOnly = false }: {
    home?: boolean;
    savedOnly?: boolean;
}) {
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
        if (value)
            next.set(key, value);
        else
            next.delete(key);
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
            if (results)
                gsap.fromTo(results, { opacity: 0.6, y: 8 }, {
                    opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity",
                });
        }, scope);
        return () => media.revert();
    }, { scope, dependencies: [resultKey, view], revertOnUpdate: true });
    const Heading = home ? "h2" : "h1";
    return <section className={`catalog container ${home ? "home-catalog" : "page-catalog"}`} id="discover" ref={scope}><div className="section-heading"><div><Heading className={home ? "section-title" : "page-title"}><UiText>{savedOnly ? "งานวิ่งที่คุณบันทึกไว้" : home ? "ค้นหาเส้นทางครั้งต่อไป" : "ค้นหางานวิ่ง"}</UiText></Heading><p><UiText>{savedOnly ? "รวมงานที่สนใจไว้ในที่เดียว พร้อมเมื่อไหร่ก็กลับมาดูได้" : "งานวิ่งทั่วไทย เลือกได้ตามสไตล์ของคุณ"}</UiText></p></div><UiText>{home && <Link href="/events" className="text-link"><UiText>{"งานวิ่งทั้งหมด "}</UiText><ArrowRight size={18}/></Link>}</UiText></div>
    <UiText>{loading && <p role="status"><UiText>{"กำลังโหลดงานวิ่ง\u2026 "}</UiText></p>}</UiText><UiText>{loadError && <div role="alert"><p><UiText>{loadError}</UiText></p><button className="button button-outline" onClick={() => retry()}><UiText>{"ลองอีกครั้ง "}</UiText></button></div>}</UiText>
    <UiText>{events.length > 0 && <>
    <div className="catalog-controls"><UiDiv className="category-tabs" role="group" aria-label="ประเภทงานวิ่ง"><UiText>{[{ key: "", name: "ทั้งหมด", Icon: Grid2X2 }, { key: "road", name: categoryLabels.road, Icon: Route }, { key: "trail", name: categoryLabels.trail, Icon: Mountain }, { key: "fun", name: categoryLabels.fun, Icon: Users }].map(({ key, name, Icon }) => <button key={key} className={filters.category === key ? "selected" : ""} onClick={() => update("category", key)} aria-pressed={filters.category === key}><Icon size={18}/><UiText>{name}</UiText><UiText>{!key && <span><UiText>{source.length}</UiText></span>}</UiText></button>)}</UiText></UiDiv>
    <button type="button" className="catalog-filter-toggle" aria-expanded={filtersOpen} aria-controls={filterPanelId} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} aria-hidden="true"/><span><UiText>{"ค้นหาและกรองงานวิ่ง "}</UiText></span><UiText>{activeFilters > 0 && <span className="filter-active-count"><UiText>{activeFilters}</UiText></span>}</UiText></button></div><div className="filter-panel" id={filterPanelId} hidden={!filtersOpen}><form className="catalog-search" key={filters.query} onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); update("q", String(values.get("q") || "").trim()); }}><label className="sr-only" htmlFor="catalog-query"><UiText>{"ค้นหาชื่องานหรือสถานที่ "}</UiText></label><Search size={19}/><UiInput id="catalog-query" name="q" defaultValue={filters.query} placeholder="ค้นหาชื่องาน หรือสถานที่"/><UiButton type="submit" className="search-submit" aria-label="ค้นหา"><UiText>{"ค้นหา "}</UiText></UiButton></form><div className="filter-selects"><label><span><UiText>{"จังหวัด "}</UiText></span><UiSelect aria-label="กรองจังหวัด" value={filters.province} onChange={(e) => update("province", e.target.value)}><option value=""><UiText>{"ทุกจังหวัด "}</UiText></option><UiText>{provinces.map((province) => <option key={province} value={province}><UiText>{province}</UiText></option>)}</UiText></UiSelect></label><label><span><UiText>{"เดือนที่จัดงาน "}</UiText></span><UiSelect aria-label="กรองเดือน" value={filters.month} onChange={(e) => update("month", e.target.value)}><option value=""><UiText>{"ทุกเดือน "}</UiText></option><UiText>{months.map((month) => <option value={month} key={month}><UiText>{new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(`${month}-01T12:00:00+07:00`))}</UiText></option>)}</UiText></UiSelect></label><label><span><UiText>{"ระยะวิ่ง "}</UiText></span><UiSelect aria-label="กรองระยะวิ่ง" value={filters.distance} onChange={(e) => update("distance", e.target.value)}><option value=""><UiText>{"ทุกระยะ "}</UiText></option><UiText>{Array.from(new Set(events.flatMap((event) => event.races.map((race) => race.name)))).sort().map((distance) => <option key={distance} value={distance}><UiText>{distance}</UiText></option>)}</UiText></UiSelect></label><label><span><UiText>{"สถานะรับสมัคร "}</UiText></span><UiSelect aria-label="กรองสถานะ" value={filters.status} onChange={(e) => update("status", e.target.value)}><option value=""><UiText>{"ทุกสถานะ "}</UiText></option><option value="open"><UiText>{"เปิดรับสมัคร "}</UiText></option><option value="upcoming"><UiText>{"เร็ว ๆ นี้ "}</UiText></option><option value="closed"><UiText>{"ปิดรับสมัครแล้ว "}</UiText></option></UiSelect></label></div></div>
    <div className="results-toolbar"><div className="results-count"><p role="status" aria-live="polite"><UiText>{pending ? "กำลังค้นหา…" : <><UiText>{`พบ ${filtered.length} งานวิ่ง`}</UiText><UiText>{filters.query && <><UiText>{"สำหรับ \u201C "}</UiText><UiText>{filters.query}</UiText>”</>}</UiText></>}</UiText></p><UiText>{activeFilters > 0 && <button type="button" className="clear-filters" onClick={clear}><X size={14} aria-hidden="true"/><UiText>{"ล้างตัวกรอง ( "}</UiText><UiText>{activeFilters}</UiText>)</button>}</UiText></div><div className="result-options"><label><span className="sort-label"><UiText>{"เรียงตาม "}</UiText></span><UiSelect aria-label="เรียงลำดับงานวิ่ง" value={sort} onChange={(e) => update("sort", e.target.value)}><option value="recommended"><UiText>{"แนะนำ "}</UiText></option><option value="date"><UiText>{"วันที่จัดใกล้ที่สุด "}</UiText></option><option value="price"><UiText>{"ค่าสมัครต่ำสุด "}</UiText></option></UiSelect></label><UiDiv className="view-toggle" role="group" aria-label="รูปแบบการแสดงผล"><UiButton className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="แสดงแบบการ์ด" aria-pressed={view === "grid"}><Grid2X2 size={17}/></UiButton><UiButton className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="แสดงแบบรายการ" aria-pressed={view === "list"}><List size={18}/></UiButton></UiDiv></div></div>
    </>}</UiText>
    <UiText>{filtered.length > 0 && !home && <h2 className="sr-only"><UiText>{"รายการงานวิ่ง "}</UiText></h2>}</UiText>
    <UiText>{!loading && !loadError && (filtered.length ? <div className={`events-grid ${view === "list" ? "events-list" : ""}`} aria-busy={pending}><UiText>{filtered.map((event) => <EventCard event={event} key={event.id}/>)}</UiText></div> : <div className="empty-state"><UiText>{savedOnly && !saved.length ? <Bookmark size={35}/> : <Search size={35}/>}</UiText><h2><UiText>{savedOnly && !saved.length ? "ยังไม่มีงานที่บันทึกไว้" : !events.length ? "ยังไม่มีงานวิ่งที่เผยแพร่" : "ยังไม่พบงานวิ่งที่ตรงกัน"}</UiText></h2><p><UiText>{savedOnly && !saved.length ? "กดสัญลักษณ์บันทึกบนการ์ดงานวิ่ง เพื่อเก็บงานที่สนใจไว้ที่นี่" : !events.length ? "เมื่อผู้จัดเผยแพร่งานแล้ว รายการจะแสดงที่นี่" : "ลองเปลี่ยนคำค้น หรือเลือกจังหวัด เดือน และระยะวิ่งอื่น"}</UiText></p><UiText>{savedOnly && !saved.length ? <Link className="button button-primary" href="/events"><UiText>{"ค้นหางานวิ่ง "}</UiText></Link> : !events.length ? <button className="button button-outline" onClick={retry}><UiText>{"ตรวจสอบงานล่าสุด "}</UiText></button> : activeFilters > 0 ? <button className="button button-primary" onClick={clear}><UiText>{"ล้างตัวกรอง "}</UiText></button> : <Link className="button button-outline" href="/how-to-register"><UiText>{"ดูขั้นตอนการสมัคร "}</UiText></Link>}</UiText></div>)}</UiText>
  </section>;
}
