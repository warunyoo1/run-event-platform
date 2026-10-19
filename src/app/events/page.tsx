import { UiText } from '@/i18n/client';
import { Suspense } from "react";
import { EventCatalog } from "@/components/event-catalog";
export const metadata = { title: "ค้นหางานวิ่ง" };
export default function EventsPage() { return <Suspense fallback={<p className="container loading"><UiText>{"กำลังโหลดงานวิ่ง\u2026 "}</UiText></p>}><EventCatalog /></Suspense>; }
