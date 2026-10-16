# Impeccable audit — Run Event

## ผลหลังแก้ไขตามรายงาน — 15 ตุลาคม 2026

**แก้ครบทั้ง 5 ประเด็นที่ยืนยันในรอบแรกแล้ว** รายละเอียดด้านล่างหัวข้อนี้เป็น baseline ก่อนแก้ (14/20) และตำแหน่งบรรทัดเดิมก่อนจัดรูปแบบ CSS ใหม่ คะแนน baseline ไม่ใช่คะแนนเว็บไซต์หลังแก้ และไม่มีการอ้างว่าการตรวจแบบสุ่มรับรอง WCAG ทั้งเว็บไซต์

| ข้อ | สถานะ | สิ่งที่แก้และหลักฐานหลังแก้ |
|---|---|---|
| 1. Contrast | แก้แล้ว | ใช้ `--muted` ส่วนกลาง: 6.00:1 บนขาว, 5.69:1 บนพื้นหน้า, 5.43:1 สำหรับขั้นตอนที่ยังไม่ถึง; ข้อความบนพื้นข้อมูลใช้ `--text-info` ได้ 5.83:1; ปรับ placeholder, หมายเหตุ, footer และตัวเลขคู่มือด้วย |
| 2. ตัวอักษรมือถือ | แก้แล้ว | รายการงาน: label 12px, วัน/สถานที่/ลิงก์ 14px, ชื่องาน 18px; stepper 12px; ช่องกรอกหลัก 16px; จัด toolbar และรายการใหม่ให้เนื้อหามีพื้นที่เต็มความกว้าง |
| 3. พื้นที่กด | แก้แล้ว | วัดปุ่มสลับมุมมอง บันทึกบนรายการ/การ์ด และบันทึกในสรุปงาน ได้ 44×44px; ปุ่มค้นหาและล้างตัวกรองขั้นต่ำ 44px |
| 4. ภาพ Hero | แก้แล้ว | ใช้ `next/image`, fill, `sizes="100vw"`, eager/high priority; สร้าง srcset 640–3840w; ตรวจ API กับ Accept WebP: 640px = 62,256 bytes (ลดประมาณ 89%), 1920px = 271,274 bytes จากต้นฉบับ 573,091 bytes |
| 5. Semantic colors | แก้แล้ว | เพิ่ม [tokens.css](C:/Project/run-event-platform/src/app/tokens.css) และย้ายสีข้อความ/พื้น/ขอบ/สถานะใน globals/header/registration ไปใช้ร่วมกัน เหลือ palette เฉพาะภาพ Hero และโปสเตอร์ตามทิศทางเดิม |

### การตรวจหลังแก้

- `npm run typecheck`, `npm test` (6/6), `npm run build` ผ่าน ไม่มีการเพิ่ม test ที่ตรวจเพียงค่า CSS ตาม implementation
- ตรวจ layout ที่ desktop 1440px, tablet 768px และ mobile 390/320px ไม่พบ horizontal overflow ในหน้าและขนาดที่ตรวจ
- คำนวณ contrast จาก computed colors ซ้ำในหน้าแรก/รายการ ฟอร์มขั้น 1–3 แท็บระยะวิ่ง และคู่มือ ไม่พบคู่สีทึบที่ไม่ผ่านในตัวอย่างที่ตรวจ การตรวจนี้เว้นข้อความใน artwork/gradient และไม่แทนการตรวจ WCAG ทุกข้อ
- ตรวจ error summary ของฟอร์ม ย้ายโฟกัสไปแก้ไขได้; ทดลองเพิ่มผู้สมัครด้วยข้อมูลสมมติ เลือกระยะ 5 KM เสื้อ M และไปทบทวนยอด 399 บาทได้
- ตรวจชื่อทีมยาวไม่มีช่องว่างและเพิ่ม wrap ให้ไม่ถูกตัด; ช่องวันเกิดที่ 320px แสดง “พฤศจิกายน” กว้าง 143px และปีเต็มแถวกว้าง 237px ได้
- ArrowRight ของแท็บรายละเอียดและ Escape ของเมนูยังทำงาน ปิดเมนูแล้วเป็น inert และคืนโฟกัส ไม่มี console warning/error ในรอบ browser ที่ตรวจ
- ตรวจ source และ render แบบจำกัดสองรอบ: รอบแรกตรวจ desktop/mobile พร้อมกัน แก้ช่องวันเกิดและพื้นคำบรรยาย Hero แล้วตรวจยืนยัน ไม่มีการเปลี่ยนข้อมูล/ราคา/การเชื่อมต่อ Admin
- ผล detector หลังแก้: [impeccable-detect-after.json](C:/Project/run-event-platform/artifacts/impeccable-detect-after.json) เหลือ pattern warnings ที่ยอมรับตามบริบท คือ Arial เดิม 5 รายการและเส้นขอบหมายเหตุ 1 รายการ จำนวน Arial เพิ่มเพราะแยก CSS จากบรรทัดยาวเป็นบรรทัดละ selector ไม่ได้เพิ่ม font family ใหม่ ไม่มีการปิด rule เพื่อซ่อนคำเตือน

![รายการมือถือหลังแก้](C:/Project/run-event-platform/artifacts/impeccable-fixed-mobile.jpg)

![ฟอร์มจอแคบหลังแก้](C:/Project/run-event-platform/artifacts/impeccable-fixed-form.jpg)

การวัดภาพเป็นขนาด response จริงของ API ในเครื่อง ไม่ใช่คะแนน LCP/CWV ยังไม่ได้วัด production ภายใต้ network throttling และไม่ได้ใช้มือถือจริง/ทดสอบ screen reader หรือ text-only zoom 200% จึงคงข้อจำกัดเหล่านี้ไว้ ไม่ได้ใช้ข้อจำกัดดังกล่าวแทนประเด็นที่แก้ครบแล้ว

---

## รายงานก่อนแก้ (baseline)

ตรวจวันที่ 15 ตุลาคม 2026 · เป้าหมาย `C:\Project\run-event-platform` · โหมด audit (ตรวจ ไม่แก้ UI)

## Implementation integrity verdict

**ผ่านในขอบเขตที่ตรวจ:** โครงสร้างสอดคล้องกับการค้นหางานวิ่ง ดูระยะ/ราคา และทดลองสมัคร เมนูและสีหลักเป็นระบบเดียวกัน หน้าใบสมัครและค้นหาใบสมัครอธิบายชัดว่าเป็นข้อมูลตัวอย่าง ไม่เชื่อม Admin หรือรับเงินจริง ไม่พบคำเตือนจาก detector ที่ยืนยันได้ว่าเป็นข้อบกพร่องเชิงการใช้งาน ทั้ง 3 รายการต้องพิจารณาตามบริบทด้านล่าง

## ผลประเมิน

| มิติ | คะแนน / 4 | หลักฐานสำคัญ |
|---|---:|---|
| Accessibility | 2 | ข้อความประกอบหลายจุด contrast ต่ำกว่า 4.5:1; label และ error ของฟอร์มมีครบ |
| Performance | 3 | Motion ใช้ transform/opacity และ cleanup; ภาพ hero ยังส่ง JPG ขนาดเดียวทุกจอ |
| Theming | 2 | มี token สีหลัก แต่สีเชิงความหมายกระจายอยู่ใน CSS หลายเฉด |
| Responsive | 3 | หน้าแรกและฟอร์มไม่ล้นในขนาดที่ทดสอบ; ปุ่มรองและข้อความรายการมือถือเล็ก |
| Implementation integrity | 4 | เนื้อหาและเส้นทางสอดคล้องกับผลิตภัณฑ์ ข้อจำกัดของ demo ระบุชัด |
| **รวม** | **14/20 — Good** | **ควรแก้ contrast ก่อนนำไปใช้งานจริง** |

คะแนนนี้เป็นการประเมินของผู้ตรวจตาม rubric ของ Impeccable จากการสุ่มตรวจโค้ดและหน้าจอ ไม่ใช่คะแนนอัตโนมัติจาก CLI หรือการรับรอง WCAG ทั้งเว็บไซต์

พบ **5 ประเด็น: P0 = 0, P1 = 1, P2 = 4, P3 = 0** ไม่พบตัวขวางงานในเส้นทางที่ทดสอบ แต่ยังมีข้อจำกัดการตรวจตามท้ายรายงาน

## ประเด็นที่ยืนยันได้ เรียงตามความสำคัญ

### 1. [P1] ข้อความประกอบบางส่วนอ่านจางเกินไป

- หมวด: Accessibility
- ตำแหน่ง: [globals.css](C:/Project/run-event-platform/src/app/globals.css:4), [registration.css](C:/Project/run-event-platform/src/app/registration.css:16), [ข้อความบอกขั้นตอน](C:/Project/run-event-platform/src/app/registration.css:25)
- วัดจาก computed foreground/background ที่เป็นสีทึบ แล้วคำนวณ relative luminance ไม่ใช้สีจากภาพ screenshot และไม่นับข้อความบน gradient/ภาพถ่ายในชุดตัวเลขนี้

| ตัวอย่าง | สีข้อความ / พื้น | Contrast |
|---|---|---:|
| ประเภทงานและจังหวัด `.event-category` | `#647d94` / `#ffffff` | 4.28:1 |
| ข้อความข้อมูลตัวอย่าง `.demo-note` | `#718093` / `#f7f9fc` | 3.82:1 |
| ป้ายชื่อขั้นตอนที่ยังไม่ถึง | `#7a8796` / `#ffffff` | 3.66:1 |
| ตัวเลขขั้นตอนที่ยังไม่ถึง | `#8390a0` / `#f0f3f7` | 2.92:1 |
| “ขั้นตอนที่ 1 จาก 4” | `#71849a` / `#ffffff` | 3.84:1 |

- ผลกระทบ: อ่านข้อมูลสถานที่และลำดับสมัครได้ยากขึ้น โดยเฉพาะเมื่อข้อความเล็กหรือใช้งานกลางแจ้ง ตัว stepper เป็นข้อมูลบอกลำดับในรายการ ไม่ใช่ปุ่ม disabled
- เกณฑ์: ข้อความขนาดปกติต้องได้อย่างน้อย 4.5:1 ตาม [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- แนะนำ: สร้าง token สำหรับข้อความรองที่ผ่านเกณฑ์กับพื้นแต่ละชนิด แล้วแทนเฉดสีจางเหล่านี้ คงสีและ `aria-current` เพื่อแยกขั้นตอนปัจจุบัน
- คำสั่งที่เหมาะ: `$impeccable colorize`

### 2. [P2] รายการงานบนมือถือย่อข้อความสำคัญเหลือ 8–10px

- หมวด: Responsive / Accessibility
- ตำแหน่ง: [mobile rules ใน globals.css](C:/Project/run-event-platform/src/app/globals.css:12), [label ของ stepper](C:/Project/run-event-platform/src/app/registration.css:153)
- หลักฐานที่ viewport 390×844: ประเภท/จังหวัด 8px, วันและสถานที่ 10px, ลิงก์ดูรายละเอียด 9px; label ขั้นตอนสมัคร 9px
- ผลกระทบ: ต้องเพ่งหรือซูมเพื่ออ่านรายละเอียดที่ใช้ตัดสินใจเลือกงาน รูปแบบรายการควรช่วยสแกนข้อมูลได้เร็ว
- แนะนำ: ข้อความเนื้อหาอย่างน้อยประมาณ 14px และ label รอง 12–13px ปรับรายการเป็นแถวสูงขึ้น/ลดความกว้างส่วนโปสเตอร์ แทนการย่อทุกข้อความเพื่อให้พอดี
- เกณฑ์: เป็นข้อเสนอด้าน readability ไม่ใช่การอ้างว่า WCAG บังคับฟอนต์ขั้นต่ำ 14/16px
- คำสั่งที่เหมาะ: `$impeccable typeset`, `$impeccable adapt`

![รายการงานบนมือถือ](C:/Project/run-event-platform/artifacts/impeccable-mobile-list.jpg)

### 3. [P2] ปุ่มรองหลายจุดมีพื้นที่กดต่ำกว่าเป้าหมาย 44×44px

- หมวด: Responsive
- ตำแหน่ง: [view toggle และ save button](C:/Project/run-event-platform/src/app/globals.css:6), [mobile overrides](C:/Project/run-event-platform/src/app/globals.css:12)
- หลักฐาน: สลับมุมมองบนมือถือ 32×32px, บันทึกในรายการ 34×34px, บันทึกบนการ์ด 38×38px, บันทึกในสรุปงาน 36×36px
- ผลกระทบ: ปุ่มที่ใช้บ่อยกดพลาดได้ง่ายขึ้น ขณะที่เมนูมือถือและปุ่มหลักมีขนาดเหมาะสมแล้ว
- แนะนำ: เพิ่มพื้นที่กดเป็นอย่างน้อย 44×44px โดยเก็บขนาด icon เดิมได้ ปรับช่องไฟ toolbar ให้พอดี
- เกณฑ์: 44px เป็นเป้าหมายของ Impeccable และระบบออกแบบนี้; [WCAG 2.5.8 ระดับ AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) ใช้ขั้นต่ำ 24px พร้อมข้อยกเว้น จึงไม่นับตัวอย่าง 32–38px เหล่านี้เป็น AA violation จากขนาดเพียงอย่างเดียว
- คำสั่งที่เหมาะ: `$impeccable adapt`

### 4. [P2] ภาพ hero ไม่มี responsive image variants

- หมวด: Performance
- ตำแหน่ง: [hero.tsx](C:/Project/run-event-platform/src/components/hero.tsx:21), `public/images/runners.jpg`
- หลักฐาน: `<img>` ใช้ไฟล์ JPG เดียว 1800×1200 ขนาด 573,091 bytes (~560 KiB) ไม่มี `srcSet`/`sizes` มือถือจึงโหลดไฟล์เดียวกับเดสก์ท็อป
- ผลกระทบ: ใช้ข้อมูลและเวลาดาวน์โหลดมากกว่าที่จำเป็นบนจอเล็ก เป็นโอกาสปรับปรุง ไม่ใช่ข้อสรุปว่าค่า LCP ปัจจุบันไม่ผ่าน
- แนะนำ: ใช้ Next Image หรือจัดภาพหลายความกว้างพร้อม `srcSet`/`sizes` และฟอร์แมตที่เหมาะสม รักษา dimension และ priority ของภาพแรกไว้ ไม่ควร lazy-load ภาพ hero
- เกณฑ์: ไม่มี WCAG violation ที่ยืนยันจากประเด็นนี้ ยังไม่ได้วัด production LCP/CWV
- คำสั่งที่เหมาะ: `$impeccable optimize`

### 5. [P2] สีข้อความและพื้นผิวเชิงความหมายยังไม่รวมเป็น token อย่างสม่ำเสมอ

- หมวด: Theming
- ตำแหน่ง: [token หลัก](C:/Project/run-event-platform/src/app/globals.css:1), [CSS ฟอร์มสมัคร](C:/Project/run-event-platform/src/app/registration.css:8)
- หลักฐาน: มี `--ink`, `--muted`, `--blue`, `--line` แล้ว แต่ส่วนประกอบยังระบุเฉดข้อความรอง/พื้น/ขอบตรง ๆ หลายแห่ง เช่น `#71849a`, `#7a8796`, `#647d94` และ `#718093` ความแตกต่างนี้สัมพันธ์กับปัญหา contrast ข้อ 1
- ผลกระทบ: แก้ความอ่านง่ายครั้งเดียวไม่ครอบคลุมทุกหน้า และองค์ประกอบใหม่อาจเลือกสีที่ไม่ผ่านเกณฑ์ซ้ำ
- แนะนำ: แยก semantic token เช่น muted text, subtle surface, field border, progress pending; เก็บสี artwork เฉพาะโปสเตอร์ไว้ได้ ไม่จำเป็นต้องเปลี่ยนทุกสีเป็นสีแบรนด์
- เกณฑ์: ข้อเสนอด้านความสม่ำเสมอและการบำรุงรักษา เว็บยังไม่ได้รับข้อกำหนด dark mode จึงไม่รายงานการไม่มี dark mode เป็นข้อบกพร่อง
- คำสั่งที่เหมาะ: `$impeccable extract`

## ผลจาก deterministic detector

ใช้ [Impeccable ทางการ](https://github.com/pbakaus/impeccable) skill 4.5.2, engine 0.1.14, commit `abf5779cabc20147fd9c013fa4705088c200bf8a` ติดตั้งที่ `.agents/skills/impeccable` ภายใน repo ไม่ได้เปิด automatic hook

เรียก `scripts/impeccable.cmd context` หนึ่งครั้ง แล้ว `scripts/impeccable.cmd detect --json src/` หนึ่งครั้ง เก็บผลดิบใน [impeccable-detect.json](C:/Project/run-event-platform/artifacts/impeccable-detect.json)

| Detector | ตำแหน่ง | ตรวจบริบทแล้ว |
|---|---|---|
| `side-tab` 1 รายการ | `globals.css:7` | เส้นขอบซ้ายของ `.info-note` ใช้แยกหมายเหตุ ไม่ใช่การตกแต่งการ์ดทุกใบ ไม่พบผลกระทบที่ควรนับเป็น defect |
| `overused-font` 2 รายการ | `globals.css:3,6` | จับ Arial ที่ใช้กับแบรนด์/โปสเตอร์ ตัวอักษรเนื้อหาไทยใช้ Noto Sans Thai ตามทิศทางเดิม จึงไม่เสนอเปลี่ยนฟอนต์เพียงเพื่อผ่าน detector |

ทั้ง 3 รายการเป็น pattern warnings ที่ตรวจพบจริง แต่ไม่ใช่ 3 ปัญหาที่ต้องแก้โดยอัตโนมัติ และแยกจาก 5 ประเด็นที่ผู้ตรวจยืนยันด้านบน การไม่มี accessibility error ในผล scan ของ TSX/CSS ไม่ได้แปลว่าเว็บไซต์ผ่าน WCAG

## สิ่งที่ทำได้ดีและผลตรวจการใช้งาน

- หน้าแรกเดสก์ท็อป 1440×900: header เมนู/โลโก้/งานที่บันทึกอยู่แถวเดียว ไม่ทับกัน
- หน้าแรกแบบรายการ 390×844: ไม่พบ horizontal overflow (`clientWidth = scrollWidth = 375px` รวมผลพื้นที่ scrollbar ของ browser)
- ฟอร์มสมัคร 390×844 และ 320×720: ไม่พบ horizontal overflow; ที่ความกว้าง 320px ได้ `clientWidth = scrollWidth = 305px`
- กดเพิ่มผู้สมัครขณะว่าง: แสดงสรุป 8 ข้อ, input/select ที่เกี่ยวข้องใช้ `aria-invalid`, error เชื่อมผ่าน `aria-describedby`, โฟกัสย้ายไปสรุปข้อผิดพลาด
- เมนูมือถือ: เปิดได้ กด Escape แล้วคืนโฟกัสไปปุ่มเปิดเมนู
- แท็บรายละเอียดงาน: ArrowRight เปลี่ยนไป “ระยะวิ่งและค่าสมัคร” พร้อมย้ายโฟกัส และ panel เชื่อม `aria-labelledby` ถูกต้อง
- ค้นหา `DEMO-1001`: แสดงงาน ระยะ เสื้อ และยอด 399 บาท พร้อมคำอธิบายข้อจำกัดข้อมูลตัวอย่าง
- มี skip link, landmark, label ของฟอร์ม และ accessible name ของปุ่ม icon
- GSAP มี scope/revert, ใช้ transform/opacity และเคารพ `prefers-reduced-motion` ในโค้ด มีการยกเลิก smooth scroll เมื่อผู้ใช้ควบคุมหน้าเอง ไม่พบ animation loop ที่ทำงานตลอดเวลา
- Console ที่ตรวจหลังเส้นทางข้างต้นไม่มี warning/error

![ตัวอย่าง error summary ของฟอร์มมือถือ](C:/Project/run-event-platform/artifacts/impeccable-mobile-form.jpg)

## ลำดับแนะนำสำหรับรอบแก้ไข

1. **P1 `$impeccable colorize`** — ทำข้อความรองและข้อมูล stepper ให้ผ่าน contrast
2. **P2 `$impeccable typeset` + `$impeccable adapt`** — เพิ่มตัวอักษรและพื้นที่กดบนมือถือ
3. **P2 `$impeccable extract`** — รวม semantic colors ให้แก้ปัญหาได้ทุกหน้าพร้อมกัน
4. **P2 `$impeccable optimize`** — ทำ responsive hero image และวัด production performance
5. **`$impeccable polish`** — ตรวจความเรียบร้อยหลังแก้ แล้วรัน `$impeccable audit` เปรียบเทียบผลอีกครั้ง

สามารถให้ทำทีละคำสั่งหรือรวมเป็นรอบแก้ไขเดียวได้ หากจะเริ่มออกแบบหน้าใหม่ภายหลัง ค่อยใช้ `$impeccable init` บันทึกบริบทผลิตภัณฑ์เพิ่มเติม รอบ audit นี้ใช้ระบบเดิมจาก `docs/design.md` และโค้ด ไม่จำเป็นต้องหยุดเพราะยังไม่มี PRODUCT.md

## ขอบเขตและข้อจำกัด

ตรวจ source ใต้ `src/` และ browser แบบ desktop/mobile emulation บน dev server `localhost:3001` โดยเน้นหน้าแรก รายละเอียดงาน ฟอร์มขั้นแรก/validation และค้นหาใบสมัคร ไม่ได้ตรวจทุกหน้า/ทุกสถานะหรือส่งใบสมัครใหม่จนจบในรอบนี้ ไม่ได้แก้โค้ด UI

ไม่ได้ทดสอบบนมือถือจริงหรือสังเคราะห์ touch gesture, screen reader, OS reduced-motion ที่เปลี่ยนค่าจริง, text-only zoom 200%, production Lighthouse/CWV หรือวัด bundle/network ภายใต้ throttling การเปลี่ยน viewport พิสูจน์ได้เฉพาะ layout จึงไม่สรุปว่าการสัมผัสหรือ WCAG ทุกข้อผ่าน

รอบนี้เพิ่มเฉพาะสกิล รายงาน และหลักฐาน จึงไม่รัน build/test ซ้ำสำหรับ application ที่ไม่ได้เปลี่ยน


## รอบแก้ไขตามรายงานรีวิว UI (15 ตุลาคม 2026)
- ตัวอักษรไทย: เพิ่ม type scale ใน `tokens.css` (`--fs-xs` 13px, `--fs-sm` 14px, `--fs-base` 15px, `--fs-md` 16px) ข้อความระดับเนื้อหาทั้งหมดไม่ต่ำกว่า 14px, ยกเลิก letter-spacing ติดลบกับหัวข้อไทย, เพิ่ม fallback "Leelawadee UI", Tahoma และใช้ฟอนต์ที่มี ฿ แทน Arial ล้วน, ตัด `overflow-wrap: anywhere`, ใช้ `text-wrap: balance/pretty`
- โปสเตอร์: ปรับสีตัวอักษร/พื้นให้ผ่าน detector, เอาปีและวันที่ออกจากโปสเตอร์เพื่อไม่ให้ปน ค.ศ./พ.ศ. (วันที่แสดงเป็น พ.ศ. ที่ตัวการ์ด), ตัวหนังสือเล็กสุด 11px, ย้ายต้นปาล์มไม่ให้ทับชื่องาน
- การเข้าถึง: วงโฟกัสสีขาวบน hero, ย้ายปุ่มล้างตัวกรองออกจาก `role="status"`, ใส่ `role="group"` ให้แท็บประเภทและปุ่มสลับมุมมอง, แก้ลำดับหัวข้อหน้าสมัครและสรุปงาน
- ฟอร์มสมัคร: จัดกลุ่ม fieldset/legend, ย้ายประเภทการแข่งขันและขนาดเสื้อขึ้นก่อน, โฟกัสและประกาศสถานะหลังเพิ่มผู้สมัคร, ลบแล้วเลิกทำได้, เตือนก่อนออกจากหน้า, autocomplete/inputMode เฉพาะขั้นตอนที่อยู่, คำอธิบาย * ทุกขั้นที่มีช่องบังคับ, "(เสร็จแล้ว)" สำหรับ screen reader
- ประสิทธิภาพ: ไม่โหลด ScrollTrigger แล้ว (ใช้ IntersectionObserver) และโหลด ScrollToPlugin เมื่อต้องเลื่อนหน้าเท่านั้น
- เลย์เอาต์: hero ใช้โครงสร้างจริง (`hero-stage` + การ์ดค้นหาใน flow) แทน margin-bottom 180px, ลบปุ่ม CTA ซ้ำใน hero, ลบไอคอนบนหัวข้อหน้า find-order/how-to-register/about
- `artifacts/impeccable-detect.json` สร้างใหม่จาก detector; `.info-note` ยังคงเดิมตามที่ตัดสินใจ
