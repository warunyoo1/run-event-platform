"use client";

import { RegistrationLeaveGuard } from "./registration-leave-guard";
import Link from "next/link";
import { useEffect, useRef, useState, type HTMLInputTypeAttribute } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardList, Copy, CreditCard, MapPin, Pencil, Plus, Shirt, Trash2, Truck, UserRound } from "lucide-react";
import { displayName, formatDate, price, type RunningEvent } from "@/lib/events";
import { MAX_PARTICIPANTS, SHIPPING_FEE, emptyDelivery, emptyParticipant, provinces, registrationTotal, shirtSizes, validateDelivery, validateParticipant, type DeliveryDraft, type DemoReceipt, type FieldErrors, type ParticipantDraft } from "@/lib/registration";
import { createOrder, PublicApiError } from "@/lib/api";
import { gsap, motionAllowed, smoothScrollTo, useGSAP } from "@/lib/motion";

type Option = string | { value: string; label: string };
type FieldProps = { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean; error?: string };
type InputHints = { autoComplete?: string; inputMode?: "text" | "numeric" | "tel" | "email" };

function FormInput({ id, label, value, onChange, required, error, type = "text", maxLength = 100, autoComplete, inputMode }: FieldProps & InputHints & { type?: HTMLInputTypeAttribute; maxLength?: number }) {
  return <div className="reg-field"><label htmlFor={id}>{label}{required && <span className="reg-required"> *</span>}</label><input id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} maxLength={maxLength} autoComplete={autoComplete ?? "off"} inputMode={inputMode} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />{error && <p className="reg-field-error" id={`${id}-error`}>{error}</p>}</div>;
}

function FormSelect({ id, label, value, onChange, required, error, options, invalid = false, describedBy, autoComplete }: FieldProps & { options: Option[]; invalid?: boolean; describedBy?: string; autoComplete?: string }) {
  const placeholder = id === "birthDay" ? "วัน" : id === "birthMonth" ? "เดือน" : id === "birthYear" ? "ปี (พ.ศ.)" : `เลือก${label}`;
  return <div className="reg-field"><label htmlFor={id}>{label}{required && <span className="reg-required"> *</span>}</label><select id={id} name={id} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoComplete={autoComplete ?? "off"} aria-invalid={!!error || invalid} aria-describedby={error ? `${id}-error` : describedBy}><option value="">{placeholder}</option>{options.map((option) => { const { value: optionValue, label: optionLabel } = typeof option === "string" ? { value: option, label: option } : option; return <option value={optionValue} key={optionValue}>{optionLabel}</option>; })}</select>{error && <p className="reg-field-error" id={`${id}-error`}>{error}</p>}</div>;
}

const steps = ["ข้อมูลผู้สมัคร", "ข้อมูลที่อยู่", "ชำระเงิน", "เสร็จสมบูรณ์"];
const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
type TextField = Exclude<keyof ParticipantDraft, "declineIdentity">;

export function RegistrationForm({ event, currentYear }: { event: RunningEvent; currentYear: number }) {
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
  const [copyMessage, setCopyMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [undo, setUndo] = useState<{ person: ParticipantDraft; index: number } | null>(null);
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
    setErrors(next); setGeneralError(message);
    if (Object.keys(next).length || message) requestAnimationFrame(() => errorRef.current?.focus());
  };
  const goTo = (next: number) => {
    setErrors({}); setGeneralError(""); setStep(next);
    requestAnimationFrame(() => { if (headingRef.current) { headingRef.current.focus({ preventScroll: true }); smoothScrollTo(headingRef.current); } });
  };
  const changeDraft = (key: TextField, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    const errorKey = key.startsWith("birth") ? "birthDate" : key;
    setErrors((current) => { const next = { ...current }; delete next[errorKey]; return next; });
  };
  // Participant fields may describe someone else, so no autocomplete tokens are set here.
  const input = (key: TextField, label: string, required = false, type: HTMLInputTypeAttribute = "text", maxLength = 100, inputMode?: InputHints["inputMode"]) => <FormInput id={key} label={label} value={draft[key]} onChange={(value) => changeDraft(key, value)} required={required} error={errors[key]} type={type} maxLength={maxLength} inputMode={inputMode} />;
  const select = (key: TextField, label: string, options: Option[], required = false) => <FormSelect id={key} label={label} value={draft[key]} onChange={(value) => changeDraft(key, value)} required={required} error={errors[key]} options={options} />;
  const changeDelivery = (key: keyof DeliveryDraft, value: string) => {
    setDelivery((current) => ({ ...current, [key]: value }));
    setErrors((current) => { const next = { ...current }; delete next[key]; return next; });
  };
  const deliveryInput = (key: Exclude<keyof DeliveryDraft, "method">, label: string, required = false, type: HTMLInputTypeAttribute = "text", maxLength = 150, hints: InputHints = {}) => <FormInput id={`delivery-${key}`} label={label} value={delivery[key]} onChange={(value) => changeDelivery(key, value)} required={required} error={errors[key]} type={type} maxLength={maxLength} {...hints} />;

  const commitDraft = (): ParticipantDraft[] | null => {
    const nextErrors = validateParticipant(draft, event);
    if (Object.keys(nextErrors).length) { reportErrors(nextErrors); return null; }
    if (editing === null && participants.length >= MAX_PARTICIPANTS) { reportErrors({}, "เพิ่มผู้สมัครได้สูงสุด 20 คนต่อใบสมัคร"); return null; }
    const cleanDraft = { ...draft, firstName: draft.firstName.trim(), lastName: draft.lastName.trim(), identity: draft.declineIdentity ? "" : draft.identity.trim() };
    const next = editing === null ? [...participants, cleanDraft] : participants.map((person, index) => index === editing ? cleanDraft : person);
    setParticipants(next); setDraft(emptyParticipant()); setEditing(null); setFormOpen(false); setErrors({}); setGeneralError(""); setUndo(null);
    setAnnouncement(editing === null ? `เพิ่มผู้สมัครคนที่ ${next.length} แล้ว` : `บันทึกการแก้ไขผู้สมัครคนที่ ${editing + 1} แล้ว`);
    requestAnimationFrame(() => listHeadingRef.current?.focus());
    return next;
  };
  const removeParticipant = (index: number) => {
    setUndo({ person: participants[index], index });
    setParticipants((current) => current.filter((_, item) => item !== index));
    setAnnouncement(`ลบผู้สมัครคนที่ ${index + 1} แล้ว สามารถเลิกทำได้`);
    if (participants.length === 1) { setFormOpen(true); setDraft(emptyParticipant()); requestAnimationFrame(() => document.getElementById("firstName")?.focus()); }
    else requestAnimationFrame(() => listHeadingRef.current?.focus());
  };
  const undoRemove = () => {
    if (!undo || participants.length >= MAX_PARTICIPANTS) { setUndo(null); return; }
    const { person, index } = undo;
    setParticipants((current) => { const copy = [...current]; copy.splice(Math.min(index, copy.length), 0, person); return copy; });
    setFormOpen(false); setDraft(emptyParticipant()); setEditing(null); setErrors({}); setGeneralError(""); setUndo(null);
    setAnnouncement(`เลิกลบผู้สมัครคนที่ ${index + 1} แล้ว`);
    requestAnimationFrame(() => listHeadingRef.current?.focus());
  };
  const nextParticipants = () => {
    let next = participants;
    if (formOpen && (hasDraft || editing !== null || !participants.length)) {
      const committed = commitDraft(); if (!committed) return; next = committed;
    }
    if (!next.length) { reportErrors({}, "กรุณาเพิ่มผู้สมัครอย่างน้อย 1 คน"); return; }
    setFormOpen(false);
    setDelivery((current) => ({ ...current, contact: current.contact || `${next[0].firstName} ${next[0].lastName}`, phone: current.phone || next[0].phone, email: current.email || next[0].email }));
    goTo(2);
  };
  const nextDelivery = () => {
    const nextErrors = validateDelivery(delivery);
    if (Object.keys(nextErrors).length) { reportErrors(nextErrors); return; }
    goTo(3);
  };
  const complete = async () => {
    if (completedRef.current || submitting) return;
    if (event.status !== "open" || !participants.length || participants.length > MAX_PARTICIPANTS || participants.some((person) => Object.keys(validateParticipant(person, event)).length) || Object.keys(validateDelivery(delivery)).length) {
      reportErrors({}, "ข้อมูลยังไม่ครบ กรุณาย้อนกลับไปตรวจสอบผู้สมัครและที่อยู่"); return;
    }
    if (!acknowledged) { reportErrors({}, "กรุณายืนยันว่าตรวจสอบข้อมูลถูกต้องแล้ว"); return; }
    completedRef.current = true; setSubmitting(true);
    try {
      const created = await createOrder(event.slug, participants, delivery);
      setReceipt({ reference: created.orderNo, eventSlug: event.slug, races: participants.map(({ race, size }) => ({ race, size })), amount: created.amount.total, delivery: delivery.method, createdAt: new Date().toISOString(), status: created.status });
      setExpiresAt(created.expiresAt); setReceiptSaved(true); goTo(4);
      setParticipants([]); setDraft(emptyParticipant()); setDelivery(emptyDelivery()); setUndo(null);
    } catch (error) {
      completedRef.current = false;
      const message = error instanceof Error ? error.message : "สมัครไม่สำเร็จ กรุณาลองใหม่";
      const fields = error instanceof PublicApiError ? Object.values(error.fields).join(" · ") : "";
      reportErrors({}, [message, fields].filter(Boolean).join(" · "));
    } finally { setSubmitting(false); }
  };
  const errorSummary = (prefix = "") => (Object.keys(errors).length > 0 || generalError) && <div className="reg-errors" role="alert" ref={errorRef} tabIndex={-1}><strong>{generalError || "กรุณาตรวจสอบข้อมูลต่อไปนี้"}</strong>{Object.keys(errors).length > 0 && <ul>{Object.entries(errors).map(([key, value]) => <li key={key}><a href={`#${prefix}${key === "birthDate" ? "birthDay" : key}`} onClick={(e) => { e.preventDefault(); document.getElementById(`${prefix}${key === "birthDate" ? "birthDay" : key}`)?.focus(); }}>{value}</a></li>)}</ul>}</div>;
  const participantList = (editable = true) => <div className="reg-person-list">{participants.map((person, index) => <article className="reg-person" key={index}><span className="reg-person-number">{index + 1}</span><div className="reg-person-info"><h3>{person.firstName} {person.lastName}</h3><p>{person.race} <span>เสื้อ {person.size}</span>{person.team && <span>{person.team}</span>}</p></div><strong>฿{price(event.races.find((race) => race.name === person.race)?.price || 0)}</strong>{editable && <div className="reg-person-actions"><button type="button" aria-label={`แก้ไขผู้สมัครคนที่ ${index + 1}`} onClick={() => { setDraft({ ...person }); setEditing(index); setFormOpen(true); setErrors({}); setGeneralError(""); requestAnimationFrame(() => document.getElementById("firstName")?.focus()); }}><Pencil size={17} /></button><button type="button" aria-label={`ลบผู้สมัครคนที่ ${index + 1}`} onClick={() => removeParticipant(index)}><Trash2 size={17} /></button></div>}</article>)}</div>;
  const totalSummary = () => <dl className="reg-totals"><div><dt>ค่าสมัคร {participants.length} คน</dt><dd>฿{price(totals.subtotal)}</dd></div><div><dt>ค่าจัดส่ง{delivery.method === "pickup" ? " (รับด้วยตนเอง)" : " (ต่อใบสมัคร)"}</dt><dd>{totals.shipping ? `฿${price(totals.shipping)}` : "ไม่มีค่าใช้จ่าย"}</dd></div><div className="reg-grand-total"><dt>ยอดรวม</dt><dd>฿{price(totals.total)}</dd></div></dl>;

  return <div className="container registration-page">
    <RegistrationLeaveGuard dirty={unsaved} submitting={submitting} />
    <Link className="back-link" href={`/events/${event.slug}`}><ArrowLeft size={17} />กลับไปดูรายละเอียดงาน</Link>
    <div className="reg-event-heading"><div><h1>{displayName(event)}</h1><p><CalendarDays size={16} />{formatDate(event.date, true)}<span /><MapPin size={16} />{event.province}</p></div></div>
    <div className="reg-demo-notice"><ClipboardList size={19} /><p>ยืนยันแล้วจะสร้างใบสมัครในระบบ โปรดตรวจสอบข้อมูลก่อนส่ง ข้อมูลที่ยังไม่ส่งจะหายเมื่อรีโหลด</p></div>
    <div className="reg-card" ref={motionScope}><div className="reg-progress"><p className="reg-progress-title">ขั้นตอนการสมัคร</p><ol aria-label="ขั้นตอนการสมัคร">{steps.map((label, index) => <li key={label} className={step > index + 1 ? "is-complete" : step === index + 1 ? "is-current" : ""} aria-current={step === index + 1 ? "step" : undefined}><span className="reg-step-number">{step > index + 1 ? <Check size={18} /> : index + 1}</span><span>{label}{step > index + 1 && <span className="sr-only"> (เสร็จแล้ว)</span>}</span></li>)}</ol></div>
    <div className="reg-content"><p className="sr-only" role="status" aria-live="polite">{announcement}</p><div className="reg-section-heading"><div><span>ขั้นตอนที่ {step} จาก 4</span><h2 ref={headingRef} tabIndex={-1}>{step === 1 ? "กรอกข้อมูลผู้เข้าร่วมกิจกรรม" : step === 2 ? "ข้อมูลติดต่อและการรับอุปกรณ์" : step === 3 ? "ตรวจสอบใบสมัครและการชำระเงิน" : "สร้างใบสมัครแล้ว"}</h2></div>{(step === 2 || (step === 1 && formOpen)) && <p><span className="reg-required">*</span> จำเป็นต้องกรอก</p>}</div>

    {step === 1 && <>
      {undo && <div className="reg-toast"><span>ลบผู้สมัครคนที่ {undo.index + 1} แล้ว · ย้อนคืนได้ก่อนบันทึกหรือลบผู้สมัครรายการถัดไป</span><button type="button" className="reg-toast-action" onClick={undoRemove}>เลิกทำ</button></div>}
      {!formOpen && <><div className="reg-list-heading"><h3 ref={listHeadingRef} tabIndex={-1}>ผู้สมัครทั้งหมด <span>{participants.length} / {MAX_PARTICIPANTS} คน</span></h3><button className="button button-outline" type="button" disabled={participants.length >= MAX_PARTICIPANTS} onClick={() => { setDraft(emptyParticipant()); setEditing(null); setFormOpen(true); setErrors({}); setGeneralError(""); requestAnimationFrame(() => document.getElementById("firstName")?.focus()); }}><Plus size={17} />เพิ่มผู้สมัคร</button></div>{participantList()}</>}
      {formOpen && <form className="reg-participant-form" noValidate onSubmit={(e) => { e.preventDefault(); commitDraft(); }}>
        {errorSummary()}
        <div className="reg-form-heading"><UserRound size={20} /><h3>{editing === null ? `ข้อมูลผู้สมัครคนที่ ${participants.length + 1}` : `แก้ไขผู้สมัครคนที่ ${editing + 1}`}</h3></div>
        <fieldset className="reg-group"><legend>ข้อมูลส่วนตัว</legend>
          <div className="reg-fields">
          {input("firstName", "ชื่อ (ไม่ต้องมีคำนำหน้า)", true)}
          {input("lastName", "นามสกุล", true)}
          {select("gender", "เพศ", ["ชาย", "หญิง", "ไม่ระบุ"], true)}
          <fieldset className="reg-birth"><legend>วันเกิด <span className="reg-required">*</span></legend><div>
            <FormSelect id="birthDay" label="วันเกิด" value={draft.birthDay} onChange={(value) => changeDraft("birthDay", value)} required options={Array.from({ length: 31 }, (_, i) => String(i + 1))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined} />
            <FormSelect id="birthMonth" label="เดือนเกิด" value={draft.birthMonth} onChange={(value) => changeDraft("birthMonth", value)} required options={months.map((label, i) => ({ value: String(i + 1), label }))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined} />
            <FormSelect id="birthYear" label="ปีเกิด" value={draft.birthYear} onChange={(value) => changeDraft("birthYear", value)} required options={Array.from({ length: currentYear - 1899 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i + 543) }))} invalid={!!errors.birthDate} describedBy={errors.birthDate ? "birthDate-error" : undefined} />
          </div>{errors.birthDate && <p className="reg-field-error" id="birthDate-error">{errors.birthDate}</p>}</fieldset>
          {select("nationality", "สัญชาติ", ["ไทย", "ลาว", "เมียนมา", "กัมพูชา", "เวียดนาม", "มาเลเซีย", "สิงคโปร์", "จีน", "ญี่ปุ่น", "อื่น ๆ"], true)}
          <div className="reg-field"><label htmlFor="identity">เลขบัตรประชาชน / พาสปอร์ต (ถ้ามี)</label><input id="identity" autoComplete="off" value={draft.identity} maxLength={30} disabled={draft.declineIdentity} onChange={(e) => changeDraft("identity", e.target.value)} aria-invalid={!!errors.identity} aria-describedby={errors.identity ? "identity-error" : undefined} /><label className="reg-checkbox reg-identity-optout"><input type="checkbox" checked={draft.declineIdentity} onChange={(e) => { setDraft((current) => ({ ...current, declineIdentity: e.target.checked, identity: "" })); setErrors((current) => { const next = { ...current }; delete next.identity; return next; }); }} />ไม่ประสงค์ให้ข้อมูล</label>{errors.identity && <p className="reg-field-error" id="identity-error">{errors.identity}</p>}</div>
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend>การแข่งขัน</legend>
          <div className="reg-fields">
          {select("race", "ประเภทการแข่งขัน", event.races.map((race) => ({ value: race.name, label: `${race.name} — ฿${price(race.price)}` })), true)}
          {select("size", "ขนาดเสื้อ", shirtSizes, true)}
          {select("applicantType", "สถานะผู้สมัคร", ["บุคคลทั่วไป", "นักเรียน / นักศึกษา", "ผู้สูงอายุ"], true)}
          {input("team", "ชื่อทีม / ชมรม (ถ้ามี)")}
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend>การติดต่อ</legend>
          <div className="reg-fields">
          {input("email", "อีเมล (ถ้ามี)", false, "email", 100, "email")}
          {input("phone", "หมายเลขโทรศัพท์", true, "tel", 24, "tel")}
          {select("province", "จังหวัดที่อยู่ปัจจุบัน", provinces, true)}
          </div>
        </fieldset>
        <fieldset className="reg-group"><legend>สุขภาพและฉุกเฉิน <span className="reg-group-hint">(ไม่บังคับ)</span></legend>
          <div className="reg-fields">
          {input("medical", "ปัญหาสุขภาพ / แพ้อาหาร / แพ้ยา (ถ้ามี)", false, "text", 250)}
          {select("blood", "หมู่เลือด (ถ้ามี)", ["A", "B", "AB", "O", "ไม่ทราบ"])}
          {input("emergencyName", "ชื่อผู้ติดต่อกรณีฉุกเฉิน (ถ้ามี)")}
          {input("emergencyRelation", "ความสัมพันธ์ (ถ้ามี)")}
          {input("emergencyPhone", "โทรศัพท์ผู้ติดต่อฉุกเฉิน (ถ้ามี)", false, "tel", 24, "tel")}
          </div>
        </fieldset>
        <div className="reg-add-actions"><span>เพิ่มผู้สมัครได้สูงสุด {MAX_PARTICIPANTS} คนต่อใบสมัคร</span><div><button className="button button-primary" type="submit">{editing === null ? <Plus size={18} /> : <Check size={18} />}{editing === null ? "เพิ่มข้อมูลผู้สมัคร" : "บันทึกการแก้ไข"}</button><button className="button button-outline" type="button" onClick={() => { setDraft(emptyParticipant()); setEditing(null); setFormOpen(participants.length === 0); setErrors({}); setGeneralError(""); }}>{participants.length ? "ยกเลิก" : "ล้างข้อมูล"}</button></div></div>
      </form>}
      {!formOpen && errorSummary()}
      <div className="reg-step-footer"><div><span>ผู้สมัครที่เพิ่มแล้ว {participants.length} คน</span><strong>ค่าสมัคร ฿{price(totals.subtotal)}</strong></div><button className="button button-primary" type="button" onClick={nextParticipants}>{formOpen && (hasDraft || editing !== null) ? "บันทึกผู้สมัครแล้วไปต่อ" : "ถัดไป: ข้อมูลที่อยู่"} <ArrowRight size={17} /></button></div>
    </>}

    {step === 2 && <form noValidate onSubmit={(e) => { e.preventDefault(); nextDelivery(); }}>
      {errorSummary("delivery-")}
      <div className="reg-form-heading"><UserRound size={20} /><h3>ผู้ติดต่อหลักของใบสมัคร</h3></div>
      <div className="reg-fields">{deliveryInput("contact", "ชื่อผู้ติดต่อ / ผู้รับอุปกรณ์", true, "text", 150, { autoComplete: "name" })}{deliveryInput("phone", "หมายเลขโทรศัพท์", true, "tel", 24, { autoComplete: "tel", inputMode: "tel" })}{deliveryInput("email", "อีเมล (ถ้ามี)", false, "email", 150, { autoComplete: "email", inputMode: "email" })}</div>
      <fieldset className="reg-delivery-method"><legend>วิธีรับอุปกรณ์</legend><div><label className={delivery.method === "pickup" ? "selected" : ""}><input type="radio" name="deliveryMethod" value="pickup" checked={delivery.method === "pickup"} onChange={() => { setDelivery((current) => ({ ...current, method: "pickup" })); setErrors({}); }} /><Shirt size={23} /><span><strong>รับด้วยตนเอง</strong><small>ตามวันและสถานที่ที่ผู้จัดประกาศ</small></span><b>ฟรี</b></label><label className={delivery.method === "shipping" ? "selected" : ""}><input type="radio" name="deliveryMethod" value="shipping" checked={delivery.method === "shipping"} onChange={() => setDelivery((current) => ({ ...current, method: "shipping" }))} /><Truck size={23} /><span><strong>จัดส่งทางไปรษณีย์</strong><small>จัดส่งรวมตามที่อยู่ในใบสมัคร</small></span><b>฿{SHIPPING_FEE}</b></label></div></fieldset>
      {delivery.method === "shipping" && <div className="reg-shipping-fields"><h3>ที่อยู่สำหรับจัดส่ง</h3><div className="reg-fields"><div className="reg-field-wide">{deliveryInput("street", "บ้านเลขที่ / หมู่บ้าน / ถนน", true, "text", 250, { autoComplete: "street-address" })}</div>{deliveryInput("subdistrict", "ตำบล / แขวง", true, "text", 150, { autoComplete: "address-level3" })}{deliveryInput("district", "อำเภอ / เขต", true, "text", 150, { autoComplete: "address-level2" })}<FormSelect id="delivery-province" label="จังหวัด" value={delivery.province} onChange={(value) => changeDelivery("province", value)} required options={provinces} error={errors.province} autoComplete="address-level1" />{deliveryInput("postalCode", "รหัสไปรษณีย์", true, "text", 5, { autoComplete: "postal-code", inputMode: "numeric" })}</div></div>}
      <div className="reg-address-total">{totalSummary()}</div>
      <div className="reg-step-footer"><button className="button button-outline" type="button" onClick={() => goTo(1)}><ArrowLeft size={17} />ย้อนกลับ</button><button className="button button-primary" type="submit">ถัดไป: ตรวจสอบและชำระเงิน <ArrowRight size={17} /></button></div>
    </form>}

    {step === 3 && <>
      {errorSummary()}
      <div className="reg-review-grid"><div><div className="reg-list-heading"><h3>รายชื่อผู้สมัคร <span>{participants.length} คน</span></h3><button className="text-link" type="button" disabled={submitting} onClick={() => goTo(1)}><Pencil size={15} />แก้ไข</button></div>{participantList(false)}<section className="reg-contact-review"><div className="reg-list-heading"><h3>ข้อมูลติดต่อและรับอุปกรณ์</h3><button className="text-link" type="button" disabled={submitting} onClick={() => goTo(2)}><Pencil size={15} />แก้ไข</button></div><p>{delivery.contact} · {delivery.phone}</p><p>{delivery.method === "shipping" ? `${delivery.street} ${delivery.subdistrict} ${delivery.district} ${delivery.province} ${delivery.postalCode}` : "รับอุปกรณ์ด้วยตนเองตามประกาศของผู้จัด"}</p></section></div>
      <aside className="reg-payment"><h3>สรุปยอดค่าสมัคร</h3>{totalSummary()}<div className="reg-payment-demo"><CreditCard size={25} /><strong>ตรวจสอบยอดก่อนสมัคร</strong><p>ยอดนี้เป็นประมาณการ ยอดสุดท้ายจะยึดตามระบบหลังยืนยัน ขณะนี้ยังไม่แสดง QR หรือบัญชีรับเงิน กรุณาติดตามคำแนะนำจากผู้จัด</p></div><label className="reg-checkbox"><input type="checkbox" checked={acknowledged} onChange={(e) => { setAcknowledged(e.target.checked); setGeneralError(""); }} /><span>ฉันตรวจสอบข้อมูลผู้สมัครและข้อมูลติดต่อถูกต้องแล้ว</span></label><button className="button button-primary" type="button" disabled={submitting} onClick={complete}>{submitting ? "กำลังสร้างใบสมัคร…" : "ยืนยันใบสมัคร"} <ChevronRight size={18} /></button></aside></div>
      <div className="reg-step-footer"><button className="button button-outline" type="button" disabled={submitting} onClick={() => goTo(2)}><ArrowLeft size={17} />ย้อนกลับ</button><span>ยังไม่ส่งใบสมัครจนกว่าจะกดยืนยัน</span></div>
    </>}

    {step === 4 && receipt && <section className="reg-complete"><span className="reg-success-icon"><CheckCircle2 size={48} /></span><h3>พร้อมแล้วสำหรับก้าวต่อไป</h3><p>สร้างใบสมัครสำหรับ {displayName(event)} แล้ว<br />โปรดเก็บเลขใบสมัครไว้เพื่อติดตามสถานะและส่งสลิป</p><div className="reg-receipt"><span>เลขที่ใบสมัคร</span><strong>{receipt.reference}</strong><button type="button" className="text-link" onClick={async () => { try { await navigator.clipboard.writeText(receipt.reference); setCopyMessage("คัดลอกเลขที่ใบสมัครแล้ว"); } catch { setCopyMessage("คัดลอกไม่ได้ กรุณาเลือกและคัดลอกเลขด้านบน"); } }}><Copy size={16} />คัดลอกเลขใบสมัคร</button><p role="status">{copyMessage}</p><dl><div><dt>จำนวนผู้สมัคร</dt><dd>{receipt.races.length} คน</dd></div><div><dt>ยอดรวม</dt><dd>฿{price(receipt.amount)}</dd></div><div><dt>สถานะ</dt><dd>รอชำระเงิน</dd></div></dl></div><div className="reg-complete-actions">{receiptSaved && <Link className="button button-primary" href={`/find-order?reference=${encodeURIComponent(receipt.reference)}`}>ดูใบสมัครและส่งสลิป <ChevronRight size={17} /></Link>}<Link className="button button-outline" href={`/events/${event.slug}`}>กลับไปหน้ากิจกรรม</Link></div><p className="reg-complete-note">{expiresAt && `กำหนดชำระ: ${new Date(expiresAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} · `}ค้นหาด้วยเลขใบสมัครและเบอร์โทรผู้ติดต่อ 4 ตัวท้าย</p></section>}

    </div></div>
  </div>;
}
