---
title: "Mizuki 项目结构详解"
published: 2025-07-27
description: "Mizuki Astro 静态博客项目的完整目录结构和文件说明，覆盖所有源码目录、配置文件、组件库的详细拆解"
tags: [Mizuki, Astro, 项目结构, 前端]
category: 学习笔记
draft: false
pinned: false
---

## 项目概述

Mizuki 是一个基于 **Astro 7** 的静态博客站点生成器 (SSG)，源自 [Fuwari](https://github.com/saicaca/fuwari) → [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki) 的演进。当前项目是 Yuzumoon82 的个人博客。

### 技术栈

| 技术 | 用途 |
|------|------|
| **Astro 7** | 静态站点框架，核心 |
| **Svelte 5** | 交互式组件（音乐播放器、搜索等） |
| **Tailwind CSS 4** | 原子化 CSS 框架 |
| **TypeScript 6** | 类型检查 |
| **Pagefind** | 站内全文搜索 |
| **Expressive Code** | 代码块语法高亮 |
| **Swup** | 页面切换过渡动画 |
| **Iconify** | 图标系统 |
| **KaTeX** | 数学公式渲染 |
| **pnpm** | 包管理器 |

---

## 🏠 项目入口

入口有多个层次：

1. **构建入口**: `astro.config.mjs` — Astro 框架的配置文件，定义了所有集成、Markdown 处理器、Vite 配置等，是整个构建流程的总控制文件。

2. **页面路由入口**: `src/pages/` 目录 — Astro 基于文件系统路由，每个 `.astro` 文件就是网站的一个页面路由。

3. **主页面入口**: `src/pages/[...page].astro` — 博客首页/文章列表的分页路由（`/`, `/2/`, `/3/`…）

4. **文章详情入口**: `src/pages/posts/[...slug].astro` — 单篇文章详情页

5. **布局入口**: `src/layouts/Layout.astro` — 全局 HTML 骨架（`<html>`, `<head>`, `<body>`）

6. **内容入口**: `src/content.config.ts` — Astro Content Collections 的内容定义，定义了 `posts` 和 `spec` 两个集合

---

## 📁 根目录文件

| 文件 | 说明 |
|------|------|
| `astro.config.mjs` | **Astro 核心配置** — 集成插件、Markdown 渲染管线、Vite 配置、字体配置 |
| `package.json` | 项目依赖与脚本定义，使用 pnpm 作为包管理器 |
| `tsconfig.json` | TypeScript 编译配置 |
| `svelte.config.js` | Svelte 组件编译配置 |
| `biome.json` | Biome 代码格式化和 Lint 配置 |
| `postcss.config.mjs` | PostCSS 配置（Tailwind CSS 相关） |
| `pagefind.yml` | Pagefind 搜索索引配置 |
| `pnpm-workspace.yaml` | pnpm monorepo 工作空间配置 |
| `pnpm-lock.yaml` | 依赖锁定文件 |
| `vercel.json` | Vercel 部署配置 |
| `.env.example` | 环境变量模板（Bilibili SESSDATA 等） |
| `.npmrc` | npm 配置 |
| `.gitignore` / `.gitattributes` | Git 配置 |
| `README.md` | 项目说明文档 |
| `CLAUDE.md` | Claude Code AI 助手的项目行为指南 |
| `LICENSE` / `LICENSE.MIT` | Apache 2.0 + MIT 双许可证 |
| `logo.png` | 项目 Logo |
| `_frontmatter.json` | Frontmatter 的 JSON 描述（可能与 CMS 集成相关） |

---

## 📁 `.github/` — CI/CD 与社区

| 路径 | 说明 |
|------|------|
| `workflows/deploy.yml` | 部署 GitHub Actions 工作流（构建并部署到 GitHub Pages） |
| `workflows/lint.yml` | 代码检查 CI 工作流 |
| `ISSUE_TEMPLATE/` | 三种 Issue 模板（Bug报告、功能请求、自定义问题） |
| `dependabot.yml` | 依赖自动更新配置 |
| `pull_request_template.md` | PR 模板 |

---

## 📁 `.vscode/` — 编辑器配置

| 文件 | 说明 |
|------|------|
| `extensions.json` | 推荐安装的 VS Code 扩展 |
| `settings.json` | 工作区级别的 VS Code 设置 |

---

## 📁 `public/` — 静态资源

直接映射到网站根目录的静态文件，构建时原样复制到 `dist/`。

| 路径 | 说明 |
|------|------|
| `_headers` | 自定义 HTTP 响应头（Cloudflare Pages / Netlify） |
| `favicon/favicon.ico` | 网站图标 |
| `assets/anime/` | 番剧页面封面图 |
| `assets/desktop-banner/` | 桌面端 Banner 横幅图（4张） |
| `assets/mobile-banner/` | 移动端 Banner 横幅图（4张） |
| `assets/home/` | 首页 Logo 和装饰图 |
| `assets/music/cover/` | 音乐播放器封面图 |
| `assets/music/url/` | 音乐播放器音频文件（`.mp3`） |
| `assets/projects/` | 项目展示图片 |
| `assets/css/` | 外部 CSS（highlight.js 主题） |
| `assets/js/` | 外部 JS（Twikoo 评论系统） |
| `images/albums/` | 相册图片数据及 `info.json` 配置 |
| `images/demos/image-grid-demo/` | 图片网格组件的演示图片 |
| `images/device/` | 设备页面展示图 |
| `images/diary/` | 日记页面插图 |
| `js/` | 页面特定交互脚本（devices、friends、filter-tabs） |
| `pio/` | **Live2D 看板娘** — `l2d-widget.min.js` 核心 + NOIR 模型文件（`.moc3`, `.model3.json`, `.physics3.json` 等） |

---

## 📁 `src/` — 源代码核心

这是整个项目的核心，所有源码都在这里。

### `src/pages/` — 页面路由（Astro 文件路由）

| 文件 | URL 路由 | 说明 |
|------|----------|------|
| `[...page].astro` | `/`, `/2/`, `/3/`... | **博客首页/文章列表**，分页显示 |
| `posts/[...slug].astro` | `/posts/xxx/` | **文章详情页**，动态路由 |
| `[...permalink].astro` | `/自定义固定链接/` | 自定义永久链接页（优先级高于 posts） |
| `about.astro` | `/about/` | 关于页面 |
| `archive.astro` | `/archive/` | 文章归档页 |
| `anime.astro` | `/anime/` | 番剧追踪页 |
| `diary.astro` | `/diary/` | 日记/动态页 |
| `friends.astro` | `/friends/` | 友链页面 |
| `projects.astro` | `/projects/` | 项目展示页 |
| `skills.astro` | `/skills/` | 技能展示页 |
| `timeline.astro` | `/timeline/` | 时间线页面 |
| `albums.astro` | `/albums/` | 相册列表页 |
| `albums/[id]/index.astro` | `/albums/:id/` | 单个相册详情 |
| `devices.astro` | `/devices/` | 设备展示页 |
| `ai-tools.astro` | `/ai-tools/` | AI 工具推荐页 |
| `404.astro` | 任意不存在的路径 | 404 页面 |
| `rss.astro` + `rss.xml.ts` | `/rss/`, `/rss.xml` | RSS 订阅源 |
| `atom.astro` + `atom.xml.ts` | `/atom/`, `/atom.xml` | Atom 订阅源 |
| `robots.txt.ts` | `/robots.txt` | 搜索引擎爬虫规则 |
| `og/[...slug].ts` | `/og/:slug.png` | Open Graph 社交分享图片动态生成 |
| `api/allPostMeta.json.ts` | `/api/allPostMeta.json` | 所有文章元数据的 JSON API |
| `api/calendar-data.json.ts` | `/api/calendar-data.json` | 日历组件数据的 JSON API |

### `src/layouts/` — 布局组件

| 文件 | 说明 |
|------|------|
| `Layout.astro` | **根布局** — HTML 骨架（`<!doctype html>`, `<head>`, `<body>`），加载全局 CSS、字体、Analytics、Pio 看板娘、音乐播放器、Swup 过渡管理器 |
| `MainGridLayout.astro` | **主内容网格布局** — 包装在 Layout 之上，渲染 Navbar、Banner、侧边栏、主内容区、Footer、TOC、悬浮控件 |
| `partials/AnalyticsScripts.astro` | 第三方统计脚本（Google Tag Manager、Microsoft Clarity） |
| `partials/GridScripts.astro` | 网格布局相关的客户端 JS 初始化（壁纸模式、Banner、Swup 等） |
| `partials/HeadTags.astro` | SEO 元标签（Open Graph、Twitter Card、favicon、主题色初始化脚本） |

### `src/components/` — 组件库（按 Atomic Design 组织）

#### `atoms/` — 原子组件（最小可复用单元）

| 组件 | 技术 | 说明 |
|------|------|------|
| `Badge/` | Svelte | 徽标标签 |
| `Button/` | Astro | 按钮 |
| `Chip/` | Svelte | 小标签 |
| `custom-scrollbar/` | Astro | 自定义滚动条 |
| `filter-tabs/` | Astro | 筛选标签页 |
| `Icon/` | Astro + Svelte | 图标组件（支持 Iconify 和本地图标） |
| `Image/` | Astro | 优化的图片组件 |
| `Link/` | Astro | 链接组件 |
| `Loader/` | Astro | 加载动画 |
| `tag-chip/` | Svelte | 标签芯片 |
| `typewriter-text/` | Astro | 打字机效果文本 |

#### `features/` — 功能性/业务组件

| 目录 | 说明 |
|------|------|
| `ai-tools/` | AI 工具卡片 |
| `albums/` | 相册卡片、照片卡片 |
| `anime/` | 番剧卡片、筛选栏、排序栏 |
| `archive/` | 归档面板（Svelte 交互） |
| `auth/` | 文章加密/密码保护组件 |
| `devices/` | 设备卡片 |
| `diary/` | 日记/动态卡片 |
| `featured-projects/` | 特色项目展示 |
| `friends/` | 友链卡片 |
| `page-header/` | 页面标题头部 |
| `pio/` | Live2D 看板娘组件 |
| `posts/` | **最核心的文章组件** — PostCard、PostListItem、PostPage、PostMeta、PostNavigation、CategoryBar、JsonLd、RandomPosts、RelatedPosts、ShareCard、LastModified 等 |
| `projects/` | 项目卡片 |
| `projects-category/` | 项目分类组件 |
| `section-title/` | 区块标题 |
| `settings/` | 显示设置面板（Svelte 交互组件） |
| `skills/` | 技能卡片 |
| `stats/` | 统计卡片 |
| `stats-grid/` | 统计网格 |
| `tech-stack/` | 技术栈展示 |
| `timeline/` | 时间线卡片 |
| `toc/` | **目录系统** — FloatingTOC、MobileTOC、SidebarTOC + hooks + utils |

#### `widgets/` — 侧边栏小部件

| 目录 | 说明 |
|------|------|
| `announcement/` | 公告栏 |
| `calendar/` | 日历小部件（复杂的 Svelte 组件，含子组件和 hooks） |
| `card-toc/` | 卡片内目录 |
| `categories/` | 分类列表 |
| `common/` | 通用部件（AccordionDrawer、WidgetHeader、WidgetLayout） |
| `feed/` | RSS/Feed 信息 |
| `music-player/` | **音乐播放器**（最复杂的 Svelte 组件，atom/molecule/organism 分层） |
| `music-sidebar/` | 侧边栏音乐播放器（独立的瘦身版本） |
| `profile/` | 个人信息卡片 |
| `sidebar/` | 侧边栏容器 |
| `site-stats/` | 站点统计 |
| `tags/` | 标签云 |
| `toc/` | 目录小部件 |

#### `layout/` — 布局组件

| 文件 | 说明 |
|------|------|
| `Banner.astro` | 首页 Banner（含波浪动画、轮播） |
| `RightSideBar.astro` | 右侧边栏容器 |
| `SidebarColumn.astro` | 侧边栏列 |

#### `organisms/` — 有机体组件（组合多个 atom/feature）

| 文件 | 说明 |
|------|------|
| `navigation/Navbar.astro` | 顶部导航栏 |
| `navigation/NavMenuPanel.astro` | 导航菜单面板 |
| `navigation/DropdownMenu.astro` | 下拉菜单 |
| `navigation/Search.svelte` | 搜索组件（Svelte，使用 Pagefind） |
| `footer/Footer.astro` | 页脚 |

#### `misc/` — 杂项/工具组件

| 文件 | 说明 |
|------|------|
| `ConfigCarrier.astro` | 将服务端配置传递给客户端 |
| `FullscreenWallpaper.astro` | 全屏壁纸 |
| `IconifyLoader.astro` | Iconify 图标预加载器 |
| `License.astro` | 许可证信息 |
| `ListContainer.astro` | 列表容器 |
| `ListDivider.astro` | 列表分隔线 |
| `Markdown.astro` | Markdown 渲染组件 |
| `SharePoster.svelte` | 分享海报生成 |
| `poster/` | 海报 Canvas 渲染逻辑 |

#### `comment/` — 评论系统

| 文件 | 说明 |
|------|------|
| `Giscus.astro` | GitHub Discussions 评论 |
| `Twikoo.astro` | Twikoo 评论系统 |
| `index.astro` | 评论系统统一入口（按配置切换） |

#### `control/` — 控制/浮动组件

| 文件 | 说明 |
|------|------|
| `BackToHome.astro` | 返回首页按钮 |
| `BackToTop.astro` | 返回顶部按钮 |
| `ButtonLink.astro` | 链接按钮 |
| `ButtonTag.astro` | 标签按钮 |
| `FloatingControls.astro` | 浮动控件容器 |
| `FloatingTOC.astro` | 悬浮目录按钮 |
| `LayoutSwitch.svelte` | 布局切换（列表/网格） |
| `MusicFabButton.svelte` | 悬浮音乐播放按钮 |
| `Pagination.astro` | 分页导航 |
| `ThemeSwitch.svelte` | 主题切换按钮 |
| `PageProgressBar/` | 页面顶部阅读进度条 |

### `src/config/` — 配置文件

| 文件 | 说明 |
|------|------|
| `siteConfig.ts` | **主站配置**（约 230 行）— 站点标题、URL、主题色、Banner、TOC、各页面开关、壁纸模式、字体、SEO 等 |
| `index.ts` | 配置聚合导出 |
| `navBarConfig.ts` | 导航栏链接配置 |
| `profileConfig.ts` | 个人信息配置 |
| `footerConfig.ts` | 页脚配置 |
| `sidebarConfig.ts` | 侧边栏配置 |
| `musicConfig.ts` | 音乐播放器配置 |
| `commentConfig.ts` | 评论系统配置 |
| `announcementConfig.ts` | 公告配置 |
| `backgroundWallpaper.ts` | 背景壁纸配置 |
| `effectsConfig.ts` | 特效配置（樱花等） |
| `expressiveCodeConfig.ts` | 代码高亮配置 |
| `licenseConfig.ts` | 许可证配置 |
| `permalinkConfig.ts` | 固定链接配置 |
| `pioConfig.ts` | Live2D 看板娘配置 |
| `randomPostsConfig.ts` | 随机文章推荐配置 |
| `relatedPostsConfig.ts` | 相关文章配置 |
| `shareConfig.ts` | 分享按钮配置 |

### `src/content/` — 内容集合

| 路径 | 说明 |
|------|------|
| `posts/*.md` | **博客文章**（Markdown/MDX 格式），这是站点的核心内容，如 `markdown-tutorial.md`、`Mizuki项目学习计划.md` 等 |
| `spec/*.md` | 特殊页面内容（如 `about.md` 关于页、`friends.md` 友链页） |

### `src/data/` — 静态数据

| 文件 | 说明 |
|------|------|
| `anime.ts` | 番剧数据（本地模式） |
| `ai-tools.ts` | AI 工具列表 |
| `devices.ts` | 设备列表 |
| `diary.ts` | 日记/动态数据 |
| `friends.ts` | 友链数据 |
| `projects.ts` | 项目数据 |
| `skills.ts` | 技能数据 |
| `timeline.ts` | 时间线事件 |

### `src/i18n/` — 国际化

| 文件 | 说明 |
|------|------|
| `i18nKey.ts` | 翻译 key 常量定义 |
| `translation.ts` | 翻译函数实现 |
| `languages/en.ts` | 英文翻译 |
| `languages/ja.ts` | 日文翻译 |
| `languages/zh_CN.ts` | 简体中文翻译 |
| `languages/zh_TW.ts` | 繁体中文翻译 |

### `src/styles/` — 样式文件

| 文件 | 说明 |
|------|------|
| `main.css` | 主样式入口（导入所有其他 CSS） |
| `variables.styl` | Stylus 全局变量 |
| `markdown.css` | Markdown 渲染样式 |
| `markdown-extend.styl` | Markdown 扩展样式 |
| `banner.css` | Banner 样式 |
| `transition.css` | 页面过渡动画 |
| `animation-enhancements.css` | 动画增强 |
| `scrollbar.css` | 自定义滚动条样式 |
| `toc.css` | 目录样式 |
| `albums.css` | 相册样式 |
| `anime.css` | 番剧页面样式 |
| `encrypted-content.css` | 加密内容样式 |
| `expressive-code.css` | 代码块样式 |
| `fancybox-custom.css` | 图片灯箱样式 |
| `gradient-buttons.css` | 渐变按钮样式 |
| `mobile-navbar.css` | 移动端导航栏样式 |
| `mobile-post-list-fix.css` | 移动端文章列表修复 |
| `mobile-transition-fix.css` | 移动端过渡修复 |
| `panel-animations.css` | 面板动画 |
| `photoswipe.css` | 图片查看器样式 |
| `twikoo.css` | Twikoo 评论样式 |
| `wallpaper-navbar-transparent.css` | 壁纸模式下导航栏透明样式 |
| `widget-responsive.css` | 小部件响应式 |
| `_transition-vars.css` | 过渡 CSS 变量 |

### `src/plugins/` — Markdown/Remark/Rehype 插件

| 文件 | 说明 |
|------|------|
| `remark-content.mjs` | 内容处理（提取摘要等） |
| `remark-mermaid.js` | Mermaid 图表语法支持 |
| `remark-fix-github-admonitions.js` | 修复 GitHub 风格的 Admonition 语法 |
| `remark-directive-rehype.js` | 将 Remark Directive 转为 Rehype 节点 |
| `remark-escape-numeric-colons.mjs` | 转义数字冒号（避免被解析为 URL） |
| `rehype-component-admonition.mjs` | 自定义 Admonition 组件（note/tip/important/caution/warning） |
| `rehype-component-github-card.mjs` | GitHub 仓库卡片组件 |
| `rehype-component-image-grid.mjs` | 图片网格布局组件 |
| `rehype-image-width.mjs` | 自动设置图片宽高 |
| `rehype-mermaid.mjs` | Rehype 层面的 Mermaid 处理 |
| `rehype-wrap-table.mjs` | 表格包裹（响应式滚动） |
| `astro-icon-include.mjs` | 构建时确定需要打包的图标集合 |
| `expressive-code/custom-copy-button.ts` | 代码块自定义复制按钮 |
| `expressive-code/language-badge.ts` | 代码块语言标签 |
| `mermaid-render-script.js` | Mermaid 客户端渲染脚本 |

### `src/scripts/` — 客户端 JS/TS

| 文件 | 说明 |
|------|------|
| `swup-manager.ts` | **Swup 页面过渡管理器入口** — 统一注册所有 Swup hooks |
| `core/swup-config.ts` | Swup 核心配置 |
| `core/swup-hooks.ts` | Swup 生命周期 hooks（页面进入/离开等） |
| `effects/sakura-effect.ts` | 樱花飘落特效 |
| `effects/transition-effect.ts` | 页面过渡特效 |
| `handlers/back-to-top-handler.ts` | 返回顶部按钮逻辑 |
| `handlers/fancybox-handler.ts` | 图片灯箱逻辑 |
| `handlers/panel-handler.ts` | 面板管理逻辑 |
| `handlers/scroll-handler.ts` | 滚动处理逻辑 |
| `anime-filter-handler.ts` | 番剧筛选交互 |
| `anime-layout-handler.ts` | 番剧页面布局 |
| `code-collapse.js` | 代码块折叠功能 |
| `post-lastmodified.ts` | 文章最后修改时间更新 |
| `right-sidebar-layout.js` | 右侧边栏布局 |
| `theme-optimizer.js` | 主题切换性能优化 |

### `src/stores/` — Svelte 状态管理

| 文件 | 说明 |
|------|------|
| `musicPlayerStore.ts` | 音乐播放器全局状态（当前曲目、播放列表、音量、播放模式等） |

### `src/constants/` — 常量

| 文件 | 说明 |
|------|------|
| `constants.ts` | 全局常量（BANNER_HEIGHT、PAGE_WIDTH 等） |
| `icon.ts` | 图标名称常量 |
| `link-presets.ts` | 链接预设 |

### `src/utils/` — 工具函数（26个）

| 文件 | 说明 |
|------|------|
| `content-utils.ts` | **文章内容处理** — 排序、筛选、分类、标签聚合 |
| `crypto-utils.ts` | AES 加密工具（文章密码保护） |
| `date-utils.ts` | 日期格式化 |
| `image-utils.ts` | 图片处理 |
| `icon-loader.ts` | 图标加载 |
| `language-utils.ts` | 语言工具 |
| `navigation-utils.ts` | 导航工具 |
| `permalink-utils.ts` | 固定链接解析 |
| `post-url.ts` | 文章 URL 生成 |
| `post-card-content.ts` | 文章卡片内容提取 |
| `url-utils.ts` | URL 处理 |
| `album-scanner.ts` | 相册扫描 |
| `anime-data.ts` | 番剧数据处理 |
| `feed-image-utils.ts` | Feed 图片处理 |
| `grid-layout-utils.ts` | 网格布局计算 |
| `panel-manager.ts` | 面板管理 |
| `performance-observer.ts` | 性能监控 |
| `poster-image.ts` | 海报图片生成 |
| `sakura-manager.ts` | 樱花效果管理 |
| `setting-utils.ts` | 设置工具 |
| `tocManager.ts` | 目录管理 |
| `widget-manager.ts` | 小部件管理 |
| `widget-renderer.ts` | 小部件渲染 |
| `responsive-sidebar.ts` | 响应式侧边栏 |
| `animation-utils.ts` / `animation-test.js` | 动画工具 |

### `src/types/` — TypeScript 类型定义

| 文件 | 说明 |
|------|------|
| `config.ts` | SiteConfig 等配置类型 |
| `album.ts` | 相册类型 |
| `framework-components.d.ts` | 框架组件类型声明 |

---

## 📁 `scripts/` — 构建与维护脚本

| 文件 | 说明 |
|------|------|
| `sync-content.js` | **内容同步** — 从远程 Git 仓库拉取文章内容（内容与代码分离架构） |
| `init-content-repo.js` | 初始化内容仓库 |
| `new-post.js` | 交互式创建新文章（模板生成） |
| `update-anime.mjs` | 从 Bangumi/Bilibili API 更新番剧数据 |
| `update-bangumi.mjs` | 更新 Bangumi 数据 |
| `update-bilibili.mjs` | 更新 Bilibili 追番数据 |
| `indexnow-submit.js` | 向搜索引擎提交新内容索引 |
| `convert-images.js` | 图片格式转换 |
| `load-env.js` | 加载 `.env` 环境变量 |
| `compress-fonts/` | **字体压缩工具链** — `index.js`（入口）、`font-compressor.js`、`text-collector.js`、`css-rewriter.js`、`config-parser.js`、`utils.js` |

---

## 📁 `docs/` — 项目文档

| 路径 | 说明 |
|------|------|
| `rule/` | 代码规范文档（组件架构、拆分指南、文件组织、CSS 风格、原子组件用法、侧边栏开发、图标规范） |
| `editor/` | 编辑器预览 HTML/CSS/JS |
| `image/` | 文档配图 |
| `README.md` | 文档索引 |
| `AUTO_BUILD_TRIGGER.md` | 自动构建触发说明 |
| `CONTENT_REPOSITORY.md` | 内容仓库分离架构说明 |
| `CONTENT_SEPARATION.md` | 内容分离机制 |
| `DEPLOYMENT.md` | 部署文档 |
| `MIGRATION_GUIDE.md` | 迁移指南 |
| `PERFORMANCE_MONITORING.md` | 性能监控说明 |

---

## 📁 `tests/` — 测试

| 文件 | 说明 |
|------|------|
| `crypto.test.mjs` | 加密功能单元测试 |
| `feed-image-utils.test.ts` | Feed 图片工具测试 |
| `post-card-content.test.ts` | 文章卡片内容提取测试 |

---

## 📁 `.astro/` — Astro 框架生成的类型和缓存

这是 Astro 框架自动生成的目录，包含内容集合的类型定义 (`content.d.ts`, `types.d.ts`)、字体缓存、数据存储等，**不需要手动修改**。

---

## 🔄 页面渲染流程总结

```
用户请求 URL
    ↓
Astro 路由匹配 (src/pages/)
    ↓
MainGridLayout.astro (包装 Layout.astro)
    ├── Navbar.astro (导航栏)
    ├── Banner.astro (横幅)
    ├── SideBar.astro (左侧栏)
    ├── <main> 内容区 ← slot (页面具体内容)
    ├── RightSideBar.astro (右侧栏)
    ├── Footer.astro (页脚)
    └── FloatingControls (悬浮控件)
    ↓
Layout.astro (HTML 骨架)
    ├── <head> SEO、字体、样式
    ├── MusicPlayer.svelte (音乐播放器)
    ├── Pio.astro (Live2D 看板娘)
    └── Swup 页面过渡管理器
```

---

## 🎯 关键设计特点

1. **内容与代码分离**: 文章内容可以从远程 Git 仓库同步（`scripts/sync-content.js`），支持独立的内容管理
2. **Atomic Design**: 组件严格分层为 atoms → features → widgets → organisms → layouts
3. **Astro + Svelte 混合**: 静态内容用 Astro（服务端渲染），交互组件用 Svelte（客户端水合）
4. **Swup 页面过渡**: 实现了类似 SPA 的平滑页面切换体验，同时保持静态站点的优势
5. **高度可配置**: `src/config/` 下有 15+ 个独立配置文件，几乎所有 UI 行为都可以开关和定制
6. **文章加密**: 支持 AES 加密的文章密码保护（`crypto-utils.ts` + `auth/` 组件）
7. **多语言**: 支持简体中文、繁体中文、英文、日文四种语言
8. **丰富的特殊页面**: 番剧追踪、相册、日记/动态、时间线、设备展示、AI 工具推荐等
