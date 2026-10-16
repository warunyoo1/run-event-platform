import { notFound } from "next/navigation";
import { displayName, getEvent, events } from "@/lib/events";
import { EventDetail } from "@/components/event-detail";
export function generateStaticParams() { return events.map((event) => ({ slug: event.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const event = getEvent((await params).slug);
  return { title: (event ? displayName(event) : "") || "ไม่พบงานวิ่ง", description: event?.description };
}
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = getEvent((await params).slug);
  if (!event) notFound();
  return <EventDetail event={event} />;
}
