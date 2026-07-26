---
title: "Mizuki 项目学习计划"
published: 2025-07-26
pinned: true
description: "从零到上线自己的博客——Mizuki 开源 Astro 静态博客模板学习路径"
tags: [Mizuki, Astro, 学习计划, 博客]
category: 学习笔记
draft: false
---

# Mizuki 项目学习计划 —— 从零到上线自己的博客

> Mizuki 是一个开源的 Astro 静态博客模板。你的目标：看懂它 → 改它 → 把它变成你自己的博客。

---

## 〇、先认识这个项目

### Mizuki 是什么

一个**静态博客网站**。写 Markdown 文章 → 自动生成 HTML 页面 → 部署到网上就能访问。

### 技术栈一览

| 技术 | 干什么的 | 你需要学到什么程度 |
|------|------|------|
| **Astro** | 框架，把 Markdown + 组件 → HTML 页面 | 会用 .astro 文件，理解 frontmatter 和 template |
| **Tailwind CSS** | 写样式的，用 class 名控制外观 | 会查文档，找到你想要的 class 名 |
| **Svelte** | 做交互组件（音乐播放器、搜索等） | 先跳过，只看不改 |
| **TypeScript** | 带类型的 JavaScript | 能读懂就行，不需要写 |
| **Markdown/MDX** | 写文章的格式 | 会用 # 标题、列表、链接 |

### 目录结构速览

```
Mizuki/
├── astro.config.mjs          ← 网站配置（插件、域名、SEO）
├── src/
│   ├── pages/                ← ★ 页面：首页、关于、文章列表...
│   ├── components/           ← ★ 组件：按钮、卡片、导航栏...
│   │   ├── atoms/            ←   最小组件（Button, Icon, Badge）
│   │   ├── widgets/          ←   大组件（音乐播放器、评论）
│   │   └── layout/           ←   页面骨架（header, footer, sidebar）
│   ├── layouts/Layout.astro  ← ★ 全局布局（所有页面都套这个壳）
│   ├── config/               ← ★ 配置文件（改这个就能改网站内容）
│   ├── content/posts/        ← ★ 博客文章（Markdown 文件）
│   ├── styles/               ← 样式文件
│   └── data/                 ← 数据文件（项目列表、朋友列表等）
├── public/                   ← 静态资源（图片、字体）
└── package.json              ← 项目依赖和脚本命令
```

---

## 第一阶段：跑起来（Day 1）

### 目标：能在本地浏览器看到这个网站

**Step 1：安装依赖**

```bash
cd /Users/dduo/WebstormProjects/Mizuki

# 如果没有 pnpm，先装它
npm install -g pnpm

# 装项目依赖
pnpm install
```

**Step 2：启动开发服务器**

```bash
pnpm dev
```

浏览器打开 `http://localhost:4321` —— 你应该能看到一个完整的博客网站。

**Step 3：改一行字，验证热更新**

打开 `src/config/site.ts`（或 `src/config/` 下的配置文件），找到网站标题，改一个字，保存。浏览器自动刷新——这说明**热更新**在工作。

**今天学到什么**：
- pnpm 是包管理器，`pnpm install` = 下载项目需要的所有代码
- `pnpm dev` = 启动开发服务器，"dev" = development
- Astro 的热更新：改代码 → 保存 → 浏览器自动刷新，不用手动 F5

---

## 第二阶段：改内容，不动代码（Day 2-3）

### Day 2：改配置 —— 把网站变成你的

**目标**：不用写一行 HTML/CSS，只改配置文件，让这个网站变成"你的"。

**任务 1：改网站基本信息**

打开 `src/config/` 目录，找到这些配置文件，逐行看，改掉能看懂的：

- 网站标题、描述
- 你的名字、头像链接
- 导航栏菜单项
- 社交链接（GitHub、邮箱）

每改一处保存，看浏览器变化。这是最快建立信心的方式。

**任务 2：改首页 Hero 区**

找首页的配置（通常在 config 文件或 `src/pages/index.astro` 的 frontmatter），改：
- 大标题
- 副标题
- 按钮文字

**任务 3：理解 Tailwind CSS 的 class**

打开 `src/pages/index.astro`，你会看到很多像 `class="text-2xl font-bold text-center"` 这样的代码。不用背，记住两个网站：
- [Tailwind CSS 文档](https://tailwindcss.com/docs) —— 查任何 class 的含义
- 改一个 class，保存，看效果。比如把 `text-2xl` 改成 `text-4xl`，字体会变大

**今天学到什么**：
- 配置驱动：这个项目的很多内容不用改代码，改配置就行
- Tailwind CSS：用 class 控制样式，不用写 CSS 文件

---

### Day 3：写第一篇文章

**目标**：在博客上发布一篇你自己的文章。

**任务 1：找到文章目录**

```bash
ls src/content/posts/
```

你会看到一些 `.md` 或 `.mdx` 文件。这些就是博客文章。

**任务 2：新建一篇文章**

```bash
pnpm new-post
```

按提示输入标题。会在 `src/content/posts/` 下生成一个新文件。

**任务 3：写 Markdown**

打开你新建的文件，顶部是 frontmatter（用 `---` 包起来的部分）：

```markdown
---
title: 我的第一篇文章
date: 2026-07-25
description: 这是我用 Mizuki 写的第一篇博客
tags: [前端, 学习]
---

## 今天学到了什么

今天我开始学习 Astro...

## 代码示例

​```javascript
console.log('hello world');
​```
```

保存 → 浏览器自动刷新 → 首页应该能看到你的新文章。

**今天学到什么**：
- Markdown frontmatter：文章标题、日期、标签在 `---` 之间
- Markdown 语法：`#` = 标题，`##` = 二级标题，``` 包起来 = 代码块
- Astro 的内容集合：`src/content/posts/` 下的 .md 文件自动变成博客文章

---

## 第三阶段：改样式，理解组件（Day 4-6）

### Day 4：理解 Astro 组件

**目标**：能看懂 `.astro` 文件的结构。

**.astro 文件的两段式结构**：

```astro
---
// ↑↑↑ 上面这段叫 frontmatter（脚本区）
// 在这里写 JavaScript/TypeScript
// 可以 import 其他组件、定义变量、获取数据
import Layout from '../layouts/Layout.astro';
const title = '我的页面';
---

<!-- ↓↓↓ 下面这段叫 template（模板区） -->
<!-- 在这里写 HTML -->
<Layout>
  <h1>{title}</h1>
  <p>这是一个 Astro 组件</p>
</Layout>

<style>
  /* 样式只影响当前组件，不会泄露到其他组件 */
  h1 { color: red; }
</style>
```

**练习**：打开 `src/pages/about.astro`，对照上面的结构看懂它。改一下 `<h1>` 里的文字，保存看效果。

**任务**：找一个 atom 组件（如 `src/components/atoms/Button/Button.astro`），逐行读完。原子组件通常很短（20-50 行），是最容易看懂的入口。

---

### Day 5：理解布局和插槽

**目标**：理解"所有页面套同一个壳"是怎么实现的。

**核心概念**：`Layout.astro`（`src/layouts/Layout.astro`）。

打开它，你会看到类似这样的结构：

```astro
<html>
  <head>...</head>
  <body>
    <Header />         ← 导航栏，每个页面都一样
    <main>
      <slot />         ← ★ 插槽：每个页面的不同内容放在这里
    </main>
    <Footer />         ← 底部，每个页面都一样
  </body>
</html>
```

`<slot />` 是关键——它是一个占位符。当你在 `about.astro` 里写：

```astro
<Layout title="关于我">
  <h1>这是关于页面</h1>     ← 这段内容替换 <slot />
</Layout>
```

**练习**：打开 `src/layouts/Layout.astro`，找到 `<slot />` 的位置。然后打开 `src/pages/about.astro`，看看它怎么用 `<Layout>` 包裹自己的内容。

---

### Day 6：改一个组件 —— 把导航栏改成你自己的

**目标**：找到导航栏组件，改菜单项。

**定位导航栏**：

导航栏通常在 `src/components/layout/` 或 `src/components/organisms/` 下，找文件名含 `Header`、`Nav`、`Navbar` 的文件。

**练习**：
1. 打开导航栏组件
2. 找到菜单项（通常是 `<a>` 标签列表）
3. 改一个菜单名（比如 "关于" 改成 "关于我"）
4. 给"关于我"加一个高亮样式（加 `class="text-blue-500"` 或 `class="font-bold"`）

**今天学到什么**：
- 组件的复用：导航栏写在 Header 组件里一次，所有页面都自动有
- Tailwind 的 class 命名规律：`text-` = 文字颜色，`font-` = 字体粗细，`bg-` = 背景色

---

## 第四阶段：加功能，真正动手（Day 7-8）

### Day 7：加一个新页面

**目标**：从零新建一个页面，加到导航栏里。

**Step 1：创建页面文件**

在 `src/pages/` 下新建 `learning.astro`：

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="我的学习记录">
  <main class="max-w-2xl mx-auto py-20">
    <h1 class="text-3xl font-bold">📚 我的前端学习记录</h1>
    <p class="mt-4 text-gray-600">这里记录我每天学到的东西。</p>
  </main>
</Layout>
```

保存，访问 `http://localhost:4321/learning` —— 你的新页面在。

**Step 2：加到导航栏**

找到导航栏组件，在菜单列表里加一个 `<a href="/learning">学习记录</a>`。

**今天学到什么**：
- Astro 的文件路由：`src/pages/xxx.astro` → 自动映射到 `/xxx` 这个 URL
- 加页面只需要两步：建文件 + 加导航链接

---

### Day 8：读懂一个 Svelte 交互组件（只读不改）

**目标**：理解项目中 `.svelte` 文件是干什么的。

Svelte 和 Astro 的区别：
- `.astro` 文件：在**服务器端**运行，生成静态 HTML，没有交互
- `.svelte` 文件：在**浏览器端**运行，可以做交互（点击、输入、动画）

**练习**：打开 `src/components/widgets/music-player/MusicPlayer.svelte`，不用全看懂，找到这三样东西：

1. `<script>` 标签里的 `let` 变量 —— 这就是组件的"状态"（比如 `let isPlaying = false`）
2. 模板里的 `{#if ...}` 和 `{变量}` —— Svelte 的模板语法
3. `on:click={...}` —— 事件监听

**今天学到什么**：
- .astro = 静态内容，构建时生成 HTML
- .svelte = 交互内容，用户在浏览器里点按钮时响应
- 不需要现在就学会写 Svelte，知道它们在项目里的角色就够了

---

## 第五阶段：部署上线（Day 9-10）

### Day 9：构建 + 部署到 GitHub Pages

**目标**：你的博客有一个人人可以访问的网址。

**Step 1：构建**

```bash
pnpm build
```

构建产物在 `dist/` 目录下——这就是你的整个网站，纯 HTML+CSS+JS，可以部署到任何静态托管服务。

**Step 2：推到自己新建的 GitHub 仓库**

```bash
# 在 GitHub 上新建一个仓库，比如 mizuki-blog
git remote add myblog https://github.com/你的用户名/mizuki-blog.git
git push myblog main
```

**Step 3：用 Vercel 部署（比 GitHub Pages 更简单）**

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点 "New Project" → 选择你的仓库
3. 不用改任何配置，点 Deploy
4. 等 2 分钟，拿到一个 `xxx.vercel.app` 的网址

**今天学到什么**：
- `pnpm build` = 生产构建，把所有代码编译成浏览器能直接读的 HTML/CSS/JS
- Vercel 自动检测到 Astro 项目，零配置部署

---

### Day 10：写 3 篇文章 + 完善博客

**目标**：你的博客有内容可以给人看了。

**写 3 篇文章**：
1. "我是怎么开始学前端的" —— 自我介绍
2. "前端学习第一周总结" —— 记录你的学习过程
3. "Mizuki 博客搭建记录" —— 记录你是怎么做这个博客的

**完善细节**：
- 把默认的头像换成你自己的
- 把默认的项目卡片换成你自己的项目链接
- 把 README.md 改成你自己的项目介绍

---

## 学习方法

| 原则 | 说明 |
|------|------|
| **先改配置文件，再动组件代码** | 配置文件是最安全的修改入口，改不坏 |
| **改一个 class → 保存 → 看效果** | Tailwind 的 class 不用背，试出来的记得最牢 |
| **遇到看不懂的代码，先跳过** | 这个项目有几百个文件，不需要全看懂 |
| **每天只吃透一个文件** | 比如今天就看懂 Button.astro，明天看 Header.astro |
| **不要怕改坏** | 改坏了 `git checkout -- .` 一键恢复 |

---

## 按照前端学习计划，这个项目对应什么水平

| 前端学习计划的阶段 | Mizuki 中的对应 |
|------|------|
| Day 1-2（CSS 实战） | 改 Tailwind class，观察效果 |
| Day 3-4（JS 原生） | 看懂 .astro 的 frontmatter 脚本区 |
| Day 5-6（第一个项目） | **Mizuki 就是你的第一个项目** |
| Day 9-10（Vue 入门） | Svelte 和 Vue 概念相通：组件、响应式、插槽 |
| Week 3（组件库） | Mizuki 的 atoms/ 就是一套组件库 |

---

> 10 天后，你应该有一个自己的博客、3 篇文章、一个可访问的网址。重要的是——你知道改哪里能改什么。
