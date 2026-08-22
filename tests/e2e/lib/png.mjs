import { PNG } from "pngjs";

export const decode = (buf) => PNG.sync.read(buf);

/**
 * 逐像素比对两张 PNG。返回 { equal, reason, diffCount, total, diffPng }。
 * channelTolerance:单通道允许的最大差值(默认 0,严格一致)。
 * diffPng:不一致像素标红的对照图(基准的灰度底)。
 */
export function comparePng(bufA, bufB, { channelTolerance = 0 } = {}) {
  const a = decode(bufA);
  const b = decode(bufB);
  if (a.width !== b.width || a.height !== b.height) {
    return {
      equal: false,
      reason: `尺寸不一致:${a.width}x${a.height} vs ${b.width}x${b.height}`,
      diffCount: -1,
      total: a.width * a.height,
      diffPng: null,
    };
  }
  const total = a.width * a.height;
  const out = new PNG({ width: a.width, height: a.height });
  let diffCount = 0;
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    let differs = false;
    for (let c = 0; c < 4; c++) {
      if (Math.abs(a.data[p + c] - b.data[p + c]) > channelTolerance) {
        differs = true;
        break;
      }
    }
    if (differs) {
      diffCount++;
      out.data[p] = 255;
      out.data[p + 1] = 0;
      out.data[p + 2] = 0;
      out.data[p + 3] = 255;
    } else {
      const grey = Math.round(
        (a.data[p] * 0.299 + a.data[p + 1] * 0.587 + a.data[p + 2] * 0.114) * 0.35 + 140
      );
      out.data[p] = grey;
      out.data[p + 1] = grey;
      out.data[p + 2] = grey;
      out.data[p + 3] = 255;
    }
  }
  return {
    equal: diffCount === 0,
    reason: diffCount === 0 ? "" : `${diffCount}/${total} 像素不一致`,
    diffCount,
    total,
    diffPng: diffCount === 0 ? null : PNG.sync.write(out),
  };
}

/** 亮度统计:meanLum(0-1 平均亮度)与 darkRatio(亮度 < darkBelow 的像素占比) */
export function analyzeLuminance(buf, { darkBelow = 0.45 } = {}) {
  const img = decode(buf);
  const total = img.width * img.height;
  let sum = 0;
  let dark = 0;
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const lum =
      (img.data[p] * 0.299 + img.data[p + 1] * 0.587 + img.data[p + 2] * 0.114) / 255;
    sum += lum;
    if (lum < darkBelow) dark++;
  }
  return { meanLum: sum / total, darkRatio: dark / total };
}
