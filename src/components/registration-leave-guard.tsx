"use client";
import { UiText } from '@/i18n/client';

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWarning } from "lucide-react";
import { shouldGuardLink } from "@/lib/navigation-guard";
export function RegistrationLeaveGuard({ dirty, submitting }: {
    dirty: boolean;
    submitting: boolean;
}) {
    const [destination, setDestination] = useState<string | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const stay = useRef<HTMLButtonElement>(null);
    const allowUnload = useRef(false);
    const router = useRouter();
    const id = useId();
    useEffect(() => {
        if (!dirty && !submitting) {
            setDestination(null);
            return;
        }
        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (!allowUnload.current) {
                event.preventDefault();
                event.returnValue = "";
            }
        };
        const click = (event: MouseEvent) => {
            const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
            if (!anchor || event.defaultPrevented || event.button !== 0)
                return;
            if (!shouldGuardLink(window.location.href, anchor.href, { download: anchor.hasAttribute("download"), target: anchor.target, modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey }))
                return;
            event.preventDefault();
            event.stopImmediatePropagation();
            setDestination(anchor.href);
        };
        document.addEventListener("click", click, true);
        window.addEventListener("beforeunload", beforeUnload);
        return () => { document.removeEventListener("click", click, true); window.removeEventListener("beforeunload", beforeUnload); };
    }, [dirty, submitting]);
    useEffect(() => {
        if (!destination)
            return;
        const element = dialog.current;
        const previous = document.activeElement as HTMLElement | null;
        element?.showModal();
        stay.current?.focus();
        return () => { element?.close(); if (previous?.isConnected)
            previous.focus(); };
    }, [destination]);
    function leave() {
        if (!destination || submitting)
            return;
        const url = new URL(destination);
        setDestination(null);
        if (url.origin === window.location.origin)
            router.push(url.pathname + url.search + url.hash);
        else {
            allowUnload.current = true;
            window.location.assign(destination);
        }
    }
    return destination ? <dialog ref={dialog} className="registration-leave-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={(event) => { event.preventDefault(); setDestination(null); }}>
    <div className="registration-leave-content"><FileWarning size={28} aria-hidden="true"/>
      <h2 id={`${id}-title`}><UiText>{submitting ? "กำลังส่งใบสมัคร" : "ข้อมูลสมัครยังไม่ได้บันทึก"}</UiText></h2>
      <p id={`${id}-description`}><UiText>{submitting ? "กรุณารอผลการสมัครก่อนออกจากหน้านี้ เพื่อป้องกันการสมัครซ้ำ" : "หากออกตอนนี้ ข้อมูลผู้สมัครที่กรอกไว้จะหายไป ต้องการกลับไปกรอกต่อหรือไม่?"}</UiText></p>
    </div>
    <div className="registration-leave-actions"><button ref={stay} className="button button-primary" onClick={() => setDestination(null)}><UiText>{"กรอกต่อ "}</UiText></button>
      <UiText>{!submitting && <button className="button button-outline" onClick={leave}><UiText>{"ทิ้งข้อมูลและออก "}</UiText></button>}</UiText>
    </div>
  </dialog> : null;
}
