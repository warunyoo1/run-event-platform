import { UiText } from '@/i18n/client';
import { findEvent } from "@/lib/api";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { displayName, statusLabels } from "@/lib/events";
import { RegistrationForm } from "@/components/registration-form";
import "@/app/registration.css";
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const event = await findEvent((await params).slug);
    return { title: event ? `สมัคร ${displayName(event)}` : "ไม่พบกิจกรรม" };
}
export default async function RegisterPage({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const event = await findEvent((await params).slug);
    if (!event)
        notFound();
    if (event.status !== "open")
        return <div className="container empty-state not-found"><CalendarClock size={36}/><h1><UiText>{statusLabels[event.status]}</UiText></h1><p>{displayName(event)} <UiText>{event.status === "closed" ? "ปิดรับสมัครแล้ว" : "ยังไม่เปิดรับสมัคร กรุณาติดตามประกาศจากผู้จัด"}</UiText></p><Link className="button button-primary" href={`/events/${event.slug}`}><UiText>{"กลับไปดูรายละเอียดงาน "}</UiText></Link></div>;
    return <RegistrationForm key={event.id} event={event} currentYear={new Date().getFullYear()}/>;
}
