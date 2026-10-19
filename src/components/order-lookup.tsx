"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, FileSearch, Search, Upload } from "lucide-react";
import { displayName, formatDate, price } from "@/lib/events";
import { findOrder, sendSlip, type PublicOrder } from "@/lib/api";

const labels = { pending: "รอชำระเงิน", slip_uploaded: "รอตรวจสลิป", paid: "ชำระเงินแล้ว", rejected: "สลิปไม่ผ่าน", expired: "หมดเวลาชำระเงิน", cancelled: "ยกเลิกแล้ว" };
export function OrderLookup({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<PublicOrder | null>(null);
  const [lookup, setLookup] = useState<{ orderNo: string; phone: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function search(event: FormEvent) {
    event.preventDefault(); if (pending || uploading) return;
    setPending(true); setError(""); setNotice(""); setResult(null); setFile(null);
    try {
      const orderNo = reference.trim().toUpperCase();
      const order = await findOrder(orderNo, phone);
      setResult(order); setLookup({ orderNo, phone });
    } catch (error) { setError(error instanceof Error ? error.message : "ค้นหาไม่สำเร็จ"); }
    finally { setPending(false); }
  }
  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file || !lookup || uploading) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0) { setError("เลือกไฟล์ JPG, PNG หรือ WEBP ที่ไม่ว่างเปล่า"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("ไฟล์ต้องมีขนาดไม่เกิน 5 MB"); return; }
    setUploading(true); setError(""); setNotice("");
    let sent = false;
    try {
      await sendSlip(lookup.orderNo, lookup.phone, file); sent = true;
      setNotice("ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ"); setFile(null); if (input.current) input.current.value = "";
      setResult((current) => current ? { ...current, status: "slip_uploaded", canUploadSlip: false } : current);
      setResult(await findOrder(lookup.orderNo, lookup.phone));
    } catch (error) { setError(sent ? "ส่งสลิปสำเร็จ แต่โหลดสถานะล่าสุดไม่ได้ กรุณาค้นหาใบสมัครอีกครั้ง" : error instanceof Error ? error.message : "ส่งสลิปไม่สำเร็จ"); }
    finally { setUploading(false); }
  }
  return <div className="lookup-content">
    <form className="lookup-form" onSubmit={search}>
      <p className="lookup-intro">กรอกข้อมูลที่ใช้สมัคร เพื่อตรวจสอบรายละเอียดและสถานะ</p>
      <div className="lookup-fields"><div className="lookup-field">
      <label htmlFor="order-reference">เลขที่ใบสมัคร</label>
      <div className="lookup-input"><FileSearch size={19} aria-hidden="true" /><input id="order-reference" placeholder="กรอกเลขที่ใบสมัคร" value={reference} onChange={(e) => { setReference(e.target.value); setResult(null); }} required maxLength={50} autoComplete="off" aria-describedby="reference-hint" disabled={uploading || pending} /></div>
      <p id="reference-hint" className="lookup-field-hint">ดูเลขที่ใบสมัครได้จากหน้าสมัครสำเร็จ</p>
      </div><div className="lookup-field">
      <label htmlFor="order-phone">เบอร์โทรผู้ติดต่อ 4 ตัวท้าย</label>
      <input id="order-phone" placeholder="ตัวเลข 4 หลัก" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0,4)); setResult(null); }} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required autoComplete="off" aria-describedby="phone-hint" disabled={uploading || pending} />
      <p id="phone-hint" className="lookup-field-hint">ใช้เบอร์โทรผู้ติดต่อที่ระบุตอนสมัคร</p>
      </div></div>
      <div className="lookup-form-actions"><button className="button button-primary" type="submit" disabled={pending || uploading}><Search size={18} aria-hidden="true" />{pending ? "กำลังค้นหา…" : "ค้นหาใบสมัคร"}</button></div>
    </form>
    <details className="lookup-help"><summary>จำเลขใบสมัครไม่ได้?</summary><p>ตรวจสอบภาพหน้าจอหรือเลขที่คัดลอกไว้จากหน้าสมัครสำเร็จ หากหาไม่พบ ให้ติดต่อผู้จัดผ่านช่องทางในประกาศงานเพื่อช่วยตรวจสอบ กรุณาอย่าสมัครซ้ำระหว่างรอตรวจสอบ</p><Link className="text-link" href="/events">ค้นหางานที่สมัคร</Link></details>
    {error && <p className="reg-field-error" role="alert">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {result && <section className="lookup-result"><div className="lookup-result-heading"><FileSearch size={24} aria-hidden="true" /><h2>{result.orderNo}</h2><span className="status-badge">{labels[result.status]}</span></div>
      {result.event && <><h3>{displayName(result.event)}</h3><p>{formatDate(result.event.date, true)} · {result.event.venue}</p></>}
      <dl><div><dt>ผู้สมัครและระยะวิ่ง</dt><dd>{result.races.map((person,index) => <span key={index} style={{display:"block"}}>คนที่ {index+1}: {person.race} · เสื้อ {person.size}</span>)}</dd></div><div><dt>ค่าสมัคร</dt><dd>฿{price(result.amount.subtotal)}</dd></div><div><dt>ค่าจัดส่ง</dt><dd>฿{price(result.amount.shipping)}</dd></div><div><dt>ยอดรวม</dt><dd>฿{price(result.amount.total)}</dd></div>{result.expiresAt && <div><dt>กำหนดชำระ</dt><dd>{new Date(result.expiresAt).toLocaleString("th-TH",{timeZone:"Asia/Bangkok"})}</dd></div>}</dl>
      {result.rejectionReason && <p role="status">เหตุผลที่สลิปไม่ผ่าน: {result.rejectionReason}</p>}
      {result.canUploadSlip && <form className="slip-upload-form" onSubmit={upload}><h3>ส่งหลักฐานการชำระเงิน</h3><p>กรุณาตรวจสอบช่องทางรับชำระกับผู้จัด ขณะนี้หน้าเว็บยังไม่แสดง QR หรือบัญชีรับเงิน</p><label>รูปสลิป (JPG, PNG, WEBP ไม่เกิน 5 MB)<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" required disabled={uploading} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label><button className="button button-primary" disabled={!file || uploading} type="submit"><Upload size={16} aria-hidden="true" />{uploading ? "กำลังส่ง…" : "ส่งสลิป"}</button></form>}
      {result.event && <Link className="text-link" href={`/events/${result.event.slug}`}>ดูรายละเอียดงาน <ArrowUpRight size={16} aria-hidden="true" /></Link>}
    </section>}
  </div>;
}
