import type { RunningEvent } from "./events";
import type { ParticipantDraft, DeliveryDraft } from "./registration";

export class PublicApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;
  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) { super(message); this.status = status; this.code = code; this.fields = fields; }
}
export function apiUrl(path: string) {
  const base = typeof window === "undefined" ? (process.env.API_PROXY_TARGET || "http://localhost:4000").replace(/\/+$/, "") : "";
  return `${base}/api/v1/public${path}`;
}
export async function publicRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await fetch(apiUrl(path), { ...options, cache: "no-store", signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) }); }
  catch { throw new PublicApiError(0, "NETWORK_ERROR", "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่ หากยืนยันสมัครไปแล้ว ให้ค้นหาออเดอร์ก่อนสมัครซ้ำ"); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new PublicApiError(response.status, body?.error?.code ?? "HTTP_ERROR", body?.error?.message ?? (response.status === 429 ? "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" : response.status === 413 ? "ไฟล์ใหญ่เกินกำหนด กรุณาลดขนาดไฟล์" : "ระบบขัดข้อง กรุณาลองใหม่"), body?.error?.fields ?? {});
  if (!body || !("data" in body)) throw new PublicApiError(0, "BAD_RESPONSE", "ระบบตอบกลับไม่สมบูรณ์ กรุณาลองใหม่");
  return body.data as T;
}
type ApiEvent = Omit<RunningEvent, "races"> & { races: { id: string; name: string; price: number; quota: number; unlimitedQuota?: boolean; reserved?: number; remaining: number; start: string | null }[] };
export const normalizeEvent = (event: ApiEvent): RunningEvent => ({ ...event, province: event.province ?? "", subtitle: event.subtitle ?? "", description: event.description ?? "", registrationEnds: event.registrationEnds ?? "", organizer: event.organizer ?? "", races: event.races.map((race) => ({ ...race, start: race.start ?? "" })) });
export async function listEvents(signal?: AbortSignal) { return (await publicRequest<ApiEvent[]>("/events", { signal })).map(normalizeEvent); }
export async function findEvent(slug: string) {
  try { return normalizeEvent(await publicRequest<ApiEvent>(`/events/${encodeURIComponent(slug)}`)); }
  catch (error) { if (error instanceof PublicApiError && error.status === 404) return undefined; throw error; }
}
export type CreatedOrder = { orderNo: string; status: "pending"; amount: { subtotal: number; shipping: number; total: number }; expiresAt: string };
export type PublicOrder = Omit<CreatedOrder, "status" | "expiresAt"> & {
  status: "pending" | "slip_uploaded" | "paid" | "rejected" | "expired" | "cancelled";
  event: { slug: string; name: string; date: string; venue: string } | null;
  races: { race: string; size: string; identityReference?: string }[]; delivery: "pickup" | "shipping"; createdAt: string;
  expiresAt?: string; rejectionReason?: string; canUploadSlip: boolean;
};
export const createOrder = (slug: string, participants: ParticipantDraft[], delivery: DeliveryDraft) => publicRequest<CreatedOrder>(`/events/${encodeURIComponent(slug)}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ participants, delivery }) });
export const findOrder = (orderNo: string, phoneLast4: string) => publicRequest<PublicOrder>(`/orders/${encodeURIComponent(orderNo)}?${new URLSearchParams({ phoneLast4 })}`);
export function sendSlip(orderNo: string, phoneLast4: string, file: File) {
  const body = new FormData(); body.set("phoneLast4", phoneLast4); body.set("slip", file);
  return publicRequest<unknown>(`/orders/${encodeURIComponent(orderNo)}/slip`, { method: "POST", body });
}
