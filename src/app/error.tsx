"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-state"><h1>โหลดข้อมูลไม่สำเร็จ</h1><p>กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่</p><button className="button button-primary" onClick={reset}>ลองอีกครั้ง</button></div>; }
