# Code Conventions

## Tailwind CSS

### 颜色系统

所有颜色通过 `tailwind.config.js` 的 `colors` 扩展定义，**禁止在 `style={{}}` 中写十六进制色值**。

#### 语义化颜色令牌

| 令牌 | 用途 | 色值 |
|---|---|---|
| `text-leaf-text` | 正文 | `#3A4A3C` |
| `text-leaf-muted` | 次要文字 | `#A8B4A8` |
| `text-leaf-dim` | 弱化文字 | `#B8C4B8` |
| `text-leaf-faint` | 极弱文字 | `#C0CAC0` |
| `text-leaf-gray` | 灰色文字 | `#8A9A8A` |
| `text-leaf-secondary` | 辅助文字 | `#6A8070` |
| `text-leaf-dark` | 深灰绿 | `#607060` |
| `text-leaf-medium` | 中绿 | `#6A9070` |
| `text-leaf-deep` | 深绿（汉字/强调） | `#5A8870` |
| `text-leaf-accent` | 强调绿 | `#4A7058` |
| `text-leaf-note` | 备注/标注 | `#B0C0B0` |
| `text-leaf-DEFAULT` | 主绿色 | `#7A9E82` |
| `bg-leaf` | 主绿色背景（按钮） | `#7A9E82` |
| `bg-leaf-bg` | 浅绿背景 | `#EEF4EF` |
| `bg-leaf-hover` | 悬停态 | `#628070` |
| `card` / `bg-card` | 卡片背景 | `#FEFCF8` |
| `card-back` / `bg-card-back` | 卡片背面 | `#F8FAF8` |
| `card-white` / `text-card-white` | 白字 | `#F8FCF8` |
| `border-leaf-border` | 软边框 | `#D8E4D8` |
| `border-leaf-border2` | 强边框 | `#E4EAE4` |
| `again-*` / `good-*` / `hard-*` / `easy-*` | 反馈语义色 | 见 config |

#### 规则

1. **能用 Tailwind 类的，不用 `style={{}}`。** 静态颜色、背景、边框全部用 className 表达。
2. 颜色写在 className 中，格式 `text-<token>` / `bg-<token>` / `border-<token>`。
3. 仅当需要动态 JS 控制（如 `onMouseEnter` 动态改色、`boxShadow` 复杂值、`rgba()` 函数）时才保留 `style={{}}`。
4. 一次性的非常用色可使用 Tailwind 任意值：`text-[#9AAA9A]`。
5. 不要用 `text-[10px]` 或 `text-[11px]` — 用 `text-xs`（12px）。

### 字号对照

| Tailwind | 实际 px | 用途 |
|---|---|---|
| `text-xs` | 12px | 最小标准字号（标签、辅助信息） |
| `text-sm` | 14px | 正文小字 |
| `text-base` | 16px | 正文 |
| `text-lg` | 18px | 大标题 |
| `text-2xl` | 24px | 假名大字号 |
| `text-[9px]` | 9px | 仅在 ruby `<rt>` 振り仮名中使用 |

禁止 `text-[10px]` 和 `text-[11px]`。

## 组件风格

- 组件职责单一，一个组件做好一件事
- 逻辑抽到 hooks，UI 组件只负责渲染
- 新组件放在 `src/components/<module>/` 下，PascalCase 命名
- 测试文件与源文件同目录：`Preview.tsx` → `Preview.test.tsx`

## CSS

- hover 动效用 CSS 伪类 + `transition-colors`，不用 `onMouseEnter/onMouseLeave` 的 JS 方案
- 翻转动画用 CSS `perspective` + `backface-visibility`
- 不用第三方 CSS/UI 库

## Git

- 分支命名：`feat/description`、`fix/description`
- 提交信息：Conventional Commits（英文）
- 禁止直接合并到 main — 通过 PR 合并
