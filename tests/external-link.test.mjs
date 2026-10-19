import test from "node:test";
import assert from "node:assert/strict";
import { externalWebLink } from "../src/lib/external-link.ts";
test("organizer links accept http/https and safely fall back for unsafe stored values", () => {
  assert.equal(externalWebLink(" https://maps.app.goo.gl/example "), "https://maps.app.goo.gl/example");
  for (const value of [undefined, "", "invalid", "javascript:alert(1)", "data:text/html,test", "//example.com"]) assert.equal(externalWebLink(value), undefined);
});
