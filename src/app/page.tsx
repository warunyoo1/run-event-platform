import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, MapPin, Route } from "lucide-react";
import { Hero } from "@/components/hero";
import { EventCatalog } from "@/components/event-catalog";

export default function HomePage() {
  return <><Hero /><div className="container quick-guide"><span><MapPin size={19} />ค้นหางานวิ่งทั่วไทย</span><span><Route size={19} />เลือกระยะในแบบของคุณ</span><span><Bookmark size={18} />บันทึกงานที่สนใจ</span></div><Suspense fallback={<p className="container loading">กำลังโหลดงานวิ่ง…</p>}><EventCatalog home /></Suspense><section className="container runner-guide"><div className="guide-mark"><Route size={40} /></div><div><h2>งานวิ่งแรกของคุณ เริ่มได้แบบสบายใจ</h2><p>เตรียมตัวอย่างไร เลือกระยะไหนดี? อ่านคำแนะนำก่อนออกสตาร์ต</p></div><Link className="button button-outline" href="/how-it-works">อ่านคู่มือนักวิ่ง <ArrowUpRight size={18} /></Link></section></>;
}
