import test from "node:test";
import assert from "node:assert/strict";
import { raceAvailability } from "../src/lib/events.ts";
test("unlimited capacity ignores the numeric compatibility quota", () => {
 assert.equal(raceAvailability({ quota: 1, remaining: 0, unlimitedQuota: true }), "ไม่จำกัดจำนวน");
});
test("finite capacity displays remaining seats and sold out", () => {
 assert.equal(raceAvailability({ quota: 500, remaining: 12 }), "เหลือ 12 คน");
 assert.equal(raceAvailability({ quota: 500, remaining: 0 }), "เต็มแล้ว");
 assert.equal(raceAvailability({ quota: 500 }), "เหลือ 500 คน");
});
