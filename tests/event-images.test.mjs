import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import React from "react";
import { localeComponents } from "./render-i18n.mjs";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const file = new URL("../src/components/event-image-sections.tsx", import.meta.url);
const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, require: (name) => name === "@/i18n/client" ? localeComponents : createRequire(file)(name) });
const render = (images) => renderToStaticMarkup(React.createElement(localeComponents.LocaleProvider, null, React.createElement(exports.EventImageSections, { event: { images } })));
const picture = (kind, id, sortOrder = 0) => ({ kind, id, sortOrder, alt: "", url: `/images/${id}.jpg` });

test("detail includes every secondary image kind, with stable order and full-size links", () => {
  const images = [picture("cover", "primary"), picture("cover", "extra"), ...["poster", "route_map", "shirt", "medal", "gallery", "sponsor", "other", "future_kind"].map((kind) => picture(kind, kind)), picture("gallery", "gallery-first", -1)];
  const before = JSON.stringify(images);
  const html = render(images);
  assert.ok(!html.includes('/images/primary.jpg'));
  for (const image of images.slice(1)) assert.ok(html.includes(image.url), image.kind);
  assert.ok(html.indexOf('/images/gallery-first.jpg') < html.indexOf('/images/gallery.jpg'));
  assert.equal((html.match(/target="_blank"/g) || []).length, images.length - 1);
  assert.equal(JSON.stringify(images), before);
});

test("empty categories are omitted and a lone poster remains available uncropped", () => {
  assert.ok(!render([]).includes('<section'));
  assert.ok(!render([picture("cover", "only")]).includes('<section'));
  const html = render([picture("poster", "poster")]);
  assert.ok(html.includes('event-media-poster'));
  assert.ok(html.includes('/images/poster.jpg'));
  assert.ok(!html.includes('event-media-shirt'));
});
