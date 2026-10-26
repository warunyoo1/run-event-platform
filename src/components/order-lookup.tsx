"use client";
import { UiInput, UiText } from '@/i18n/client';

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FileSearch, Search, Upload } from "lucide-react";
import { BankPaymentDetails } from "./bank-payment-details";
import { OrderResult } from "./order-result";
import { findOrder, sendSlip, type PublicOrder } from "@/lib/api";
export function OrderLookup({ initialReference = "" }: {
    initialReference?: string;
}) {
    const [reference, setReference] = useState(initialReference);
    const [phone, setPhone] = useState("");
    const [result, setResult] = useState<PublicOrder | null>(null);
    const [lookup, setLookup] = useState<{
        orderNo: string;
        phone: string;
    } | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [pending, setPending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const input = useRef<HTMLInputElement>(null);
    async function search(event: FormEvent) {
        event.preventDefault();
        if (pending || uploading)
            return;
        setPending(true);
        setError("");
        setNotice("");
        setResult(null);
        setFile(null);
        try {
            const orderNo = reference.trim().toUpperCase();
            const order = await findOrder(orderNo, phone);
            setResult(order);
            setLookup({ orderNo, phone });
        }
        catch (error) {
            setError(error instanceof Error ? error.message : "ค้นหาไม่สำเร็จ");
        }
        finally {
            setPending(false);
        }
    }
    async function upload(event: FormEvent) {
        event.preventDefault();
        if (!file || !lookup || uploading)
            return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0) {
            setError("เลือกไฟล์ JPG, PNG หรือ WEBP ที่ไม่ว่างเปล่า");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("ไฟล์ต้องมีขนาดไม่เกิน 5 MB");
            return;
        }
        setUploading(true);
        setError("");
        setNotice("");
        let sent = false;
        try {
            await sendSlip(lookup.orderNo, lookup.phone, file);
            sent = true;
            setNotice("ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ");
            setFile(null);
            if (input.current)
                input.current.value = "";
            setResult((current) => current ? { ...current, status: "slip_uploaded", canUploadSlip: false } : current);
            setResult(await findOrder(lookup.orderNo, lookup.phone));
        }
        catch (error) {
            setError(sent ? "ส่งสลิปสำเร็จ แต่โหลดสถานะล่าสุดไม่ได้ กรุณาค้นหาใบสมัครอีกครั้ง" : error instanceof Error ? error.message : "ส่งสลิปไม่สำเร็จ");
        }
        finally {
            setUploading(false);
        }
    }
    return <div className="lookup-content">
    <form className="lookup-form" onSubmit={search}>
      <p className="lookup-intro"><UiText>{"กรอกข้อมูลที่ใช้สมัคร เพื่อตรวจสอบรายละเอียดและสถานะ "}</UiText></p>
      <div className="lookup-fields"><div className="lookup-field">
      <label htmlFor="order-reference"><UiText>{"เลขที่ใบสมัคร "}</UiText></label>
      <div className="lookup-input"><FileSearch size={19} aria-hidden="true"/><UiInput id="order-reference" placeholder="กรอกเลขที่ใบสมัคร" value={reference} onChange={(e) => { setReference(e.target.value); setResult(null); }} required maxLength={50} autoComplete="off" aria-describedby="reference-hint" disabled={uploading || pending}/></div>
      <p id="reference-hint" className="lookup-field-hint"><UiText>{"ดูเลขที่ใบสมัครได้จากหน้าสมัครสำเร็จ "}</UiText></p>
      </div><div className="lookup-field">
      <label htmlFor="order-phone"><UiText>{"เบอร์โทรผู้ติดต่อ 4 ตัวท้าย "}</UiText></label>
      <UiInput id="order-phone" placeholder="ตัวเลข 4 หลัก" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 4)); setResult(null); }} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required autoComplete="off" aria-describedby="phone-hint" disabled={uploading || pending}/>
      <p id="phone-hint" className="lookup-field-hint"><UiText>{"ใช้เบอร์โทรผู้ติดต่อที่ระบุตอนสมัคร "}</UiText></p>
      </div></div>
      <div className="lookup-form-actions"><button className="button button-primary" type="submit" disabled={pending || uploading}><Search size={18} aria-hidden="true"/><UiText>{pending ? "กำลังค้นหา…" : "ค้นหาใบสมัคร"}</UiText></button></div>
    </form>
    <details className="lookup-help"><summary><UiText>{"จำเลขใบสมัครไม่ได้? "}</UiText></summary><p><UiText>{"ตรวจสอบภาพหน้าจอหรือเลขที่คัดลอกไว้จากหน้าสมัครสำเร็จ หากหาไม่พบ ให้ติดต่อผู้จัดผ่านช่องทางในประกาศงานเพื่อช่วยตรวจสอบ กรุณาอย่าสมัครซ้ำระหว่างรอตรวจสอบ "}</UiText></p><Link className="text-link" href="/events"><UiText>{"ค้นหางานที่สมัคร "}</UiText></Link></details>
    <UiText>{error && <p className="reg-field-error" role="alert"><UiText>{error}</UiText></p>}</UiText>
    <UiText>{notice && <p role="status"><UiText>{notice}</UiText></p>}</UiText>
    <UiText>{result && <OrderResult result={result}>
      <UiText>{result.canUploadSlip && <form className="slip-upload-form" onSubmit={upload}><h3><UiText>{"ส่งหลักฐานการชำระเงิน "}</UiText></h3><BankPaymentDetails/><label className="slip-file-field"><span><Upload size={24} aria-hidden="true"/><strong><UiText>{file ? file.name : "เลือกภาพสลิป"}</UiText></strong><small><UiText>{"JPG, PNG หรือ WEBP \u00B7 ไม่เกิน 5 MB "}</UiText></small></span><UiInput ref={input} type="file" aria-label="เลือกภาพสลิป" accept="image/jpeg,image/png,image/webp" required disabled={uploading} onChange={(e) => setFile(e.target.files?.[0] ?? null)}/></label><button className="button button-primary" disabled={!file || uploading} type="submit"><Upload size={16} aria-hidden="true"/><UiText>{uploading ? "กำลังส่ง…" : "ส่งสลิป"}</UiText></button></form>}</UiText>
      </OrderResult>}</UiText></div>;
}
