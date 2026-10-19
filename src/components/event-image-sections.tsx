"use client";
import { UiA, UiImg, UiSection, UiText } from '@/i18n/client';

import { ArrowUpRight, ImageOff } from "lucide-react";
import { useState } from "react";
import type { RunningEvent } from "@/lib/events";
type EventImage = NonNullable<RunningEvent["images"]>[number];
const sections = [
    { kind: "poster", title: "โปสเตอร์งาน" },
    { kind: "route_map", title: "แผนที่เส้นทาง" },
    { kind: "shirt", title: "เสื้อที่ระลึก" },
    { kind: "medal", title: "เหรียญและของรางวัล" },
    { kind: "gallery", title: "ภาพบรรยากาศ" },
    { kind: "sponsor", title: "ผู้สนับสนุน" },
    { kind: "cover", title: "ภาพงานเพิ่มเติม" },
    { kind: "other", title: "ภาพประกอบอื่น ๆ" },
];
function ImageFigure({ image, title, index }: {
    image: EventImage;
    title: string;
    index: number;
}) {
    const [failed, setFailed] = useState(false);
    const description = image.alt?.trim() || `${title} ภาพที่ ${index + 1}`;
    return <figure className="event-media-figure">
    <UiA className="event-media-link" href={image.url} target="_blank" rel="noreferrer" aria-label={`ดู${description}ขนาดเต็ม (เปิดแท็บใหม่)`}>
      <UiText>{failed ? <span className="event-media-error"><ImageOff size={24} aria-hidden="true"/><UiText>{"โหลดภาพไม่ได้ กดเปิดไฟล์ภาพเพื่อลองอีกครั้ง "}</UiText></span> : <UiImg src={image.url} alt={description} loading="lazy" decoding="async" onError={() => setFailed(true)}/>}</UiText>
      <span className="event-media-open"><UiText>{"ดูภาพขนาดเต็ม "}</UiText><ArrowUpRight size={16} aria-hidden="true"/></span>
    </UiA>
    {image.alt?.trim() && <figcaption>{image.alt}</figcaption>}
  </figure>;
}
export function EventImageSections({ event, includeCover = false }: {
    event: RunningEvent;
    includeCover?: boolean;
}) {
    const images = [...(event.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    // The first cover is already shown above the detail tabs. All other images
    // remain available here, including unknown kinds from future API versions.
    const primaryCover = images.find((image) => image.kind === "cover");
    const knownKinds = new Set(sections.map((section) => section.kind));
    return <div className="event-media-sections"><UiText>{sections.map(({ kind, title }) => {
            const group = images.filter((image) => (includeCover || image !== primaryCover) && (image.kind === kind || (kind === "other" && !knownKinds.has(image.kind))));
            if (!group.length)
                return null;
            return <UiSection className={`event-media-section event-media-${kind}`} key={kind} aria-label={title}>
      <h2><UiText>{title}</UiText><span><UiText>{group.length}</UiText><UiText>{"ภาพ "}</UiText></span></h2>
      <div className="event-media-grid"><UiText>{group.map((image, index) => <ImageFigure key={image.id} image={image} title={title} index={index}/>)}</UiText></div>
    </UiSection>;
        })}</UiText></div>;
}
