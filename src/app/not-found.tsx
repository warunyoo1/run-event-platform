import { UiText } from '@/i18n/client';
import Link from "next/link";
import { Route } from "lucide-react";
export default function NotFound() { return <div className="container empty-state not-found"><Route size={40}/><h1><UiText>{"ไม่พบเส้นทางนี้ "}</UiText></h1><p><UiText>{"งานวิ่งหรือหน้าที่คุณกำลังค้นหาอาจไม่มีอยู่ "}</UiText></p><Link className="button button-primary" href="/events"><UiText>{"กลับไปค้นหางานวิ่ง "}</UiText></Link></div>; }
