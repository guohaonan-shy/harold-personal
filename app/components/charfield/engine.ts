/**
 * WebGL 字符场引擎(OGL)。全站唯一的 WebGL 表面,只渲染 ASCII 头像的字符矩阵。
 * 仅在细指针 + 非 reduced-motion 的客户端被动态 import,不进 SSR bundle。
 *
 * 动画全部在 shader 内完成(settle / 鼠标扰动 / 绿色点亮),CPU 每帧零 buffer 写入;
 * settle 完成且指针离场后自动报告 idle,由组件停掉 RAF。
 */

import { Renderer, Program, Mesh, Geometry, Texture } from "ogl";
import type { AsciiVariant } from "../../generated/ascii-avatar";

/** 亮度 ramp,与 scripts/ascii-avatar/core.mjs 的 CHARSET 同源(设计常量) */
const RAMP = " .:-=+*#%@";
/** 轮换乱码字符,与 DecryptedText 的 GLYPHS 同族 */
const SCRAMBLE = "ABCDEFGHIKLMNOPQRSTUVWYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

const ATLAS_COLS = 12;
const ATLAS_CELL = 64;
/** settle 时长(s):挂在 cardBody(950ms)槽位上,压着 done(1400ms)收尾 */
const SETTLE_DURATION = 0.45;
/** 扰动半径(行高单位)与推斥幅度(cell 单位) */
const DISTURB_RADIUS = 4.5;
const PUSH_STRENGTH = 0.4;
/** 等宽字形 宽/高 比,与生成脚本的 charAspect 同源 */
const CHAR_ASPECT = 0.6;

export interface CharFieldColors {
  /** 卡片底色(canvas 不透明背景,遮住底层常驻照片) */
  background: string;
  /** 墨色低/高两端:非绿字符按墨量在两者间取色 */
  inkLow: string;
  inkHigh: string;
  green: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** 白字透明底的字形图集;alpha 通道即字形覆盖率 */
function buildAtlas(chars: string): HTMLCanvasElement {
  const rows = Math.ceil(chars.length / ATLAS_COLS);
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * ATLAS_CELL;
  canvas.height = rows * ATLAS_CELL;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${Math.round(ATLAS_CELL * 0.72)}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < chars.length; i++) {
    const x = (i % ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    const y = Math.floor(i / ATLAS_COLS) * ATLAS_CELL + ATLAS_CELL / 2;
    ctx.fillText(chars[i], x, y);
  }
  return canvas;
}

const VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
attribute vec2 aCell;
attribute float aGlyph;
attribute float aInk;
attribute float aGreen;
attribute float aSeed;

uniform vec2 uGrid;
uniform float uTime;
uniform float uSettleStart;
uniform vec2 uMouse;
uniform float uMouseT;
uniform float uScrambleCount;

varying vec2 vUV;
varying float vGlyph;
varying float vInk;
varying float vGreenMix;
varying float vAlpha;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 center = aCell + 0.5;

  float settleP = clamp((uTime - uSettleStart) / ${SETTLE_DURATION.toFixed(2)}, 0.0, 1.0);
  float settled = step(aSeed, settleP);

  // 距离用「行高单位」度量(cell 宽 0.6 × 高),扰动半径在视觉上是圆
  vec2 delta = (center - uMouse) * vec2(${CHAR_ASPECT}, 1.0);
  float d = length(delta);
  float influence = smoothstep(${DISTURB_RADIUS.toFixed(1)}, ${(DISTURB_RADIUS * 0.2).toFixed(1)}, d) * uMouseT;

  // 轻微推斥,不做物理弹跳;方向在行高单位空间求出后换算回 cell 空间保持各向同性
  vec2 dir = d > 0.001 ? delta / d : vec2(0.0);
  vec2 push = dir / vec2(${CHAR_ASPECT}, 1.0) * (influence * ${PUSH_STRENGTH});

  // settle 前全场噪声;settle 后仅指针近旁快速轮换
  float tick = floor(uTime * 9.0);
  float scrambling = max(1.0 - settled, step(0.4, influence));
  float noiseGlyph = floor(hash(aCell + tick) * uScrambleCount);
  vGlyph = mix(aGlyph, noiseGlyph, scrambling);

  // 绿只标记「活的」:恒绿的最亮 10% + 指针影响圈,噪声期不点绿
  vGreenMix = max(aGreen * settled, influence);
  vInk = mix(0.4, aInk, settled);
  vAlpha = mix(0.75, 1.0, settled);

  vec2 cellSize = 2.0 / uGrid;
  vec2 pos = (center + push) * cellSize - 1.0;
  // 字形 quad 取方形(边长 = cell 高),等宽字形本身 <0.6em 宽,重叠区透明无碍
  vec2 vertex = vec2(pos.x, -pos.y) + position * cellSize.y * vec2(1.0, -1.0);
  vUV = uv;
  gl_Position = vec4(vertex, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D tAtlas;
uniform vec2 uAtlasGrid;
uniform vec3 uInkLow;
uniform vec3 uInkHigh;
uniform vec3 uGreen;

varying vec2 vUV;
varying float vGlyph;
varying float vInk;
varying float vGreenMix;
varying float vAlpha;

void main() {
  float gi = floor(vGlyph + 0.5);
  vec2 gcell = vec2(mod(gi, uAtlasGrid.x), floor(gi / uAtlasGrid.x));
  float a = texture2D(tAtlas, (gcell + vUV) / uAtlasGrid).a;
  vec3 ink = mix(uInkLow, uInkHigh, vInk);
  vec3 color = mix(ink, uGreen, vGreenMix);
  gl_FragColor = vec4(color, a * vAlpha);
}
`;

/** settleStart 的「未触发」哨兵:远未来 → 全场保持噪声 */
const NEVER = 1e9;

export class CharFieldEngine {
  private renderer: Renderer;
  private mesh: Mesh;
  private program: Program;
  private cols: number;
  private rows: number;
  private cellCount: number;
  private atlasChars: string;
  private glyphBuf: Float32Array;
  private inkBuf: Float32Array;
  private greenBuf: Float32Array;
  private start: number;
  private settleStart = NEVER;
  private mouse = { x: 0, y: 0, t: 0, targetT: 0 };
  private clearColor: [number, number, number] = [0, 0, 0];

  /** WebGL 上下文创建失败时抛出,调用方回退静态形态 */
  constructor(canvas: HTMLCanvasElement, cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.cellCount = cols * rows;
    this.start = performance.now();

    this.renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = this.renderer.gl;
    if (!gl) throw new Error("WebGL unavailable");

    this.atlasChars = Array.from(new Set(RAMP + SCRAMBLE)).join("");
    const atlas = buildAtlas(this.atlasChars);
    const texture = new Texture(gl, {
      image: atlas,
      generateMipmaps: false,
      flipY: false,
    });

    const cells = new Float32Array(this.cellCount * 2);
    const seeds = new Float32Array(this.cellCount);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        cells[i * 2] = c;
        cells[i * 2 + 1] = r;
        // 每 cell 的 settle 时刻确定但空间上无序(伪随机,与 shader hash 独立)
        seeds[i] = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
        if (seeds[i] < 0) seeds[i] += 1;
      }
    }
    this.glyphBuf = new Float32Array(this.cellCount);
    this.inkBuf = new Float32Array(this.cellCount);
    this.greenBuf = new Float32Array(this.cellCount);

    const geometry = new Geometry(gl, {
      position: {
        size: 2,
        data: new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]),
      },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) },
      index: { data: new Uint16Array([0, 1, 2, 0, 2, 3]) },
      aCell: { instanced: 1, size: 2, data: cells },
      aSeed: { instanced: 1, size: 1, data: seeds },
      aGlyph: { instanced: 1, size: 1, data: this.glyphBuf },
      aInk: { instanced: 1, size: 1, data: this.inkBuf },
      aGreen: { instanced: 1, size: 1, data: this.greenBuf },
    });

    const atlasRows = Math.ceil(this.atlasChars.length / ATLAS_COLS);
    this.program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      transparent: true,
      depthTest: false,
      // vertex 里的 y 轴翻转反转了三角形绕向,默认的背面剔除会吃掉全部 quad
      cullFace: false,
      uniforms: {
        tAtlas: { value: texture },
        uAtlasGrid: { value: [ATLAS_COLS, atlasRows] },
        uGrid: { value: [cols, rows] },
        uTime: { value: 0 },
        uSettleStart: { value: NEVER },
        uMouse: { value: [-100, -100] },
        uMouseT: { value: 0 },
        uScrambleCount: { value: this.atlasChars.length },
        uInkLow: { value: [0, 0, 0] },
        uInkHigh: { value: [0, 0, 0] },
        uGreen: { value: [0, 0, 0] },
      },
    });
    this.mesh = new Mesh(gl, { geometry, program: this.program });
  }

  /** 载入某主题的字符矩阵与配色;主题切换时重调 */
  setVariant(variant: AsciiVariant, colors: CharFieldColors) {
    const greenCols: boolean[] = new Array(this.cols);
    for (let r = 0; r < this.rows; r++) {
      const line = variant.lines[r] ?? "";
      greenCols.fill(false);
      for (const [s, e] of variant.green[r] ?? []) {
        for (let c = s; c < e; c++) greenCols[c] = true;
      }
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        const ch = line[c] ?? " ";
        this.glyphBuf[i] = Math.max(0, this.atlasChars.indexOf(ch));
        const rampIdx = RAMP.indexOf(ch);
        this.inkBuf[i] = rampIdx >= 0 ? rampIdx / (RAMP.length - 1) : 0.5;
        this.greenBuf[i] = greenCols[c] ? 1 : 0;
      }
    }
    const geo = this.mesh.geometry;
    geo.attributes.aGlyph.needsUpdate = true;
    geo.attributes.aInk.needsUpdate = true;
    geo.attributes.aGreen.needsUpdate = true;

    this.clearColor = hexToRgb(colors.background);
    this.program.uniforms.uInkLow.value = hexToRgb(colors.inkLow);
    this.program.uniforms.uInkHigh.value = hexToRgb(colors.inkHigh);
    this.program.uniforms.uGreen.value = hexToRgb(colors.green);
  }

  /**
   * 触发 settle。at 为 performance.now() 时间戳:引擎晚于 cue 就绪时,
   * 动画从既定时刻起算(掐头),不推迟 boot 收尾。
   */
  startSettle(at: number = performance.now()) {
    this.settleStart = (at - this.start) / 1000;
  }

  /** 跳过动画直达稳定终态(无 boot 编排时) */
  setStable() {
    this.settleStart = -SETTLE_DURATION;
  }

  /** 指针位置(cell 坐标);null = 离场 */
  setPointer(cell: { x: number; y: number } | null) {
    if (cell) {
      this.mouse.x = cell.x;
      this.mouse.y = cell.y;
      this.mouse.targetT = 1;
    } else {
      this.mouse.targetT = 0;
    }
  }

  setSize(width: number, height: number) {
    this.renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setSize(width, height);
  }

  /** 渲染一帧;返回 false 表示已达稳态(可停 RAF,等事件唤醒) */
  frame(): boolean {
    const now = (performance.now() - this.start) / 1000;
    this.mouse.t += (this.mouse.targetT - this.mouse.t) * 0.22;
    if (Math.abs(this.mouse.targetT - this.mouse.t) < 0.01) {
      this.mouse.t = this.mouse.targetT;
    }

    const u = this.program.uniforms;
    u.uTime.value = now;
    u.uSettleStart.value = this.settleStart;
    u.uMouse.value = [this.mouse.x, this.mouse.y];
    u.uMouseT.value = this.mouse.t;

    const gl = this.renderer.gl;
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1);
    this.renderer.render({ scene: this.mesh });

    const settleDone =
      this.settleStart !== NEVER && now >= this.settleStart + SETTLE_DURATION;
    return !(settleDone && this.mouse.t === 0);
  }

  dispose() {
    const gl = this.renderer.gl;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
