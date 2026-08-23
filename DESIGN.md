---
version: 1
name: harold-personal
description: >-
  Harold Guo 个人站点的设计系统。核心隐喻是"一个正在运行的终端会话"——近黑背景、单一强调色(终端绿)、
  macOS 三色圆点 chrome、mono 字体承载的路径式标题。明暗双主题都要维持这个隐喻,不是深色主题的附属品。
colors:
  accent:
    terminalGreen: "#27C93F"
    terminalCyan: "#48B0BD"
    terminalRed: "#FF5F56"
    terminalYellow: "#FFBD2E"
  light:
    bgPage: "#FFFFFF"
    bgCard: "#F3F3F3"
    bgTerminal: "#F9F9F9"
    textMain: "#1A1A1A"
    textDim: "#666666"
    border: "#E5E5E5"
    borderLight: "#E5E5E5"
  dark:
    bgPage: "#050505"
    bgCard: "#0F0F0F"
    bgTerminal: "#121212"
    textMain: "#EDEDED"
    textDim: "#888888"
    border: "#262626"
    borderLight: "#333333"
typography:
  fontSans: "Inter, sans-serif"
  fontMono: "JetBrains Mono, monospace"
radius:
  md: "0.375rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
---

# DESIGN.md

harold-personal 的设计语言参考。按 [DESIGN.md 规范](https://stitch.withgoogle.com/docs/design-md/specification)(Google Stitch)的结构组织,机器可读的 token 在上面的 frontmatter 里,正文是给人(和 agent)看的设计理由。正文里 `{colors.accent.terminalGreen}` 这种占位符指向 frontmatter 里的同名 token。

`DESIGN.md` 和 `CLAUDE.md` 分工不同:`CLAUDE.md` 是给写代码的 agent 看的"怎么把这个项目搭起来";这份文件是给做设计的 agent(`design-ui`/`design-motion`)看的"这个项目该长什么样"。不要把工程决策(用什么框架、目录怎么组织)混进这份文件。

## Overview

harold-personal 是一个终端黑客美学的个人站点:近黑画布(`{colors.dark.bgPage}` `#050505`)、单一强调色(`{colors.accent.terminalGreen}` `#27C93F`)只用在状态点、active 标记、链接 hover 这些"正在发生的事"上,macOS 三色圆点 + `~/path/filename` 路径式标题是贯穿全站的 chrome。整站读起来像"一个开着的终端窗口",不是"深色模式的开发者作品集"——这两者的区别在于:近黑背景是身份本身,不是浅色主题的深色变体;圆点、路径标题、`ls`/`cat` 式的交互隐喻是结构,不是装饰。

明暗双主题都要维持这个隐喻。亮色主题不是"把深色反相"——背景变成接近白色的 `{colors.light.bgPage}`,但终端强调色(绿/青/红/黄)完全不随主题变化,圆点 chrome、路径式标题在两个主题下都要在场。

**Key Characteristics:**
- 单一强调色 `{colors.accent.terminalGreen}` 承载所有"这是活的/这是当前状态"的信号(在线指示、active 标记、hover 反馈、CTA);青色是次要强调色,用得比绿色少得多,不跟绿色平分秋色。
- 卡片和容器靠 **边框**分层,不是阴影——`shadow-*` 只在少数"悬浮"元素上出现(头像、终端装饰窗口、卡片 hover),card-in-card 的层级用 `border-main`/`border-light` 表达。
- macOS 三色圆点 + `~/path` 标题是唯一的"卡片头"样式,新组件不发明第二套 header 视觉。
- Mono(JetBrains Mono)承载一切"这是路径/代码/命令/标签"的语境;Sans(Inter)承载叙述性正文。两者不混用在同一段落里。
- 圆角只有两级实际在用:`rounded-full`(圆点、徽章、按钮、头像)和 `rounded-2xl`(卡片容器)。`rounded-xl`/`rounded-md` 出现在更小的内部元素(标签、切换按钮)上,不作为卡片级容器使用。

## Colors

### Brand & Accent
- **Terminal Green**(`{colors.accent.terminalGreen}` `#27C93F`):唯一的"强调"色。状态点(在线指示、active 标记)、链接/标题 hover、CTA、GitHub 贡献图配色。不随主题变化。
- **Terminal Cyan**(`{colors.accent.terminalCyan}` `#48B0BD`):次要强调色,出现频率远低于绿色——终端徽章里的 `~` 符号、部分标签文字。不是"第二个可以随便用的强调色"。
- **Terminal Red / Yellow**(`{colors.accent.terminalRed}` `#FF5F56` / `{colors.accent.terminalYellow}` `#FFBD2E`):只用在 macOS 三色圆点 chrome 里,不作为独立的语义色(比如不用来表示"错误/警告")。

### Surface
| Token | Light | Dark | 用途 |
|---|---|---|---|
| `{colors.*.bgPage}` | `#FFFFFF` | `#050505` | 页面背景 |
| `{colors.*.bgCard}` | `#F3F3F3` | `#0F0F0F` | 卡片/输入框背景 |
| `{colors.*.bgTerminal}` | `#F9F9F9` | `#121212` | 终端装饰元素背景、渐变起点 |

### Text
| Token | Light | Dark | 用途 |
|---|---|---|---|
| `{colors.*.textMain}` | `#1A1A1A` | `#EDEDED` | 标题、正文主文字 |
| `{colors.*.textDim}` | `#666666` | `#888888` | 次要文字、meta 信息、标签 |

### Border
| Token | Light | Dark | 用途 |
|---|---|---|---|
| `{colors.*.border}` | `#E5E5E5` | `#262626` | 卡片/分隔线默认边框 |
| `{colors.*.borderLight}` | `#E5E5E5` | `#333333` | 更淡的边框变体(footer 分隔线等) |

### Semantic
目前没有独立的语义色板——这是个静态个人站,没有表单校验、没有错误/警告态。`Experience.tsx` 里"当前"节点的绿色发光(`shadow-[0_0_12px_rgba(39,201,63,0.5)]`)复用的是 Terminal Green,不是单独的 semantic token。如果以后加了需要语义色的场景(比如联系表单校验),在这里补一个 `Semantic` 小节,不要临时借用 terminal-red/yellow。

## Typography

### Font Family
- **Sans**:Inter——承载所有叙述性正文(Hero 描述、About 文案、Blog 正文)
- **Mono**:JetBrains Mono——承载路径式标题、代码块、标签、终端语境的一切文字
- 通过 `app/layout.tsx` 里的 Google Fonts `<link>` 加载,**没有**用 `next/font`(已知技术债,不在本次范围)

### Hierarchy

实际在用的字号,不是发明的一套新系统——新组件优先复用这些值,不要在这之外造新字号:

| Token | 尺寸 | 场景 |
|---|---|---|
| Hero 标题 | `text-5xl lg:text-7xl`,`font-bold`,`leading-[1.1]`,`tracking-tight` | 首页 Hero H1,全站最大字号 |
| 二级页标题 | `text-4xl lg:text-5xl`,`leading-[1.15]` | About 页 H1(`PhotoGallery.tsx`) |
| 内容页标题 | `text-3xl lg:text-4xl` | Blog/项目详情页 H1 |
| 卡片标题 | `text-2xl font-mono font-bold leading-none` | ProjectCard 标题 |
| Lead 正文 | `text-xl leading-[1.6]` | Hero 描述段落 |
| 次级 Lead | `text-lg leading-[1.8]` | About 页副标题 |
| 默认正文 | `text-base` | 列表/正文默认字号 |
| 次要文字 | `text-sm` | 大部分 meta 信息、标签、nav |
| 最小文字 | `text-xs` | 徽章、时间戳、极小标签——全站用得最多的字号 |

字重只有两档在用:`font-bold`(标题、强调)和默认 400(正文)。`font-semibold` 只出现过两次,不是一个刻意维护的中间档。

### Principles
- **终端徽章式的等宽标签是全站的签名标签样式**——小写字母 + mono 字体 + 淡色(`text-dim`),不是大写 + letter-spacing 的"eyebrow"套路。
- **正文行高偏松**(1.6–1.8),不是紧凑的产品 UI 密度——这是个人叙述性内容站,不是数据密集的工作台。
- **Hero 标题行高极紧**(1.1)——大字号 + 紧行高 + `tracking-tight` 的组合只在 Hero 出现,不下放到二级标题。

## Layout

### Spacing System
没有自定义间距刻度,直接用 Tailwind 默认的 4px 基准刻度。实际观测到的规律:
- 容器左右留白:`px-8`(移动端)/ `lg:px-[120px]`(桌面端)
- Section 之间的竖向节奏:`py-16`
- 卡片内边距:`p-6`
- 小元素(徽章、标签、按钮)内边距:`px-2`~`px-4` / `py-1`~`py-2`

### Grid & Container
- 内容最大宽度 `max-w-7xl`(首页主容器),内容页(Blog/项目详情)用更窄的 `max-w-3xl` 保证长文可读性
- Projects 网格用 `grid-template-columns: 1fr 1fr`(桌面两栏),没有响应式断点降级到移动端单栏的显式规则——这是一个已知的待补项,见下方 Known Gaps

### Breakpoints
只有一个断点在系统性使用:Tailwind 的 `lg:`(1024px)。字号、内边距、Projects 网格都在这个断点切换。没有观测到 `md:`/`sm:` 断点的系统性使用——移动端布局大多靠 flex 方向切换(`flex-col lg:flex-row`)而不是精细的多断点响应。

## Elevation & Depth

**边框优先于阴影**是这个站的核心分层策略。卡片、导航、footer 的分隔全部靠 `border-main`/`border-light`,不是 `shadow-*`。

阴影只在少数"悬浮/独立"的元素上出现,且都是柔和阴影(不是硬投影):
- 头像:`shadow-xl`(唯一用到 xl 级别阴影的地方)
- 终端徽章 / 主题切换按钮:`shadow-sm`
- About 页照片卡片 / 装饰性终端窗口(`Terminal.tsx`):`shadow-lg shadow-black/5 dark:shadow-black/20`——低透明度、跟随主题调整强度,不是一刀切的黑色阴影

不用硬投影(non-zero x/y + zero blur 的"新野兽主义"风格阴影)——这和终端隐喻的"扁平、精确"气质冲突。如果需要更强的层级感,先考虑加边框宽度或提高背景对比度,阴影是最后手段。

## Shapes

### Border Radius Scale
只有两级在系统性使用:

| Token | 值 | 用途 |
|---|---|---|
| `{radius.full}` | `9999px` | 圆点(chrome dots)、徽章、按钮、头像、切换开关——出现频率最高 |
| `{radius.2xl}` | `1rem` | 卡片级容器(ProjectCard、内容页终端 header 卡片) |
| `{radius.xl}` | `0.75rem` | 部分内部容器(相对少见) |
| `{radius.md}` | `0.375rem` | 小型交互元素(主题/语言切换按钮、标签) |

不用 `rounded-none`(硬直角)或 `rounded-3xl`+(过度圆润)——终端窗口本身是直角的,但站内的卡片/按钮统一走圆角语言,两种风格不混用。

## Components

### 终端 Chrome(签名组件)
全站唯一的"卡片头"样式,`ProjectCard.tsx`、Blog/项目详情页的容器 header 都用这一套:
```
[红圆点] [黄圆点] [绿圆点]  ~/path/filename
```
三个 `w-2.5 h-2.5 rounded-full` 圆点(红/黄/绿,固定顺序)+ mono 字体的路径式标题,容器 `rounded-2xl` + `border-main`,header 区 `border-b border-main` 和内容区分开。新页面的容器头一律复用这个组件,不发明新的"卡片头"视觉。

### Cards
- 项目卡片(`ProjectCard.tsx`):`rounded-2xl` + `border` + `bg-card`,内部靠 `border-t`/`border-b` 分区(媒体区 / 信息区),不用阴影分层
- 照片卡片(`PhotoGallery.tsx`):`shadow-lg shadow-black/5 dark:shadow-black/20`,这是少数例外的"用阴影而不是边框"的卡片类型

### 按钮与徽章
三种按钮/徽章样式,不要互相混用:
- **Pill 按钮**(如"访问项目"):`rounded-full` + `border border-main/20 hover:border-main/40` + `bg-main/5 hover:bg-main/10` + `font-mono text-xs font-bold`
- **切换按钮**(主题/语言):`rounded-md` + `border border-main` + `bg-card` + `font-mono text-xs`,hover 变 `bg-terminal`
- **标签徽章**(项目标签):`rounded-md` + `border border-main/20` + `bg-main/5` + `text-xs font-bold uppercase tracking-widest`

### Prompt Line(终端提示符模式)
`~ user command` 的假终端提示符是另一个反复出现的模式(Hero 徽章、`TypewriterTitle.tsx`、`Upcoming.tsx` 的 section 标题、Blog 列表页头部),结构固定:`~` (dim) + 用户名(bold,main 色)+ 命令(dim),mono 字体。

### Navigation
Nav tab 用路径式命名(`~/work`、`~/blog`、`~/about`)而不是普通词汇标签,active 态用 `text-terminal-green font-bold`,非 active 用 `text-dim hover:text-main`。

## Motion

实际观测到的 framer-motion / CSS 数值,新组件延用同一节奏,不要随意发明新的时长/缓动:

| 场景 | 参数 |
|---|---|
| 卡片入场(`ProjectCard.tsx`) | `initial:{opacity:0,y:20}` → `whileInView:{opacity:1,y:0}`,`duration:0.6, ease:"easeOut"` |
| Hover 反馈(如按钮浮现) | `duration:0.2` |
| 主题切换 View Transition | `210ms cubic-bezier(0,0,0.2,1)` 进场 / `90ms cubic-bezier(0.4,0,1,1)` 出场,整体 `400ms ease-in-out` |
| 颜色/边框过渡(hover 态) | `duration-200` ~ `duration-300` |
| 字符解密效果 | `DecryptedText.tsx`,用于副标题等强调文案 |
| 打字机效果 | `TypewriterTitle.tsx` |
| CRT scanline | `10s linear infinite`,叠加在媒体容器上 |

### Hero boot 分镜(`useHeroBoot.ts`)

首屏专属的一次性编排,`html[data-boot]` 门控 + rAF 驱动的 cue 表,桌面基准(ms),键序即时间序:

| cue | 时刻 | 内容 |
|---|---|---|
| (打字开始) | 0 | 徽章行 `init --workspace` 逐字打出,`30ms`/字符(全场唯一逐字打字) |
| `h1Line1` | 400 | H1 第一行整行回显 |
| `h1Cursor` | 500 | 光标从徽章行跳到 H1 尾部 |
| `h1Line2` | 500 | H1 第二行回显(与第一行 stagger 100ms) |
| `subtitle` | 640 | 副标题开始字符解密(`DecryptedText`) |
| `subtitleCursor` | 710 | 光标交接到副标题尾部 |
| `description` | 720 | 描述段 fade-in |
| `cardChrome` | 800 | ASCII 头像卡 chrome 头先现 |
| `cardBody` | 950 | 卡片内容淡入;同一槽位触发 WebGL 字符场的 settle 动画,不另起时机 |
| `done` | 1400 | 编排完成,光标退场,徽章行绿点常驻脉冲 |

- 移动端(`pointer: coarse`)整体乘 `0.8/1.4 ≈ 0.57` 压缩到约 0.8s,cue 表本身不用按档位改写。
- `prefers-reduced-motion: reduce` 或无 JS 时不走这套编排,直接呈现终态(`data-boot` 不置位)。
- 打字速率 `30ms`/字符是"收在 0–500ms 窗口内"优先于"贴近 35ms 观感速率"的取舍(16 字符 × 35ms 会超出窗口)——新场景若也要逐字打字,同样按目标窗口反推速率,不要孤立地复用 30ms 这个数字。
- 首帧到 hydration 之间用一个 2.5s 的兜底 `setTimeout` 移除 `data-boot`(fail-open):这是韧性机制,不是动效数值,新组件不需要照抄,但改动这套编排时时长预算要留在 2.5s 内。

### Section 入场语法(`useSectionEntrance.ts`)

Hero 之外所有 section 共用的入场门控,三态模型:

- **ssr**:未水合 / 无 JS / reduced-motion——内容用 `boot-hide` 隐藏,SSR HTML 里本来就可见(避免无 JS 访客永远看不到内容)。
- **gated**:已水合,该 section 自己的 `TypewriterTitle` prompt 还没打完——无条件隐藏,在绘制前用 `useLayoutEffect` 接管,不闪现。
- **entered**:prompt 打完(`onPromptDone` 回调)——挂 `animate-fadeIn` 播放入场;reduced-motion 不进这个分支,直接就位。
- 每个 section 用自己的 prompt 行(如 `~/projects --list`、`~/repos ls --starred`)当入场触发器,不共享 Hero 的 boot cue 表,也不各自 `whileInView`——这是本 PR 统一之前"各卡片各自触发"的不一致状态后定下的规则,新 section 沿用同一模式。

## Do's and Don'ts

### Do
- 近黑背景(`{colors.dark.bgPage}` `#050505`)当作品牌身份本身来对待——这是"终端"这个隐喻成立的前提,不是可以被"优化掉"的深色模式默认值。
- 新组件的"卡片头"一律复用三色圆点 + 路径标题这套 chrome,不发明第二套视觉签名。
- 强调色只用 Terminal Green,青色作为极少量的第二强调色;不引入第三个强调色。
- 卡片/容器分层优先用边框,阴影留给头像、装饰性终端窗口这类"悬浮"元素。
- Mono 字体用于一切路径/代码/命令/标签语境,不要为了"好看"在正文里插入 mono 片段。
- 明暗主题切换时,终端强调色、圆点 chrome、路径式标题必须在两个主题下都在场——不是深色主题独有的装饰。

### Don't
- 不引入渐变文字、玻璃拟态(glassmorphism)、AI 默认紫/靛蓝强调色——这些和"终端窗口"的扁平、精确气质直接冲突(机械层面的检查见 `.claude/plugins/design-workflow/scripts/design-lint.mjs`,但这里是"为什么"的记录)。
- 不用硬投影(非零 x/y + 零模糊的阴影)——终端隐喻里没有这种拟物层级。
- 不把 `rounded-none` 或 `rounded-3xl`+ 引入卡片/按钮系统——只在两级圆角(`full`/`2xl`)之间选,内部小元素可以用 `xl`/`md`。
- 不为了"不同页面有区分度"给 Blog 或项目详情页发明新的容器头样式——终端 chrome 是全站统一签名,不是首页专属。

## 内容页(项目详情 / Blog)的约定

以下是内容管线上线时新引入的规则,之前站点没有对应场景:

- **正文排版(prose)**:基于 `@tailwindcss/typography` 的 `.prose` 做基础,但不用它默认的灰色主题——标题用 `font-mono` + `{colors.*.textMain}`,链接用 `{colors.accent.terminalGreen}` 加下划线,正文文字色用 `textMain`/`textDim` 搭配,行高贴近 `leading-[1.6]` 的既有节奏。具体实现见 `app/globals.css` 里 `@tailwindcss/typography` 的覆盖规则和 `mdx-components.tsx`。
- **MDX 代码块**:不用 typography 插件的默认代码块样式,而是做成和终端 chrome 一致的三色圆点 header,保持"整站都是终端"的视觉签名。
- **图片**:MDX 里的原生 `<img>` 不映射到 `next/image`(项目已设 `images.unoptimized: true`,接入 `next/image` 拿不到优化收益,反而会因为普通 markdown 图片语法缺少 `width`/`height` 导致构建报错),直接用原生标签配合 prose CSS 统一样式。

## 工具链备注

- **`tailwind.config.ts` 是死代码**:仓库里还有一份 v3 风格的遗留文件,`app/globals.css` 没有 `@config` 指令引用它,Tailwind v4 只读 `@theme` 块。不要往这个文件里加东西。
- **design-workflow 插件与本文件的关系**:`.claude/plugins/design-workflow` 里的机械化 lint(`scripts/design-lint.mjs`)完全通用、不读任何项目配置——只硬编码那些不管什么项目都成立的 AI-slop 特征。**这份文件才是品牌约束唯一的落点**:上面 Do's and Don'ts 里的规则,`design-ui`/`design-motion` 在 Setup 阶段直接读这份文件、由 agent 自己判断执行,不存在另一份机器可读的配置文件去镜像它。

## Known Gaps

诚实标注哪些地方还没有确立规则,而不是假装齐全——按 [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) 的惯例保留这个 section:

- **Projects 网格没有移动端降级规则**——桌面端固定两栏(`1fr 1fr`),移动端如何降级(单栏?保持两栏挤压?)还没有明确定义,目前靠浏览器默认行为。
- **表单 / 语义色**:目前没有任何表单输入或校验场景,Semantic 色板是空的。如果以后加联系表单或订阅功能,需要先在这里定义,而不是复用 terminal-red/yellow。
- **组件库还很薄**:目前只有 Terminal Chrome、Card、三种按钮/徽章、Prompt Line 几个反复出现的模式被记录下来。项目详情页的 A/B/C 视觉概念(见下)、更复杂的表单/弹层/空状态组件都还没有先例,遇到时按这份文件的既有规则推导,并把推导结果写回这里。
- **项目详情页的最终视觉概念**——本轮内容管线只搭了"终端 header + prose 正文"的默认壳,A/B/C 概念(命令式导览 / 分屏 README 阅读器 / 轻量版)还没有选定。
