import { defineConfig } from "vitest/config";

// E2E 套件与单元测试(默认 `npm test`)隔离:
// 文件名用 *.e2e.mjs(不含 .test.),默认 vitest include 不会捡到。
export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.e2e.mjs"],
    globalSetup: ["tests/e2e/global-setup.mjs"],
    // 共享一个浏览器与静态服务器,串行跑,避免动效计时互相干扰
    fileParallelism: false,
    testTimeout: 90_000,
    hookTimeout: 120_000,
  },
});
