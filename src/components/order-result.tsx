import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, FileSearch } from "lucide-react";
import { displayName, formatDate, price } from "@/lib/events";
import type { PublicOrder } from "@/lib/api";

const labels = { pending: "รอชำระเงิน", slip_uploaded: "รอตรวจสลิป", paid: "ชำระเงินแล้ว", rejected: "สลิปไม่ผ่าน", expired: "หมดเวลาชำระเงิน", cancelled: "ยกเลิกแล้ว" };

export function OrderResult({ result, children }: { result: PublicOrder; children?: ReactNode }) {
  return <section className="lookup-result" aria-label="รายละเอียดใบสมัคร">
    <div className="lookup-result-heading"><span className="lookup-result-icon"><FileSearch size={22} aria-hidden="true" /></span><div><p>เลขที่ใบสมัคร</p><h2>{result.orderNo}</h2></div><span className={`status-badge order-status-${result.status}`}>{labels[result.status]}</span></div>
    {result.event && <div className="order-event"><h3>{displayName(result.event)}</h3><p>{formatDate(result.event.date, true)} · {result.event.venue}</p></div>}
    <div className="order-details-grid"><section className="order-participants"><h3>ผู้สมัครและระยะวิ่ง</h3><ol>{result.races.map((person, index) => <li key={index}><span className="order-person">{index + 1}</span><div><strong>{person.race}</strong><p>เสื้อไซซ์ {person.size}</p></div></li>)}</ol></section>
      <section className="order-cost"><h3>สรุปยอดชำระ</h3><dl><div><dt>ค่าสมัคร</dt><dd>฿{price(result.amount.subtotal)}</dd></div><div><dt>ค่าจัดส่ง</dt><dd>฿{price(result.amount.shipping)}</dd></div><div className="order-total"><dt>ยอดรวม</dt><dd>฿{price(result.amount.total)}</dd></div></dl>{result.expiresAt && <p className="order-deadline">กำหนดชำระ <strong>{new Date(result.expiresAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</strong></p>}</section></div>
    {result.rejectionReason && <p className="order-rejection" role="status">เหตุผลที่สลิปไม่ผ่าน: {result.rejectionReason}</p>}
    {children}
    {result.event && <div className="order-result-footer"><Link className="text-link" href={`/events/${result.event.slug}`}>ดูรายละเอียดงาน <ArrowUpRight size={16} aria-hidden="true" /></Link></div>}
  </section>;
}
