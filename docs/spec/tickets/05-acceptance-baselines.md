# 05 — 验收固化:截图基准 + E2E 烟囱

**Blocked by**:01、02、03、04 全部(动效全落地前,截图基准会一直失效——本刀是序列末尾的「集成并验证」)
**设计冻结**:不涉及 UI

## 要建什么

把 spec [[home-motion-upgrade]] §5 的黑盒验收自动化,让首页动效系统从此有回归网。用仓库**已有的 puppeteer**(devDependencies 里现成,design-workflow 截图流程同源)搭 E2E 烟囱,跑在**构建产物(静态导出)**上,不 mock 任何自有模块。

七个 case(全部落在首页):

1. **boot 完成性**——桌面视口加载,≤1.5s 内徽章行/H1/副标题/描述/头像卡片全部可见且不再变化,过程无布局跳动。
2. **头像解密**——桌面 hover 头像卡片照片显现,移开后字符场恢复。
3. **reduced-motion**——模拟减弱动态效果偏好加载:无打字、无解密、无 settle,直接终态。
4. **移动端档位**——粗指针视口:页面未创建 WebGL 上下文,头像为静态 ASCII,tap 在 ASCII/照片间切换。
5. **section 语法**——逐个滚动到各 section:prompt 打字一次、内容在其后入场;回滚再进不重播。
6. **亮色主题同保真**——切亮色走完 boot:字符场为深色字符、无白底发光,编排与暗色同样在场。
7. **无 JS 降级**——禁 JS 加载:全部文案与静态 ASCII 头像可见,无空白区域。

四张截图基准:暗/亮主题 × 桌面/移动视口,取 boot 完成后的**稳定终态**(等动画全部结束再截,规避 flaky;常驻动画如绿点脉冲、状态 spinner 需在截图前冻结或遮蔽)。

## 验收标准

- [x] 七个 case 单命令全绿,可在本地重复执行
- [x] 四张基准图入库,连续跑三次无 diff(无 flaky)
- [x] 任一 case 失败时输出可定位:失败截图或带上下文的日志,不是裸的超时
- [x] 既有构建与 lint 保持绿

## 选中的存量回归

无 test-cases 库——**本刀交付的就是这个仓库第一份浏览器级回归套件**。既有真实套件(Next 静态导出构建、ESLint、01 的生成器单元测试)保持绿即可。

## 决策记录(实现期补记)

**ESLint 9 flat-config 迁移**(`eslint.config.mjs` 新增,`npm run lint` 从 `next lint` 改为 `eslint .`):不在本 ticket 原始范围内,是「既有构建与 lint 保持绿」这条验收标准逼出来的工具性使能——Next 16 移除了 `next lint`,不迁移 `npm run lint` 就无法运行。round-1 codex-review 指出这是未申报的 scope expansion,在此补记为决策而非事后默许。

迁移带出的连带变更:
- `scripts/generate-sitemap.js`(CommonJS,`require()`)被新 flat config 的 `@typescript-eslint/no-require-imports` 规则命中;`eslint.config.mjs` 为 `scripts/**/*.js` 加了针对性 override 关闭该规则,不动全局默认。
- flat config 首次启用 `react-hooks/immutability`、`react-hooks/set-state-in-effect`、`@typescript-eslint/ban-ts-comment` 三条规则,命中 `DecryptedText.tsx`、`ProjectCard.tsx`、`ThemeToggle.tsx`、`TypewriterTitle.tsx` 四个文件里长期存在、与本次改动无关的代码模式。三条规则的 warn 降级通过 `eslint.config.mjs` 的 `files` override **精确圈定到这四个文件**,不做仓库级 default 降级;这四个文件之外(含本刀新增的 `useHeroBoot.ts`、`AsciiAvatarCard.tsx` 等)一律保持 error,新代码触发的告警在实现期已逐条改掉,不依赖 warn 豁免。
