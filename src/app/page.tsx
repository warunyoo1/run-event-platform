import { UiText } from '@/i18n/client';
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Route } from "lucide-react";
import { Hero } from "@/components/hero";
import { EventCatalog } from "@/components/event-catalog";
export default function HomePage() {
    return <><Hero /><Suspense fallback={<p className="container loading"><UiText>{"กำลังโหลดงานวิ่ง\u2026 "}</UiText></p>}><EventCatalog home/></Suspense><section className="container runner-guide"><div className="guide-mark"><Route size={40}/></div><div><h2><UiText>{"งานวิ่งแรกของคุณ เริ่มได้แบบสบายใจ "}</UiText></h2><p><UiText>{"เตรียมตัวอย่างไร เลือกระยะไหนดี? อ่านคำแนะนำก่อนออกสตาร์ต "}</UiText></p></div><Link className="button button-outline" href="/how-it-works"><UiText>{"อ่านคู่มือนักวิ่ง "}</UiText><ArrowUpRight size={18}/></Link></section></>;
}
