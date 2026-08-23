import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { startStaticServer } from "./lib/static-server.mjs";

/** 起本地静态服务器,把构建产物(out/)喂给全部 e2e 用例 */
export default async function globalSetup({ provide }) {
  const outDir = resolve("out");
  if (!existsSync(resolve(outDir, "index.html"))) {
    throw new Error(
      "找不到构建产物 out/index.html —— e2e 跑在静态导出上,请先执行 `npm run build`(`npm run test:e2e` 已包含构建)。"
    );
  }
  const server = await startStaticServer(outDir);
  provide("baseUrl", `http://127.0.0.1:${server.port}`);
  return async () => {
    await server.close();
  };
}
