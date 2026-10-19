"use client";
import { LanguageSwitch, UiButton, UiLink, UiNav, UiText } from '@/i18n/client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ClipboardList, Footprints, House, Info, Menu, Search, X } from "lucide-react";
import { gsap, motionAllowed, useGSAP } from "@/lib/motion";
const navigation = [
    { href: "/", label: "กิจกรรม", Icon: House },
    { href: "/how-to-register", label: "ขั้นตอนการสมัคร", Icon: ClipboardList },
    { href: "/find-order", label: "ค้นหาใบสมัคร", Icon: Search },
    { href: "/about", label: "เกี่ยวกับเรา", Icon: Info },
];
export function Brand({ tagline = true }: {
    tagline?: boolean;
}) {
    return <UiLink className="brand" href="/" aria-label="Run Event หน้าหลัก"><span className="brand-icon"><Footprints size={25} strokeWidth={2.5}/></span><span>RUN<span className="brand-light">EVENT</span><UiText>{tagline && <small><UiText>{"ทุกเส้นทาง เริ่มต้นที่นี่ "}</UiText></small>}</UiText></span></UiLink>;
}
export function Header() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLElement>(null);
    const menuAnimation = useRef<gsap.core.Timeline | null>(null);
    const menuState = useRef(false);
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add({ mobile: "(max-width: 1020px)", desktop: "(min-width: 1021px)", motion: motionAllowed }, (context) => {
            const nav = menuRef.current;
            if (!nav)
                return;
            const mobile = !!context.conditions?.mobile;
            nav.inert = mobile && !menuState.current;
            if (!mobile || !context.conditions?.motion)
                return () => { nav.inert = false; };
            const timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
                .fromTo(nav, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.22 })
                .fromTo(nav.querySelectorAll("a"), { opacity: 0, x: -5 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.025 }, 0.035);
            menuAnimation.current = timeline;
            timeline.progress(menuState.current ? 1 : 0).pause();
            return () => { menuAnimation.current = null; nav.inert = false; };
        }, headerRef);
        return () => media.revert();
    }, { scope: headerRef });
    useGSAP(() => {
        menuState.current = menuOpen;
        if (menuRef.current)
            menuRef.current.inert = window.matchMedia("(max-width: 1020px)").matches && !menuOpen;
        if (menuAnimation.current) {
            if (menuOpen)
                menuAnimation.current.play();
            else
                menuAnimation.current.reverse();
        }
    }, { dependencies: [menuOpen], scope: headerRef });
    useEffect(() => {
        if (!menuOpen)
            return;
        const closeOutside = (event: PointerEvent) => {
            if (event.target instanceof Node && !headerRef.current?.contains(event.target))
                setMenuOpen(false);
        };
        document.addEventListener("pointerdown", closeOutside);
        return () => document.removeEventListener("pointerdown", closeOutside);
    }, [menuOpen]);
    return <header className="site-header" ref={headerRef} onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        }}>
    <div className="container header-inner">
      <Brand tagline={false}/>
      <UiNav ref={menuRef} id="main-navigation" className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="เมนูหลัก">
        <UiText>{navigation.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" || pathname.startsWith("/events") : pathname === href;
            return <Link href={href} key={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><Icon size={18} strokeWidth={1.8} aria-hidden="true"/><span><UiText>{label}</UiText></span></Link>;
        })}</UiText>
      </UiNav>
      <div className="header-actions"><LanguageSwitch />
        <UiButton ref={menuButtonRef} className="menu-toggle icon-button" aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><UiText>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</UiText></UiButton>
      </div>
    </div>
  </header>;
}
export function Footer() {
    return <footer className="site-footer"><div className="container footer-main"><div><Brand /><p><UiText>{"ค้นหางานวิ่งที่ใช่ แล้วออกไปสร้างเรื่องราวของคุณ "}</UiText></p></div><div className="footer-links"><UiText>{navigation.map(({ href, label }) => <Link href={href} key={href}><UiText>{label}</UiText> <ArrowUpRight size={15}/></Link>)}</UiText></div></div><div className="container footer-bottom"><span>© 2026 Run Event</span><span><UiText>{"ข้อมูลกิจกรรมและการรับสมัครจากผู้จัด "}</UiText></span></div></footer>;
}
