# 任务名称
实现 Minecraft 像素风设计系统基础组件（Design System Pixel UI）

## 任务目标
为项目建立统一的像素风 UI 基础组件与设计 token，保证后续页面风格统一。
风格参考 Minecraft，但不要直接复制游戏界面，要做成**现代网页可用的像素金融工具界面**。

## 产品背景
本产品的视觉关键词：
- **Minecraft Pixel Style**：方块感、硬边、有限色板
- **生存感**：进度、状态、成就反馈
- **游戏化约束**：清晰规则、可预期交互
- **像素科技感**：整齐、网格、数据可读
- **清晰、轻量、可复用**

这些基础组件会被后续模块复用：
- 成本模拟器
- 影子账户页面
- 行为刹车面板
- 分享报告
- 社交广场

---

## 技术要求
- 基于 **Next.js + React + TypeScript**
- 使用 **Tailwind CSS**，design tokens 通过 Tailwind `theme.extend` 或 CSS 变量注入
- 组件应**可复用**，统一使用项目已有的 `lib/utils/cn` 做 className 合并
- **不依赖**大型 UI 框架（如 MUI、Chakra、Ant Design）
- 组件代码位于 **`components/ui/`** 目录，按组件名建子文件（如 `PixelButton.tsx`）

---

## 一、Design Tokens 规范

### 1.1 色彩系统

| Token 用途           | 变量名（建议）     | 色值       | 说明           |
|----------------------|--------------------|------------|----------------|
| 盈利/安全/理智       | `--color-success`  | `#55FF55`  | 正反馈、健康值 |
| 亏损/冲动/警告       | `--color-danger`   | `#FF5555`  | 负反馈、警告   |
| 中性/震荡/背景灰     | `--color-muted`    | `#AAAAAA`  | 次要信息       |
| 页面背景色           | `--color-page-bg` | `#2D2D2D` 或 `#1a1a1a` | 整页底色 |
| 面板背景色           | `--color-panel-bg`| `#3D3D3D` 或 `#404040` | 卡片/面板 |
| 面板边框色           | `--color-border`   | `#555555`  | 面板描边       |
| 文字主色             | `--color-text`     | `#E0E0E0` 或 `#FFFFFF` | 正文 |
| 次级文字色           | `--color-text-muted` | `#AAAAAA` | 说明、标签     |
| 高亮/链接色（可选）  | `--color-accent`   | `#55AAFF`  | 链接、焦点     |

- 在 `tailwind.config.ts` 的 `theme.extend.colors` 中映射上述 token，便于 Tailwind 类名使用（如 `bg-pixel-panel`、`text-pixel-danger`）。
- 或在 `styles/globals.css` 中定义 CSS 变量，再在 Tailwind 中通过 `var(--color-*)` 引用。

### 1.2 像素与间距
- **基础单位**：建议 4px 网格（4、8、12、16、24、32…），保证“像素对齐”感。
- **边框**：统一 2px 实线，营造像素块感；圆角可为 0 或极小（如 2px），避免过于圆润。
- **阴影/按压**：按钮按下时用 `transform: translateY(2px)` 或 2px 内阴影模拟按压，不要复杂渐变。

---

## 二、基础组件清单与 API 约定

### 2.1 PixelButton
- **路径**：`components/ui/PixelButton.tsx`
- **Props**：`children`、`variant?: 'primary' | 'danger' | 'neutral' | 'ghost'`、`size?: 'sm' | 'md' | 'lg'`、`disabled?: boolean`、`type?: 'button' | 'submit'`、`onClick`、`className?`，以及标准 HTML button 属性（如 `aria-*`）。
- **状态**：default、hover、active（按下位移/阴影）、disabled（灰显、不可点）、focus-visible（轮廓或高亮边框）。
- **风格**：块状、2px 边框、active 时下移 2px 或内阴影。

### 2.2 PixelCard
- **路径**：`components/ui/PixelCard.tsx`
- **Props**：`children`、`title?: ReactNode`、`className?`、可选 `padding?: 'none' | 'sm' | 'md'`。
- **风格**：面板背景色 + 边框，内容区可带标题栏（左对齐标题 + 可选右侧操作区）。

### 2.3 PixelInput
- **路径**：`components/ui/PixelInput.tsx`
- **Props**：与原生 `input` 对齐（value、onChange、placeholder、disabled、type 等），加 `label?: string`、`error?: string`、`className?`、`wrapperClassName?`。
- **状态**：default、focus（边框高亮）、disabled、error（边框或文字用 danger 色）。
- **风格**：方框输入框、2px 边框、与 PixelLabel 可组合。

### 2.4 PixelLabel
- **路径**：`components/ui/PixelLabel.tsx`
- **Props**：`children`、`htmlFor?`（与 input id 关联）、`required?: boolean`、`className?`。
- **风格**：主色或次级文字，可带必填星号。

### 2.5 PixelBadge
- **路径**：`components/ui/PixelBadge.tsx`
- **Props**：`children`、`variant?: 'success' | 'danger' | 'muted' | 'accent'`、`className?`。
- **风格**：小标签、色块背景 + 边框，用于状态、分类标记。

### 2.6 PixelProgressBar
- **路径**：`components/ui/PixelProgressBar.tsx`
- **Props**：`value: number`（0–100 或 0–1）、`max?: number`（默认 100）、`variant?: 'default' | 'success' | 'danger'`、`showLabel?: boolean`、`className?`。
- **风格**：参考 XP 条——轨道 + 填充条，边界清晰，便于后续做“理智值”等进度展示。

### 2.7 PixelToast / PixelAchievementToast
- **路径**：`components/ui/PixelToast.tsx`（可导出 `PixelAchievementToast` 为带图标/标题的变体）
- **Props**：`message: ReactNode`、`title?: string`（Achievement 用）、`variant?: 'info' | 'success' | 'danger'`、`duration?: number`、`onClose`。
- **风格**：参考 MC 右上角成就提示——小面板、短时展示，适合网页（可固定右上角，不遮挡主内容）。

### 2.8 PageSection
- **路径**：`components/ui/PageSection.tsx`
- **Props**：`children`、`title?: ReactNode`、`description?: ReactNode`、`className?`。
- **用途**：页面内区块容器，统一外边距与标题/描述排版，供各功能页复用。

---

## 三、状态与交互统一要求
- 所有可交互组件需支持：**default**、**hover**、**active**（按下）、**disabled**。
- 可聚焦组件需有清晰的 **focus-visible** 样式（键盘可访问）。
- 禁用时使用 `pointer-events-none` 与视觉灰化，并设置 `aria-disabled="true"` 或 `disabled`。

---

## 四、本任务要完成的内容（清单）

1. **定义全局 design tokens**
   - 在 `tailwind.config.ts` 和/或 `styles/globals.css` 中实现色彩与间距 token。
2. **实现以下基础组件**（均放在 `components/ui/`）：
   - PixelButton  
   - PixelCard  
   - PixelInput  
   - PixelLabel  
   - PixelBadge  
   - PixelProgressBar  
   - PixelToast / PixelAchievementToast  
   - PageSection  
3. **为组件提供常见状态**：default、hover、active、disabled（及 focus-visible）。
4. **创建 UI 展示页**
   - 路由：`/ui-demo`
   - 展示所有组件及主要 variant、状态示例，便于验收与后续复用参考。
5. **保证后续表单页和图表页能直接复用**
   - 组件不写死业务文案；不包含具体业务逻辑；通过 props 传入内容与配置。

---

## 五、输出结果
1. **设计 token 配置**（Tailwind + 可选 CSS 变量）
2. **基础 UI 组件代码**（`components/ui/*.tsx`）
3. **演示页面**：`app/ui-demo/page.tsx`，展示各组件及状态
4. **可被后续功能直接 import**：例如 `import { PixelButton, PixelCard } from '@/components/ui/PixelButton'` 或统一从 `@/components/ui` 导出

建议在 `components/ui/index.ts` 中统一导出所有组件，便于 `import { PixelButton, PixelCard, ... } from '@/components/ui'`。

---

## 六、验收标准
- [ ] 所有组件均可正常渲染，无 TypeScript 报错
- [ ] 样式统一，色彩与间距符合 token 定义
- [ ] 按钮有清晰按下反馈（位移或阴影）
- [ ] 进度条适合后续做“理智值”等进度展示
- [ ] 通知组件适合后续做“Advancement Made”风格提示，且不遮挡主内容
- [ ] 演示页面 `/ui-demo` 可直观看到各组件及各状态效果
- [ ] 首页或导航中可进入 `/ui-demo`（可选）

---

## 七、编码要求
- 使用 **TypeScript**，所有 Props 有明确类型定义
- **不要写死业务文案**，文案通过 props 或 children 传入
- 保持组件**通用**，不把具体业务逻辑写进基础组件
- 使用项目已有的 **`cn()`** 工具合并 className，支持外部传入 `className` 覆盖
- 组件尽量**可控**（受控）或**非受控**语义清晰（如 Input 支持受控 value + onChange）

---

## 八、特别约束
- **不要**使用过于拟真的游戏贴图（如草块、泥土纹理）
- **不要**引入复杂动画库，用 CSS transition 即可
- **不要**做成纯娱乐风，兼顾**金融工具的清晰性与可读性**
- 像素风体现在：色块、硬边、简单阴影与位移，而非花哨动效或炫彩效果

---

## 九、参考文件结构（建议）

```
components/
  ui/
    index.ts           # 统一导出
    PixelButton.tsx
    PixelCard.tsx
    PixelInput.tsx
    PixelLabel.tsx
    PixelBadge.tsx
    PixelProgressBar.tsx
    PixelToast.tsx     # 含 PixelAchievementToast 变体
    PageSection.tsx
app/
  ui-demo/
    page.tsx           # 组件展示页
styles/
  globals.css          # 可选：CSS 变量
tailwind.config.ts     # theme.extend 色彩与间距
```

以上为在理解“第二个 task”后对需求的完善，可直接作为开发与验收依据。
