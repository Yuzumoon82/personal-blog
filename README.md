# 🌸 Yuzumoon82 的博客

这是 [Yuzumoon82](https://github.com/Yuzumoon82) 的个人博客站点，基于 [Mizuki](https://github.com/LyraVoid/Mizuki) 主题搭建，用于记录学习笔记、技术随笔和生活点滴。

> 本项目 Fork / 克隆自 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki)，在此基础上进行个性化修改与内容创作。感谢原作者的优秀工作！

## 🙏 致谢与版权

### 原项目

本博客基于 **[Mizuki](https://github.com/LyraVoid/Mizuki)**，作者 [LyraVoid](https://github.com/LyraVoid)，使用 [Apache License 2.0](LICENSE) 开源。

Mizuki 又源自 **[Fuwari](https://github.com/saicaca/fuwari)**，作者 [saicaca](https://github.com/saicaca)，使用 MIT 许可证开源。原始版权声明见 [LICENSE.MIT](LICENSE.MIT)。

### 灵感来源

- [Fuwari](https://github.com/saicaca/fuwari) — 博客模板的起点，感谢 saicaca 创造了如此优雅的模板
- [Yukina](https://github.com/WhitePaper233/yukina) — 设计与创意灵感
- [Firefly](https://github.com/CuteLeaf/Firefly) — 布局设计思路
- [Twilight](https://github.com/spr-aachen/Twilight) — 动态壁纸与过渡效果参考
- [Pio](https://github.com/Dreamer-Paul/Pio) — Live2D 看板娘插件

### 技术栈

- [Astro](https://astro.build) — 静态站点框架
- [Tailwind CSS](https://tailwindcss.com) — CSS 框架
- [Pagefind](https://pagefind.app/) — 站内搜索
- [Expressive Code](https://expressive-code.com/) — 代码高亮
- [KaTeX](https://katex.org/) — 数学公式渲染
- [Iconify](https://iconify.design/) — 图标

## 🚀 本地运行

```bash
# 安装依赖（需 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📝 写文章

```bash
# 创建新文章
pnpm new-post <文件名>

# 文章存放在 src/content/posts/
```

文章 Frontmatter 格式：

```yaml
---
title: 文章标题
published: 2024-01-01
description: 文章简介
tags: [标签1, 标签2]
category: 分类
draft: false
pinned: false
---
```

## ⚡ 常用命令

| 命令                     | 说明                 |
| :----------------------- | :------------------- |
| `pnpm install`           | 安装依赖             |
| `pnpm dev`               | 启动开发服务器       |
| `pnpm build`             | 构建生产版本         |
| `pnpm preview`           | 本地预览构建结果     |
| `pnpm new-post <文件名>` | 创建新文章           |
| `pnpm format`            | 格式化代码           |
| `pnpm lint`              | 代码检查与修复       |

## 📄 许可证

本项目代码基于原项目 [Mizuki](https://github.com/LyraVoid/Mizuki) 的 [Apache License 2.0](LICENSE) 开源。博客文章内容版权归本人所有。

---

⭐ 如果你喜欢这个博客主题，请给原项目 [LyraVoid/Mizuki](https://github.com/LyraVoid/Mizuki) 点个 Star！
