import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer";

/** 与页面文案的契约(变更文案会让断言红,这是刻意的) */
export const BOOT_CMD = "init --workspace";
export const SUBTITLE = "Innovation in progress.";
export const H1_LINE1 = "Building What Matters,";
export const H1_LINE2 = "Powered by AI.";
export const AVATAR_TOGGLE_LABEL = "Toggle avatar between ASCII art and photo";
export const CHROME_ASCII = "~/harold/avatar.ascii";
export const CHROME_PHOTO = "~/harold/avatar.jpg";

/** 五个 section 的 prompt(main > section 顺序,hero 之后) */
export const SECTION_PROMPTS = [
  { path: "~/projects", command: "--list" },
  { path: "~/repos", command: "ls --starred" },
  { path: "~/career", command: "ls --graph" },
  { path: "~/crafts", command: "ls --future" },
  { path: "~/social", command: "show --all" },
];

export const OUTPUT_DIR = resolve("tests/e2e/output");

export function launchBrowser() {
  return puppeteer.launch({ headless: true });
}

/**
 * 打开一个按档位配置好的页面。全部用例默认拦掉非本机请求:
 * 套件可离线重复执行,截图不受远程字体/图片可用性影响。
 *
 * 每个页面挂在独立的 incognito context 里(page.__context,随 closePage 关闭):
 * localStorage 在同一 profile 内跨页面泄漏,主题用例写入的 theme
 * 会污染后续"默认暗色"页面。
 */
export async function newPage(browser, opts = {}) {
  const {
    width = 1440,
    height = 900,
    mobile = false,
    reducedMotion = false,
    theme, // 'light' | 'dark' | undefined(站点默认 dark)
    js = true,
    // 阻断全部同源 <script> 网络请求(内联脚本不受影响,不走网络):
    // 用于复现「应用 chunk 加载失败/hydration 永不到来」场景(F-1 watchdog)
    blockScripts = false,
    // 细粒度请求拦截:(req) => boolean,true 则 abort。在 blockScripts 之前判定,
    // 用于只阻断某一个懒加载 chunk(如 F-2 的 charfield engine)而不阻断整个应用 bundle
    shouldBlockRequest = null,
  } = opts;

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.__context = context;

  const logs = [];
  page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
  page.__logs = logs;

  await page.setViewport({
    width,
    height,
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: 1,
  });
  if (reducedMotion) {
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  }
  if (!js) {
    await page.setJavaScriptEnabled(false);
  } else {
    if (theme) {
      await page.evaluateOnNewDocument((t) => {
        localStorage.setItem("theme", t);
      }, theme);
    }
    // 仪表(注在页面脚本之前):WebGL 上下文计数 + 布局跳动累计
    await page.evaluateOnNewDocument(() => {
      window.__webglContexts = 0;
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        const ctx = orig.call(this, type, ...rest);
        if (ctx && String(type).startsWith("webgl")) window.__webglContexts += 1;
        return ctx;
      };
      window.__cls = 0;
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) window.__cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        /* 环境不支持 layout-shift 时 __cls 恒 0 */
      }
    });
  }

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const { hostname } = new URL(req.url());
    if (hostname !== "127.0.0.1" && hostname !== "localhost") {
      req.abort();
      return;
    }
    if (shouldBlockRequest && shouldBlockRequest(req)) {
      req.abort();
      return;
    }
    if (blockScripts && req.resourceType() === "script") {
      req.abort();
      return;
    }
    req.continue();
  });

  return page;
}

/** 关闭页面及其独立 context(newPage 的配套收尾) */
export async function closePage(page) {
  if (!page) return;
  await page.close().catch(() => {});
  await page.__context?.close().catch(() => {});
}

/**
 * Hero 终态判定(整段在页面里执行,只看渲染结果):
 * 徽章命令打满、caret 退场、H1 两行 + 副标题 + 描述 + 头像卡片有效不透明度≈1、
 * data-boot 已摘除。未达标时返回 why 供定位。
 */
export function heroFinalState() {
  const CMD = "init --workspace";
  const SUB = "Innovation in progress.";
  const LINE1 = "Building What Matters,";
  const LINE2 = "Powered by AI.";
  const doc = document;
  const fail = (why) => ({ ok: false, why });

  if (doc.documentElement.hasAttribute("data-boot")) return fail("data-boot 仍在");
  const hero = doc.querySelector("main section");
  if (!hero) return fail("hero section 缺失");

  // 徽章:active 分支看 overlay(ghost 恒为全文,不能作数),静态分支看 .boot-cmd
  const overlay = hero.querySelector(".inline-flex span.absolute");
  const bootCmd = hero.querySelector(".boot-cmd");
  const typed = (overlay ?? bootCmd)?.textContent ?? "";
  if (typed !== CMD) return fail(`徽章命令未打满:${JSON.stringify(typed)}`);
  if (overlay && overlay.querySelector("span[aria-hidden]")) return fail("徽章 caret 未退场");

  if (hero.querySelector(".boot-cursor-h1")) return fail("H1 光标未退场");
  if (hero.querySelector("span.animate-blink")) return fail("副标题光标未退场");

  // 有效不透明度:文本载体自身 × 全部祖先(framer 把 opacity 写在中间层)
  const effOpacity = (el) => {
    let o = 1;
    for (let n = el; n && n !== doc.documentElement; n = n.parentElement) {
      o *= parseFloat(getComputedStyle(n).opacity || "1");
    }
    return o;
  };
  // 找包含 text 的最深元素(两种渲染分支下都指到真正的文字载体)
  const deepestWith = (root, text) => {
    if (!root.textContent.includes(text)) return null;
    let el = root;
    let descend = true;
    while (descend) {
      descend = false;
      for (const c of el.children) {
        if (c.textContent.includes(text)) {
          el = c;
          descend = true;
          break;
        }
      }
    }
    return el;
  };

  for (const [label, text] of [
    ["H1 第一行", LINE1],
    ["H1 第二行", LINE2],
    ["描述", "Hi, I'm"],
  ]) {
    const el = deepestWith(hero, text);
    if (!el) return fail(`${label}文本缺失`);
    const o = effOpacity(el);
    if (o < 0.99) return fail(`${label}未完全可见(opacity=${o.toFixed(2)})`);
  }
  // 副标题:解密完成 = 明文在场;其容器带设计基线 opacity-40,检查时跳过该层
  const sub = deepestWith(hero, SUB);
  if (!sub) return fail("副标题明文缺失(解密未完成?)");
  {
    let o = 1;
    for (let n = sub; n && n !== doc.documentElement; n = n.parentElement) {
      const v = parseFloat(getComputedStyle(n).opacity || "1");
      if (Math.abs(v - 0.4) < 0.02) continue; // 设计基线 opacity-40
      o *= v;
    }
    if (o < 0.99) return fail(`副标题被额外隐藏(opacity=${o.toFixed(2)})`);
  }

  // 头像卡片:chrome 标题在场,内容层(ascii pre 或 canvas)完全可见
  const chromeTitle = deepestWith(hero, "~/harold/avatar");
  if (!chromeTitle) return fail("卡片 chrome 标题缺失");
  if (effOpacity(chromeTitle) < 0.99) return fail("卡片 chrome 未完全可见");
  const media = hero.querySelector("canvas") ?? hero.querySelector("pre");
  if (!media) return fail("卡片内容层缺失(无 canvas 也无 pre)");
  if (effOpacity(media.parentElement) < 0.99) return fail("卡片内容层未完全可见");

  return { ok: true };
}

/**
 * 页面侧 rAF 轮询直到 Hero 终态,返回 { ok, t(performance.now), cls } 或 { ok:false, why }。
 * t 以 navigationStart 为原点,boot 完成性 case 直接拿它对 1.5s 预算。
 */
export async function pollHeroFinal(page, timeoutMs = 8000) {
  return page.evaluate(
    async (src, timeout) => {
      const check = new Function(`return (${src})();`);
      return await new Promise((resolve) => {
        const tick = () => {
          const r = check();
          if (r.ok) {
            const paint = performance
              .getEntriesByType("paint")
              .find((e) => e.name === "first-contentful-paint");
            resolve({
              ok: true,
              t: performance.now(),
              fcp: paint ? paint.startTime : 0,
              cls: window.__cls ?? 0,
            });
          } else if (performance.now() > timeout) {
            resolve({ ok: false, why: r.why });
          } else {
            requestAnimationFrame(tick);
          }
        };
        tick();
      });
    },
    heroFinalState.toString(),
    timeoutMs
  );
}

export async function waitForHeroFinal(page, timeoutMs = 8000) {
  const res = await pollHeroFinal(page, timeoutMs);
  if (!res.ok) throw new Error(`Hero 未达终态:${res.why}`);
  return res;
}

export function gotoHome(page, baseUrl) {
  // domcontentloaded 即返回,轮询尽早入场,不等远程资源超时
  return page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
}

/** 用例失败时留现场:整页截图 + 页面控制台日志,并把路径挂进错误信息 */
export async function withArtifacts(page, name, fn) {
  try {
    await fn();
  } catch (err) {
    const dir = resolve(OUTPUT_DIR, "failures");
    mkdirSync(dir, { recursive: true });
    const shotPath = resolve(dir, `${name}.png`);
    const logPath = resolve(dir, `${name}.console.log`);
    let shotNote = shotPath;
    try {
      await page.screenshot({ path: shotPath, fullPage: true });
    } catch (e) {
      shotNote = `截图失败:${e.message}`;
    }
    writeFileSync(logPath, (page.__logs ?? []).join("\n") + "\n");
    err.message += `\n[e2e] 失败截图:${shotNote}\n[e2e] 页面控制台:${logPath}`;
    throw err;
  }
}

/** 截图前冻结常驻 CSS 动画(绿点脉冲等),消除相位随机性 */
export async function freezeAnimations(page) {
  await page.addStyleTag({
    content:
      "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
  });
}

/**
 * 等字符场画布停帧:连续两次元素截图逐字节一致才算稳。
 * 引擎稳态且指针离场会停 RAF,这里用渲染结果黑盒确认。
 */
export async function waitForCanvasStable(page, { tries = 25, gapMs = 200 } = {}) {
  const canvas = await page.$("canvas");
  if (!canvas) throw new Error("页面上没有 canvas,无法等待字符场停帧");
  let prev = await canvas.screenshot();
  for (let i = 0; i < tries; i++) {
    await new Promise((r) => setTimeout(r, gapMs));
    const cur = await canvas.screenshot();
    if (Buffer.compare(prev, cur) === 0) return;
    prev = cur;
  }
  throw new Error(`字符场 ${tries} 次采样内未停帧(每次间隔 ${gapMs}ms)`);
}
