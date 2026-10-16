import Link from "next/link";
import { ArrowUpRight, ClipboardList, CreditCard, FileCheck2, Search } from "lucide-react";

export const metadata = { title: "ขั้นตอนการสมัคร" };

const steps = [
  { Icon: Search, title: "เลือกงานและระยะวิ่ง", text: "ค้นหากิจกรรมที่สนใจ อ่านวันจัดงาน สถานที่ เงื่อนไข และค่าสมัคร แล้วเลือกระยะที่เหมาะกับคุณ" },
  { Icon: ClipboardList, title: "กรอกข้อมูลผู้สมัคร", text: "คลิกสมัครเข้าร่วมกิจกรรม กรอกข้อมูล เลือกระยะและขนาดเสื้อ เพิ่มผู้สมัครได้สูงสุด 20 คน แล้วเลือกวิธีรับอุปกรณ์" },
  { Icon: CreditCard, title: "ตรวจสอบและชำระเงิน", text: "ตรวจสอบรายชื่อ ยอดรวม และค่าจัดส่ง รุ่นทดลองยังไม่มีการรับเงินจริง ให้ยืนยันใบสมัครตัวอย่างเพื่อดูขั้นตอนถัดไป" },
  { Icon: FileCheck2, title: "ตรวจสอบใบสมัคร", text: "เก็บเลขที่ใบสมัครไว้สำหรับตรวจสอบสถานะ ติดตามผลการชำระเงิน และเตรียมรับหมายเลขวิ่งตามประกาศผู้จัด" },
];

export default function RegistrationGuidePage() {
  return <div className="container guide-page">
    <div className="guide-page-intro"><h1>ขั้นตอนการสมัคร</h1><p>จากการเลือกงานที่ใช่ ไปจนถึงการตรวจสอบใบสมัคร</p></div>
    <div className="info-note registration-notice">ทดลองกรอกใบสมัครได้จากหน้ากิจกรรมที่เปิดรับสมัคร ข้อมูลยังไม่ส่งเข้า Admin และไม่มีการจองสิทธิ์หรือรับชำระเงินจริง กรุณาใช้ข้อมูลสมมติในการทดลอง</div>
    <div className="guide-steps">{steps.map(({ Icon, title, text }, index) => <article key={title}><span className="step-number">{index + 1}</span><Icon size={25} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></article>)}</div>
    <div className="guide-practical"><div><h2>ก่อนสมัคร ควรตรวจสอบอะไร?</h2><p>วันและสถานที่จัดงาน ระยะทาง เวลาปล่อยตัว ค่าสมัคร ขนาดเสื้อ วิธีรับอุปกรณ์ และเงื่อนไขของผู้จัดแต่ละงาน</p></div><div><h2>เตรียมตัวสำหรับวันวิ่ง</h2><p>อ่านประกาศล่าสุดจากผู้จัด วางแผนการเดินทาง และตรวจสอบเวลารับ BIB เพิ่มวันจัดงานลงในปฏิทินได้จากหน้ารายละเอียดงาน</p><Link className="text-link" href="/how-it-works">อ่านคู่มือนักวิ่ง <ArrowUpRight size={16} /></Link></div></div>
    <div className="guide-cta"><Link href="/events" className="button button-primary">เลือกดูกิจกรรม <ArrowUpRight size={18} /></Link><Link href="/find-order" className="button button-outline">ค้นหาใบสมัครตัวอย่าง</Link></div>
  </div>;
}
