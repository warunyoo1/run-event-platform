import { UiText } from "@/i18n/client";
import Link from "next/link";
import { ArrowUpRight, Check, ClipboardList } from "lucide-react";

export const metadata = { title: "ขั้นตอนการสมัคร" };
const steps = [
  { title: "เลือกงานและระยะวิ่ง", description: "เลือกงานที่เปิดรับสมัครและตรวจสอบระยะ ราคา และเงื่อนไข" },
  { title: "กรอกข้อมูลและเลือกวิธีรับชุดวิ่ง", description: "กรอกข้อมูลผู้สมัครและผู้ติดต่อ เลือกรับชุดวิ่งเองหรือจัดส่ง" },
  { title: "ตรวจสอบและยืนยันใบสมัคร", description: "ตรวจสอบข้อมูลและยืนยันเพื่อสร้างใบสมัครจริง เก็บเลขใบสมัครไว้" },
  { title: "ชำระเงินตามคำแนะนำของผู้จัด", description: "ตรวจสอบช่องทางชำระกับผู้จัด ขณะนี้เว็บยังไม่แสดง QR หรือบัญชีรับเงิน" },
  { title: "ส่งสลิปและติดตามสถานะ", description: "ค้นหาใบสมัครด้วยเลขใบสมัครและเบอร์โทรผู้ติดต่อ 4 ตัวท้าย เพื่อส่งสลิปและติดตามผลตรวจ" },
];
export default function Guide() {
  return <div className="container registration-help">
    <header className="registration-help-intro">
      <h1><UiText>ขั้นตอนการสมัคร</UiText></h1>
      <p><UiText>ตั้งแต่เลือกงานจนถึงติดตามใบสมัคร ทำตามลำดับได้เลย</UiText></p>
    </header>
    <div className="registration-help-layout">
      <ol className="registration-help-steps">
        {steps.map((step, index) => <li key={step.title}>
          <span className="registration-help-number" aria-hidden="true">{index + 1}</span>
          <div><h2><UiText>{step.title}</UiText></h2><p><UiText>{step.description}</UiText></p>
            {index === 2 && <p className="registration-help-tip"><ClipboardList size={17} aria-hidden="true"/><UiText>เก็บเลขใบสมัครไว้ ใช้ค้นหาและส่งสลิปภายหลัง</UiText></p>}
          </div>
        </li>)}
      </ol>
      <aside className="registration-help-aside">
        <h2><UiText>เตรียมก่อนสมัคร</UiText></h2>
        <ul>{["ข้อมูลส่วนตัวและเบอร์โทรผู้ติดต่อ", "ระยะวิ่งและขนาดเสื้อที่ต้องการ", "ที่อยู่จัดส่ง หากเลือกรับทางไปรษณีย์"].map((item) => <li key={item}><Check size={17} aria-hidden="true"/><UiText>{item}</UiText></li>)}</ul>
        <Link className="button button-primary" href="/events"><UiText>เลือกงานวิ่ง</UiText><ArrowUpRight size={18} aria-hidden="true"/></Link>
        <div className="registration-help-existing"><h3><UiText>สมัครไว้แล้ว?</UiText></h3><p><UiText>ใช้เลขใบสมัครและเบอร์โทรผู้ติดต่อ 4 ตัวท้าย</UiText></p><Link className="text-link" href="/find-order"><UiText>ค้นหาใบสมัครและส่งสลิป</UiText><ArrowUpRight size={17} aria-hidden="true"/></Link></div>
      </aside>
    </div>
  </div>;
}
