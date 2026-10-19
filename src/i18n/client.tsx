"use client";

import { Children, createElement, useEffect, useState, useSyncExternalStore, type ReactNode, type ComponentPropsWithRef } from "react";
import Link from "next/link";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import en from "./en.json";
import { translateUiText } from "./translate";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({ lng: "th", fallbackLng: "th", resources: { en: { translation: en } }, keySeparator: false, nsSeparator: false, initAsync: false, interpolation: { escapeValue: false }, react: { useSuspense: false } });
    return i18n;
  });
  useEffect(() => {
    try { const saved = localStorage.getItem("run-event-language"); if (saved === "en" || saved === "th") void instance.changeLanguage(saved); } catch {}
    const update = (language: string) => { document.documentElement.lang = language; try { localStorage.setItem("run-event-language", language); } catch {} };
    update(instance.language);
    instance.on("languageChanged", update);
    const sync = (event: StorageEvent) => { if (event.key === "run-event-language" && (event.newValue === "th" || event.newValue === "en")) void instance.changeLanguage(event.newValue); };
    window.addEventListener("storage", sync);
    return () => { instance.off("languageChanged", update); window.removeEventListener("storage", sync); };
  }, [instance]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

const subscribeHydration = () => () => {};
const clientHydration = () => true;
const serverHydration = () => false;

export function useUiTranslation() {
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydration, serverHydration);
  const { t, i18n } = useTranslation();
  const translate = (value: string) => translateUiText(value, hydrated ? i18n.language : "th", key => String(t(key)));
  return { translate, language: hydrated ? i18n.language : "th", changeLanguage: (language: "th" | "en") => i18n.changeLanguage(language) };
}

/** UI labels only. Organizer text and form values stay in their original language. */
export function UiText({ children }: { children: ReactNode }) {
  const { translate } = useUiTranslation();
  return <>{Children.map(children, child => typeof child === "string" ? translate(child) : child)}</>;
}

export function LanguageSwitch() {
  const { language, changeLanguage } = useUiTranslation();
  return <div className="language-switch" role="group" aria-label={language === "en" ? "Language" : "ภาษา"}>
    <button type="button" lang="th" aria-pressed={language === "th"} onClick={() => void changeLanguage("th")}>ไทย</button>
    <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => void changeLanguage("en")}>EN</button>
  </div>;
}

function useTranslatedAttributes<P extends object>(props: P): P {
  const { translate } = useUiTranslation();
  const result = { ...props } as Record<string, unknown>;
  for (const key of ["placeholder", "title", "aria-label", "alt"]) if (typeof result[key] === "string") result[key] = translate(result[key] as string);
  return result as P;
}

export function UiLink(props: ComponentPropsWithRef<typeof Link>) { return createElement(Link, useTranslatedAttributes(props)); }
export function UiDiv(props: ComponentPropsWithRef<"div">) { return createElement("div", useTranslatedAttributes(props)); }
export function UiInput(props: ComponentPropsWithRef<"input">) { return createElement("input", useTranslatedAttributes(props)); }
export function UiButton(props: ComponentPropsWithRef<"button">) { return createElement("button", useTranslatedAttributes(props)); }
export function UiSelect(props: ComponentPropsWithRef<"select">) { return createElement("select", useTranslatedAttributes(props)); }
export function UiNav(props: ComponentPropsWithRef<"nav">) { return createElement("nav", useTranslatedAttributes(props)); }
export function UiSection(props: ComponentPropsWithRef<"section">) { return createElement("section", useTranslatedAttributes(props)); }
export function UiImg(props: ComponentPropsWithRef<"img">) { return createElement("img", useTranslatedAttributes(props)); }
export function UiA(props: ComponentPropsWithRef<"a">) { return createElement("a", useTranslatedAttributes(props)); }
export function UiOl(props: ComponentPropsWithRef<"ol">) { return createElement("ol", useTranslatedAttributes(props)); }
