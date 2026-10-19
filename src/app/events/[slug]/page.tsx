import { findEvent } from "@/lib/api";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { displayName,  } from "@/lib/events";
import { EventDetail } from "@/components/event-detail";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const event = await findEvent((await params).slug);
  return { title: (event ? displayName(event) : "") || "ไม่พบงานวิ่ง", description: event?.description };
}
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await findEvent((await params).slug);
  if (!event) notFound();
  return <EventDetail event={event} />;
}
