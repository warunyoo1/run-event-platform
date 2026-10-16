import Link from "next/link";
import { ArrowUpRight, Bookmark, CalendarDays, Search } from "lucide-react";

export const metadata = { title: "เกี่ยวกับเรา" };

export default function AboutPage() {
  return <div className="container about-page"><div className="guide-page-intro"><h1>เกี่ยวกับ Run Event</h1><p>รวมข้อมูลงานวิ่ง ให้คุณค้นพบเส้นทางครั้งต่อไป</p></div>
    <section className="about-intro"><h2>ทุกเส้นทาง เริ่มต้นที่นี่</h2><p>Run Event เป็นพื้นที่สำหรับค้นหาและอ่านข้อมูลงานวิ่ง เลือกกิจกรรมตามสถานที่ วันจัดงาน และระยะทางที่เหมาะกับคุณ พร้อมรายละเอียดที่ช่วยให้วางแผนก่อนออกวิ่งได้สะดวกขึ้น</p></section>
    <div className="about-features">{[{ Icon: Search, title: "หางานที่ตรงใจ", text: "ค้นหาตามชื่อ สถานที่ จังหวัด เดือน ประเภท และระยะวิ่ง" }, { Icon: CalendarDays, title: "วางแผนก่อนวันงาน", text: "อ่านรายละเอียด ค่าสมัคร และกำหนดการ พร้อมเพิ่มวันงานลงปฏิทิน" }, { Icon: Bookmark, title: "เก็บงานที่สนใจ", text: "บันทึกงานในเบราว์เซอร์เครื่องนี้ แล้วกลับมาอ่านได้ภายหลัง" }].map(({ Icon, title, text }) => <article key={title}><Icon size={26} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></article>)}</div>
    <div className="info-note about-demo"><strong>เว็บไซต์รุ่นสาธิต</strong><p>งานวิ่ง รูปประกอบ และค่าสมัครในเว็บไซต์นี้ใช้เพื่อสาธิต UI ปัจจุบันยังไม่เชื่อมข้อมูลกับระบบแอดมิน และยังไม่มีการรับสมัครหรือชำระเงินผ่านเว็บไซต์</p></div>
    <div className="guide-cta"><Link href="/events" className="button button-primary">เลือกดูกิจกรรม <ArrowUpRight size={18} /></Link><Link href="/how-to-register" className="button button-outline">ขั้นตอนการสมัคร</Link></div>
  </div>;
}
