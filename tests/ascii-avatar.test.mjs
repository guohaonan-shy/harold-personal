import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeImage } from "../scripts/ascii-avatar/decode.mjs";
import { imageToAscii, CHARSET } from "../scripts/ascii-avatar/core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, "fixtures", "blocks-16x16.png");

// Fixture layout (16x16): top-left quadrant black, top-right quadrant white,
// bottom half mid-gray (128). With cols=8 / charAspect=0.5 the sampling grid is
// 8x4 and every cell falls entirely inside one uniform block.
const OPTS = { cols: 8, charAspect: 0.5 };

function densityAt(result, row, col) {
  return CHARSET.indexOf(result.lines[row][col]);
}

describe("decodeImage", () => {
  it("decodes the fixture PNG into RGBA pixel data", () => {
    const img = decodeImage(FIXTURE);
    expect(img.width).toBe(16);
    expect(img.height).toBe(16);
    expect(img.data.length).toBe(16 * 16 * 4);
  });
});

describe("imageToAscii — brightness to character mapping", () => {
  const img = () => decodeImage(FIXTURE);

  it("dark theme: black maps to blank, white maps to densest glyph", () => {
    const { lines } = imageToAscii(img(), { ...OPTS, theme: "dark" });
    expect(lines[0][0]).toBe(" "); // black cell
    expect(lines[0][7]).toBe("@"); // white cell
  });

  it("light theme: mapping inverts — black gets the densest ink, white goes blank", () => {
    const { lines } = imageToAscii(img(), { ...OPTS, theme: "light" });
    expect(lines[0][0]).toBe("@"); // black cell
    expect(lines[0][7]).toBe(" "); // white cell
  });

  it("mapping is monotonic in source brightness (dark theme: darker → sparser)", () => {
    const dark = imageToAscii(img(), { ...OPTS, theme: "dark" });
    const black = densityAt(dark, 0, 0);
    const gray = densityAt(dark, 2, 0);
    const white = densityAt(dark, 0, 7);
    expect(black).toBeLessThan(gray);
    expect(gray).toBeLessThan(white);
  });

  it("output matrix respects the requested dimensions", () => {
    const { lines, rows, cols } = imageToAscii(img(), { ...OPTS, theme: "dark" });
    expect(cols).toBe(8);
    expect(rows).toBe(4); // 16/16 aspect * 8 cols * 0.5 char aspect
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line).toHaveLength(8);
  });

  it("dark and light outputs differ, and light compensates with denser glyphs on midtones", () => {
    const dark = imageToAscii(img(), { ...OPTS, theme: "dark" });
    const light = imageToAscii(img(), { ...OPTS, theme: "light" });
    expect(light.lines).not.toEqual(dark.lines);
    // Mid-gray cell: light theme must land on a denser glyph than a plain
    // inversion of the dark mapping would give (contrast compensation).
    expect(densityAt(light, 2, 0)).toBeGreaterThan(densityAt(dark, 2, 0));
  });
});

describe("imageToAscii — terminal-green highlight mask", () => {
  const img = () => decodeImage(FIXTURE);

  it("dark theme: only the brightest cells are marked green", () => {
    const { green } = imageToAscii(img(), { ...OPTS, theme: "dark" });
    // White cells occupy cols 4..7 of rows 0-1; gray/black rows get nothing.
    expect(green[0]).toEqual([[4, 8]]);
    expect(green[1]).toEqual([[4, 8]]);
    expect(green[2]).toEqual([]);
    expect(green[3]).toEqual([]);
  });

  it("light theme: blank glyphs are never marked green", () => {
    const { green, lines } = imageToAscii(img(), { ...OPTS, theme: "light" });
    for (let r = 0; r < lines.length; r++) {
      for (const [start, end] of green[r]) {
        for (let c = start; c < end; c++) {
          expect(lines[r][c]).not.toBe(" ");
        }
      }
    }
    // In this fixture the brightest cells are blank in light theme, so no runs.
    expect(green.flat()).toEqual([]);
  });
});
