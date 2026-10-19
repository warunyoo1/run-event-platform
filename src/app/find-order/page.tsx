import { UiText } from '@/i18n/client';
import { OrderLookup } from "@/components/order-lookup";
export const metadata = { title: "ค้นหาใบสมัคร" };
export default async function FindOrderPage({ searchParams }: {
    searchParams: Promise<{
        reference?: string | string[];
    }>;
}) {
    const reference = (await searchParams).reference;
    return <div className="container lookup-page"><div className="guide-page-intro"><h1><UiText>{"ค้นหาใบสมัคร "}</UiText></h1><p><UiText>{"ตรวจสอบรายละเอียดและสถานะใบสมัครของคุณ "}</UiText></p></div><OrderLookup initialReference={typeof reference === "string" ? reference.slice(0, 50) : ""}/></div>;
}
