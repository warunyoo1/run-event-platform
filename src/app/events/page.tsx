import { Suspense } from "react";
import { EventCatalog } from "@/components/event-catalog";
export const metadata = { title: "ค้นหางานวิ่ง" };
export default function EventsPage() { return <Suspense fallback={<p className="container loading">กำลังโหลดงานวิ่ง…</p>}><EventCatalog /></Suspense>; }
