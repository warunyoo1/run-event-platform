import { Suspense } from "react";
import { EventCatalog } from "@/components/event-catalog";
export const metadata = { title: "งานวิ่งที่บันทึก" };
export default function SavedPage() { return <Suspense fallback={<p className="container loading">กำลังโหลดงานที่บันทึก…</p>}><EventCatalog savedOnly /></Suspense>; }
