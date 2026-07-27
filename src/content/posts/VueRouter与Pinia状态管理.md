---
title: "Vue Router 与 Pinia 状态管理"
published: 2025-07-26
description: "Vue Router 前端路由和 Pinia 全局状态管理的入门指南，含完整代码示例和项目实战"
tags: [Vue, Router, Pinia, 状态管理, 前端]
category: 学习笔记
draft: false
pinned: false
---

> 学习时间：2026.07.22 - 2026.07.26  
> 适用：前端小白，已了解 Vue 组件基础

---

## 一、Vue Router 是什么？

**Vue Router 就是前端页面的"导航系统"**。它让用户在多个页面之间切换，但**不刷新浏览器**。

### 1.1 没有 Router vs 有 Router

```
没有 Router：
  跳页面 = 浏览器重新加载整个 HTML → 慢、闪烁

有 Router：
  跳页面 = 只替换内容区域 → 快、顺滑（SPA 单页应用的核心体验）
```

---

## 二、路由配置（router/index.ts）

### 2.1 路由表结构

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),  // URL 模式：干净的路径 /home，没有 #
  routes: [                     // 路由表：一个数组，定义所有页面
    {
      path: '/home',            // ① URL 路径
      name: 'home',             // ② 路由名字（跳转时可以用名字代替路径）
      component: HomeView,      // ③ 匹配到这个路径时显示哪个组件
    },
  ],
})

export default router           // 导出，让 main.ts 用 import 接住
```

### 2.2 `component` 的两种写法

| 写法 | 何时加载 | 优缺点 |
|------|----------|--------|
| `component: HomeView` | 页面一开始就加载 | 切换快，但首屏稍慢 |
| `component: () => import('...')` | 访问时才加载（懒加载） | 首屏快，推荐 |

```typescript
// 直接加载（用于首页等高频页面）
component: HomeView

// 懒加载（用于不常访问的页面）
component: () => import('../views/AboutView.vue')
```

---

## 三、两个核心标签

### 3.1 `<router-link>` — 导航链接

```html
<!-- 代替 <a href="/home">，点击不会刷新页面 -->
<router-link to="/home">首页</router-link>
```

**和 `<a>` 标签的区别**：
- `<a href="/home">`：浏览器刷新整个页面
- `<router-link to="/home">`：只替换内容区域，不刷新

### 3.2 `<router-view />` — 路由出口

```html
<!-- 当前 URL 匹配到哪个路由，就把哪个组件渲染在这里 -->
<router-view />
```

**它是整个路由系统的"舞台"**，所有页面都在这个位置显示。

### 3.3 它们怎么配合？

```
用户点击 <router-link to="/about">
          ↓
URL 变成 /about
          ↓
路由表匹配到 { path: '/about', component: AboutView }
          ↓
<router-view /> 渲染 AboutView 组件
          ↓
用户看到 About 页面
```

---

## 四、路由跳转的两种方式

### 4.1 方式一：声明式（`<router-link>`）

写在模板里，生成链接。适合导航栏、菜单等。

```html
<!-- 写死路径 -->
<router-link to="/home">首页</router-link>

<!-- 用命名路由（推荐，路径变了也不用改代码） -->
<router-link :to="{ name: 'home' }">首页</router-link>
```

注意上面第二行有 `:` 冒号（`:to`），这表示 `to` 的值是 JavaScript 表达式，不是字符串。

### 4.2 方式二：编程式（JS 代码）

写在 `<script>` 里，用代码触发跳转。适合按钮点击、表单提交后跳转等场景。

```typescript
import { useRouter } from 'vue-router'
const router = useRouter()

router.push({ name: 'home' })         // 跳转到首页
router.push({ path: '/home' })        // 用路径跳转
router.push('/home')                  // 直接写字符串也行
```

### 4.3 导航方法全家福

| 方法 | 效果 | 比喻 |
|------|------|------|
| `router.push('/a')` | 跳转到新页面，留下历史记录 | 翻开新的一页 |
| `router.back()` | 回到上一页 | 翻回上一页 |
| `router.forward()` | 前进到下一页 | 回到刚才翻过去的那页 |
| `router.go(-2)` | 后退 2 页 | 一次性往回翻两页 |
| `router.replace('/a')` | 跳转但**替换**当前页（不留下历史记录） | 撕掉当前页，放上新页 |

### 4.4 push vs replace（重要！）

```
push（压入）                     replace（替换）
┌─────────┐                     ┌─────────┐
│ 新页面   │ ← 新增加            │ 新页面   │ ← 覆盖掉当前页
├─────────┤                     ├─────────┤
│ 当前页   │                     │ 旧页面   │ ← 当前页已消失
├─────────┤                     ├─────────┤
│ 旧页面   │                     │ 更旧     │
└─────────┘                     └─────────┘

push 后点"后退"能回当前页        replace 后点"后退"回不到当前页
```

**什么时候用 replace？** 登录成功后跳首页——不希望用户点"后退"又回到登录页。

---

## 五、useRoute() vs useRouter()

这是新手最容易搞混的两个 API，但它们职责完全不同。

```typescript
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()    // ← 读：看当前页面的信息
const router = useRouter()  // ← 做：跳转到别的地方
```

**记法**：**R**oute 里有个 **R**ead（读），**R**outer 里有个 **R**un（跑/执行）。

### 5.1 useRoute() — 读取当前路由信息

```typescript
const route = useRoute()

route.path       // 当前路径 → /user/99
route.fullPath   // 完整路径（含 ? 和 #）→ /user/99?from=list
route.params.id  // 动态路由参数 → "99"
route.query.from // query 参数 → "list"
route.name       // 当前路由名 → "user-detail"
```

**都是只读的，别去改它们！**

### 5.2 useRouter() — 操作导航

```typescript
const router = useRouter()

router.push('/home')    // 跳转
router.back()           // 后退
router.replace('/xxx')  // 替换
```

### 5.3 实际应用场景对照

| 需求 | 用什么 | 代码 |
|------|--------|------|
| 获取 URL 里的用户 ID | `useRoute()` | `route.params.id` |
| 获取搜索关键词 `?keyword=vue` | `useRoute()` | `route.query.keyword` |
| 导航栏高亮当前页 | `useRoute()` | `route.name === 'home'` |
| 点击按钮跳转 | `useRouter()` | `router.push(...)` |
| 表单提交后跳列表 | `useRouter()` | `router.push(...)` |
| 无权限跳 403 | `useRouter()` | `router.replace('/403')` |

---

## 六、路由传参：params 和 query

### 6.1 对比总览

| | params | query |
|---|---|---|
| **URL 样子** | `/user/123` | `/user?id=123&name=张三` |
| **本质** | 参数是路径的一部分 | 路径后面挂的问号尾巴 |
| **比喻** | 房间号 | 门上的便利贴 |
| **路由定义** | **必须**提前声明 `:id` | 不需要声明 |
| **跳转写法** | **必须用 `name`**，不能用 `path` | `name` 和 `path` 都可以 |
| **获取方式** | `route.params.xxx` | `route.query.xxx` |
| **适合场景** | 资源 ID（用户ID、文章ID） | 搜索条件、来源追踪、分页 |

### 6.2 params 完整流程

```typescript
// 1. 路由定义：用 :id 占位
{ path: '/user/:id', name: 'user-detail', component: UserDetail }

// 2. 跳转：必须用 name
router.push({ name: 'user-detail', params: { id: '99' } })
// URL 变成：/user/99

// 3. 在组件里接收
const route = useRoute()
console.log(route.params.id)  // "99"
```

### 6.3 query 完整流程

```typescript
// 1. 路由定义：不需要额外声明
{ path: '/search', name: 'search', component: SearchView }

// 2. 跳转：name 和 path 都可以
router.push({ name: 'search', query: { keyword: 'vue', page: '1' } })
// URL 变成：/search?keyword=vue&page=1

// 3. 在组件里接收
const route = useRoute()
console.log(route.query.keyword)  // "vue"
console.log(route.query.page)     // "1"
```

### 6.4 混用

```typescript
router.push({
  name: 'user-detail',
  params: { id: '99' },          // → /user/99
  query: { from: 'wechat' },     // → ?from=wechat
})
// 最终 URL：/user/99?from=wechat
```

---

## 七、动态路由 — `:id` 占位符

### 7.1 它是什么？

路由路径中的 `:xxx` 是一个**占位符**，可以匹配任意值。

```
定义：  /user/:id
匹配：  /user/99     → route.params.id = "99"
       /user/888    → route.params.id = "888"
       /user/abc    → route.params.id = "abc"
不匹配：/user        → 没有 id
       /user/99/extra → 多了一层
```

同一个组件（`UserDetail.vue`），根据 URL 里不同的 `:id` 显示不同内容。

### 7.2 实现详情页的典型模式

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

// 根据 URL 里的 id 去后端请求对应的用户数据
const userId = route.params.id
// axios.get(`/api/user/${userId}`)
</script>

<template>
  <p>当前用户 ID：{{ route.params.id }}</p>
</template>
```

---

## 八、嵌套路由 — children

### 8.1 它是什么？

父组件像一个"壳"，子路由的组件渲染在壳里面的 `<router-view />` 中。

### 8.2 路由配置

```typescript
{
  path: '/user-list',
  component: UserList,       // 父组件（壳）
  children: [
    {
      path: ':id',            // 子路由 path 不要以 / 开头
      name: 'user-list-detail',
      component: UserDetail,  // 子组件（渲染在壳里面）
    },
  ],
}
```

### 8.3 父组件（壳）的写法

```vue
<!-- UserList.vue -->
<template>
  <div class="layout">
    <div class="left">
      <!-- 左侧：用户列表 -->
      <router-link to="/user-list/1">张三</router-link>
      <router-link to="/user-list/2">李四</router-link>
    </div>
    <div class="right">
      <!-- ⭐ 子路由出口！和 App.vue 里的 router-view 是同一个东西 -->
      <router-view />
    </div>
  </div>
</template>
```

### 8.4 访问效果

```
访问 /user-list      → 只显示父组件壳，右侧为空（没有匹配的子路由）
访问 /user-list/3    → 父组件壳 + 右侧渲染 UserDetail（id=3）
```

### 8.5 理解要点

`<router-view />` 不止 App.vue 里可以有，任何组件里都可以有。子路由的组件渲染在**最近的父级** `<router-view />` 里。

```
App.vue
  └─ <router-view />          ← 一级出口
       └─ UserList.vue
            └─ <router-view /> ← 二级出口（嵌套路由的关键）
```

---

## 九、Pinia 状态管理

### 9.1 它解决了什么问题？

**没有 Pinia 时，跨组件共享数据很麻烦：**

```
组件 A ←→ 父组件（中转）←→ 组件 B
```

兄弟组件传数据，必须通过父组件中转：A emit 给父，父再传 props 给 B。层级一深就成了"props 地狱"。

**有了 Pinia，数据放在全局仓库里：**

```
组件 A → store（全局仓库）← 组件 B
```

任何组件直接从 store 读、往 store 写，不需要经过父组件。

### 9.2 Store 的混合式（Setup 风格）写法

这是 Vue 官方推荐的写法，结构和组件 setup 几乎一样：

```typescript
// src/stores/user.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useXxxStore = defineStore('store名字', () => {
  // ① 状态（state）：用 ref / reactive 定义
  const nickname = ref('张三')
  const isLoggedIn = ref(false)

  // ② 计算属性（getter）：用 computed 派生新值
  const greeting = computed(() => {
    return isLoggedIn.value ? `欢迎回来，${nickname.value}！` : '请先登录'
  })

  // ③ 方法（action）：普通 function，用来修改状态
  function login(name: string) {
    nickname.value = name
    isLoggedIn.value = true
  }

  // ④ 暴露出去：只有 return 的东西外部才能访问
  return { nickname, isLoggedIn, greeting, login }
})
```

### 9.3 和组件写法的对照

| | 组件写法 | Store 写法 |
|---|---|---|
| 状态 | `const count = ref(0)` | `const count = ref(0)` |
| 计算属性 | `const double = computed(...)` | `const double = computed(...)` |
| 方法 | `function increment() {}` | `function increment() {}` |
| 暴露 | `defineExpose({ ... })` | `return { ... }` |

**除了 `defineStore` 外壳和 `return`，写法和组件一模一样。**

---

## 十、在组件中使用 Store

### 10.1 方式一：直接使用（最常用）

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
const counterStore = useCounterStore()
</script>

<template>
  <!-- 直接 store.xxx 读取，模板里自动解包，不需要 .value -->
  <p>{{ counterStore.count }}</p>
  <!-- 直接 store.xxx() 调用方法 -->
  <button @click="counterStore.increment()">+1</button>
</template>
```

### 10.2 方式二：storeToRefs 解构

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()

// 状态 → 用 storeToRefs 包一下再解构（保持响应式）
const { count, doubleCount } = storeToRefs(counterStore)

// 方法 → 直接解构（方法不需要响应式）
const { increment } = counterStore
</script>

<template>
  <p>{{ count }}</p>           <!-- 解构后可以直接用短名字 -->
  <button @click="increment()">+1</button>
</template>
```

### 10.3 为什么需要 storeToRefs？（重点）

```typescript
// ❌ 直接解构 → 响应式丢失！
const { count } = counterStore
// count 现在只是一个普通数字，store 里 count 变了它不会跟着变

// ✅ storeToRefs 解构 → 响应式保留
const { count } = storeToRefs(counterStore)
// count 现在是一个 ref，store 里 count 变了它会自动更新
```

**原理**：`storeToRefs` 把 store 里的每个状态转成独立的 `ref`，解构后每个 ref 仍然保持响应式连接。

### 10.4 storeToRefs 只包状态和 getter

```typescript
const { count, doubleCount } = storeToRefs(counterStore)  // ✅ 状态 + getter
const { increment } = counterStore                        // ✅ 方法直接解构
```

方法不需要响应式（方法本身不会变），所以直接从 store 上解构就行。

---

## 十一、难点速查

| 难点 | 一句话解释 |
|------|-----------|
| params vs query | params 是路径的一部分（`/user/99`），query 是问号尾巴（`/user?id=99`） |
| useRoute vs useRouter | Route = Read（读当前页信息），Router = Run（跳转到别处） |
| push vs replace | push 留历史记录（可后退），replace 替换当前页（不可后退） |
| 嵌套路由 | 父组件里放 `<router-view />`，子路由的组件就渲染在那里 |
| 懒加载 | `() => import(...)` — 访问时才下载组件，首屏更快 |
| `component: HomeView` | 变量名 `HomeView` 来自文件顶部的 `import HomeView from ...` |
| storeToRefs | 解构 store 时必须用它包一下，否则响应式丢失 |
| params 必须用 name 跳转 | `router.push({ path: '/user/99' })` 的 params 会被忽略，必须用 `name` |
| `!` 取反 | `!undefined` = `true`，常用来判断"参数不存在时显示提示" |
