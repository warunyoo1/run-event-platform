import Link from "next/link";
import { Route } from "lucide-react";
export default function NotFound() { return <div className="container empty-state not-found"><Route size={40} /><h1>ไม่พบเส้นทางนี้</h1><p>งานวิ่งหรือหน้าที่คุณกำลังค้นหาอาจไม่มีอยู่</p><Link className="button button-primary" href="/events">กลับไปค้นหางานวิ่ง</Link></div>; }
