import test from "node:test";
import assert from "node:assert/strict";
import { translateUiText } from "../src/i18n/translate.ts";

test("English labels and Thai fallback preserve surrounding spaces", () => {
 assert.equal(translateUiText(" ค้นหา ", "en"), " Search ");
 assert.equal(translateUiText("ค้นหา", "th"), "ค้นหา");
 assert.equal(translateUiText("Organizer's custom event text 🏃", "en"), "Organizer's custom event text 🏃");
});
test("English dates use Gregorian years and localize availability", () => {
 assert.equal(translateUiText("30 มกราคม 2570", "en"), "30 January 2027");
 assert.equal(translateUiText("มกราคม 2570", "en"), "January 2027");
 assert.equal(translateUiText("เหลือ 1,000 คน", "en"), "1,000 places left");
 assert.equal(translateUiText("5 KM — ฿279 · ไม่จำกัดจำนวน", "en"), "5 KM — ฿279 · Unlimited");
 assert.equal(translateUiText("เลือกขนาดเสื้อ", "en"), "Select shirt size");
});
