import type { RunningEvent } from "./events";

export const MAX_PARTICIPANTS = 20;
export const SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE || 50);
export const shirtSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
export const provinces = ["กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"];

export type ParticipantDraft = {
  firstName: string; lastName: string; gender: string;
  birthDay: string; birthMonth: string; birthYear: string;
  nationality: string; identity: string; declineIdentity: boolean; identityReference: string;
  email: string; phone: string; medical: string; blood: string;
  emergencyName: string; emergencyRelation: string; emergencyPhone: string;
  race: string; size: string; province: string; team: string; applicantType: string;
};
export const emptyParticipant = (): ParticipantDraft => ({
  firstName: "", lastName: "", gender: "", birthDay: "", birthMonth: "", birthYear: "",
  nationality: "ไทย", identity: "", declineIdentity: false, identityReference: "", email: "", phone: "",
  medical: "", blood: "", emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  race: "", size: "", province: "", team: "", applicantType: "บุคคลทั่วไป",
});
export type DeliveryDraft = {
  method: "pickup" | "shipping"; contact: string; phone: string; email: string;
  street: string; subdistrict: string; district: string; province: string; postalCode: string;
};
export const emptyDelivery = (): DeliveryDraft => ({ method: "pickup", contact: "", phone: "", email: "", street: "", subdistrict: "", district: "", province: "", postalCode: "" });
export type FieldErrors = Record<string, string>;
export const cleanPhone = (value: string) => value.replace(/[\s()-]/g, "");
const validPhone = (value: string) => /^(?:0\d{8,9}|\+\d{8,15})$/.test(cleanPhone(value));
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function validateParticipant(draft: ParticipantDraft, event: RunningEvent, today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.firstName.trim()) errors.firstName = "กรุณากรอกชื่อ";
  if (!draft.lastName.trim()) errors.lastName = "กรุณากรอกนามสกุล";
  if (!["ชาย", "หญิง", "ไม่ระบุ"].includes(draft.gender)) errors.gender = "กรุณาเลือกเพศ";
  const year = Number(draft.birthYear), month = Number(draft.birthMonth), day = Number(draft.birthDay);
  const birth = new Date(Date.UTC(year, month - 1, day));
  const dateString = `${draft.birthYear}-${draft.birthMonth.padStart(2, "0")}-${draft.birthDay.padStart(2, "0")}`;
  if (!year || !month || !day || year < 1900 || birth.getUTCFullYear() !== year || birth.getUTCMonth() !== month - 1 || birth.getUTCDate() !== day || dateString > today) errors.birthDate = "กรุณาเลือกวันเกิดที่ถูกต้องและไม่อยู่ในอนาคต";
  if (!draft.nationality) errors.nationality = "กรุณาเลือกสัญชาติ";
  if (!validPhone(draft.phone)) errors.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง เช่น 0812345678";
  if (draft.email.trim() && !validEmail(draft.email)) errors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
  if (draft.emergencyPhone.trim() && !validPhone(draft.emergencyPhone)) errors.emergencyPhone = "กรุณาตรวจสอบเบอร์ผู้ติดต่อฉุกเฉิน";
  if (!draft.declineIdentity && draft.identity.trim() && draft.nationality === "ไทย" && !/^\d{13}$/.test(draft.identity.trim())) errors.identity = "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก หรือเลือกไม่ประสงค์ให้ข้อมูล";
  if (!event.races.some((race) => race.name === draft.race)) errors.race = "กรุณาเลือกระยะวิ่งของงานนี้";
  if (!shirtSizes.includes(draft.size)) errors.size = "กรุณาเลือกขนาดเสื้อ";
  if (!provinces.includes(draft.province)) errors.province = "กรุณาเลือกจังหวัดที่อยู่ปัจจุบัน";
  if (!["บุคคลทั่วไป", "นักเรียน / นักศึกษา", "ผู้สูงอายุ"].includes(draft.applicantType)) errors.applicantType = "กรุณาเลือกสถานะผู้สมัคร";
  return errors;
}

export function validateDelivery(draft: DeliveryDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.contact.trim()) errors.contact = "กรุณากรอกชื่อผู้ติดต่อ";
  if (!validPhone(draft.phone)) errors.phone = "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง";
  if (draft.email.trim() && !validEmail(draft.email)) errors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
  if (draft.method === "shipping") {
    for (const [key, label] of [["street", "ที่อยู่"], ["subdistrict", "ตำบล / แขวง"], ["district", "อำเภอ / เขต"]] as const) {
      if (!draft[key].trim()) errors[key] = `กรุณากรอก${label}`;
    }
    if (!provinces.includes(draft.province)) errors.province = "กรุณาเลือกจังหวัด";
    if (!/^\d{5}$/.test(draft.postalCode.trim())) errors.postalCode = "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
  }
  return errors;
}

export function registrationTotal(event: RunningEvent, participants: Pick<ParticipantDraft, "race">[], method: DeliveryDraft["method"]) {
  const subtotal = participants.reduce((sum, participant) => sum + (event.races.find((race) => race.name === participant.race)?.price || 0), 0);
  const shipping = method === "shipping" ? SHIPPING_FEE : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

// Session receipts deliberately exclude names, identity, phone, DOB, health,
// emergency contacts and address. Full form values only live in React memory.
export type DemoReceipt = {
  reference: string; eventSlug: string; races: { race: string; size: string }[];
  amount: number; delivery: DeliveryDraft["method"]; createdAt: string; status: "pending";
};
export function createDemoReceipt(event: RunningEvent, participants: ParticipantDraft[], delivery: DeliveryDraft): DemoReceipt {
  return {
    reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    eventSlug: event.slug, races: participants.map(({ race, size }) => ({ race, size })),
    amount: registrationTotal(event, participants, delivery.method).total,
    delivery: delivery.method, createdAt: new Date().toISOString(), status: "pending",
  };
}
const receiptKey = "run-event:demo-receipts:v1";
export function readDemoReceipts(): DemoReceipt[] {
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(receiptKey) || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is DemoReceipt => item && typeof item.reference === "string" && typeof item.eventSlug === "string" && typeof item.amount === "number" && Number.isFinite(item.amount) && item.amount >= 0 && item.status === "pending" && ["pickup", "shipping"].includes(item.delivery) && typeof item.createdAt === "string" && Array.isArray(item.races) && item.races.length > 0 && item.races.length <= MAX_PARTICIPANTS && item.races.every((race: { race?: unknown; size?: unknown }) => race && typeof race.race === "string" && typeof race.size === "string"));
  } catch { return []; }
}
export function saveDemoReceipt(receipt: DemoReceipt) {
  try { sessionStorage.setItem(receiptKey, JSON.stringify([receipt, ...readDemoReceipts()].slice(0, 50))); return true; }
  catch { return false; }
}
