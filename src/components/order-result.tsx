import { useUiTranslation, UiSection, UiText } from '@/i18n/client';
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, FileSearch } from "lucide-react";
import { displayName, formatDate, price } from "@/lib/events";
import type { PublicOrder } from "@/lib/api";
const labels = { pending: "รอชำระเงิน", slip_uploaded: "รอตรวจสลิป", paid: "ชำระเงินแล้ว", rejected: "สลิปไม่ผ่าน", expired: "หมดเวลาชำระเงิน", cancelled: "ยกเลิกแล้ว" };
export function OrderResult({ result, children }: {
    result: PublicOrder;
    children?: ReactNode;
}) {
    const { language } = useUiTranslation();
    return <UiSection className="lookup-result" aria-label="รายละเอียดใบสมัคร">
    <div className="lookup-result-heading"><span className="lookup-result-icon"><FileSearch size={22} aria-hidden="true"/></span><div><p><UiText>{"เลขที่ใบสมัคร "}</UiText></p><h2><UiText>{result.orderNo}</UiText></h2></div><span className={`status-badge order-status-${result.status}`}><UiText>{labels[result.status]}</UiText></span></div>
    <UiText>{result.event && <div className="order-event"><h3>{displayName(result.event, language)}</h3><p><UiText>{formatDate(result.event.date, true)}</UiText> · <UiText>{result.event.venue}</UiText></p></div>}</UiText>
    <div className="order-details-grid"><section className="order-participants"><h3><UiText>{"ผู้สมัครและระยะวิ่ง "}</UiText></h3><ol><UiText>{result.races.map((person, index) => <li key={index}><span className="order-person"><UiText>{index + 1}</UiText></span><div><strong>{person.race}</strong><p><UiText>{"เสื้อไซซ์ "}</UiText>{person.size}</p>{person.identityReference && <p className="runner-reference"><UiText>รหัสอ้างอิงผู้สมัคร</UiText>: {person.identityReference}</p>}</div></li>)}</UiText></ol></section>
      <section className="order-cost"><h3><UiText>{"สรุปยอดชำระ "}</UiText></h3><dl><div><dt><UiText>{"ค่าสมัคร "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(result.amount.subtotal)}</UiText></dd></div><div><dt><UiText>{"ค่าจัดส่ง "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(result.amount.shipping)}</UiText></dd></div><div className="order-total"><dt><UiText>{"ยอดรวม "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(result.amount.total)}</UiText></dd></div></dl><UiText>{result.expiresAt && <p className="order-deadline"><UiText>{"กำหนดชำระ "}</UiText><strong><UiText>{new Date(result.expiresAt).toLocaleString(language === "en" ? "en-GB" : "th-TH", { timeZone: "Asia/Bangkok" })}</UiText></strong></p>}</UiText></section></div>
    <UiText>{result.rejectionReason && <p className="order-rejection" role="status"><UiText>{"เหตุผลที่สลิปไม่ผ่าน: "}</UiText><UiText>{result.rejectionReason}</UiText></p>}</UiText>
    <UiText>{children}</UiText>
    <UiText>{result.event && <div className="order-result-footer"><Link className="text-link" href={`/events/${result.event.slug}`}><UiText>{"ดูรายละเอียดงาน "}</UiText><ArrowUpRight size={16} aria-hidden="true"/></Link></div>}</UiText>
  </UiSection>;
}
