import en from "./en.json" with { type: "json" };

export function translateUiText(value: string, language: string, lookup: (key: string) => string = key => en[key as keyof typeof en] ?? key): string {
  const translate = (text: string) => translateUiText(text, language, lookup);

    if (language !== "en") return value;
    const text = value.trim();
    const exact = en[text as keyof typeof en];
    if (exact) return value.replace(text, lookup(text));
    const results = /^พบ (\d+) งานวิ่ง$/.exec(text);
    if (results) return `${results[1]} ${results[1] === "1" ? "event" : "events"} found`;
    const monthYear = /^(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม) (\d{4})$/.exec(text);
    if (monthYear) return `${translate(monthYear[1])} ${Number(monthYear[2]) - 543}`;
    const distanceOption = /^(.* · )เหลือ ([\d,]+) คน$/.exec(text);
    if (distanceOption) return `${distanceOption[1]}${distanceOption[2]} places left`;
    if (/ · ไม่จำกัดจำนวน$/.test(text)) return text.replace(/ไม่จำกัดจำนวน$/, "Unlimited");
    if (/ · เต็มแล้ว$/.test(text)) return text.replace(/เต็มแล้ว$/, "Sold out");
    const runnerHeading = /^(?:ข้อมูลผู้สมัครคนที่|แก้ไขผู้สมัครคนที่|ลบผู้สมัครคนที่) (\d+)$/.exec(text);
    if (runnerHeading) return `Runner ${runnerHeading[1]}`;
    const view = /^ดูรายละเอียด (.+)$/.exec(text);
    if (view) return `View details: ${view[1]}`;
    const remaining = /^เหลือ ([\d,]+) คน$/.exec(text);
    if (remaining) return `${remaining[1]} places left`;
    const choice = /^เลือก(.+)$/.exec(text);
    if (choice && en[choice[1] as keyof typeof en]) return `Select ${translate(choice[1]).toLowerCase()}`;
    const date = /^(\d{1,2}) (ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม) (\d{4})$/.exec(text);
    if (date) {
      const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
      const full = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
      const month = months.indexOf(date[2]) >= 0 ? months.indexOf(date[2]) : full.indexOf(date[2]);
      return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: months.includes(date[2]) ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(Number(date[3]) - 543, month, Number(date[1]))));
    }
    return value;
  
}
