"use client";
import { useUiTranslation, UiButton, UiOl, UiText } from '@/i18n/client';

import { BankPaymentDetails } from "./bank-payment-details";
import { RegistrationLeaveGuard } from "./registration-leave-guard";
import Link from "next/link";
import { useEffect, useRef, useState, type HTMLInputTypeAttribute } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardList, Copy, MapPin, Pencil, Plus, Shirt, Trash2, Truck, Upload, UserRound } from "lucide-react";
import { raceAvailability, displayName, formatDate, price, type RunningEvent } from "@/lib/events";
import { MAX_PARTICIPANTS, SHIPPING_FEE, emptyDelivery, emptyParticipant, provinces, registrationTotal, shirtSizes, validateDelivery, validateParticipant, type DeliveryDraft, type DemoReceipt, type FieldErrors, type ParticipantDraft } from "@/lib/registration";
import { addressDistricts, addressSubdistricts, updateAddress } from "@/lib/thai-address";
import { createOrder, sendSlip, PublicApiError } from "@/lib/api";
import { gsap, motionAllowed, smoothScrollTo, useGSAP } from "@/lib/motion";
type Option = string | {
    value: string;
    label: string;
};
type FieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
};
type InputHints = {
    autoComplete?: string;
    inputMode?: "text" | "numeric" | "tel" | "email";
};
function FormInput({ id, label, value, onChange, required, error, type = "text", maxLength = 100, autoComplete, inputMode }: FieldProps & InputHints & {
    type?: HTMLInputTypeAttribute;
    maxLength?: number;
}) {
    return <div className="reg-field"><label htmlFor={id}><UiText>{label}</UiText><UiText>{required && <span className="reg-required"> *</span>}</UiText></label><input id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} maxLength={maxLength} autoComplete={autoComplete ?? "off"} inputMode={inputMode} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}/><UiText>{error && <p className="reg-field-error" id={`${id}-error`}><UiText>{error}</UiText></p>}</UiText></div>;
}
function FormSelect({ id, label, value, onChange, required, error, options, invalid = false, describedBy, autoComplete, disabled = false }: FieldProps & {
    options: Option[];
    disabled?: boolean;
    invalid?: boolean;
    describedBy?: string;
    autoComplete?: string;
}) {
    const placeholder = id === "birthDay" ? "วัน" : id === "birthMonth" ? "เดือน" : id === "birthYear" ? "ปี (พ.ศ.)" : `เลือก${label}`;
    return <div className="reg-field"><label htmlFor={id}><UiText>{label}</UiText><UiText>{required && <span className="reg-required"> *</span>}</UiText></label><select disabled={disabled} id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoComplete={autoComplete ?? "off"} aria-invalid={!!error || invalid} aria-describedby={error ? `${id}-error` : describedBy}><option value=""><UiText>{placeholder}</UiText></option><UiText>{options.map((option) => { const { value: optionValue, label: optionLabel } = typeof option === "string" ? { value: option, label: option } : option; return <option value={optionValue} key={optionValue}><UiText>{optionLabel}</UiText></option>; })}</UiText></select><UiText>{error && <p className="reg-field-error" id={`${id}-error`}><UiText>{error}</UiText></p>}</UiText></div>;
}
const steps = ["ข้อมูลผู้สมัคร", "ข้อมูลที่อยู่", "ชำระเงิน", "เสร็จสมบูรณ์"];
const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
type TextField = Exclude<keyof ParticipantDraft, "declineIdentity">;
export function RegistrationForm({ event, currentYear }: {
    event: RunningEvent;
    currentYear: number;
}) {
    const { language } = useUiTranslation();
    const [step, setStep] = useState(1);
    const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
    const [draft, setDraft] = useState<ParticipantDraft>(emptyParticipant);
    const [editing, setEditing] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(true);
    const [delivery, setDelivery] = useState<DeliveryDraft>(emptyDelivery);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [receipt, setReceipt] = useState<DemoReceipt | null>(null);
    const [receiptSaved, setReceiptSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
    const [slipSent, setSlipSent] = useState(false);
    const [slipNotice, setSlipNotice] = useState("");
    const [copyMessage, setCopyMessage] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const [undo, setUndo] = useState<{
        person: ParticipantDraft;
        index: number;
    } | null>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const listHeadingRef = useRef<HTMLHeadingElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const completedRef = useRef(false);
    const motionScope = useRef<HTMLDivElement>(null);
    const totals = registrationTotal(event, participants, delivery.method);
    const hasDraft = JSON.stringify(draft) !== JSON.stringify(emptyParticipant());
    const unsaved = step < 4 && (participants.length > 0 || hasDraft || Boolean(undo));
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add(motionAllowed, () => {
            gsap.fromTo(".reg-content", { opacity: 0.45 }, {
                opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "opacity",
            });
            gsap.fromTo(".reg-progress .is-current .reg-step-number", { scale: 0.9 }, {
                scale: 1, duration: 0.35, ease: "power2.out", clearProps: "transform",
            });
        }, motionScope);
        return () => media.revert();
    }, { scope: motionScope, dependencies: [step], revertOnUpdate: true });
    const reportErrors = (next: FieldErrors, message = "") => {
        setErrors(next);
        setGeneralError(message);
        if (Object.keys(next).length || message)
            requestAnimationFrame(() => errorRef.current?.focus());
    };
    const goTo = (next: number) => {
        setErrors({});
        setGeneralError("");
        setStep(next);
        requestAnimationFrame(() => { if (headingRef.current) {
            headingRef.current.focus({ preventScroll: true });
            smoothScrollTo(headingRef.current);
        } });
    };
    const changeDraft = (key: TextField, value: string) => {
        setDraft((current) => ({ ...current, [key]: value }));
        const errorKey = key.startsWith("birth") ? "birthDate" : key;
        setErrors((current) => { const next = { ...current }; delete next[errorKey]; return next; });
    };
    // Participant fields may describe someone else, so no autocomplete tokens are set here.
    const input = (key: TextField, label: string, required = false, type: HTMLInputTypeAttribute = "text", maxLength = 100, inputMode?: InputHints["inputMode"]) => <FormInput id={key} label={label} value={draft[key] ?? ""} onChange={(value) => changeDraft(key, value)} required={required} error={errors[key]} type={type} maxLength={maxLength} inputMode={inputMode}/>;
    const select = (key: TextField, label: string, options: Option[], required = false) => <FormSelect id={key} label={label} value={draft[key] ?? ""} onChange={(value) => changeDraft(key, value)} required={required} error={errors[key]} options={options}/>;
    const changeDelivery = (key: keyof DeliveryDraft, value: string) => {
        setDelivery((current) => updateAddress(current, key, value));
        setErrors((current) => { const next = { ...current }; delete next[key]; if (key === "province") { delete next.district; delete next.subdistrict; delete next.postalCode; } if (key === "district") { delete next.subdistrict; delete next.postalCode; } if (key === "subdistrict") delete next.postalCode; return next; });
    };
    const deliveryInput = (key: Exclude<keyof DeliveryDraft, "method">, label: string, required = false, type: HTMLInputTypeAttribute = "text", maxLength = 150, hints: InputHints = {}) => <FormInput id={`delivery-${key}`} label={label} value={delivery[key]} onChange={(value) => changeDelivery(key, value)} required={required} error={errors[key]} type={type} maxLength={maxLength} {...hints}/>;
    const commitDraft = (): ParticipantDraft[] | null => {
        const nextErrors = validateParticipant(draft, event);
        if (Object.keys(nextErrors).length) {
            reportErrors(nextErrors);
            return null;
        }
        if (editing === null && participants.length >= MAX_PARTICIPANTS) {
            reportErrors({}, "เพิ่มผู้สมัครได้สูงสุด 20 คนต่อใบสมัคร");
            return null;
        }
        const { otherNationality, ...participantDraft } = draft;
        const cleanDraft = { ...participantDraft, nationality: draft.nationality === "อื่น ๆ" ? otherNationality!.trim() : draft.nationality, firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), identity: draft.declineIdentity ? "" : draft.identity.trim() };
        const next = editing === null ? [...participants, cleanDraft] : participants.map((person, index) => index === editing ? cleanDraft : person);
        setParticipants(next);
        setDraft(emptyParticipant());
        setEditing(null);
        setFormOpen(false);
        setErrors({});
        setGeneralError("");
        setUndo(null);
        setAnnouncement(editing === null ? `เพิ่มผู้สมัครคนที่ ${next.length} แล้ว` : `บันทึกการแก้ไขผู้สมัครคนที่ ${editing + 1} แล้ว`);
        requestAnimationFrame(() => listHeadingRef.current?.focus());
        return next;
    };
    const removeParticipant = (index: number) => {
        setUndo({ person: participants[index], index });
        setParticipants((current) => current.filter((_, item) => item !== index));
        setAnnouncement(`ลบผู้สมัครคนที่ ${index + 1} แล้ว สามารถเลิกทำได้`);
        if (participants.length === 1) {
            setFormOpen(true);
            setDraft(emptyParticipant());
            requestAnimationFrame(() => document.getElementById("firstName")?.focus());
        }
        else
            requestAnimationFrame(() => listHeadingRef.current?.focus());
    };
    const undoRemove = () => {
        if (!undo || participants.length >= MAX_PARTICIPANTS) {
            setUndo(null);
            return;
        }
        const { person, index } = undo;
        setParticipants((current) => { const copy = [...current]; copy.splice(Math.min(index, copy.length), 0, person); return copy; });
        setFormOpen(false);
        setDraft(emptyParticipant());
        setEditing(null);
        setErrors({});
        setGeneralError("");
        setUndo(null);
        setAnnouncement(`เลิกลบผู้สมัครคนที่ ${index + 1} แล้ว`);
        requestAnimationFrame(() => listHeadingRef.current?.focus());
    };
    const nextParticipants = () => {
        let next = participants;
        if (formOpen && (hasDraft || editing !== null || !participants.length)) {
            const committed = commitDraft();
            if (!committed)
                return;
            next = committed;
        }
        if (!next.length) {
            reportErrors({}, "กรุณาเพิ่มผู้สมัครอย่างน้อย 1 คน");
            return;
        }
        setFormOpen(false);
        setDelivery((current) => ({ ...current, contact: current.contact || `${next[0].firstName} ${next[0].lastName}`, phone: current.phone || next[0].phone, email: current.email || next[0].email }));
        goTo(2);
    };
    const nextDelivery = () => {
        const nextErrors = validateDelivery(delivery);
        if (Object.keys(nextErrors).length) {
            reportErrors(nextErrors);
            return;
        }
        goTo(3);
    };
    const complete = async () => {
        if (completedRef.current || submitting)
            return;
        if (event.status !== "open" || !participants.length || participants.length > MAX_PARTICIPANTS || participants.some((person) => Object.keys(validateParticipant(person, event)).length) || Object.keys(validateDelivery(delivery)).length) {
            reportErrors({}, "ข้อมูลยังไม่ครบ กรุณาย้อนกลับไปตรวจสอบผู้สมัครและที่อยู่");
            return;
        }
        if (!acknowledged) {
            reportErrors({}, "กรุณายืนยันว่าตรวจสอบข้อมูลถูกต้องแล้ว");
            return;
        }
        completedRef.current = true;
        setSubmitting(true);
        try {
            const created = await createOrder(event.slug, participants, delivery);
            setReceipt({ reference: created.orderNo, eventSlug: event.slug, races: participants.map(({ race, size }) => ({ race, size })), amount: created.amount.total, delivery: delivery.method, createdAt: new Date().toISOString(), status: created.status });
            if (paymentSlip) {
                if (created.amount.total !== totals.total) {
                    setSlipNotice("สร้างใบสมัครแล้ว แต่ยอดค่าสมัครเปลี่ยนแปลง กรุณาตรวจสอบยอดและส่งสลิปผ่านหน้าค้นหาใบสมัคร");
                } else {
                    try {
                        await sendSlip(created.orderNo, delivery.phone.replace(/[\s()-]/g, "").slice(-4), paymentSlip);
                        setSlipSent(true);
                    } catch {
                        setSlipNotice("สร้างใบสมัครแล้ว แต่ส่งสลิปไม่สำเร็จ กรุณาเก็บเลขใบสมัครและส่งสลิปอีกครั้งผ่านหน้าค้นหาใบสมัคร");
                    }
                }
                setPaymentSlip(null);
            }
            setExpiresAt(created.expiresAt);
            setReceiptSaved(true);
            goTo(4);
            setParticipants([]);
            setDraft(emptyParticipant());
            setDelivery(emptyDelivery());
            setUndo(null);
        }
        catch (error) {
            completedRef.current = false;
            const message = error instanceof Error ? error.message : "สมัครไม่สำเร็จ กรุณาลองใหม่";
            const fields = error instanceof PublicApiError ? Object.values(error.fields).join(" · ") : "";
            reportErrors({}, [message, fields].filter(Boolean).join(" · "));
        }
        finally {
            setSubmitting(false);
        }
    };
    const errorSummary = (prefix = "") => (Object.keys(errors).length > 0 || generalError) && <div className="reg-errors" role="alert" ref={errorRef} tabIndex={-1}><strong><UiText>{generalError || "กรุณาตรวจสอบข้อมูลต่อไปนี้"}</UiText></strong><UiText>{Object.keys(errors).length > 0 && <ul><UiText>{Object.entries(errors).map(([key, value]) => <li key={key}><a href={`#${prefix}${key === "birthDate" ? "birthDay" : key}`} onClick={(e) => { e.preventDefault(); document.getElementById(`${prefix}${key === "birthDate" ? "birthDay" : key}`)?.focus(); }}><UiText>{value}</UiText></a></li>)}</UiText></ul>}</UiText></div>;
    const participantList = (editable = true) => <div className="reg-person-list"><UiText>{participants.map((person, index) => <article className="reg-person" key={index}><span className="reg-person-number"><UiText>{index + 1}</UiText></span><div className="reg-person-info"><h3>{person.firstName} {person.lastName}</h3><p>{person.race} <span><UiText>{"เสื้อ "}</UiText>{person.size}</span>{person.team && <span>{person.team}</span>}</p></div><strong><UiText>{"฿ "}</UiText><UiText>{price(event.races.find((race) => race.name === person.race)?.price || 0)}</UiText></strong><UiText>{editable && <div className="reg-person-actions"><UiButton type="button" aria-label={`แก้ไขผู้สมัครคนที่ ${index + 1}`} onClick={() => { setDraft(["ไทย", "ลาว", "เมียนมา", "กัมพูชา", "เวียดนาม", "มาเลเซีย", "สิงคโปร์", "จีน", "ญี่ปุ่น"].includes(person.nationality) ? { ...person } : { ...person, nationality: "อื่น ๆ", otherNationality: person.nationality }); setEditing(index); setFormOpen(true); setErrors({}); setGeneralError(""); requestAnimationFrame(() => document.getElementById("firstName")?.focus()); }}><Pencil size={17}/></UiButton><UiButton type="button" aria-label={`ลบผู้สมัครคนที่ ${index + 1}`} onClick={() => removeParticipant(index)}><Trash2 size={17}/></UiButton></div>}</UiText></article>)}</UiText></div>;
    const totalSummary = () => <dl className="reg-totals"><div><dt><UiText>{"ค่าสมัคร "}</UiText><UiText>{participants.length}</UiText><UiText>{"คน "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(totals.subtotal)}</UiText></dd></div><div><dt><UiText>{"ค่าจัดส่ง "}</UiText>{delivery.method === "pickup" ? " (รับด้วยตนเอง)" : " (ต่อใบสมัคร)"}</dt><dd><UiText>{totals.shipping ? `฿${price(totals.shipping)}` : "ไม่มีค่าใช้จ่าย"}</UiText></dd></div><div className="reg-grand-total"><dt><UiText>{"ยอดรวม "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(totals.total)}</UiText></dd></div></dl>;
    return <div className="container registration-page">
    <RegistrationLeaveGuard dirty={unsaved} submitting={submitting}/>
    <Link className="back-link" href={`/events/${event.slug}`}><ArrowLeft size={17}/><UiText>{"กลับไปดูรายละเอียดงาน "}</UiText></Link>
    <div className="reg-event-heading"><div><h1>{displayName(event, language)}</h1><p><CalendarDays size={16}/><UiText>{formatDate(event.date, true)}</UiText><span /><MapPin size={16}/><UiText>{event.province}</UiText></p></div></div>
    <div className="reg-demo-notice"><ClipboardList size={19}/><p><UiText>{"ยืนยันแล้วจะสร้างใบสมัครในระบบ โปรดตรวจสอบข้อมูลก่อนส่ง ข้อมูลที่ยังไม่ส่งจะหายเมื่อรีโหลด "}</UiText></p></div>
    <div className="reg-card" ref={motionScope}><div className="reg-progress"><p className="reg-progress-title"><UiText>{"ขั้นตอนการสมัคร "}</UiText></p><UiOl aria-label="ขั้นตอนการสมัคร"><UiText>{steps.map((label, index) => <li key={label} className={step > index + 1 ? "is-complete" : step === index + 1 ? "is-current" : ""} aria-current={step === index + 1 ? "step" : undefined}><span className="reg-step-number"><UiText>{step > index + 1 ? <Check size={18}/> : index + 1}</UiText></span><span><UiText>{label}</UiText><UiText>{step > index + 1 && <span className="sr-only"><UiText>{"(เสร็จแล้ว) "}</UiText></span>}</UiText></span></li>)}</UiText></UiOl></div>
    <div className="reg-content"><p className="sr-only" role="status" aria-live="polite"><UiText>{announcement}</UiText></p><div className="reg-section-heading"><div><span><UiText>{"ขั้นตอนที่ "}</UiText><UiText>{step}</UiText><UiText>{"จาก 4 "}</UiText></span><h2 ref={headingRef} tabIndex={-1}><UiText>{step === 1 ? "กรอกข้อมูลผู้เข้าร่วมกิจกรรม" : step === 2 ? "ข้อมูลติดต่อและการรับอุปกรณ์" : step === 3 ? "ตรวจสอบใบสมัครและการชำระเงิน" : "สร้างใบสมัครแล้ว"}</UiText></h2></div><UiText>{(step === 2 || (step === 1 && formOpen)) && <p><span className="reg-required">*</span><UiText>{"จำเป็นต้องกรอก "}</UiText></p>}</UiText></div>

    <UiText>{step === 1 && <>
      <UiText>{undo && <div className="reg-toast"><span><UiText>{"ลบผู้สมัครคนที่ "}</UiText><UiText>{undo.index + 1}</UiText><UiText>{"แล้ว \u00B7 ย้อนคืนได้ก่อนบันทึกหรือลบผู้สมัครรายการถัดไป "}</UiText></span><button type="button" className="reg-toast-action" onClick={undoRemove}><UiText>{"เลิกทำ "}</UiText></button></div>}</UiText>
      <UiText>{!formOpen && <><div className="reg-list-heading"><h3 ref={listHeadingRef} tabIndex={-1}><UiText>{"ผู้สมัครทั้งหมด "}</UiText><span><UiText>{participants.length}</UiText> / <UiText>{MAX_PARTICIPANTS}</UiText><UiText>{"คน "}</UiText></span></h3><button className="button button-outline" type="button" disabled={participants.length >= MAX_PARTICIPANTS} onClick={() => { setDraft(emptyParticipant()); setEditing(null); setFormOpen(true); setErrors({}); setGeneralError(""); requestAnimationFrame(() => document.getElementById("firstName")?.focus()); }}><Plus size={17}/><UiText>{"เพิ่มผู้สมัคร "}</UiText></button></div><UiText>{participantList()}</UiText></>}</UiText>
      <UiText>{formOpen && <form className="reg-participant-form" noValidate onSubmit={(e) => { e.preventDefault(); commitDraft(); }}>
        <UiText>{errorSummary()}</UiText>
        <div className="reg-form-heading"><UserRound size={20}/><h3><UiText>{editing === null ? `ข้อมูลผู้สมัครคนที่ ${participants.length + 1}` : `แก้ไขผู้สมัครคนที่ ${editing + 1}`}</UiText></h3></div>
        <fieldset className="reg-group"><legend><UiText>{"ข้อมูลส่วนตัว "}</UiText></legend>
          <div className="reg-fields">
          <UiText>{input("firstName", "ชื่อ (ไม่ต้องมีคำนำหน้า)", true)}</UiText>
          <UiText>{input("lastName", "นามสกุล", true)}</UiText>
          <UiText>{select("gender", "เพศ", ["ชาย", "หญิง", "ไม่ระบุ"], true)}</UiText>
          <fieldset className="reg-birth"><legend><UiText>{"วันเกิด "}</UiText><span className="reg-required">*</span></legend><div>
            <FormSelect id="birthDay" label="วันเกิด" value={draft.birthDay} onChange={(value) => changeDraft("birthDay", value)} required options={Array.from({ length: 31 }, (_, i) => String(i + 1))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined}/>
            <FormSelect id="birthMonth" label="เดือนเกิด" value={draft.birthMonth} onChange={(value) => changeDraft("birthMonth", value)} required options={months.map((label, i) => ({ value: String(i + 1), label }))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined}/>
            <FormSelect id="birthYear" label="ปีเกิด" value={draft.birthYear} onChange={(value) => changeDraft("birthYear", value)} required options={Array.from({ length: currentYear - 1899 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i + (language === "en" ? 0 : 543)) }))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined}/>
          </div><UiText>{errors.birthDate && <p className="reg-field-error" id="birthDate-error"><UiText>{errors.birthDate}</UiText></p>}</UiText></fieldset>
          <UiText>{select("nationality", "สัญชาติ", ["ไทย", "ลาว", "เมียนมา", "กัมพูชา", "เวียดนาม", "มาเลเซีย", "สิงคโปร์", "จีน", "ญี่ปุ่น", "อื่น ๆ"], true)}</UiText>
          {draft.nationality === "อื่น ๆ" && input("otherNationality", "ระบุสัญชาติ", true, "text", 100)}
          <div className="reg-field"><label htmlFor="identity"><UiText>{"เลขบัตรประชาชน / พาสปอร์ต (ถ้ามี) "}</UiText></label><input id="identity" autoComplete="off" value={draft.identity} maxLength={30} disabled={draft.declineIdentity} onChange={(e) => changeDraft("identity", e.target.value)} aria-invalid={!!errors.identity} aria-describedby={errors.identity ? "identity-error" : undefined}/><label className="reg-checkbox reg-identity-optout"><input type="checkbox" checked={draft.declineIdentity} onChange={(e) => { setDraft((current) => ({ ...current, declineIdentity: e.target.checked, identity: "", identityReference: e.target.checked ? (current.identityReference || `RUN-${Array.from(crypto.getRandomValues(new Uint8Array(10)), byte => "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"[byte & 31]).join("")}`) : "" })); setErrors((current) => { const next = { ...current }; delete next.identity; return next; }); }}/><UiText>{"ไม่ประสงค์ให้ข้อมูล "}</UiText></label>{draft.declineIdentity && draft.identityReference && <div className="identity-reference-preview" role="status"><label htmlFor="runner-reference"><UiText>รหัสอ้างอิงผู้สมัคร</UiText></label><input id="runner-reference" value={draft.identityReference} readOnly aria-describedby="runner-reference-hint"/><p className="identity-reference-hint" id="runner-reference-hint"><UiText>รหัสนี้จะบันทึกเมื่อยืนยันสมัคร ไม่ใช่เลขบัตรประชาชนหรือพาสปอร์ต</UiText></p></div>}<UiText>{errors.identity && <p className="reg-field-error" id="identity-error"><UiText>{errors.identity}</UiText></p>}</UiText></div>
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend><UiText>{"การแข่งขัน "}</UiText></legend>
          <div className="reg-fields">
          <UiText>{select("race", "ประเภทการแข่งขัน", event.races.map((race) => ({ value: race.name, label: `${race.name} — ฿${price(race.price)} · ${raceAvailability(race)}` })), true)}</UiText>
          <UiText>{select("size", "ขนาดเสื้อ", shirtSizes, true)}</UiText>
          <UiText>{select("applicantType", "สถานะผู้สมัคร", ["บุคคลทั่วไป", "นักเรียน / นักศึกษา", "ผู้สูงอายุ"], true)}</UiText>
          <UiText>{input("team", "ชื่อทีม / ชมรม (ถ้ามี)")}</UiText>
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend><UiText>{"การติดต่อ "}</UiText></legend>
          <div className="reg-fields">
          <UiText>{input("email", "อีเมล (ถ้ามี)", false, "email", 100, "email")}</UiText>
          <UiText>{input("phone", "หมายเลขโทรศัพท์", true, "tel", 24, "tel")}</UiText>
          <UiText>{select("province", "จังหวัดที่อยู่ปัจจุบัน", provinces, true)}</UiText>
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend><UiText>{"สุขภาพและฉุกเฉิน "}</UiText><span className="reg-group-hint"><UiText>{"(ไม่บังคับ) "}</UiText></span></legend>
          <div className="reg-fields">
          <UiText>{input("medical", "ปัญหาสุขภาพ / แพ้อาหาร / แพ้ยา (ถ้ามี)", false, "text", 250)}</UiText>
          <UiText>{select("blood", "หมู่เลือด (ถ้ามี)", ["A", "B", "AB", "O", "ไม่ทราบ"])}</UiText>
          <UiText>{input("emergencyName", "ชื่อผู้ติดต่อกรณีฉุกเฉิน (ถ้ามี)")}</UiText>
          <UiText>{input("emergencyRelation", "ความสัมพันธ์ (ถ้ามี)")}</UiText>
          <UiText>{input("emergencyPhone", "โทรศัพท์ผู้ติดต่อฉุกเฉิน (ถ้ามี)", false, "tel", 24, "tel")}</UiText>
          </div>
        </fieldset>
        <div className="reg-add-actions"><span><UiText>{"เพิ่มผู้สมัครได้สูงสุด "}</UiText><UiText>{MAX_PARTICIPANTS}</UiText><UiText>{"คนต่อใบสมัคร "}</UiText></span><div><button className="button button-primary" type="submit"><UiText>{editing === null ? <Plus size={18}/> : <Check size={18}/>}</UiText><UiText>{editing === null ? "เพิ่มข้อมูลผู้สมัคร" : "บันทึกการแก้ไข"}</UiText></button><button className="button button-outline" type="button" onClick={() => { setDraft(emptyParticipant()); setEditing(null); setFormOpen(participants.length === 0); setErrors({}); setGeneralError(""); }}><UiText>{participants.length ? "ยกเลิก" : "ล้างข้อมูล"}</UiText></button></div></div>
      </form>}</UiText>
      <UiText>{!formOpen && errorSummary()}</UiText>
      <div className="reg-step-footer"><div><span><UiText>{"ผู้สมัครที่เพิ่มแล้ว "}</UiText><UiText>{participants.length}</UiText><UiText>{"คน "}</UiText></span><strong><UiText>{"ค่าสมัคร ฿ "}</UiText><UiText>{price(totals.subtotal)}</UiText></strong></div><button className="button button-primary" type="button" onClick={nextParticipants}><UiText>{formOpen && (hasDraft || editing !== null) ? "บันทึกผู้สมัครแล้วไปต่อ" : "ถัดไป: ข้อมูลที่อยู่"}</UiText> <ArrowRight size={17}/></button></div>
    </>}</UiText>

    <UiText>{step === 2 && <form noValidate onSubmit={(e) => { e.preventDefault(); nextDelivery(); }}>
      <UiText>{errorSummary("delivery-")}</UiText>
      <div className="reg-form-heading"><UserRound size={20}/><h3><UiText>{"ผู้ติดต่อหลักของใบสมัคร "}</UiText></h3></div>
      <div className="reg-fields"><UiText>{deliveryInput("contact", "ชื่อผู้ติดต่อ / ผู้รับอุปกรณ์", true, "text", 150, { autoComplete: "name" })}</UiText><UiText>{deliveryInput("phone", "หมายเลขโทรศัพท์", true, "tel", 24, { autoComplete: "tel", inputMode: "tel" })}</UiText><UiText>{deliveryInput("email", "อีเมล (ถ้ามี)", false, "email", 150, { autoComplete: "email", inputMode: "email" })}</UiText></div>
      <fieldset className="reg-delivery-method"><legend><UiText>{"วิธีรับอุปกรณ์ "}</UiText></legend><div><label className={delivery.method === "pickup" ? "selected" : ""}><input type="radio" name="deliveryMethod" value="pickup" checked={delivery.method === "pickup"} onChange={() => { setDelivery((current) => ({ ...current, method: "pickup" })); setErrors({}); }}/><Shirt size={23}/><span><strong><UiText>{"รับด้วยตนเอง "}</UiText></strong><small><UiText>{"ตามวันและสถานที่ที่ผู้จัดประกาศ "}</UiText></small></span><b><UiText>{"ฟรี "}</UiText></b></label><label className={delivery.method === "shipping" ? "selected" : ""}><input type="radio" name="deliveryMethod" value="shipping" checked={delivery.method === "shipping"} onChange={() => setDelivery((current) => ({ ...current, method: "shipping" }))}/><Truck size={23}/><span><strong><UiText>{"จัดส่งทางไปรษณีย์ "}</UiText></strong><small><UiText>{"จัดส่งรวมตามที่อยู่ในใบสมัคร "}</UiText></small></span><b><UiText>{"฿ "}</UiText><UiText>{SHIPPING_FEE}</UiText></b></label></div></fieldset>
      {delivery.method === "shipping" && <div className="reg-shipping-fields"><h3><UiText>{"ที่อยู่สำหรับจัดส่ง "}</UiText></h3><div className="reg-fields"><div className="reg-field-wide"><UiText>{deliveryInput("street", "บ้านเลขที่ / หมู่บ้าน / ถนน", true, "text", 250, { autoComplete: "street-address" })}</UiText></div><FormSelect id="delivery-province" label="จังหวัด" value={delivery.province} onChange={(value) => changeDelivery("province", value)} required options={provinces} error={errors.province} autoComplete="address-level1"/><FormSelect id="delivery-district" label="อำเภอ / เขต" value={delivery.district} onChange={value => changeDelivery("district", value)} required disabled={!delivery.province} options={addressDistricts(delivery.province)} error={errors.district} autoComplete="address-level2"/><FormSelect id="delivery-subdistrict" label="ตำบล / แขวง" value={delivery.subdistrict} onChange={value => changeDelivery("subdistrict", value)} required disabled={!delivery.district} options={addressSubdistricts(delivery.province, delivery.district).map(([name]) => name)} error={errors.subdistrict} autoComplete="address-level3"/><UiText>{deliveryInput("postalCode", "รหัสไปรษณีย์", true, "text", 5, { autoComplete: "postal-code", inputMode: "numeric" })}</UiText></div></div>}
      <div className="reg-address-total"><UiText>{totalSummary()}</UiText></div>
      <div className="reg-step-footer"><button className="button button-outline" type="button" onClick={() => goTo(1)}><ArrowLeft size={17}/><UiText>{"ย้อนกลับ "}</UiText></button><button className="button button-primary" type="submit"><UiText>{"ถัดไป: ตรวจสอบและชำระเงิน "}</UiText><ArrowRight size={17}/></button></div>
    </form>}</UiText>

    <UiText>{step === 3 && <>
      <UiText>{errorSummary()}</UiText>
      <div className="reg-review-grid"><div><div className="reg-list-heading"><h3><UiText>{"รายชื่อผู้สมัคร "}</UiText><span><UiText>{participants.length}</UiText><UiText>{"คน "}</UiText></span></h3><button className="text-link" type="button" disabled={submitting} onClick={() => goTo(1)}><Pencil size={15}/><UiText>{"แก้ไข "}</UiText></button></div><UiText>{participantList(false)}</UiText><section className="reg-contact-review"><div className="reg-list-heading"><h3><UiText>{"ข้อมูลติดต่อและรับอุปกรณ์ "}</UiText></h3><button className="text-link" type="button" disabled={submitting} onClick={() => goTo(2)}><Pencil size={15}/><UiText>{"แก้ไข "}</UiText></button></div><p>{delivery.contact} · {delivery.phone}</p><p>{delivery.method === "shipping" ? `${delivery.street} ${delivery.subdistrict} ${delivery.district} ${delivery.province} ${delivery.postalCode}` : "รับอุปกรณ์ด้วยตนเองตามประกาศของผู้จัด"}</p></section></div>
      <aside className="reg-payment"><h3><UiText>{"สรุปยอดค่าสมัคร "}</UiText></h3><UiText>{totalSummary()}</UiText><BankPaymentDetails/><section className="reg-payment-slip"><h3><UiText>แนบหลักฐานการชำระเงิน (ถ้ามี)</UiText></h3><p><UiText>สลิปจะถูกส่งเมื่อกดยืนยันใบสมัคร หรือส่งภายหลังผ่านหน้าค้นหาใบสมัครได้</UiText></p><label className="slip-file-field"><span><Upload size={24} aria-hidden="true"/><strong>{paymentSlip ? paymentSlip.name : <UiText>เลือกภาพสลิป</UiText>}</strong><small><UiText>JPG, PNG หรือ WEBP · ไม่เกิน 5 MB</UiText></small></span><input type="file" aria-label="เลือกภาพสลิป" accept="image/jpeg,image/png,image/webp" disabled={submitting} onChange={e => {
          const file = e.target.files?.[0] ?? null;
          if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024)) {
            setPaymentSlip(null); e.target.value = ""; setSlipNotice("เลือกไฟล์ JPG, PNG หรือ WEBP ที่ไม่ว่างเปล่า ขนาดไม่เกิน 5 MB"); return;
          }
          setPaymentSlip(file); setSlipNotice("");
        }}/></label>{slipNotice && <p role="alert"><UiText>{slipNotice}</UiText></p>}</section><label className="reg-checkbox"><input type="checkbox" checked={acknowledged} onChange={(e) => { setAcknowledged(e.target.checked); setGeneralError(""); }}/><span><UiText>{"ฉันตรวจสอบข้อมูลผู้สมัครและข้อมูลติดต่อถูกต้องแล้ว "}</UiText></span></label><button className="button button-primary" type="button" disabled={submitting} onClick={complete}><UiText>{submitting ? "กำลังสร้างใบสมัครและส่งข้อมูล…" : paymentSlip ? "ยืนยันใบสมัครและส่งสลิป" : "ยืนยันใบสมัคร"}</UiText> <ChevronRight size={18}/></button></aside></div>
      <div className="reg-step-footer"><button className="button button-outline" type="button" disabled={submitting} onClick={() => goTo(2)}><ArrowLeft size={17}/><UiText>{"ย้อนกลับ "}</UiText></button><span><UiText>{"ยังไม่ส่งใบสมัครจนกว่าจะกดยืนยัน "}</UiText></span></div>
    </>}</UiText>

    <UiText>{step === 4 && receipt && <section className="reg-complete"><span className="reg-success-icon"><CheckCircle2 size={48}/></span><h3><UiText>{"พร้อมแล้วสำหรับก้าวต่อไป "}</UiText></h3><p><UiText>{"สร้างใบสมัครสำหรับ "}</UiText>{displayName(event, language)}<UiText>{"แล้ว "}</UiText><br /><UiText>{"โปรดเก็บเลขใบสมัครไว้เพื่อติดตามสถานะและส่งสลิป "}</UiText></p><div className="reg-receipt"><span><UiText>{"เลขที่ใบสมัคร "}</UiText></span><strong><UiText>{receipt.reference}</UiText></strong><button type="button" className="text-link" onClick={async () => { try {
        await navigator.clipboard.writeText(receipt.reference);
        setCopyMessage("คัดลอกเลขที่ใบสมัครแล้ว");
    }
    catch {
        setCopyMessage("คัดลอกไม่ได้ กรุณาเลือกและคัดลอกเลขด้านบน");
    } }}><Copy size={16}/><UiText>{"คัดลอกเลขใบสมัคร "}</UiText></button><p role="status"><UiText>{copyMessage}</UiText></p><dl><div><dt><UiText>{"จำนวนผู้สมัคร "}</UiText></dt><dd><UiText>{receipt.races.length}</UiText><UiText>{"คน "}</UiText></dd></div><div><dt><UiText>{"ยอดรวม "}</UiText></dt><dd><UiText>{"฿ "}</UiText><UiText>{price(receipt.amount)}</UiText></dd></div><div><dt><UiText>{"สถานะ "}</UiText></dt><dd><UiText>{slipSent ? "ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ" : "รอชำระเงิน"}</UiText></dd></div></dl></div>{slipNotice && <p role="alert"><UiText>{slipNotice}</UiText></p>}{!slipSent && <BankPaymentDetails/>}<div className="reg-complete-actions"><UiText>{receiptSaved && <Link className="button button-primary" href={`/find-order?reference=${encodeURIComponent(receipt.reference)}`}><UiText>{"ดูใบสมัครและส่งสลิป "}</UiText><ChevronRight size={17}/></Link>}</UiText><Link className="button button-outline" href={`/events/${event.slug}`}><UiText>{"กลับไปหน้ากิจกรรม "}</UiText></Link></div><p className="reg-complete-note"><UiText>{expiresAt && `กำหนดชำระ: ${new Date(expiresAt).toLocaleString(language === "en" ? "en-GB" : "th-TH", { timeZone: "Asia/Bangkok" })} · `}</UiText><UiText>{"ค้นหาด้วยเลขใบสมัครและเบอร์โทรผู้ติดต่อ 4 ตัวท้าย "}</UiText></p></section>}</UiText>

    </div></div>
  </div>;
}
