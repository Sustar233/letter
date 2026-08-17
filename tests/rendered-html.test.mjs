import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the private starlit letter shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>写给另一颗星<\/title>/);
  assert.match(html, /name="robots" content="noindex, nofollow, nocache"/i);
  assert.match(html, /星光正在抵达/);
  assert.match(html, /我们曾短暂地经过彼此的世界/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps editable copy, media slots and both endings in one content file", async () => {
  const config = await readFile(new URL("../src/content/letter.ts", import.meta.url), "utf8");
  assert.match(config, /intro:/);
  assert.match(config, /apology:/);
  assert.match(config, /calm:/);
  assert.match(config, /blessing:/);
  assert.match(config, /choice:/);
  assert.match(config, /endings:/);
  assert.match(config, /如果故事还有下一页/);
  assert.match(config, /src: ""/);
  assert.doesNotMatch(config, /https?:\/\//);
});

test("ships responsive, keyboard-friendly and without starter UI", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /localStorage/);
  assert.match(page, /role="tab"/);
  assert.match(page, /type="button"/);
  assert.match(page, /pointerType/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 768px\)/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(layout, /next\/font|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../本地阅读说明.txt", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(root);
});
