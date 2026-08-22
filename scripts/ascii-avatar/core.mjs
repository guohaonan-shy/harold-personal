/**
 * Build-time ASCII avatar generator core: pure functions from decoded pixel
 * data to a character matrix. Runtime code only consumes the pre-generated
 * output — nothing in here ships to the browser.
 */

/** Brightness gradient, sparsest to densest ink. */
export const CHARSET = " .:-=+*#%@";

/**
 * Light theme compensation: exponent < 1 applied to the ink level pushes
 * midtones toward denser glyphs, since dark-on-white needs more ink coverage
 * than light-on-black to read at the same contrast.
 */
const LIGHT_INK_GAMMA = 0.7;

function luminance(data, offset) {
  return (
    (0.2126 * data[offset] + 0.7152 * data[offset + 1] + 0.0722 * data[offset + 2]) /
    255
  );
}

/** Center-crop pixel data to a square. */
export function cropToSquare(image) {
  const { width, height, data } = image;
  if (width === height) return image;
  const size = Math.min(width, height);
  const x0 = Math.floor((width - size) / 2);
  const y0 = Math.floor((height - size) / 2);
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const src = ((y0 + y) * width + (x0 + x)) * 4;
      const dst = (y * size + x) * 4;
      out[dst] = data[src];
      out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2];
      out[dst + 3] = data[src + 3];
    }
  }
  return { width: size, height: size, data: out };
}

/**
 * Convert decoded pixel data to an ASCII character matrix.
 *
 * @param {{ width: number, height: number, data: Uint8Array }} image
 * @param {object} options
 * @param {"dark"|"light"} options.theme  dark = light glyphs on dark bg
 *   (brighter pixel → denser glyph); light = inverted, with density
 *   compensation for contrast.
 * @param {number} [options.cols]  output width in characters
 * @param {number} [options.charAspect]  rendered glyph width/height ratio,
 *   used to derive the row count so the matrix keeps the image's proportions
 * @param {number} [options.greenShare]  share of brightest cells to mark as
 *   terminal green ("green only marks living things")
 * @returns {{ lines: string[], green: Array<Array<[number, number]>>, rows: number, cols: number }}
 *   `green` holds per-row [startCol, endCol) runs of highlighted glyphs.
 */
export function imageToAscii(image, options) {
  const { theme, cols = 60, charAspect = 0.6, greenShare = 0.1 } = options;
  const { width, height, data } = image;
  const rows = Math.max(1, Math.round((height / width) * cols * charAspect));

  // Average luminance per grid cell.
  const brightness = new Float64Array(rows * cols);
  for (let r = 0; r < rows; r++) {
    const yStart = Math.floor((r * height) / rows);
    const yEnd = Math.max(yStart + 1, Math.floor(((r + 1) * height) / rows));
    for (let c = 0; c < cols; c++) {
      const xStart = Math.floor((c * width) / cols);
      const xEnd = Math.max(xStart + 1, Math.floor(((c + 1) * width) / cols));
      let sum = 0;
      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          sum += luminance(data, (y * width + x) * 4);
        }
      }
      brightness[r * cols + c] = sum / ((yEnd - yStart) * (xEnd - xStart));
    }
  }

  // Contrast stretch so the full charset range is used even on flat photos.
  let min = Infinity;
  let max = -Infinity;
  for (const b of brightness) {
    if (b < min) min = b;
    if (b > max) max = b;
  }
  const range = max - min;
  const normalized =
    range > 0 ? brightness.map((b) => (b - min) / range) : brightness;

  const maxIndex = CHARSET.length - 1;
  const glyphFor = (b) => {
    const ink = theme === "light" ? Math.pow(1 - b, LIGHT_INK_GAMMA) : b;
    return CHARSET[Math.round(ink * maxIndex)];
  };

  // Threshold for the brightest ~greenShare of cells.
  const greenCount = Math.max(1, Math.round(rows * cols * greenShare));
  const sorted = Array.from(normalized).sort((a, b) => b - a);
  const greenThreshold = sorted[greenCount - 1];

  const lines = [];
  const green = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    const runs = [];
    let runStart = -1;
    for (let c = 0; c < cols; c++) {
      const b = normalized[r * cols + c];
      const glyph = glyphFor(b);
      line += glyph;
      const isGreen = b >= greenThreshold && glyph !== " ";
      if (isGreen && runStart === -1) runStart = c;
      if (!isGreen && runStart !== -1) {
        runs.push([runStart, c]);
        runStart = -1;
      }
    }
    if (runStart !== -1) runs.push([runStart, cols]);
    lines.push(line);
    green.push(runs);
  }

  return { lines, green, rows, cols };
}
