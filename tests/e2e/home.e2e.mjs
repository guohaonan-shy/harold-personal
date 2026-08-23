import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, inject, test } from "vitest";
import {
  AVATAR_TOGGLE_LABEL,
  BOOT_CMD,
  CHROME_ASCII,
  CHROME_PHOTO,
  H1_LINE1,
  H1_LINE2,
  SECTION_PROMPTS,
  SUBTITLE,
  closePage,
  gotoHome,
  launchBrowser,
  newPage,
  pollHeroFinal,
  waitForHeroFinal,
  withArtifacts,
} from "./lib/harness.mjs";

const baseUrl = inject("baseUrl");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @type {import('puppeteer').Browser} */
let browser;
/** @type {import('puppeteer').Page | null} */
let page;

beforeAll(async () => {
  browser = await launchBrowser();
  // 预热:冷启动的首次导航带 JIT/缓存开销,会污染 boot 计时
  const warm = await newPage(browser);
  await gotoHome(warm, baseUrl);
  await waitForHeroFinal(warm);
  await closePage(warm);
});

afterAll(async () => {
  await browser?.close();
});

afterEach(async () => {
  await closePage(page);
  page = null;
});

describe("首页动效系统(spec home-motion-upgrade §5)", () => {
  test("1. boot 完成性:桌面加载 ≤1.5s 达终态,过程无布局跳动", async () => {
    page = await newPage(browser);
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "boot-completeness", async () => {
      const res = await pollHeroFinal(page);
      expect(res.ok, `未达终态:${res.why}`).toBe(true);
      // 1.5s 预算的原点是访客可感知的加载起点(首次内容绘制),
      // 不含网络/解析开销——spec 约束的是 boot 编排本身的时长
      expect(res.fcp, "拿不到 first-contentful-paint").toBeGreaterThan(0);
      expect(res.t - res.fcp, "boot 终态耗时(自首次内容绘制)").toBeLessThanOrEqual(1500);
      // 终态后不再变化:400ms 后重新判定仍为终态,且 hero 文本不变
      const textBefore = await page.$eval("main section", (el) => el.innerText);
      await sleep(400);
      const again = await pollHeroFinal(page, 100);
      expect(again.ok, `终态后出现回退:${again.why}`).toBe(true);
      const textAfter = await page.$eval("main section", (el) => el.innerText);
      expect(textAfter).toBe(textBefore);
      // 布局跳动:累计 layout shift 应约等于 0(编排全程只动 opacity/transform)
      expect(again.cls).toBeLessThan(0.02);
    });
  });

  test("2. 头像解密:hover 照片显现,移开后字符场恢复", async () => {
    page = await newPage(browser);
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "avatar-decrypt", async () => {
      await waitForHeroFinal(page);
      // 细指针档位:字符场 canvas 在场
      await page.waitForSelector("main section canvas", { timeout: 5000 });

      const charLayerOpacity = () =>
        page.$eval("main section canvas", (c) =>
          parseFloat(getComputedStyle(c.parentElement.parentElement).opacity)
        );
      const chromeTitle = () =>
        page.$eval("main section canvas", (c) => {
          const card = c.closest(".rounded-2xl");
          return card.querySelector("span.flex-1").textContent;
        });

      expect(await charLayerOpacity()).toBeGreaterThan(0.95);
      expect(await chromeTitle()).toBe(CHROME_ASCII);

      await page.hover("main section canvas");
      // 渐隐带 250ms 起步延迟 + 400ms 过渡
      await expect
        .poll(charLayerOpacity, { timeout: 3000, interval: 50 })
        .toBeLessThan(0.05);
      expect(await chromeTitle()).toBe(CHROME_PHOTO);
      // 照片常驻底层
      const photoVisible = await page.$eval(
        "main section canvas",
        (c) => !!c.closest(".rounded-2xl").querySelector('img[src*="avatar"]')
      );
      expect(photoVisible).toBe(true);

      // 移开:字符场恢复
      await page.mouse.move(10, 10);
      await expect
        .poll(charLayerOpacity, { timeout: 3000, interval: 50 })
        .toBeGreaterThan(0.95);
      expect(await chromeTitle()).toBe(CHROME_ASCII);
    });
  });

  test("3. reduced-motion:无打字、无解密、无 settle,直接终态", async () => {
    page = await newPage(browser, { reducedMotion: true });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "reduced-motion", async () => {
      // 采样前 600ms:徽章命令必须从头到尾是全文(打字动画从未发生)
      const samples = await page.evaluate(
        async () =>
          await new Promise((resolve) => {
            const seen = [];
            const start = performance.now();
            const tick = () => {
              const el = document.querySelector(".boot-cmd");
              seen.push(el ? el.textContent : "(active 分支)");
              if (performance.now() - start > 600) resolve(seen);
              else setTimeout(tick, 30);
            };
            tick();
          })
      );
      for (const s of samples) expect(s).toBe(BOOT_CMD);

      // 直接终态(不给 1.5s 编排时间也应立即成立)
      await waitForHeroFinal(page, 3000);
      // data-boot 从未生效(内联脚本对 reduced-motion 不置位)
      expect(
        await page.evaluate(() => document.documentElement.hasAttribute("data-boot"))
      ).toBe(false);
      // 无 settle:reduced-motion 走静态档,不建 WebGL 上下文
      expect(await page.evaluate(() => window.__webglContexts)).toBe(0);
      expect(await page.$("canvas")).toBeNull();
      // 副标题无解密:立即是明文(waitForHeroFinal 已断言),且不曾变化
      const sub1 = await page.evaluate(() =>
        document.querySelector("main section h1 + div").textContent
      );
      await sleep(300);
      const sub2 = await page.evaluate(() =>
        document.querySelector("main section h1 + div").textContent
      );
      expect(sub1).toBe(SUBTITLE);
      expect(sub2).toBe(SUBTITLE);
      // section prompt 不打字:全部立即全文,内容无门控隐藏
      const sections = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll("main > section div.mb-10.font-mono").forEach((el) => {
          list.push(el.textContent.replace(/\s+/g, " ").trim());
        });
        return list;
      });
      expect(sections.length).toBe(SECTION_PROMPTS.length);
      sections.forEach((text, i) => {
        const p = SECTION_PROMPTS[i];
        expect(text.replace(/\s+/g, "")).toBe(`${p.path}harold${p.command}`.replace(/\s+/g, ""));
      });
    });
  });

  test("4. 移动端档位:无 WebGL 上下文,tap 在 ASCII/照片间切换", async () => {
    page = await newPage(browser, { width: 390, height: 844, mobile: true });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "mobile-tier", async () => {
      await waitForHeroFinal(page);
      // 粗指针:静态 ASCII,页面未创建任何 WebGL 上下文
      expect(await page.evaluate(() => window.__webglContexts)).toBe(0);
      expect(await page.$("canvas")).toBeNull();
      await page.waitForSelector("main section pre");

      const toggle = `button[aria-label="${AVATAR_TOGGLE_LABEL}"]`;
      const state = () =>
        page.$eval(toggle, (btn) => ({
          pressed: btn.getAttribute("aria-pressed"),
          title: btn.querySelector("span.flex-1").textContent,
          hasAscii: !!btn.querySelector("pre"),
          hasPhoto: !!btn.querySelector('img[src*="avatar"]'),
        }));

      expect(await state()).toMatchObject({
        pressed: "false",
        title: CHROME_ASCII,
        hasAscii: true,
        hasPhoto: false,
      });

      await page.tap(toggle);
      await expect.poll(state, { timeout: 2000, interval: 50 }).toMatchObject({
        pressed: "true",
        title: CHROME_PHOTO,
        hasAscii: false,
        hasPhoto: true,
      });

      await page.tap(toggle);
      await expect.poll(state, { timeout: 2000, interval: 50 }).toMatchObject({
        pressed: "false",
        title: CHROME_ASCII,
        hasAscii: true,
        hasPhoto: false,
      });

      // 交互全程仍未触发 WebGL
      expect(await page.evaluate(() => window.__webglContexts)).toBe(0);
    });
  });

  test("5. section 语法:prompt 打字一次、内容其后入场、回滚再进不重播", async () => {
    page = await newPage(browser);
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "section-grammar", async () => {
      await waitForHeroFinal(page);

      const promptText = (idx) =>
        page.evaluate((i) => {
          const el = document.querySelectorAll("main > section div.mb-10.font-mono")[i];
          return el ? el.textContent.replace(/\s+/g, "") : null;
        }, idx);

      const fullOf = (p) => `${p.path}harold${p.command}`.replace(/\s+/g, "");

      for (let i = 0; i < SECTION_PROMPTS.length; i++) {
        const full = fullOf(SECTION_PROMPTS[i]);
        // 逐个滚动到 section 的 prompt
        await page.evaluate((idx) => {
          document
            .querySelectorAll("main > section div.mb-10.font-mono")
            [idx].scrollIntoView({ block: "start", behavior: "instant" });
        }, i);

        // 采样打字过程;若滚动路径上该 prompt 已被提前触发,首样本可能已是全文
        const seen = [];
        const deadline = Date.now() + 5000;
        while (Date.now() < deadline) {
          const t = await promptText(i);
          seen.push(t);
          // 打字中途应存在门控中的内容(有效 opacity < 0.3 的文字元素)
          if (t !== full && t !== "" && seen.gatedProbed === undefined) {
            seen.gatedProbed = await page.evaluate((idx) => {
              const section = document.querySelectorAll("main > section")[idx + 1];
              const eff = (el) => {
                let o = 1;
                for (let n = el; n && n !== document.documentElement; n = n.parentElement)
                  o *= parseFloat(getComputedStyle(n).opacity || "1");
                return o;
              };
              for (const el of section.querySelectorAll("*")) {
                if (el.closest("div.mb-10.font-mono")) continue;
                if (!el.textContent.trim() || el.children.length > 0) continue;
                if (el.getClientRects().length === 0) continue;
                if (eff(el) < 0.3) return true;
              }
              return false;
            }, i);
          }
          if (t === full) break;
          await sleep(30);
        }
        expect(seen.at(-1), `section ${i}(${SECTION_PROMPTS[i].path})prompt 未打满`).toBe(full);
        // 观察到中途态的 section:打字期间必须存在被门控的内容
        const partials = seen.filter((t) => t !== full && t !== "");
        if (partials.length > 0) {
          expect(
            seen.gatedProbed,
            `${SECTION_PROMPTS[i].path} 打字期间内容未被门控(应在 prompt 完成后才入场)`
          ).toBe(true);
        }
        // prompt 完成后内容入场:section 里不再有被门控隐藏的文字
        await expect
          .poll(
            () =>
              page.evaluate((idx) => {
                const section = document.querySelectorAll("main > section")[idx + 1];
                const eff = (el) => {
                  let o = 1;
                  for (let n = el; n && n !== document.documentElement; n = n.parentElement)
                    o *= parseFloat(getComputedStyle(n).opacity || "1");
                  return o;
                };
                let hidden = 0;
                for (const el of section.querySelectorAll("*")) {
                  if (!el.textContent.trim() || el.children.length > 0) continue;
                  // 未渲染(自身或祖先 display:none,如桌面上的移动端时间线)不算隐藏内容
                  if (el.getClientRects().length === 0) continue;
                  if (eff(el) < 0.3) hidden++;
                }
                return hidden;
              }, i),
            { timeout: 4000, interval: 100 }
          )
          .toBe(0);
      }

      // 回滚到顶,再逐个进入:prompt 不重播(任何时刻都不该出现部分文本)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await sleep(400);
      for (let i = 0; i < SECTION_PROMPTS.length; i++) {
        const full = fullOf(SECTION_PROMPTS[i]);
        await page.evaluate((idx) => {
          document
            .querySelectorAll("main > section div.mb-10.font-mono")
            [idx].scrollIntoView({ block: "start", behavior: "instant" });
        }, i);
        for (let k = 0; k < 10; k++) {
          expect(await promptText(i), `${SECTION_PROMPTS[i].path} 重播了`).toBe(full);
          await sleep(50);
        }
      }
    });
  });

  test("6. 亮色主题同保真:boot 同样在场,字符场为深色字符", async () => {
    page = await newPage(browser, { theme: "light" });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "light-theme", async () => {
      // 亮色确实生效
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("light")))
        .toBe(true);
      // boot 编排在场:走的是 active 分支(静态 .boot-cmd 不存在),并正常达到终态
      await waitForHeroFinal(page);
      const activeBranch = await page.evaluate(() => !document.querySelector(".boot-cmd"));
      expect(activeBranch, "boot 编排未接管(仍是静态徽章分支)").toBe(true);
      // 字符场在场且已按亮色渲染:浅底深字
      await page.waitForSelector("main section canvas", { timeout: 5000 });
      const canvas = await page.$("main section canvas");
      await sleep(600); // 等主题字符场重绘稳定
      const shot = await canvas.screenshot();
      const { analyzeLuminance } = await import("./lib/png.mjs");
      const { meanLum, darkRatio } = analyzeLuminance(shot);
      expect(meanLum, "亮色主题下字符场应是浅色底").toBeGreaterThan(0.6);
      expect(darkRatio, "亮色主题下应存在深色字符").toBeGreaterThan(0.002);
    });
  });

  test("7. 无 JS 降级:全部文案与静态 ASCII 头像可见,无空白区域", async () => {
    page = await newPage(browser, { js: false });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "no-js", async () => {
      const res = await page.evaluate(
        (line1, line2, subtitle, cmd) => {
          const fails = [];
          if (document.documentElement.hasAttribute("data-boot"))
            fails.push("data-boot 被置位(内联脚本不该在无 JS 下生效)");

          const eff = (el) => {
            let o = 1;
            for (let n = el; n && n !== document.documentElement; n = n.parentElement)
              o *= parseFloat(getComputedStyle(n).opacity || "1");
            return o;
          };

          // Hero 文案齐全且可见
          const hero = document.querySelector("main section");
          for (const text of [line1, line2, subtitle, "Hi, I'm", cmd]) {
            if (!hero.textContent.includes(text)) fails.push(`hero 文案缺失:${text}`);
          }
          // 静态 ASCII 头像在场(无 JS 下无 canvas,pre 内容量足)
          if (document.querySelector("canvas")) fails.push("无 JS 下不该有 canvas");
          const pres = [...hero.querySelectorAll("pre")].filter(
            (p) => getComputedStyle(p).display !== "none"
          );
          if (pres.length === 0) fails.push("可见的 ASCII pre 缺失");
          else if (pres[0].textContent.length < 500) fails.push("ASCII 内容异常短");

          // 无空白区域:每个 section 都有实质内容,且没有被隐藏的文字元素
          const sections = document.querySelectorAll("main > section");
          if (sections.length < 6) fails.push(`section 数量异常:${sections.length}`);
          sections.forEach((section, i) => {
            if (section.innerText.replace(/\s+/g, "").length < 30)
              fails.push(`section[${i}] 内容过少(疑似空白区域)`);
            if (section.offsetHeight < 100) fails.push(`section[${i}] 高度异常`);
            for (const el of section.querySelectorAll("*")) {
              if (!el.textContent.trim() || el.children.length > 0) continue;
              // 未渲染(自身或祖先 display:none)与 visibility:hidden 不算空白
              if (el.getClientRects().length === 0) continue;
              if (getComputedStyle(el).visibility === "hidden") continue;
              if (eff(el) < 0.3)
                fails.push(
                  `section[${i}] 有被隐藏的文字:${el.textContent.trim().slice(0, 40)}`
                );
            }
          });
          return fails;
        },
        H1_LINE1,
        H1_LINE2,
        SUBTITLE,
        BOOT_CMD
      );
      expect(res).toEqual([]);
    });
  });

  test("8. chunk 加载失败兜底(watchdog fail-open):应用 bundle 被阻断、hydration 永不到来时,内联脚本仍在预算内摘除 data-boot", async () => {
    // JS 开(内联脚本会跑),但全部 <script src> 网络请求被拦——模拟部署错位/断网导致
    // 应用 chunk 永远加载不到、hydration 永不发生(区别于用例 7 的「整段禁 JS」)
    page = await newPage(browser, { blockScripts: true });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "chunk-blocked-failopen", async () => {
      // 前提:内联脚本确实跑了、data-boot 确实被置位(否则下面的断言无意义)
      expect(
        await page.evaluate(() => document.documentElement.hasAttribute("data-boot")),
        "内联脚本未置位 data-boot(用例前提不成立,并非在测 watchdog)"
      ).toBe(true);

      // hydration 永不会发生:watchdog(2.5s)触发前不该提前达到终态
      const early = await pollHeroFinal(page, 800);
      expect(
        early.ok,
        "chunk 被阻断的情况下不该这么早就达到终态——watchdog 是否提前触发了?"
      ).toBe(false);

      // watchdog 兜底:即便没有 hydration,内容也必须在预算内 fail-open 恢复可见
      // (2.5s watchdog + 富余,4s 内必须达到终态;pollHeroFinal 用页面自身 rAF 轮询)
      const res = await pollHeroFinal(page, 4000);
      expect(res.ok, `watchdog 超时后仍未 fail-open:${res.why}`).toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.hasAttribute("data-boot")),
        "watchdog 后 data-boot 应已被摘除"
      ).toBe(false);

      // 内容确实是"整页可见"而非仅通过了终态探针的个别字段:全部静态 boot-hide 分支
      // 组件(未 hydrate,SSR 静态 HTML)最终都应有效可见。这些卡片元素自带
      // `transition-all duration-300`(hover 用途),opacity 规则解除的瞬间不会
      // 立即到位,给够一个 transition 周期的余量再判定,避免采样到过渡中间态。
      const findHidden = () =>
        page.evaluate(() => {
          const eff = (el) => {
            let o = 1;
            for (let n = el; n && n !== document.documentElement; n = n.parentElement)
              o *= parseFloat(getComputedStyle(n).opacity || "1");
            return o;
          };
          const hidden = [];
          document.querySelectorAll("main > section").forEach((section, i) => {
            for (const el of section.querySelectorAll("*")) {
              if (!el.textContent.trim() || el.children.length > 0) continue;
              if (el.getClientRects().length === 0) continue;
              if (eff(el) < 0.3) hidden.push(`section[${i}]: ${el.textContent.trim().slice(0, 30)}`);
            }
          });
          return hidden;
        });
      await expect
        .poll(findHidden, { timeout: 1000, interval: 50 })
        .toEqual([]);
    });
  });

  test("9. WebGL 引擎 chunk 加载失败:头像回退静态 ASCII,不停留成空白方块", async () => {
    // 只拦「初始 HTML 里没有声明过」的 <script> 请求——即运行时才发起的懒加载 chunk。
    // 本仓库首页唯一的客户端懒加载是 CharFieldCanvas 的 import("./engine"),
    // 核心应用 bundle(初始 HTML 自带的 <script src>)不受影响,hydration 正常发生。
    const indexHtml = readFileSync(resolve("out/index.html"), "utf8");
    const knownScripts = new Set(
      [...indexHtml.matchAll(/<script[^>]+\bsrc="([^"]+)"/g)].map((m) => m[1])
    );
    page = await newPage(browser, {
      shouldBlockRequest: (req) => {
        if (req.resourceType() !== "script") return false;
        const { pathname } = new URL(req.url());
        return !knownScripts.has(pathname);
      },
    });
    await gotoHome(page, baseUrl);
    await withArtifacts(page, "engine-chunk-blocked", async () => {
      // hydration 正常发生、boot 编排正常跑完(核心 bundle 未受影响)
      await waitForHeroFinal(page);

      // engine chunk 请求被拒 → CharFieldCanvas 的 import().catch 应调用 onUnavailable,
      // AsciiAvatarCard 降级为 static 模式:静态 ASCII <pre> 出现,canvas 不残留
      await expect
        .poll(() => page.evaluate(() => !!document.querySelector("main section pre")), {
          timeout: 5000,
          interval: 100,
        })
        .toBe(true);

      const state = await page.evaluate(() => {
        const hero = document.querySelector("main section");
        const pre = hero.querySelector("pre");
        return {
          hasCanvas: !!hero.querySelector("canvas"),
          hasPre: !!pre,
          preLength: pre ? pre.textContent.length : 0,
        };
      });
      expect(
        state.hasCanvas,
        "engine 不可用时不该残留 canvas(那正是「空白方块」bug 的成因)"
      ).toBe(false);
      expect(state.hasPre, "engine 不可用时应回退到静态 ASCII pre").toBe(true);
      expect(state.preLength, "回退的 ASCII 内容异常短").toBeGreaterThan(500);
    });
  });
});
