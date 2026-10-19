// The base event and race fields match running-event-admin. This repository
// deliberately contains public event content only; no participant/order data.
export type Race = { name: string; price: number; quota: number; unlimitedQuota?: boolean; reserved?: number; start: string; remaining?: number; benefits?: string[]; extraDetails?: string; prizes?: { rank: number; amount: number; trophy?: boolean }[] };
export type RunningEvent = {
  images?: { id: string; kind: string; alt: string; url: string; sortOrder: number }[];
  id: string;
  name: string;
  slug: string;
  date: string;
  venue: string;
  startPoint?: string;
  shirtPickupPoint?: string;
  contactPhones?: string[];
  websiteUrl?: string;
  locationUrl?: string;
  shirtPickupUrl?: string;
  province: string;
  status: "open" | "closed" | "upcoming";
  category: "road" | "trail" | "fun";
  theme: "orange" | "green" | "blue" | "pink" | "navy" | "sand";
  races: Race[];
  subtitle: string;
  description: string;
  registrationStarts?: string;
  registrationEnds: string;
  organizer: string;
  refundPolicy?: string;
};

export const statusLabels = { open: "เปิดรับสมัคร", closed: "ปิดรับสมัครแล้ว", upcoming: "เร็ว ๆ นี้" };
export const themeLabels: Record<RunningEvent["theme"], string> = { orange: "ส้ม", green: "เขียว", blue: "ฟ้า", pink: "ชมพู", navy: "กรมท่า", sand: "ทราย" };
export const categoryLabels = { road: "วิ่งถนน", trail: "วิ่งเทรล", fun: "ฟันรัน" };
export const formatDate = (value: string, full = false) => new Intl.DateTimeFormat("th-TH", {
  day: "numeric", month: full ? "long" : "short", year: "numeric", timeZone: "Asia/Bangkok",
}).format(new Date(`${value}T12:00:00+07:00`));
// Thai UI shows Buddhist Era only: convert any Gregorian year inside an event name (e.g. "Run 2027" -> "Run 2570").
export const displayName = (event: Pick<RunningEvent, "name">, language = "th") => language === "en" ? event.name : event.name.replace(/\b(19|20)\d{2}\b/g, (year) => String(Number(year) + 543));
export const price = (value: number) => new Intl.NumberFormat("th-TH").format(value);

export type EventFilters = { query: string; province: string; month: string; distance: string; category: string; status: string };
export function filterEvents(source: RunningEvent[], filters: EventFilters) {
  const query = filters.query.trim().toLocaleLowerCase("th-TH");
  return source.filter((event) =>
    (!query || `${event.name} ${displayName(event)} ${event.venue} ${event.province}`.toLocaleLowerCase("th-TH").includes(query)) &&
    (!filters.province || event.province === filters.province) &&
    (!filters.month || event.date.startsWith(filters.month)) &&
    (!filters.distance || event.races.some((race) => race.name === filters.distance)) &&
    (!filters.category || event.category === filters.category) &&
    (!filters.status || event.status === filters.status)
  );
}

export function raceAvailability(race: Pick<Race, "unlimitedQuota" | "remaining" | "quota">): string {
  if (race.unlimitedQuota) return "ไม่จำกัดจำนวน";
  const remaining = Math.max(0, race.remaining ?? race.quota);
  return remaining === 0 ? "เต็มแล้ว" : `เหลือ ${price(remaining)} คน`;
}
