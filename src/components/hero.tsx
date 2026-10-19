"use client";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { gsap, motionAllowed, useGSAP } from "@/lib/motion";

export function Hero() {
  const router = useRouter();
  const scope = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(motionAllowed, () => {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .fromTo(".hero-image", { scale: 1.045 }, { scale: 1, duration: 1.1, clearProps: "transform" }, 0)
        .fromTo(".hero-copy", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, clearProps: "transform,opacity" }, 0.05)
        .fromTo(".hero-search", { opacity: 0.35, y: 12 }, { opacity: 1, y: 0, duration: 0.55, clearProps: "transform,opacity" }, 0.22);
    }, scope);
    return () => media.revert();
  }, { scope });
  return <section className="hero" ref={scope}><div className="hero-stage"><div className="hero-media"><Image className="hero-image" src="/images/runners.jpg" alt="นักวิ่งร่วมออกวิ่งบนเส้นทางในเมือง" fill sizes="100vw" loading="eager" fetchPriority="high" /><div className="hero-shade" /></div><div className="container hero-content"><div className="hero-copy"><span className="hero-intro"><span />พบเส้นทางใหม่ ๆ และเพื่อนร่วมทาง</span><h1>งานวิ่งครั้งต่อไป<br />เริ่มต้นที่นี่</h1><p>จะก้าวแรก หรือก้าวที่ไกลกว่าเดิม<br />ค้นหางานวิ่งที่ใช่ แล้วออกไปด้วยกัน</p></div></div><div className="hero-caption">ภาพบรรยากาศประกอบ</div></div><div className="container hero-search-wrap"><form className="hero-search" onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); const params = new URLSearchParams(); const q = String(values.get("q") || "").trim(); const province = String(values.get("province") || ""); if (q) params.set("q", q); if (province) params.set("province", province); router.push(`/events?${params.toString()}`); }}><label className="hero-query"><Search size={22} /><span><span className="input-label">อยากออกวิ่งที่ไหน?</span><input name="q" placeholder="ค้นหาชื่องาน หรือสถานที่จัดงาน" /></span></label><label className="hero-province"><MapPin size={21} /><span><span className="input-label">จังหวัด</span><select name="province" defaultValue=""><option value="">ทุกจังหวัด</option>{["กรุงเทพมหานคร", "นครราชสีมา", "ชลบุรี", "เชียงใหม่", "พระนครศรีอยุธยา"].map((province) => <option key={province}>{province}</option>)}</select></span></label><button className="button button-primary" type="submit"><Search size={18} />ค้นหางานวิ่ง</button></form></div></section>;
}

