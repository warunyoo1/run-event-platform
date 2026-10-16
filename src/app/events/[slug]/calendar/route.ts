import { displayName, getEvent } from "@/lib/events";
const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const event = getEvent((await params).slug);
  if (!event) return new Response("Event not found", { status: 404 });
  // Use an all-day entry; individual race start times remain in the description.
  const start = event.date.replaceAll("-", "");
  const endDate = new Date(`${event.date}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replaceAll("-", "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Run Event//Public Events//TH", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${event.slug}@run-event.example`, "DTSTAMP:20261015T000000Z", `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${escape(displayName(event))}`, `LOCATION:${escape(event.venue)}`, `DESCRIPTION:${escape(`ข้อมูลตัวอย่าง — ${event.races.map((race) => `${race.name}: ${race.start} น.`).join(", ")}`)}`, "END:VEVENT", "END:VCALENDAR"];
  // RFC 5545 folds lines at 75 octets, without splitting a UTF-8 character.
  const fold = (line: string) => { let result = ""; let size = 0; for (const char of line) { const bytes = Buffer.byteLength(char, "utf8"); if (size + bytes > 75) { result += "\r\n "; size = 1; } result += char; size += bytes; } return result; };
  return new Response(lines.map(fold).join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${event.slug}.ics"` } });
}
