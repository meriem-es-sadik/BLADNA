import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9335;
const PROFILE = join(tmpdir(), `bladna-chrome-photos-${Date.now()}`);
const BASE = "http://localhost:4173";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--window-size=1440,1200",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPageTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      /* not ready */
    }
    await sleep(250);
  }
  throw new Error("Chrome debugging endpoint did not start");
}

let nextId = 1;
function createClient(ws) {
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
}

async function evaluate(send, expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result.value;
}

const cardReport = `(() => {
  const cards = [...document.querySelectorAll('article')];
  const imgs = cards.map((card) => card.querySelector('img')).filter(Boolean);
  const loaded = imgs.filter((img) => img.complete && img.naturalWidth > 0);
  const broken = imgs.filter((img) => img.complete && img.naturalWidth === 0);
  const badges = [...document.querySelectorAll('span')]
    .map((node) => node.textContent.trim())
    .filter((text) => /Illustrative/i.test(text));
  return {
    cards: cards.length,
    images: imgs.length,
    loaded: loaded.length,
    broken: broken.length,
    illustrativeBadges: [...new Set(badges)].slice(0, 4),
    samples: imgs.slice(0, 4).map((img) => ({
      src: img.getAttribute('src'),
      alt: img.alt,
      loaded: img.complete && img.naturalWidth > 0,
    })),
  };
})()`;

try {
  const target = await getPageTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const send = createClient(ws);
  await send("Page.enable");
  await send("Runtime.enable");

  for (const slug of ["casablanca", "chefchaouen"]) {
    await send("Page.navigate", { url: `${BASE}/cities/${slug}` });
    await sleep(6000);
    console.log(`\n### ${slug} hotels`);
    console.log(JSON.stringify(await evaluate(send, cardReport)));

    for (const label of ["Restaurants", "Activities"]) {
      await evaluate(
        send,
        `(() => {
          const button = [...document.querySelectorAll('button')].find((node) => node.textContent.trim().startsWith(${JSON.stringify(label)}));
          if (button) button.click();
          return Boolean(button);
        })()`
      );
      await sleep(7000);
      console.log(`\n### ${slug} ${label.toLowerCase()}`);
      console.log(JSON.stringify(await evaluate(send, cardReport)));
    }

    await evaluate(
      send,
      `(() => {
        const button = [...document.querySelectorAll('button')].find((node) => node.textContent.trim().startsWith('Hotels'));
        if (button) button.click();
        return Boolean(button);
      })()`
    );
    await sleep(4000);
    await evaluate(
      send,
      `(() => {
        const button = [...document.querySelectorAll('button')].find((node) => /View Details/i.test(node.textContent));
        if (button) button.click();
        return Boolean(button);
      })()`
    );
    await sleep(2000);
    await evaluate(
      send,
      `(() => {
        const img = [...document.querySelectorAll('img')].find((node) => /photo|Illustrative/i.test(node.alt));
        if (img) img.scrollIntoView({ block: 'center' });
        return Boolean(img);
      })()`
    );
    await sleep(3000);
    console.log(`\n### ${slug} first hotel details gallery`);
    console.log(
      JSON.stringify(
        await evaluate(
          send,
          `(() => {
            const imgs = [...document.querySelectorAll('img')].filter((img) => img.alt);
            const loaded = imgs.filter((img) => img.complete && img.naturalWidth > 0);
            const badges = [...document.querySelectorAll('span')]
              .map((node) => node.textContent.trim())
              .filter((text) => /Illustrative/i.test(text));
            return {
              images: imgs.length,
              loaded: loaded.length,
              illustrativeBadges: [...new Set(badges)].slice(0, 4),
              samples: imgs.slice(0, 3).map((img) => ({
                src: img.getAttribute('src'),
                alt: img.alt,
                loaded: img.complete && img.naturalWidth > 0,
              })),
            };
          })()`
        )
      )
    );
  }

  ws.close();
} finally {
  chrome.kill();
  await sleep(500);
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
}
