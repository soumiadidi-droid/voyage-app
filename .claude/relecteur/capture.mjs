// Capture d'écran d'une page du site, pour l'agent relecteur (11/09/2026).
//
// Pilote Chrome directement plutôt que via `--screenshot` : ce dernier ne capture que la hauteur de
// la fenêtre, et la grande photo d'accueil fait 100 % de l'écran, donc les sections du dessous
// n'apparaissaient jamais. Ici on photographie une zone précise ou la page entière.
//
// Usage :
//   node capture.mjs <adresse> <sortie.png> [--largeur 1440] [--hauteur 900] [--mobile] [--sombre]
//                    [--ancre "texte visible"] [--pleine]
//
//   --mobile   largeur 390 et comportement téléphone
//   --sombre   simule un téléphone/ordinateur réglé en mode sombre
//   --ancre    commence la capture juste au-dessus du premier élément contenant ce texte
//   --pleine   capture toute la page (sinon : une hauteur d'écran)
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const [url, out] = args;
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : def;
};
const flag = (name) => args.includes(name);
if (!url || !out) {
  console.log('Usage : node capture.mjs <adresse> <sortie.png> [--largeur 1440] [--hauteur 900] [--mobile] [--sombre] [--ancre "texte"] [--pleine]');
  process.exit(1);
}

const mobile = flag("--mobile");
const width = Number(opt("--largeur", mobile ? 390 : 1440));
const height = Number(opt("--hauteur", mobile ? 844 : 900));
const anchor = opt("--ancre");
// Port et profil propres à chaque capture : plusieurs captures peuvent tourner en même temps.
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "relecteur-chrome-"));
const chrome = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${width},${height}`, "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Chrome sans fenêtre a tendance à ne jamais se fermer seul : garde-fou à 60 s.
const guard = setTimeout(() => {
  console.log("ERREUR délai dépassé (60 s)");
  chrome.kill("SIGKILL");
  process.exit(2);
}, 60000);

try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(250);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  if (!target) throw new Error("Chrome ne répond pas");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) {
    await send("Emulation.setUserAgentOverride", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
  }
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: flag("--sombre") ? "dark" : "light" }],
  });
  await send("Page.navigate", { url });
  await sleep(7000); // laisse passer les fondus et le compteur animé de l'accueil

  const r = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const txt = ${JSON.stringify(anchor ?? null)};
      let top = 0;
      if (txt) {
        const el = [...document.querySelectorAll("h1,h2,h3,h4,p,span,a,button,li")].find((n) => n.textContent.includes(txt));
        if (!el) return { missing: true };
        top = el.getBoundingClientRect().top + window.scrollY;
      }
      return { top, total: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth };
    })()`,
  });
  const v = r.result.result.value;
  if (v.missing) throw new Error(`texte d'ancrage introuvable : ${anchor}`);
  const y = anchor ? Math.max(0, v.top - 140) : 0;
  const h = Math.min(flag("--pleine") ? v.total - y : Math.min(height, v.total - y), 16000);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y, width, height: h, scale: 1 },
  });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log(`OK ${out} — ${width}x${Math.round(h)}, page de ${v.total}px${v.overflowX ? " — ATTENTION : la page déborde en largeur" : ""}`);
  ws.close();
} catch (e) {
  console.log("ERREUR", e.message);
  process.exitCode = 1;
} finally {
  clearTimeout(guard);
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
