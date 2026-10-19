"use client";
import { UiText } from '@/i18n/client';

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, motionAllowed, stopSmoothScroll, useGSAP } from "@/lib/motion";
export function PageMotion({ children }: {
    children: ReactNode;
}) {
    const scope = useRef<HTMLElement>(null);
    const pathname = usePathname();
    useGSAP(() => {
        const media = gsap.matchMedia();
        media.add(motionAllowed, () => {
            const root = scope.current;
            if (!root)
                return;
            const intro = root.querySelector(".detail-title, .guide-page-intro, .reg-event-heading");
            if (intro)
                gsap.fromTo(intro, { opacity: 0.5, y: 10 }, {
                    opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform,opacity",
                });
            const guide = root.querySelector(".runner-guide");
            let observer: IntersectionObserver | undefined;
            if (guide) {
                gsap.set(guide, { opacity: 0.65, y: 16 });
                observer = new IntersectionObserver((entries) => {
                    if (!entries.some((entry) => entry.isIntersecting))
                        return;
                    observer?.disconnect();
                    gsap.to(guide, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", clearProps: "transform,opacity" });
                }, { rootMargin: "0px 0px -6% 0px" });
                observer.observe(guide);
            }
            return () => observer?.disconnect();
        }, scope);
        return () => media.revert();
    }, { scope, dependencies: [pathname], revertOnUpdate: true });
    useEffect(() => {
        // Cancel an anchor/step scroll before a route change can focus old content.
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onPreferenceChange = () => { if (preference.matches)
            stopSmoothScroll(); };
        const onNavigationKey = (event: KeyboardEvent) => {
            if (["Tab", "Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key))
                stopSmoothScroll();
        };
        preference.addEventListener("change", onPreferenceChange);
        window.addEventListener("pointerdown", stopSmoothScroll, { passive: true, capture: true });
        window.addEventListener("wheel", stopSmoothScroll, { passive: true });
        window.addEventListener("keydown", onNavigationKey);
        return () => {
            stopSmoothScroll();
            preference.removeEventListener("change", onPreferenceChange);
            window.removeEventListener("pointerdown", stopSmoothScroll, true);
            window.removeEventListener("wheel", stopSmoothScroll);
            window.removeEventListener("keydown", onNavigationKey);
        };
    }, [pathname]);
    return <main id="main" ref={scope}><UiText>{children}</UiText></main>;
}
