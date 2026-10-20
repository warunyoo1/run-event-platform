import test from "node:test";
import assert from "node:assert/strict";
import { addressDistricts, addressSubdistricts, updateAddress } from "../src/lib/thai-address.ts";
import { provinces } from "../src/lib/registration.ts";

test("every province has districts and subdistricts with postal codes", () => {
  for (const province of provinces) {
    assert.ok(addressDistricts(province).length, province);
    for (const district of addressDistricts(province)) {
      const entries = addressSubdistricts(province, district);
      assert.ok(entries.length, `${province}/${district}`);
      assert.ok(entries.every(([name, postal]) => name && /^\d{5}$/.test(postal)));
    }
  }
});

test("address choices cascade, fill postal code and clear dependent selections", () => {
  const original = { province: "สุโขทัย", district: "เมืองสุโขทัย", subdistrict: "เมืองเก่า", postalCode: "64210", street: "123" };
  assert.ok(addressDistricts(original.province).includes(original.district));
  assert.ok(!addressDistricts("กรุงเทพมหานคร").includes(original.district));
  assert.equal(updateAddress({ ...original, postalCode: "" }, "subdistrict", "เมืองเก่า").postalCode, "64210");
  assert.deepEqual(updateAddress(original, "province", "กรุงเทพมหานคร"), { ...original, province: "กรุงเทพมหานคร", district: "", subdistrict: "", postalCode: "" });
  assert.deepEqual(updateAddress(original, "district", "ศรีสำโรง"), { ...original, district: "ศรีสำโรง", subdistrict: "", postalCode: "" });
  assert.deepEqual(addressSubdistricts("สุโขทัย", "พระนคร"), []);
});
