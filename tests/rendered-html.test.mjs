import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the private letter shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>给你的一封信<\/title>/);
  assert.match(html, /name="robots" content="noindex, nofollow, nocache"/i);
  assert.match(html, /正在取出信件/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps all editable letter content in one five-section config", async () => {
  const config = await readFile(new URL("../app/letter-config.ts", import.meta.url), "utf8");
  const interactions = [...config.matchAll(/interaction: "([a-z]+)"/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(interactions, ["star", "brush", "hold", "bookmark", "seal"]);
  assert.match(config, /recipient: "\[对方称呼\]"/);
  assert.match(config, /sender: "\[你的署名\]"/);
  assert.match(config, /accessPhraseHash:/);
  assert.doesNotMatch(config, /https?:\/\//);
});

test("ships without starter UI or remote visual dependencies", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /localStorage/);
  assert.match(page, /crypto\.subtle\.digest/);
  assert.match(page, /prefers-reduced-motion|quiet-next|onKeyDown/);
  assert.match(layout, /index:\s*false/);
  assert.doesNotMatch(layout, /next\/font|codex-preview/);
  assert.doesNotMatch(css, /url\(|https?:\/\//);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
  await access(new URL("../本地阅读说明.txt", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(root);
});
