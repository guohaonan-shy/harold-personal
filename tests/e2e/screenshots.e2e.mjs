import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, inject, test } from "vitest";
import {
  OUTPUT_DIR,
  closePage,
  freezeAnimations,
  gotoHome,
  launchBrowser,
  newPage,
  waitForCanvasStable,
  waitForHeroFinal,
  withArtifacts,
} from "./lib/harness.mjs";
import { comparePng } from "./lib/png.mjs";

const baseUrl = inject("baseUrl");
const BASELINE_DIR = resolve("tests/e2e/baselines");
const UPDATE = process.env.E2E_UPDATE_SHOTS === "1";

/**
 * 四张基准:暗/亮主题 × 桌面/移动视口,Hero boot 完成后的稳定终态。
 * 视口高度取到让 Hero 完整落在视口内——element.screenshot 不必
 * captureBeyondViewport(那会触发 ResizeObserver,扰动字符场)。
 * 远程请求全程被拦(harness 默认),字体走本机回退,截图不依赖网络。
 */
const VARIANTS = [
  { name: "hero-dark-desktop", opts: { width: 1440, height: 1600 } },
  { name: "hero-light-desktop", opts: { width: 1440, height: 1600, theme: "light" } },
  { name: "hero-dark-mobile", opts: { width: 390, height: 2600, mobile: true } },
  {
    name: "hero-light-mobile",
    opts: { width: 390, height: 2600, mobile: true, theme: "light" },
  },
];

/** @type {import('puppeteer').Browser} */
let browser;
/** @type {import('puppeteer').Page | null} */
let page;

beforeAll(async () => {
  browser = await launchBrowser();
});

afterAll(async () => {
  await browser?.close();
});

afterEach(async () => {
  await closePage(page);
  page = null;
});

describe(`截图基准:Hero 稳定终态(${UPDATE ? "更新基准" : "比对基准"})`, () => {
  for (const { name, opts } of VARIANTS) {
    test(name, async () => {
      page = await newPage(browser, opts);
      await gotoHome(page, baseUrl);
      await withArtifacts(page, `shot-${name}`, async () => {
        await waitForHeroFinal(page);

        if (opts.mobile) {
          // 移动档位:静态 ASCII,无 canvas
          expect(await page.$("canvas")).toBeNull();
        } else {
          // 桌面档位:等字符场 settle 后停帧
          await page.waitForSelector("main section canvas", { timeout: 5000 });
          await waitForCanvasStable(page);
        }

        // 冻结常驻 CSS 动画(徽章绿点脉冲等),消除相位随机
        await freezeAnimations(page);
        await new Promise((r) => setTimeout(r, 200));

        const hero = await page.$("main section");
        const box = await hero.boundingBox();
        expect(
          box.y + box.height,
          "Hero 超出截图视口,请调大该档位的视口高度"
        ).toBeLessThanOrEqual(opts.height);

        const shot = await hero.screenshot();
        const baselinePath = resolve(BASELINE_DIR, `${name}.png`);

        if (UPDATE) {
          mkdirSync(BASELINE_DIR, { recursive: true });
          writeFileSync(baselinePath, shot);
          console.log(`[e2e] 基准已更新:${baselinePath}`);
          return;
        }

        expect(
          existsSync(baselinePath),
          `基准缺失:${baselinePath}\n先执行 E2E_UPDATE_SHOTS=1 npx vitest run --config vitest.e2e.config.mts 生成`
        ).toBe(true);

        const result = comparePng(readFileSync(baselinePath), shot);
        if (!result.equal) {
          const dir = resolve(OUTPUT_DIR, "screenshot-diffs");
          mkdirSync(dir, { recursive: true });
          const actualPath = resolve(dir, `${name}.actual.png`);
          writeFileSync(actualPath, shot);
          let diffNote = "";
          if (result.diffPng) {
            const diffPath = resolve(dir, `${name}.diff.png`);
            writeFileSync(diffPath, result.diffPng);
            diffNote = `\n差异标注:${diffPath}`;
          }
          expect.fail(
            `${name} 与基准不一致:${result.reason}\n实际截图:${actualPath}${diffNote}\n基准:${baselinePath}`
          );
        }
      });
    });
  }
});
