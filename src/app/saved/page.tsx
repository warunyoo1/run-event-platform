import { UiText } from '@/i18n/client';
import { Suspense } from "react";
import { EventCatalog } from "@/components/event-catalog";
export const metadata = { title: "งานวิ่งที่บันทึก" };
export default function SavedPage() { return <Suspense fallback={<p className="container loading"><UiText>{"กำลังโหลดงานที่บันทึก\u2026 "}</UiText></p>}><EventCatalog savedOnly/></Suspense>; }
