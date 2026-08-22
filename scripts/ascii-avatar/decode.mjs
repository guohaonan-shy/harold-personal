import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

/**
 * Decode a PNG or JPEG file into raw RGBA pixel data.
 * @param {string} filePath
 * @returns {{ width: number, height: number, data: Uint8Array }}
 */
export function decodeImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") {
    const png = PNG.sync.read(buf);
    return { width: png.width, height: png.height, data: png.data };
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    const { width, height, data } = jpeg.decode(buf, {
      useTArray: true,
      formatAsRGBA: true,
    });
    return { width, height, data };
  }
  throw new Error(`Unsupported image format: ${ext}`);
}
