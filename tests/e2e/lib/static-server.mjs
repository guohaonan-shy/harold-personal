import { createServer } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { join, normalize, extname } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".mp4": "video/mp4",
  ".xml": "application/xml",
};

async function resolveFile(root, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [];
  if (clean.endsWith("/")) {
    candidates.push(join(root, clean, "index.html"));
  } else {
    candidates.push(join(root, clean));
    if (!extname(clean)) {
      candidates.push(join(root, `${clean}.html`));
      candidates.push(join(root, clean, "index.html"));
    }
  }
  for (const file of candidates) {
    if (!file.startsWith(root)) continue;
    try {
      const s = await stat(file);
      if (s.isFile()) return file;
    } catch {
      /* 试下一个候选 */
    }
  }
  return null;
}

/** 服务 Next 静态导出目录;监听随机端口,返回 { port, close } */
export async function startStaticServer(root) {
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const file = await resolveFile(root, pathname);
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found: " + pathname);
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(String(err));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    port: server.address().port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
