"use client";
import { UiText } from '@/i18n/client';

export default function ErrorPage({ reset }: {
    reset: () => void;
}) { return <div className="container empty-state"><h1><UiText>{"โหลดข้อมูลไม่สำเร็จ "}</UiText></h1><p><UiText>{"กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่ "}</UiText></p><button className="button button-primary" onClick={reset}><UiText>{"ลองอีกครั้ง "}</UiText></button></div>; }
