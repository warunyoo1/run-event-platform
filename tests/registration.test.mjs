import test from "node:test";
import assert from "node:assert/strict";
import { displayName } from "../src/lib/events.ts";
import { events } from "./fixtures/events.ts";
import { emptyParticipant, emptyDelivery, validateParticipant, validateDelivery, registrationTotal, createDemoReceipt, provinces } from "../src/lib/registration.ts";

const event = events[0];
const participant = () => ({ ...emptyParticipant(), firstName: "ทดสอบ", lastName: "สมัครวิ่ง", gender: "ไม่ระบุ", birthDay: "29", birthMonth: "2", birthYear: "2000", phone: "0812345678", race: "5 KM", size: "M", province: "กรุงเทพมหานคร" });

test("required participant fields and event-specific race are validated", () => {
  assert.ok(Object.keys(validateParticipant(emptyParticipant(), event)).length > 5);
  assert.deepEqual(validateParticipant(participant(), event, "2026-10-15"), {});
  assert.ok(validateParticipant({ ...participant(), race: "21 KM" }, event).race);
});
test("birthday rejects impossible calendar dates and future dates", () => {
  assert.ok(validateParticipant({ ...participant(), birthYear: "2001" }, event, "2026-10-15").birthDate);
  assert.ok(validateParticipant({ ...participant(), birthYear: "2032" }, event, "2026-10-15").birthDate);
  assert.equal(validateParticipant(participant(), event, "2026-10-15").birthDate, undefined);
});
test("optional fields may be omitted, while invalid phone/email and disclosed identity are caught", () => {
  const errors = validateParticipant({ ...participant(), phone: "123", email: "bad", identity: "123" }, event);
  assert.ok(errors.phone); assert.ok(errors.email); assert.ok(errors.identity);
  assert.equal(validateParticipant({ ...participant(), identity: "123", declineIdentity: true }, event).identity, undefined);
});
test("shipping address is required only when shipping is selected", () => {
  const delivery = { ...emptyDelivery(), contact: "ผู้ติดต่อทดสอบ", phone: "0812345678" };
  assert.deepEqual(validateDelivery(delivery), {});
  assert.ok(validateDelivery({ ...delivery, method: "shipping" }).street);
  assert.deepEqual(validateDelivery({ ...delivery, method: "shipping", street: "99 ถนนตัวอย่าง", subdistrict: "สวนหลวง", district: "สวนหลวง", province: "กรุงเทพมหานคร", postalCode: "10250" }), {});
});
test("each participant uses the chosen event price and shipping is charged once per order", () => {
  const group = [participant(), { ...participant(), race: "10 KM" }];
  assert.deepEqual(registrationTotal(event, group, "pickup"), { subtotal: 998, shipping: 0, total: 998 });
  assert.deepEqual(registrationTotal(event, group, "shipping"), { subtotal: 998, shipping: 50, total: 1048 });
});
test("demo receipt contains no participant contact, identity, birthday, health or address", () => {
  const receipt = createDemoReceipt(event, [{ ...participant(), identity: "1234567890123", medical: "ข้อมูลสุขภาพสมมติ" }], { ...emptyDelivery(), contact: "ชื่อผู้ติดต่อ", street: "ที่อยู่ส่วนตัว" });
  assert.deepEqual(Object.keys(receipt).sort(), ["reference", "eventSlug", "races", "amount", "delivery", "createdAt", "status"].sort());
  assert.deepEqual(receipt.races, [{ race: "5 KM", size: "M" }]);
  assert.equal(receipt.status, "pending");
  assert.match(receipt.reference, /^DEMO-[A-F0-9]{8}$/);
  assert.ok(!JSON.stringify(receipt).includes("1234567890123"));
  assert.equal(provinces.length, 77);
});

test("event names show Buddhist Era years only", () => {
  assert.equal(displayName(events[0]), "Bangkok Morning Run 2570");
  for (const e of events) assert.doesNotMatch(displayName(e), /\b20\d{2}\b/);
});
