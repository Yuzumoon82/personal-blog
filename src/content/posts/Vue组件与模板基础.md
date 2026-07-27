---
title: "Vue 组件与模板基础"
published: 2025-07-26
description: "Vue 3 组件开发入门：defineProps、defineEmits、插槽 Slots、模板语法，适合刚学完 HTML/JS 的小白"
tags: [Vue, 组件, 前端, 模板]
category: 学习笔记
draft: false
pinned: false
---

> 学习时间：2026.07.22 - 2026.07.26  
> 适用：前端小白，已了解基本的 HTML/JS

---

## 一、组件接收数据：defineProps

### 1.1 它是什么？

`defineProps` 是子组件用来**声明"我能接收哪些数据"**的。父组件通过属性（props）传数据进来，子组件用 `defineProps` 接住。

### 1.2 代码拆解

```vue
<!-- 父组件 -->
<MessageDisplay text="你好，世界！" />

<!-- 子组件 MessageDisplay.vue -->
<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <p>{{ text }}</p>  <!-- 渲染：你好，世界！ -->
</template>
```

逐词解释：

```
defineProps<{
  text: string
}>()
```

| 部分 | 含义 |
|------|------|
| `defineProps` | Vue 的编译宏，**不需要 import**，直接在 `<script setup>` 里用 |
| `<{ ... }>` | TypeScript 泛型语法，定义 props 的"形状" |
| `text` | prop 的名字，父组件传数据时用的属性名 |
| `: string` | TypeScript 类型注解，表示 `text` 必须是**字符串类型** |

### 1.3 核心规则：单向数据流

```
父组件 → 通过 props 传数据 → 子组件
子组件只能读，不能改
```

子组件修改 props 会报错。如果子组件需要改变数据，应该让父组件来改，或者子组件自己内部用 `ref` 存一份副本。

### 1.4 两种写法对比

```typescript
// 运行时写法（纯 JS，没有类型检查）
defineProps({ text: String })

// TypeScript 泛型写法（推荐，编译时就能发现类型错误）
defineProps<{ text: string }>()
```

---

## 二、TypeScript 类型注解：`text: string`

### 2.1 它是什么？

`变量名: 类型` 是 TypeScript 的核心语法，告诉编译器"这个变量只能放这种类型的数据"。

```typescript
let name: string = '张三'     // ✅ 正确
let name: string = 123        // ❌ 报错：number 不能赋值给 string

let age: number = 17          // ✅ 数字
let isDone: boolean = false   // ✅ 布尔
let items: string[] = ['a']   // ✅ 字符串数组
```

### 2.2 常见类型速查

| 写法 | 含义 | 示例值 |
|------|------|--------|
| `string` | 字符串 | `'hello'` |
| `number` | 数字 | `17`、`3.14` |
| `boolean` | 布尔 | `true` / `false` |
| `string[]` | 字符串数组 | `['a', 'b']` |
| `number[]` | 数字数组 | `[1, 2, 3]` |

---

## 三、模板循环：v-for

### 3.1 基础用法

```vue
<script setup>
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
]
</script>

<template>
  <li v-for="user in users" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

### 3.2 逐词解释

```
v-for = "user   in   users"
 ↑        ↑      ↑     ↑
指令   临时变量   介词   数据源数组
```

- `v-for`：Vue 的循环指令，把元素**重复渲染 N 遍**
- `user`：随便起的名字，代表数组里的**每一项**
- `users`：要被遍历的数组

### 3.3 执行过程（像复印机）

```
users 数组: [张三, 李四, 王五]

第 1 轮：user = { id: 1, name: '张三' } → 渲染 <li>张三</li>
第 2 轮：user = { id: 2, name: '李四' } → 渲染 <li>李四</li>
第 3 轮：user = { id: 3, name: '王五' } → 渲染 <li>王五</li>
```

### 3.4 `:key` 是什么？

**必须写！** 给每个循环出来的元素一个**唯一身份证号**，Vue 靠它来追踪谁是谁。

```vue
<!-- ✅ 正确：用唯一 id -->
<li v-for="user in users" :key="user.id">{{ user.name }}</li>

<!-- ❌ 错误：不要用数组下标（index），数据顺序一变就乱了 -->
<li v-for="(user, index) in users" :key="index">{{ user.name }}</li>
```

### 3.5 其他写法

```vue
<!-- 顺便拿下标 -->
<li v-for="(item, index) in list" :key="item.id">{{ index }} - {{ item }}</li>

<!-- 遍历对象 -->
<li v-for="(value, key) in obj" :key="key">{{ key }}: {{ value }}</li>

<!-- 直接写次数 -->
<li v-for="n in 5" :key="n">{{ n }}</li>  <!-- 1, 2, 3, 4, 5 -->
```

---

## 四、条件渲染：v-if 和 v-show

### 4.1 v-if — 条件为真才存在

```vue
<p v-if="!route.params.id">👈 点击左侧用户查看详情</p>
```

```
v-if  =  "!"    route.params.id
 ↑        ↑          ↑
条件指令  取反符号    当前 URL 里的 :id 参数值
```

**规则**：
- 条件为 `true` → 显示元素
- 条件为 `false` → **元素直接从 HTML 里删除**（不是隐藏，是没了）

### 4.2 `!` 取反运算

```javascript
!true    → false
!false   → true
!'hello' → false  // 非空字符串是 truthy
!''      → true   // 空字符串是 falsy
!0       → true   // 0 是 falsy
!undefined → true // undefined 是 falsy
```

### 4.3 实际场景

```vue
<!-- 没选用户时显示提示，选了就消失 -->
<p v-if="!route.params.id">请选择用户</p>

<!-- 等价写法 -->
<p v-if="route.params.id === undefined">请选择用户</p>
```

### 4.4 v-if vs v-show

| | `v-if` | `v-show` |
|---|---|---|
| 条件为假时 | **移除 DOM 元素** | **隐藏**（加 `display: none`） |
| 切换开销 | 大（要销毁/重建整个元素） | 小（只改 CSS） |
| 初始渲染 | 条件为假就不渲染 | 无论条件都渲染 |
| 适合场景 | 不频繁切换（如是否已登录） | 频繁切换（如 Tab 切换） |

---

## 五、HTML 标签

### 5.1 `<section>` — 有主题的内容区块

```html
<!-- ❌ 无语义，纯布局盒子 -->
<div class="card">
  <h2>标题</h2>
  <p>内容</p>
</div>

<!-- ✅ 语义明确，表示一个独立内容区块 -->
<section class="card">
  <h2>标题</h2>
  <p>内容</p>
</section>
```

**人眼看没区别**，但屏幕阅读器和搜索引擎会识别出 `<section>` 是一个独立的内容区域。

### 5.2 `<code>` — 行内代码

```html
<p>用 <code>console.log()</code> 打印信息。</p>
```

浏览器会用**等宽字体**显示被 `<code>` 包裹的文字，表示"这是代码"。

### 5.3 常见语义标签全家福

```html
<header>   <!-- 页头 -->
<nav>      <!-- 导航栏 -->
<main>     <!-- 页面主体 -->
<section>  <!-- 独立内容区块 -->
<article>  <!-- 独立完整内容（如文章） -->
<aside>    <!-- 侧边栏 -->
<footer>   <!-- 页脚 -->
<div>      <!-- 无语义，纯布局容器 -->
<span>     <!-- 无语义，行内容器 -->
```

---

## 六、CSS：把样式写到 `<style scoped>` 里

### 6.1 不推荐：行内样式

```html
<!-- 样式和结构混在一起，难维护 -->
<nav style="display: flex; background: #333; padding: 12px;">
  <a style="color: #ddd; text-decoration: none;">首页</a>
</nav>
```

### 6.2 推荐：CSS class + `<style scoped>`

```vue
<template>
  <nav class="my-nav">
    <a>首页</a>
  </nav>
</template>

<style scoped>
.my-nav {
  display: flex;
  background: #333;
  padding: 12px;
}
.my-nav a {
  color: #ddd;
  text-decoration: none;
}
.my-nav a:hover {  /* 行内样式写不了 hover！这也是优势 */
  color: #fff;
}
</style>
```

**优势**：结构（HTML）和样式（CSS）分离，可复用，能写伪类（`:hover`）。

---

## 七、项目启动流程

### 7.1 main.ts 四步走

```
main.ts （程序入口）
  │
  ├─ 第 1 步：const app = createApp(App)
  │    创建 Vue 应用实例，指定 App.vue 为根组件
  │
  ├─ 第 2 步：app.use(router)
  │    安装路由插件
  │
  ├─ 第 3 步：app.use(createPinia())
  │    安装状态管理插件
  │
  └─ 第 4 步：app.mount('#app')
       启动！接管 index.html 里 <div id="app"> 这个节点
       页面开始显示
```

### 7.2 核心 API 含义

| 代码 | 含义 | 比喻 |
|------|------|------|
| `createApp(App)` | 以 App.vue 为根，创建应用 | 买一台新手机 |
| `app.use(xxx)` | 装插件 | 在手机上装 App |
| `app.mount('#app')` | 启动，接管 HTML 节点 | 按下开机键 |

### 7.3 `export default` 和 `import`

```typescript
// router/index.ts（定义 + 导出）
const router = createRouter({ ... })
export default router   // ← "把路由器放到出货口"

// main.ts（导入 + 使用）
import router from './router'  // ← "从出货口取走"
app.use(router)                 // ← "装到应用上"
```

`export default`：一个文件只能有一个，导出后别人用 `import` 接住。

---

## 八、难点速查

| 难点 | 一句话解释 |
|------|-----------|
| `defineProps` vs 直接写变量 | props 是父传子的数据通道，单向的 |
| `v-if` vs `v-show` | v-if 是移除/创建，v-show 是显示/隐藏 |
| `:key` 为什么必须写 | Vue 靠它区分循环出来的每个元素，没 key 更新会乱 |
| `!` 取反 | `!undefined` = `true`，`!"hello"` = `false` |
| `<section>` vs `<div>` | 长得一样，但 section 有语义（告诉机器"这是一块独立内容"） |
| TypeScript 类型 | `变量名: 类型`，比如 `name: string` 表示 name 只能是字符串 |
