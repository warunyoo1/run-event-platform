// The base event and race fields match running-event-admin. This repository
// deliberately contains public event content only; no participant/order data.
export type Race = { name: string; price: number; quota: number; start: string; remaining?: number };
export type RunningEvent = {
  images?: { id: string; kind: string; alt: string; url: string; sortOrder: number }[];
  id: string;
  name: string;
  slug: string;
  date: string;
  venue: string;
  province: string;
  status: "open" | "closed" | "upcoming";
  category: "road" | "trail" | "fun";
  theme: "orange" | "green" | "blue" | "pink" | "navy" | "sand";
  races: Race[];
  subtitle: string;
  description: string;
  registrationEnds: string;
  organizer: string;
};

export const statusLabels = { open: "เปิดรับสมัคร", closed: "ปิดรับสมัครแล้ว", upcoming: "เร็ว ๆ นี้" };
export const categoryLabels = { road: "วิ่งถนน", trail: "วิ่งเทรล", fun: "ฟันรัน" };
export const formatDate = (value: string, full = false) => new Intl.DateTimeFormat("th-TH", {
  day: "numeric", month: full ? "long" : "short", year: "numeric", timeZone: "Asia/Bangkok",
}).format(new Date(`${value}T12:00:00+07:00`));
// Thai UI shows Buddhist Era only: convert any Gregorian year inside an event name (e.g. "Run 2027" -> "Run 2570").
export const displayName = (event: Pick<RunningEvent, "name">) => event.name.replace(/\b(19|20)\d{2}\b/g, (year) => String(Number(year) + 543));
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
