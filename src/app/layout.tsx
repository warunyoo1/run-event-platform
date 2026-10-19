import { LocaleProvider, UiText } from "@/i18n/client";
import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "./tokens.css";
import "./globals.css";
import "./header.css";
import "./motion.css";
import "./start-line.css";
import { Header, Footer } from "@/components/site-shell";
import { PublicEventsProvider } from "@/components/public-events-provider";
import { PageMotion } from "@/components/page-motion";

export const metadata: Metadata = {
  title: { default: "Run Event | ค้นหางานวิ่งครั้งต่อไป", template: "%s | Run Event" },
  description: "ค้นหาข้อมูลงานวิ่งทั่วไทย เลือกจังหวัด ระยะทาง และวันที่ใช่ พร้อมรายละเอียดงานในที่เดียว",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body><LocaleProvider><a href="#main" className="skip-link"><UiText>ข้ามไปเนื้อหา</UiText></a><PublicEventsProvider><Header /><PageMotion>{children}</PageMotion><Footer /></PublicEventsProvider></LocaleProvider></body></html>;
}
