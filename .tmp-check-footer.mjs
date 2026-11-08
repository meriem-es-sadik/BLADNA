import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const PROFILE = join(tmpdir(), `bladna-chrome-footer-${Date.now()}`);
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
    "--window-size=1440,900",
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

const routes = [
  ["home", "/"],
  ["destinations", "/destinations"],
  ["cities", "/cities"],
  ["casablanca", "/cities/casablanca"],
  ["chefchaouen", "/cities/chefchaouen"],
];

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

  for (const [name, path] of routes) {
    await send("Page.navigate", { url: `${BASE}${path}` });
    await sleep(4500);
    const initial = await evaluate(
      send,
      `(() => {
        const footer = document.querySelector('footer');
        const pageRoot = footer?.previousElementSibling;
        const footerRect = footer?.getBoundingClientRect();
        const rootRect = pageRoot?.getBoundingClientRect();
        return {
          path: location.pathname,
          innerHeight: window.innerHeight,
          scrollY: window.scrollY,
          docHeight: document.documentElement.scrollHeight,
          footerTop: footerRect ? Math.round(footerRect.top) : null,
          footerPosition: footer ? getComputedStyle(footer).position : null,
          pageRootHeight: rootRect ? Math.round(rootRect.height) : null,
          footerBelowFold: footerRect ? footerRect.top >= window.innerHeight - 1 : null,
        };
      })()`
    );
    await evaluate(send, "window.scrollTo(0, document.documentElement.scrollHeight)");
    await sleep(700);
    const scrolled = await evaluate(
      send,
      `(() => {
        const footer = document.querySelector('footer');
        const rect = footer?.getBoundingClientRect();
        return {
          scrollY: Math.round(window.scrollY),
          footerTop: rect ? Math.round(rect.top) : null,
          footerBottom: rect ? Math.round(rect.bottom) : null,
          footerVisible: rect ? rect.top < window.innerHeight && rect.bottom > 0 : null,
        };
      })()`
    );
    console.log(JSON.stringify({ name, initial, scrolled }));
  }

  ws.close();
} finally {
  chrome.kill();
  await sleep(500);
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
}
