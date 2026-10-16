"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileSearch, Search } from "lucide-react";
import { displayName, formatDate, getEvent, price } from "@/lib/events";
import { readDemoReceipts, type DemoReceipt } from "@/lib/registration";

const example: DemoReceipt = { reference: "DEMO-1001", eventSlug: "bangkok-morning-2027", races: [{ race: "5 KM", size: "M" }], amount: 399, delivery: "pickup", createdAt: "2026-10-15T00:00:00Z", status: "pending" };
const findReceipt = (reference: string) => [example, ...readDemoReceipts()].find((receipt) => receipt.reference === reference.trim().toUpperCase() && getEvent(receipt.eventSlug)) || null;

export function OrderLookup({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [result, setResult] = useState<DemoReceipt | "empty" | null>(null);
  useEffect(() => {
    setReference(initialReference);
    setResult(initialReference ? findReceipt(initialReference) || "empty" : null);
  }, [initialReference]);
  const event = result && result !== "empty" ? getEvent(result.eventSlug) : undefined;
  return <div className="lookup-content">
    <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); setResult(findReceipt(reference) || "empty"); }}>
      <label htmlFor="order-reference">เลขที่ใบสมัคร</label>
      <p id="reference-hint">ค้นหาใบสมัครที่ทดลองสร้างในแท็บนี้ หรือใช้ <button type="button" className="example-reference" onClick={() => { setReference(example.reference); setResult(null); }}>{example.reference}</button></p>
      <div className="lookup-input"><Search size={19} aria-hidden="true" /><input id="order-reference" name="reference" value={reference} onChange={(e) => { setReference(e.target.value); setResult(null); }} placeholder="เช่น DEMO-1001" aria-describedby="reference-hint" required maxLength={50} autoComplete="off" spellCheck={false} /><button className="button button-primary" type="submit">ค้นหาใบสมัคร</button></div>
      <p className="lookup-note">เฉพาะใบสมัครตัวอย่างในแท็บนี้ ไม่มีการดึงข้อมูลผู้สมัครจริงจาก Admin</p>
    </form>
    <div aria-live="polite" aria-atomic="true">
      {result && result !== "empty" && event && <section className="lookup-result"><div className="lookup-result-heading"><span className="lookup-result-icon"><FileSearch size={23} /></span><div><span className="event-category">ใบสมัครตัวอย่าง</span><h2>{result.reference}</h2></div><span className="status-badge status-upcoming">รอชำระเงิน (ตัวอย่าง)</span></div><h3>{displayName(event)}</h3><dl><div><dt>วันจัดงาน</dt><dd>{formatDate(event.date, true)}</dd></div><div><dt>สถานที่</dt><dd>{event.venue}</dd></div><div><dt>ผู้สมัครและระยะวิ่ง</dt><dd>{result.races.map((person, index) => <span key={index} style={{ display: "block" }}>คนที่ {index + 1}: {person.race} · เสื้อ {person.size}</span>)}</dd></div><div><dt>ยอดรวม{result.delivery === "shipping" ? " (รวมค่าจัดส่ง)" : ""}</dt><dd>฿{price(result.amount)}</dd></div></dl><Link className="text-link" href={`/events/${event.slug}`}>ดูรายละเอียดงาน <ArrowUpRight size={16} /></Link></section>}
      {result === "empty" && <div className="lookup-empty"><FileSearch size={30} aria-hidden="true" /><h2>ไม่พบใบสมัครตัวอย่าง</h2><p>ตรวจสอบเลขที่ใบสมัครและเปิดในแท็บเดียวกับที่ทดลองสมัคร หรือลองใช้ {example.reference}</p></div>}
    </div>
    <div className="info-note">ใบสมัครทดลองไม่มีการจองสิทธิ์หรือชำระเงินจริง เก็บเฉพาะเลขใบสมัคร ระยะวิ่ง และยอดรวมในแท็บนี้ โดยไม่เก็บข้อมูลส่วนตัวของผู้สมัคร</div>
  </div>;
}
