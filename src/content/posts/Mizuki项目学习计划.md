---
title: "Mizuki 项目学习计划——从看懂到拥有自己的博客"
published: 2025-07-27
description: "前端小白专属的 Mizuki 博客项目学习路径，分 10 阶段 24 天，从跑起来到部署上线"
tags: [Mizuki, Astro, 学习计划, 博客, 前端]
category: 学习笔记
draft: false
pinned: true
---

> **适合人群**：前端小白，已有基本的 HTML/CSS/JS 语法基础，还没做过完整项目。
>
> **目标**：看懂 Mizuki → 会改 Mizuki → 把它变成你自己的博客并上线。
>
> **参考文档**：配合 `Mizuki项目结构详解.md` 一起看，里面标注了每个文件的作用，看不懂某个文件时去查。

---

## 目录

- [0. 学之前需要什么基础](#0-学之前需要什么基础)
- [第一阶段：跑起来，建立手感（Day 1-2）](#第一阶段跑起来建立手感day-1-2)
- [第二阶段：改配置文件，不动代码（Day 3-4）](#第二阶段改配置文件不动代码day-3-4)
- [第三阶段：写文章，理解内容系统（Day 5-6）](#第三阶段写文章理解内容系统day-5-6)
- [第四阶段：读懂 Astro 组件（Day 7-8）](#第四阶段读懂-astro-组件day-7-8)
- [第五阶段：改样式，理解 Tailwind CSS（Day 9-10）](#第五阶段改样式理解-tailwind-cssday-9-10)
- [第六阶段：改组件，真刀真枪动手（Day 11-13）](#第六阶段改组件真刀真枪动手day-11-13)
- [第七阶段：理解 Svelte 交互组件（Day 14-15）](#第七阶段理解-svelte-交互组件day-14-15)
- [第八阶段：加新功能，从改到写（Day 16-18）](#第八阶段加新功能从改到写day-16-18)
- [第九阶段：把它变成你的博客（Day 19-22）](#第九阶段把它变成你的博客day-19-22)
- [第十阶段：部署上线（Day 23-24）](#第十阶段部署上线day-23-24)
- [附录：遇到问题怎么自救](#附录遇到问题怎么自救)

---

## 0. 学之前需要什么基础

在开始学 Mizuki 之前，确保你已经会：

| 基础 | 程度要求 | 怎么验证 |
|------|------|------|
| **HTML** | 认识常用标签：`<div>`, `<h1>-<h6>`, `<p>`, `<a>`, `<img>`, `<ul>/<li>`, `<header>`, `<main>`, `<footer>` | 打开任意 .astro 文件的模板区，能认出 80% 的标签 |
| **CSS** | 理解盒模型、Flex、选择器、class 的概念 | 能在浏览器开发者工具里改一个元素的样式 |
| **JavaScript** | 变量、函数、数组、对象、`import/export` | 能看懂 `const x = [1,2,3].map(n => n*2)` |
| **命令行** | `cd`、`ls`、`mkdir` | 能在终端里进入项目目录 |
| **Git** | `clone`、`add`、`commit`、`push` | 能把代码推到 GitHub |

> 如果以上还有不熟的，先看 `前端学习计划-零基础到实战.md` 的第一周内容，打基础。

**不需要会的**（会在学习过程中慢慢接触）：
- Astro 框架（这个学习计划会带你入门）
- Svelte（第七阶段才接触）
- TypeScript（看懂就行，不用写）
- Tailwind CSS（第五阶段会专门练）

---

## 第一阶段：跑起来，建立手感（Day 1-2）

### Day 1：让项目在本地跑起来

**目标**：在浏览器里看到这个博客网站。

#### Step 1：确认环境

打开终端，依次执行：

```bash
node -v    # 确认 Node.js 已安装（需要 v18+）
npm -v     # 确认 npm 已安装
```

如果报错 "command not found"，先去 [nodejs.org](https://nodejs.org) 下载安装 LTS 版本。

#### Step 2：安装 pnpm 和依赖

```bash
# 安装 pnpm 包管理器（比 npm 更快、更省磁盘）
npm install -g pnpm

# 进入项目目录
cd /Users/gaoyaoqian/DevCode/webwork/Mizuki

# 安装所有依赖（第一次需要几分钟）
pnpm install
```

#### Step 3：启动开发服务器

```bash
pnpm dev
```

浏览器打开 `http://localhost:3000`，你应该能看到一个完整的博客网站。

> **端口说明**：这个项目配置的是 3000 端口（在 `astro.config.mjs` 第 97-99 行的 `server.port`），不是默认的 4321。

#### Step 4：初体验 —— 改一个字看效果

打开 `src/config/siteConfig.ts`，找到第 7 行：

```typescript
title: "Yuzumoon82",
```

改成你的名字，保存。浏览器自动刷新——标题变了。

这就是**热更新（HMR, Hot Module Replacement）**：改代码 → 保存 → 浏览器自动刷新，不用手动 F5。

#### Step 5：随便点点

在浏览器里逛一逛这个网站，了解它有哪些页面：
- 首页（文章列表）
- 点击任意文章 → 文章详情页
- 归档页、关于页、友链页、番剧页……
- 试试右上角的搜索按钮
- 试试侧边栏的音乐播放器
- 试试切换亮色/暗色主题

**目的**：建立感性认识——"这个博客长什么样、有哪些功能"。

---

### Day 2：建立项目地图

**目标**：知道"想改 XX 应该去哪个文件"。

#### 任务 1：对比项目结构文档

打开 `Mizuki项目结构详解.md`，对着文件列表，用 VS Code 打开项目，按图索骥找到以下关键文件：

| 找这个文件 | 它在哪 | 它是干什么的 |
|------|------|------|
| 首页 | `src/pages/[...page].astro` | 博客文章列表页 |
| 文章详情页 | `src/pages/posts/[...slug].astro` | 单篇文章 |
| 全局布局（壳） | `src/layouts/Layout.astro` | 所有页面的 HTML 骨架 |
| 主网格布局 | `src/layouts/MainGridLayout.astro` | 内容区布局（导航+侧栏+内容+Footer） |
| 主配置 | `src/config/siteConfig.ts` | 网站的几乎所有设置 |
| 一篇文章 | `src/content/posts/*.md` | 随便打开一篇看 Markdown 格式 |
| 导航栏 | `src/components/organisms/navigation/Navbar.astro` | 顶部导航 |
| 音乐播放器 | `src/components/widgets/music-player/MusicPlayer.svelte` | 交互组件示例 |

#### 任务 2：理解文件路由的对应关系

在浏览器里访问，然后找到对应的源文件：

| URL | 源文件 |
|------|------|
| `http://localhost:3000/` | `src/pages/[...page].astro` |
| `http://localhost:3000/about/` | `src/pages/about.astro` |
| `http://localhost:3000/friends/` | `src/pages/friends.astro` |
| `http://localhost:3000/projects/` | `src/pages/projects.astro` |
| `http://localhost:3000/posts/xxx/` | `src/pages/posts/[...slug].astro` |

**规律**：`src/pages/xxx.astro` → 自动映射到 `/xxx` 这个 URL。这就是 Astro 的**文件路由**。

> **关键理解**：`[...page].astro` 和 `[...slug].astro` 中的 `[...]` 是 Astro 的**动态路由**语法。`[...page]` 匹配 `/`、`/2/`、`/3/`……`[...slug]` 匹配 `/posts/任意文章名/`。

#### 任务 3：画一张自己的"项目地图"

在纸上或笔记软件里画一个简单的图：

```
我打开浏览器访问 /
    ↓
[...page].astro 处理请求
    ↓
用 MainGridLayout.astro 布局
    ├── Navbar.astro（导航栏）
    ├── Banner.astro（顶部横幅）
    ├── SideBar.astro（左侧栏）
    ├── PostPage.astro（文章列表）← 主要内容
    ├── RightSideBar.astro（右侧栏）
    └── Footer.astro（底部）
```

---

## 第二阶段：改配置文件，不动代码（Day 3-4）

**核心理念**：这个项目是**配置驱动**的。很多内容不需要动 .astro 文件，改配置就能改。配置文件在 `src/config/` 下，是最安全的修改入口——改不坏，改错了改回来就行。

### Day 3：把网站信息改成你的

#### 任务 1：改站点基本信息

打开 `src/config/siteConfig.ts`，逐行看，改以下内容：

| 行 | 改什么 | 改成 |
|------|------|------|
| 第 7 行 `title` | 网站标题 | 你的名字或昵称 |
| 第 8 行 `subtitle` | 网站副标题 | "XXX 的博客" |
| 第 9 行 `siteURL` | 网站域名 | 先不改，部署时再改 |
| 第 14 行 `hue` | 主题色相（0-360） | 挑一个你喜欢的颜色：红色=0，蓝色=240，绿色=120，紫色=270 |

每改一处保存，看浏览器变化。

#### 任务 2：改个人信息

打开 `src/config/profileConfig.ts`，修改：
- 头像（先替换 `public/` 下的图片，再改路径）
- 名字
- 个人简介
- 社交链接（GitHub、邮箱等）

#### 任务 3：改导航栏菜单

打开 `src/config/navBarConfig.ts`，看看菜单项是怎么配置的。试着：
- 改一个菜单名（比如 "关于" 改成 "关于我"）
- 去掉一个你不想要的菜单项
- 注意 `featurePages` 开关的影响（在 `siteConfig.ts` 里）

#### 任务 4：理解"开关"模式

在 `siteConfig.ts` 第 19-30 行，找到 `featurePages`：

```typescript
featurePages: {
    anime: true,    // true = 显示番剧页面
    diary: true,    // false = 隐藏日记页面
    // ...
}
```

试着把 `anime: true` 改成 `anime: false`，保存——番剧页面的入口在导航栏里消失了。

这就是"配置开关"：**不需要删代码，改一个 true/false 就能控制功能显隐**。

---

### Day 4：改外观配置

#### 任务 1：改 Banner

在 `siteConfig.ts` 里找到 `banner` 配置块（约第 108-180 行），理解以下配置：

| 配置 | 作用 |
|------|------|
| `src.desktop` | 桌面端 Banner 图片数组（多张 = 自动轮播） |
| `src.mobile` | 移动端 Banner 图片 |
| `carousel.interval` | 轮播间隔（秒） |
| `homeText.title` | Banner 上的大标题 |
| `homeText.subtitle` | Banner 上的副标题（数组 = 随机/轮播显示） |
| `typewriter.enable` | 副标题打字机效果开关 |
| `typewriter.speed` | 打字速度 |

#### 任务 2：替换 Banner 图片

1. 找 4 张你喜欢的图片（建议 `.webp` 格式，桌面端宽度至少 1920px）
2. 放到 `public/assets/desktop-banner/` 下（替换原有的或新增）
3. 在 `siteConfig.ts` 里修改 `banner.src.desktop` 数组的路径
4. 同样操作移动端 Banner 到 `public/assets/mobile-banner/`

#### 任务 3：改页面布局

理解三种壁纸模式（`wallpaperMode.defaultMode`）：
- `"banner"` — 顶部大横幅（默认）
- `"fullscreen"` — 全屏壁纸
- `"none"` — 无壁纸

改成不同的值，观察页面变化。

#### 任务 4：改文章列表布局

- `postListLayout.defaultMode`：`"list"` = 单列列表，`"grid"` = 双列网格
- `postListLayout.allowSwitch`：是否允许访客切换布局
- 把 `defaultMode` 改成 `"grid"`，看看效果

---

## 第三阶段：写文章，理解内容系统（Day 5-6）

### Day 5：用 Markdown 写文章

#### 任务 1：理解 Markdown Frontmatter

打开 `src/content/posts/` 下的任意一篇文章（`.md` 文件），观察顶部：

```markdown
---
title: "文章标题"
published: 2025-07-24
description: "文章简介"
tags: [前端, 学习]
category: 学习笔记
draft: false
pinned: false
---
```

这就是 **Frontmatter**——文章元数据，用 `---` 包起来。它告诉 Astro：这篇文章的标题是什么、什么时候发布的、属于哪个分类。

查阅 `src/content.config.ts`，这里面用 Zod 定义了所有支持的 frontmatter 字段及其类型。

#### 任务 2：创建你的第一篇文章

```bash
pnpm new-post 我的第一篇文章
```

这会在 `src/content/posts/` 下生成一个新文件。打开它：

1. 修改 frontmatter 里的 `description`、`tags`、`category`
2. 在 `---` 下面的区域用 Markdown 写内容：

```markdown
## 今天学了什么

今天我开始学习 Astro 静态博客框架……

### 三个收获

1. Astro 的 `.astro` 文件分为 frontmatter 区和模板区
2. 文件路由：`src/pages/xxx.astro` → `/xxx`
3. 热更新：改了代码不用手动刷新

### 代码示例

​```javascript
console.log('Hello, Mizuki!');
​```
```

保存，首页应能看到你的新文章。

#### 任务 3：理解 Markdown → HTML 的渲染过程

Astro 处理文章的流程：

```
.md 文件
  → frontmatter 被解析为元数据（标题、日期、标签...）
  → Markdown 正文被 remark/rehype 插件处理
    → 代码块 → Expressive Code 高亮
    → 数学公式 → KaTeX 渲染
    → Mermaid 图表 → 转为 SVG
    → 图片 → 优化 + 响应式
    → Admonition（提示框）→ 自定义组件
  → 最终生成 HTML 页面
```

用到的插件都在 `src/plugins/` 下，在 `astro.config.mjs` 的 `markdown.processor` 中注册。**现在不需要看懂插件代码，只要知道它们存在就行**。

---

### Day 6：理解内容与代码分离

#### 任务 1：理解内容同步机制

这个项目支持**内容与代码分离**——文章可以存放在另一个 Git 仓库里，构建时自动拉取。

看这几个文件：
- `scripts/sync-content.js` — 从远程仓库拉取文章
- `scripts/init-content-repo.js` — 初始化内容仓库
- `docs/CONTENT_SEPARATION.md` — 内容分离说明文档

`package.json` 里的 `predev` 和 `prebuild` 脚本会在启动/构建前自动执行同步：

```json
"predev": "node scripts/sync-content.js || true",
"prebuild": "node scripts/sync-content.js || true",
```

`|| true` 的意思是：即使同步失败（比如没有配置内容仓库），也不影响启动。

#### 任务 2：再写两篇文章

1. **"我是怎么开始学前端的"** — 自我介绍，用上图片、链接、列表
2. **"Mizuki 博客搭建记录"** — 记录你学到现在的过程

练习 Markdown 语法：
- `#` `##` `###` 标题层级
- `**粗体**` `*斜体*`
- `[链接文字](URL)`
- `![图片描述](图片路径)`
- `- 列表项`
- `1. 有序列表`
- `> 引用文字`
- ​```语言 代码块 ```

---

## 第四阶段：读懂 Astro 组件（Day 7-8）

### Day 7：.astro 文件的解剖

#### 核心概念：三段式结构

每一个 `.astro` 文件包含三个区域（后两个可选）：

```astro
---
// ╔══════════════════════════════╗
// ║  ① Frontmatter（脚本区）      ║
// ║  运行在服务器端（构建时）       ║
// ║  写 JS/TS 逻辑、import、取数据  ║
// ╚══════════════════════════════╝
import Layout from '../layouts/Layout.astro';
const title = '我的页面';
const items = ['a', 'b', 'c'];
---

<!-- ╔══════════════════════════════╗ -->
<!-- ║  ② Template（模板区）         ║ -->
<!-- ║  写 HTML/组件，可用 {变量}      ║ -->
<!-- ╚══════════════════════════════╝ -->
<Layout>
  <h1>{title}</h1>
  <ul>
    {items.map(item => <li>{item}</li>)}
  </ul>
</Layout>

<style>
  /* ╔══════════════════════════════╗ */
  /* ║  ③ Style（样式区，可选）      ║ */
  /* ║  默认 Scoped：只影响当前组件   ║ */
  /* ╚══════════════════════════════╝ */
  h1 { color: red; }
</style>
```

#### 练习 1：从最简单的原子组件开始

打开 `src/components/atoms/Badge/Badge.svelte`（或 `Button/Button.astro`），逐行读完。

- 这类原子组件通常很短（20-50 行），是最容易看懂的入口
- 注意：它接受 `Props`（也叫属性/参数），父组件传入，组件内部使用

#### 练习 2：读懂 about.astro

打开 `src/pages/about.astro`，对照上面的三段式结构理解它：

1. Frontmatter 区导入了什么？
2. 模板区用了什么 HTML 标签和组件？
3. `<Layout>` 是怎么包裹它的？

改一下 `<h1>` 里的文字，保存看效果。

#### 练习 3：找 5 个 `.astro` 组件，标出"三段式"

随便打开 5 个 `.astro` 文件，每个都：
1. 找到 frontmatter 区（`---` 之间）
2. 找到模板区（HTML/组件部分）
3. 找到样式区（如果有的话）

---

### Day 8：理解布局和插槽（Slot）

#### 核心概念：Layout 模式

这是 Astro / 所有组件化框架最重要的模式之一：**Layout 组件提供"壳"，每个页面填充自己的"肉"**。

打开 `src/layouts/Layout.astro`，找到 `<slot />`。

```astro
<!-- Layout.astro -->
<html>
  <head>...</head>
  <body>
    <Header />            ← 每个页面都一样
    <main>
      <slot />            ← ★ 这里放每个页面自己的内容
    </main>
    <Footer />            ← 每个页面都一样
  </body>
</html>
```

当 `about.astro` 这样写：

```astro
<Layout title="关于我">
  <h1>这是关于页面</h1>     ← 这段内容会替换 <slot />
</Layout>
```

**最终生成的 HTML**：

```html
<html>
  <head>...</head>
  <body>
    <Header />
    <main>
      <h1>这是关于页面</h1>   ← 替换了 <slot /> 的位置
    </main>
    <Footer />
  </body>
</html>
```

#### 练习：追踪 slot 的传递链

从 `about.astro` 开始追踪：

```
about.astro
  → <Layout>...</Layout>  ← 给 Layout 传了 title 和 slot 内容
    → Layout.astro  ← 接收 title prop；<slot /> 放内容
      → 在 <head> 里用 {title} 拼出 <title> 标签
      → 在 <body> 里用 <slot /> 渲染子内容
```

再用同样的方法追踪首页 `[...page].astro`：
```
[...page].astro
  → <MainGridLayout>...</MainGridLayout>
    → MainGridLayout.astro  ← 包装在 Layout 之上
      → Layout.astro  ← 最终还是套这个壳
```

---

## 第五阶段：改样式，理解 Tailwind CSS（Day 9-10）

### Day 9：Tailwind CSS 入门

#### 核心理念

Tailwind CSS 是**原子化 CSS 框架**。传统方式是你写 CSS 规则给 class 起名，Tailwind 是给你成千上万个预先定义好的、单一用途的 class，你直接在 HTML 里组合它们。

```html
<!-- 传统写法 -->
<style>
  .my-button {
    padding: 8px 16px;
    background: blue;
    color: white;
    border-radius: 8px;
  }
</style>
<button class="my-button">按钮</button>

<!-- Tailwind 写法 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg">按钮</button>
```

**优点**：不用在 HTML 和 CSS 文件之间来回切换，不用给 class 起名字。
**缺点**：HTML 会变得很长。习惯了就好。

#### 最重要的记忆规律

Tailwind 的 class 命名非常有规律：

| 类别 | 命名模式 | 示例 |
|------|------|------|
| 颜色 | `{color}-{depth}` | `text-gray-500`, `bg-blue-100`, `border-red-300` |
| 尺寸 | `{property}-{size}` | `p-4`（padding 16px）, `m-2`（margin 8px）, `w-64`（width 256px） |
| 文字 | `text-{size}` | `text-sm`, `text-lg`, `text-2xl`, `text-4xl` |
| 粗细 | `font-{weight}` | `font-normal`, `font-bold`, `font-black` |
| 圆角 | `rounded-{size}` | `rounded`, `rounded-lg`, `rounded-full` |
| 阴影 | `shadow-{size}` | `shadow`, `shadow-md`, `shadow-xl` |
| 显示 | `flex`, `grid`, `hidden`, `block` | 布局相关 |
| 响应式 | `{screen}:{class}` | `md:flex`, `lg:hidden`, `xl:text-2xl` |

> **学习方法**：不背。打开 [Tailwind CSS 文档](https://tailwindcss.com/docs)，用到什么查什么。试 100 次就记住了。

#### 练习 1：在浏览器里改 class

1. 打开 `http://localhost:3000`，按 F12 打开开发者工具
2. 点击左上角的元素选择器（箭头图标）
3. 选中一个元素（比如文章标题）
4. 在右侧 Styles 面板里，找到它的 class
5. 双击一个 class 名，改成别的值，观察效果

比如：
- 把 `text-lg` 改成 `text-4xl` → 字变大
- 把 `text-gray-500` 改成 `text-blue-500` → 颜色变蓝
- 加一个 `bg-yellow-200` → 背景变黄

#### 练习 2：改一个组件的样式

打开 `src/components/features/posts/PostCard.astro`，找到其中的 class：
- 给卡片加一个 `hover:shadow-xl`（鼠标悬停大阴影）
- 把标题颜色改成 `text-blue-600`

保存看效果。

---

### Day 10：理解和修改全局样式

#### 任务 1：理解 main.css 的结构

打开 `src/styles/main.css`。这个文件导入了 Tailwind 并注册了项目中用到的自定义 CSS 变量。观察 `@theme` 块中定义的 CSS 变量（以 `--` 开头）。

#### 任务 2：改主题色

主题色通过 CSS 变量控制，核心是 `--hue`（色相）。Mizuki 的主题色系统基于 OKLCH 色彩空间：

- 用 `--hue` 设定色相（0-360）
- 网站的所有主题色自动基于这个值计算出来

你在 `siteConfig.ts` 里改的 `themeColor.hue` 就是在控制这个值。

#### 任务 3：改暗色模式颜色

打开浏览器开发者工具，在 `<html>` 元素上找到 `class="dark"` 或类似的暗色模式标记。手动切换主题，观察哪些 CSS 变量变了。

如果想自定义暗色模式的配色，搜 `@media (prefers-color-scheme: dark)` 和 `.dark` 相关的样式规则。

#### 任务 4：改字体

在 `src/styles/main.css` 的 `@theme` 块里找到 `--font-sans` 变量。这控制了全站的默认字体。字体文件本身通过 `astro.config.mjs` 的 `fonts` 配置加载。

如果想用系统默认字体（更快）：

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

---

## 第六阶段：改组件，真刀真枪动手（Day 11-13）

### Day 11：改导航栏

#### 目标：把导航栏改成你想要的样子

1. 打开 `src/components/organisms/navigation/Navbar.astro`
2. 找到菜单项渲染的部分
3. 改一个菜单名
4. 改菜单的样式（高亮当前页面的样式）
5. 给导航栏加一个背景模糊效果：`backdrop-blur-md`

同时看 `src/config/navBarConfig.ts`，理解配置如何驱动导航栏的渲染。

---

### Day 12：改首页文章列表

#### 目标：调整首页文章卡片的展示

1. 打开 `src/components/features/posts/PostCard.astro`
2. 改卡片的布局（封面图位置、标题大小、描述截断行数）
3. 把日期格式改成你喜欢的样子（比如 "2025年7月26日"）

相关工具函数在 `src/utils/date-utils.ts`。

#### 理解 PostCard vs PostListItem

- `PostCard.astro`：网格模式的卡片
- `PostListItem.astro`：列表模式的行

两者的区别是布局，数据来源相同。在 `PostPage.astro` 中按当前布局模式决定用哪个。

---

### Day 13：改 Footer

#### 目标：把页脚改成你自己的

1. 打开 `src/components/organisms/footer/Footer.astro`
2. 改版权信息、链接
3. 改 ICP 备案号（如果需要的话）

相关配置：`src/config/footerConfig.ts`、`src/config/licenseConfig.ts`

---

## 第七阶段：理解 Svelte 交互组件（Day 14-15）

### Day 14：Svelte 是什么，和 Astro 什么关系

#### 关键区别

| | .astro 组件 | .svelte 组件 |
|------|------|------|
| **运行位置** | 服务器端（构建时） | 浏览器端（运行时） |
| **生成什么** | 静态 HTML | 带交互的 HTML + JS |
| **能做什么** | 渲染内容、接收 props | 响应用户点击、输入、动画、状态管理 |
| **什么时候用** | 页面、布局、纯展示组件 | 音乐播放器、搜索、主题切换、表单 |

#### 程序员的类比

- `.astro` = **打印机**：构建时跑一次，产出静态 HTML，和用户没有互动
- `.svelte` = **手机 App**：跑在用户浏览器里，响应用户操作

#### Svelte 组件的基本结构

```svelte
<script>
  // ① 脚本区：变量、函数、逻辑
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<!-- ② 模板区：HTML + Svelte 模板语法 -->
<button on:click={increment}>
  点击了 {count} 次
</button>

<style>
  /* ③ 样式区：Scoped 样式 */
  button {
    background: blue;
    color: white;
  }
</style>
```

#### 练习：找到一个 Svelte 组件，认三样东西

打开 `src/components/control/ThemeSwitch.svelte`（主题切换按钮）：

1. 找到 `<script>` 里的 `let` 变量 —— 这是组件的**状态**
2. 找到 `on:click={...}` —— 这是**事件监听**
3. 找到模板里的 `{#if ...}` 和 `{变量}` —— 这是 Svelte 的**模板语法**

---

### Day 15：跟踪音乐播放器的数据流

#### 目标：理解一个复杂 Svelte 组件是怎么工作的

音乐播放器是这个项目里最复杂的 Svelte 组件，在 `src/components/widgets/music-player/`。

**组件层级**（从外到内）：

```
MusicPlayer.svelte          ← 顶层：控制播放器整体显示/隐藏
  ├── FabMusicPanel.svelte  ← 悬浮按钮 + 弹出面板
  └── PlayerBar.svelte      ← 底部播放条
        ├── TrackDisplay     ← 当前曲目信息（封面、歌名、歌手）
        ├── PlayerControls   ← 播放/暂停/上一首/下一首
        ├── ProgressControl  ← 进度条
        └── VolumeControl    ← 音量控制
```

**数据流**：

```
musicPlayerStore.ts（全局状态仓库）
  ↓ 订阅
MusicPlayer.svelte
  ↓ props 传递
PlayerBar.svelte
  ↓ props 传递
TrackDisplay / PlayerControls / ProgressControl ...
```

`musicPlayerStore.ts`（`src/stores/musicPlayerStore.ts`）是数据源——它存储了：
- 当前播放的歌曲
- 播放列表
- 播放状态（播放中/暂停）
- 音量
- 播放模式（顺序/随机/单曲循环）

**概念理解**：
- **Store（状态仓库）**：类似一个全局变量，任何组件都能读取/修改它
- **当 Store 更新时，所有读取它的组件自动更新**——这就是"响应式"

> **不用现在就学会写 Svelte。这个阶段的目标只是：能认出 .svelte 文件、知道它是做交互的、理解数据从 store 流向组件。**

---

## 第八阶段：加新功能，从改到写（Day 16-18）

### Day 16：加一个新页面

#### 目标：从零新建一个页面，并加到导航栏里

**Step 1：创建页面文件**

在 `src/pages/` 下新建 `reading.astro`：

```astro
---
import MainGridLayout from '../layouts/MainGridLayout.astro';
---

<MainGridLayout title="读书笔记">
  <main class="max-w-2xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-6">📚 读书笔记</h1>
    <p class="text-gray-500">这里记录我读过的书和笔记。</p>

    <div class="mt-8 space-y-4">
      <div class="p-4 border rounded-lg">
        <h3 class="font-bold">《书名》</h3>
        <p class="text-sm text-gray-500">作者 · 2025 年 7 月读完</p>
        <p class="mt-2">这本书讲了……</p>
      </div>
    </div>
  </main>
</MainGridLayout>
```

保存，访问 `http://localhost:3000/reading/`——你的新页面出现了！

**Step 2：加到导航栏**

打开 `src/config/navBarConfig.ts`，在菜单列表里加一项链接到 `/reading/`。

---

### Day 17：添加一个新的侧边栏小部件

#### 目标：在侧边栏加一个自定义小部件

**Step 1：理解侧边栏的渲染机制**

侧边栏的内容由 `widget-manager.ts`（`src/utils/widget-manager.ts`）管理。它在启动时读取 `sidebarConfig.ts`，决定哪些 widget 在什么条件下显示。

**Step 2：创建一个小部件**

在 `src/components/widgets/` 下新建 `my-quote/MyQuote.astro`：

```astro
---
// 随机显示一句名言
const quotes = [
  { text: "代码是写给人看的，顺便能在机器上运行。", author: "Harold Abelson" },
  { text: "简单是可靠的先决条件。", author: "Edsger Dijkstra" },
  { text: "先让程序跑起来，再考虑优化。", author: "Kent Beck" },
];
const random = quotes[Math.floor(Math.random() * quotes.length)];
---

<div class="my-quote p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
  <p class="text-sm italic">"{random.text}"</p>
  <p class="text-xs text-gray-500 mt-1">— {random.author}</p>
</div>
```

**Step 3：注册到侧边栏**

在 `src/config/sidebarConfig.ts` 中配置这个新 widget。

---

### Day 18：定制文章详情页

#### 目标：文章页面的展示由你掌控

1. 打开 `src/pages/posts/[...slug].astro` — 理解它如何获取文章数据并传给布局
2. 打开 `src/components/features/posts/PostPage.astro` — 这是文章页面的核心组件
3. 试着改：
   - 文章标题的字号
   - 文章元数据（日期、分类、字数、阅读时长）的显示顺序
   - 要不要显示文章封面
   - 相关文章推荐的数量

相关工具函数在：
- `src/utils/content-utils.ts` — 内容处理
- `src/utils/post-card-content.ts` — 卡片内容提取
- `src/utils/reading-time` — 阅读时长计算（这是一个 npm 包）

---

## 第九阶段：把它变成你的博客（Day 19-22）

### Day 19：彻底改头换面

#### 目标：让博客在视觉上不再像原版 Mizuki

| 要改的 | 在哪改 | 改成什么 |
|------|------|------|
| 网站标题 | `siteConfig.ts` | 你的名字 |
| Banner 图 | 替换 `public/assets/desktop-banner/` 下的图 | 你自己的图 |
| 头像 | 替换 `public/assets/` 或 `src/assets/images/` | 你自己的头像 |
| 主题色 | `siteConfig.ts` 的 `themeColor.hue` | 你喜欢的颜色 |
| 字体 | `astro.config.mjs` 的 `fonts` 配置 | 你喜欢的字体（或用系统默认） |
| 首页介绍 | `siteConfig.ts` 的 `banner.homeText` | 你自己的欢迎语 |
| 导航栏菜单 | `navBarConfig.ts` | 你想要的菜单 |
| 音乐 | `musicConfig.ts` + `public/assets/music/` | 你喜欢的歌 |
| 社交链接 | `profileConfig.ts` | 你自己的链接 |
| Footer 版权 | `footerConfig.ts` | 你的名字 |

---

### Day 20：清理内容

1. 删除 `src/content/posts/` 下原有的示例文章（或移到备份文件夹）
2. 保留你之前写的 3 篇文章
3. 再写至少 2 篇新文章，让你的博客有 5+ 篇文章
4. 删掉不想要的特色页面（在 `siteConfig.ts` 的 `featurePages` 里关掉）

---

### Day 21：整理数据和图片

1. `src/data/projects.ts` — 改成你自己的项目
2. `src/data/friends.ts` — 加你自己的友链（或清空）
3. `src/data/skills.ts` — 改成你会的技能
4. `src/data/timeline.ts` — 改成你的经历
5. 清理 `public/` 下的旧图片，换上你自己的
6. 把 `logo.png` 换成你自己的 logo

---

### Day 22：打磨细节

- 改 404 页面（`src/pages/404.astro`）：写一句有趣的话
- 改 RSS 配置（检查 `rss.xml.ts`）
- 改 `README.md`：介绍你自己的博客
- 检查所有中文文案，确保没有"Yuzumoon82"的痕迹
- 打开所有页面（首页、文章、关于、友链……），确认都正常
- 在手机浏览器上测试，确认移动端也正常

---

## 第十阶段：部署上线（Day 23-24）

### Day 23：构建 + GitHub Pages 部署

#### Step 1：在 GitHub 上创建仓库

1. 登录 GitHub → New Repository
2. 仓库名：`my-blog`（或任何你喜欢的名字）
3. 不要勾选 "Initialize this repository with a README"（因为已有代码）

#### Step 2：关联远程仓库

```bash
cd /Users/gaoyaoqian/DevCode/webwork/Mizuki

# 查看当前的远程仓库
git remote -v

# 添加你自己的远程仓库
git remote add origin https://github.com/你的用户名/my-blog.git

# 推送代码
git push -u origin main
```

#### Step 3：修改 siteURL

在 `src/config/siteConfig.ts` 里，把 `siteURL` 改成你的 GitHub Pages 地址：

```typescript
siteURL: "https://你的用户名.github.io/my-blog/",
```

同时确认 `astro.config.mjs` 里的 `base` 路径正确：

```javascript
base: process.env.NODE_ENV === "production" ? "/my-blog/" : "/",
```

#### Step 4：本地构建测试

```bash
pnpm build
pnpm preview
```

打开 `http://localhost:4321` 检查构建结果。

---

### Day 24：正式部署

#### 方案 A：Vercel 部署（推荐，最简单）

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点 "New Project" → 选择你的仓库
3. **FrameWork Preset** 会自动识别为 Astro
4. **Build Command**: `pnpm build`
5. **Output Directory**: `dist`
6. 点 Deploy
7. 等 2 分钟，拿到 `xxx.vercel.app` 网址

Vercel 的优势：
- 自动检测 Astro 项目，零配置
- 每次 push 自动重新部署
- 支持自定义域名
- 免费额度足够个人博客使用

#### 方案 B：GitHub Pages（用 Actions 自动部署）

项目已经有 `.github/workflows/deploy.yml`，但可能需要调整：

1. 在 GitHub 仓库 Settings → Pages → Source 选 "GitHub Actions"
2. 每次 push 到 main 分支，Actions 自动构建部署

> **注意**：如果用 GitHub Pages，注意 `astro.config.mjs` 里的 `base` 配置和 `siteConfig.ts` 里的 `siteURL` 要匹配你的 GitHub Pages 地址。

#### ✅ 部署成功标志

- 用手机/其他设备打开你的网址，能正常访问
- 文章、图片、样式都正常显示
- RSS 订阅地址可以正常访问

---

## 🎯 完整里程碑速查

| 天数 | 阶段 | 核心目标 | 产出 |
|------|------|------|------|
| Day 1-2 | 跑起来 | 项目在本地跑起来 | 能访问 localhost:3000 |
| Day 3-4 | 改配置 | 用配置文件改网站信息 | 标题、个人信息变成你的 |
| Day 5-6 | 写文章 | 用 Markdown 写文章 | 3 篇自己写的文章 |
| Day 7-8 | 懂 Astro | 理解 .astro 文件结构 | 能看懂任意 .astro 组件 |
| Day 9-10 | 改样式 | 能用 Tailwind CSS class | 改了 5+ 个组件的样式 |
| Day 11-13 | 改组件 | 改导航栏、文章卡片、Footer | 导航栏/Footer 是你的样式 |
| Day 14-15 | 懂 Svelte | 理解 .svelte 交互组件 | 能说出数据流怎么走 |
| Day 16-18 | 加功能 | 新建页面 + 侧边栏部件 | 一个自定义页面 + widget |
| Day 19-22 | 变我的 | 彻底个性化 | 看起来完全是你的博客 |
| Day 23-24 | 上线 | 构建 + 部署 | 人人都能访问的网址 |

---

## 📖 建议的阅读顺序（如果想系统学习源码）

当你想深入理解这个项目时，按以下顺序阅读关键文件：

```
第 1 层：入门
  ├── src/config/siteConfig.ts        ← 先看配置，理解网站有哪些开关
  ├── src/content.config.ts           ← 理解内容集合定义
  └── src/pages/about.astro           ← 最简单的页面

第 2 层：布局
  ├── src/layouts/Layout.astro        ← 全局 HTML 骨架
  ├── src/layouts/MainGridLayout.astro ← 内容区布局
  └── src/pages/[...page].astro       ← 首页的文章列表渲染

第 3 层：组件
  ├── src/components/atoms/Icon/Icon.astro       ← 原子组件
  ├── src/components/atoms/Button/Button.astro   ← 原子组件
  ├── src/components/features/posts/PostCard.astro  ← 业务组件
  ├── src/components/organisms/navigation/Navbar.astro ← 有机体
  └── src/components/widgets/profile/Profile.astro    ← 侧边栏部件

第 4 层：交互
  ├── src/components/control/ThemeSwitch.svelte   ← 简单 Svelte 组件
  ├── src/stores/musicPlayerStore.ts              ← 全局状态
  └── src/components/widgets/music-player/        ← 复杂 Svelte 组件群

第 5 层：工具和插件
  ├── src/utils/content-utils.ts     ← 核心数据处理
  ├── src/scripts/swup-manager.ts    ← 页面过渡管理器
  ├── src/plugins/rehype-component-admonition.mjs  ← 自定义 Markdown 组件
  └── astro.config.mjs               ← 总配置（最后看，因为包含所有插件）
```

---

## 附录：遇到问题怎么自救

### 1. 改坏了怎么办？

```bash
# 放弃所有修改，回到最后一次 commit 的状态
git checkout -- .

# 或者只恢复一个文件
git checkout -- src/config/siteConfig.ts

# 查看你改了哪些文件
git status
```

**所以**：改代码之前先 `git commit`！养成习惯：做一个小改动 → commit → 再做下一个。

### 2. 页面报错怎么办？

1. 先看终端（运行 `pnpm dev` 的窗口），错误信息通常在那
2. 再看浏览器的开发者工具 Console（F12 → Console 标签）
3. 把错误信息复制到 Google 搜
4. Astro 的错误提示通常非常清晰，**认真读**就能定位到具体文件和行号

### 3. 不知道怎么改某个东西？

查找法：
1. 在浏览器里右键 → 检查元素，看它的 class 名
2. 用 VS Code 的全局搜索（Cmd+Shift+F），搜这个 class 名
3. 找到对应的 `.astro` 或 `.svelte` 文件

问 AI 法：
1. 打开 `Mizuki项目结构详解.md`
2. 找到你想改的部分属于哪个目录
3. 打开对应的文件，把代码贴给 AI 问

### 4. "这个技术我不懂"怎么办？

| 不懂的 | 学哪个 | 需要多深 |
|------|------|------|
| Astro | [Astro 官方教程](https://docs.astro.build/en/tutorial/0-introduction/) | 前三章就够了 |
| Tailwind CSS | [Tailwind 文档](https://tailwindcss.com/docs) | 会查 class 名就行 |
| Svelte | [Svelte 教程](https://svelte.dev/tutorial/) | 前 10 节，理解响应式概念 |
| TypeScript | 先跳过 | 能看懂 `let x: string` 这种类型注解就行 |
| Markdown | [Markdown 指南](https://www.markdownguide.org/) | 10 分钟学会 |

---

> **最后的话**：这个项目有 600+ 个文件，你不需要全看懂。你的目标是让别人访问你的博客时，觉得"这是你的博客"，而不是"这是用 Mizuki 模板改的"。做到这一点，你就成功了。🎉
