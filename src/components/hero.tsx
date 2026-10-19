"use client";
import { useUiTranslation, UiText } from '@/i18n/client';

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { gsap, motionAllowed, useGSAP } from "@/lib/motion";
export function Hero() {
    const { translate } = useUiTranslation();
    const scope = useRef<HTMLElement>(null);
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add(motionAllowed, () => {
            gsap.timeline({ defaults: { ease: "power2.out" } })
                .fromTo(".hero-image", { scale: 1.045 }, { scale: 1, duration: 1.1, clearProps: "transform" }, 0)
                .fromTo(".hero-copy", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, clearProps: "transform,opacity" }, 0.05);
        }, scope);
        return () => media.revert();
    }, { scope });
    return <section className="hero" ref={scope}><div className="hero-stage"><div className="hero-media"><Image className="hero-image" src="/images/runners.jpg" alt={translate("นักวิ่งร่วมออกวิ่งบนเส้นทางในเมือง")} fill sizes="100vw" loading="eager" fetchPriority="high"/><div className="hero-shade"/></div><div className="container hero-content"><div className="hero-copy"><h1><UiText>{"งานวิ่งครั้งต่อไป "}</UiText><br /><span><UiText>{"เริ่มต้นที่นี่ "}</UiText></span></h1><p><UiText>{"จะก้าวแรก หรือก้าวที่ไกลกว่าเดิม "}</UiText><br /><UiText>{"ค้นหางานวิ่งที่ใช่ แล้วออกไปด้วยกัน "}</UiText></p><a className="hero-discover" href="#discover"><UiText>{"สำรวจงานวิ่ง "}</UiText><ArrowDown size={18} aria-hidden="true"/></a></div></div><div className="hero-caption"><UiText>{"ภาพบรรยากาศประกอบ "}</UiText></div></div></section>;
}
