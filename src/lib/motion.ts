"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
export const motionAllowed = "(prefers-reduced-motion: no-preference)";

let activeScroll: gsap.core.Tween | null = null;
let scrollRequest = 0;
let scrollPluginReady: Promise<void> | null = null;
// ScrollToPlugin is only needed for animated scrolling, so it is loaded on first use.
function loadScrollPlugin() {
  scrollPluginReady ??= import("gsap/ScrollToPlugin").then(({ ScrollToPlugin }) => { gsap.registerPlugin(ScrollToPlugin); });
  return scrollPluginReady;
}

export function stopSmoothScroll() {
  scrollRequest += 1;
  activeScroll?.kill();
  activeScroll = null;
}

export function smoothScrollTo(target: HTMLElement | string, focus = false) {
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element?.isConnected) return;
  stopSmoothScroll();
  const offset = (document.querySelector(".site-header")?.getBoundingClientRect().height || 84) + 20;
  const y = Math.max(0, element.getBoundingClientRect().top + window.scrollY - offset);
  const finish = () => {
    activeScroll = null;
    if (focus && element.isConnected) {
      if (!element.hasAttribute("tabindex")) element.tabIndex = -1;
      element.focus({ preventScroll: true });
    }
  };
  if (!window.matchMedia(motionAllowed).matches) {
    window.scrollTo({ top: y, behavior: "instant" });
    finish();
    return;
  }
  const request = scrollRequest;
  loadScrollPlugin().then(() => {
    if (request !== scrollRequest || !element.isConnected) return;
    activeScroll = gsap.to(window, {
      scrollTo: { y, autoKill: true },
      duration: gsap.utils.clamp(0.32, 0.75, Math.abs(y - window.scrollY) / 1400),
      ease: "power2.inOut",
      overwrite: "auto",
      onComplete: finish,
      onInterrupt: () => { activeScroll = null; },
    });
  });
}
