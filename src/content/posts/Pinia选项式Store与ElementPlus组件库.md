---
title: "Pinia 选项式 Store 与 Element Plus 组件库"
published: 2025-07-26
description: "Pinia 选项式 Store 写法详解 + Element Plus 组件库的安装、配置和常用组件示例"
tags: [Pinia, Element Plus, Vue, 组件库, 前端]
category: 学习笔记
draft: false
pinned: false
---

> 学习时间：2026.07.26  
> 适用：已了解 Vue 组件基础和 Router 基础

---

## 一、Pinia 选项式 Store 写法

### 1.1 和混合式的区别

Pinia 有两种写法，效果一样，只是结构不同：

```typescript
// 混合式（Setup 风格）—— 像组件 setup
defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})

// 选项式（Options API 风格）—— state/getters/actions 分门别类
defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() { this.count++ },
  },
})
```

### 1.2 选项式结构详解

```
defineStore('名字', {
  state: () => ({ ... }),    // ① 数据，必须是一个函数返回对象
  getters: { ... },          // ② 计算属性，由数据派生新值
  actions: { ... },          // ③ 方法，用来修改数据
})
```

#### ① state — 定义数据

```typescript
state: (): { count: number } => ({
  count: 0,
})
```

- **必须是函数**，返回一个对象
- `(): { count: number }` 是 TypeScript 类型注解，声明 count 是 number 类型

#### ② getters — 计算属性

```typescript
getters: {
  doubleCount(): number {
    return this.count * 2
  },
}
```

- 用 `this.xxx` 访问 state 里的数据（和 actions 一样）
- 也可以用参数写法：`doubleCount: (state) => state.count * 2`

#### ③ actions — 修改数据的方法

```typescript
actions: {
  increment(value: number): number {
    if (typeof value === 'number' && value >= 0) {
      this.count += value
    }
    return this.count
  },
  reset(): void {
    this.count = 0
  },
}
```

- 用 `this.xxx` 访问和修改 state
- 可以接受参数、返回值

### 1.3 TypeScript 类型注解

```typescript
increment(value: number): number
//          ↑               ↑
//     参数是 number     返回值是 number

reset(): void
//        ↑
//   无返回值（void = "空的"）
```

| 类型 | 含义 | 示例 |
|------|------|------|
| `string` | 字符串 | `'hello'` |
| `number` | 数字 | `17`、`3.14` |
| `boolean` | 布尔 | `true` / `false` |
| `void` | 无返回值 | 方法里没有 return |
| `string[]` | 字符串数组 | `['a', 'b']` |

---

## 二、`this.count += value` 详解（重点）

### 2.1 拆解

```
this.count   +=   value
    ↑         ↑      ↑
  store里   加等于   传进来的参数
  的数据
```

`+=` 是 JavaScript 的简写运算符，等价于：

```typescript
this.count += value
// 完全等于 ↓
this.count = this.count + value
// 新值    =   旧值    +  加多少
```

### 2.2 实际执行

```
假设 count = 5，调用 increment(1)

第 1 步：value = 1
第 2 步：检查通过（1 是 number 且 >= 0）
第 3 步：this.count += 1
         → this.count = 5 + 1
         → this.count = 6
第 4 步：return this.count  →  返回 6
```

### 2.3 常见简写运算符

```typescript
this.count += value   // 加等于：count = count + value
this.count -= value   // 减等于：count = count - value
this.count++          // 自增 1：count = count + 1
this.count--          // 自减 1：count = count - 1
```

---

## 三、computed 计算属性（重点）

### 3.1 它是什么？

**`computed` 会自动追踪依赖的数据，数据一变，它自己重新算。**

### 3.2 对比普通函数

```typescript
const count = ref(5)

// 普通函数：需要手动调用
function getDouble() {
  return count.value * 2
}
console.log(getDouble())  // 10，不调用就不会算

// computed：自动追踪，count 一变它就重算
const double = computed(() => count.value * 2)
console.log(double.value)  // 10

count.value = 10
console.log(double.value)  // 20 ✅ 自动更新了！
```

### 3.3 自动追踪原理

```
computed(() => count.value * 2)
              ↑
      computed 发现这里读了 count
              ↓
      把 count 记在"依赖列表"里
              ↓
      count 一变 → 收到通知 → 自动重新执行 → 得到新值
```

### 3.4 实际例子：user.ts 里的 greeting

```typescript
const isLoggedIn = ref(false)
const nickname = ref('张三')

const greeting = computed(() => {
  if (isLoggedIn.value) {
    return `欢迎回来，${nickname.value}！`
  } else {
    return '请先登录'
  }
})
```

`greeting` 会自动盯着 `isLoggedIn` 和 `nickname`，任何一个变了它都会重新算，不需要手动更新。

---

## 四、三元表达式和模板字符串

### 4.1 三元表达式

```typescript
条件 ? 为 true 时取这个 : 为 false 时取这个

// 读作：isLoggedIn 是 true 吗？是 → 取前面的，否则 → 取后面的
isLoggedIn.value ? `欢迎回来！` : '请先登录'
```

**等价于 if...else：**

```typescript
// 三元表达式（一行）
const msg = isLoggedIn.value ? '欢迎' : '请登录'

// if...else（多行）
let msg: string
if (isLoggedIn.value) {
  msg = '欢迎'
} else {
  msg = '请登录'
}
```

### 4.2 模板字符串 `` `...${}...` ``

反引号 `` ` `` 包裹的字符串里，`${变量}` 可以把变量嵌入文字：

```typescript
const name = '张三'

// 普通拼接
'欢迎回来，' + name + '！'

// 模板字符串（推荐，清晰直观）
`欢迎回来，${name}！`
```

---

## 五、`||` 运算符 — 备用值（重点）

### 5.1 逻辑

```typescript
左边 || 右边
```

- 左边有值（truthy）→ 用左边
- 左边没值（falsy）→ 用右边作为备用

### 5.2 实际例子

```html
<p>{{ inputText || '（还没输入）' }}</p>
```

```
用户没输入 → inputText = ''（空字符串，falsy）
            → '' || '（还没输入）' → 显示"（还没输入）"

用户输入了 → inputText = 'hello'（非空字符串，truthy）
            → 'hello' || '（还没输入）' → 显示"hello"
```

### 5.3 truthy 和 falsy

```typescript
// falsy（假值，|| 会跳过它）
''        空字符串
0         数字零
false     布尔假
null      空
undefined 未定义

// truthy（真值，|| 会用它）
'hello'   非空字符串
1         非零数字
true      布尔真
[]        空数组
{}        空对象
```

---

## 六、storeToRefs 解构规则（重点）

### 6.1 核心规则

```typescript
// 状态和 getter → 必须用 storeToRefs（保持响应式）
const { count, doubleCount } = storeToRefs(counterStore)

// 方法（action）→ 直接解构就行（方法不会变，不需要响应式）
const { increment } = counterStore
```

### 6.2 为什么不能用 storeToRefs 包所有？

**`storeToRefs` 刻意不提取方法。** 它只返回状态和 getter，方法会被忽略。所以方法必须单独从 store 上解构。

### 6.3 为什么方法可以直接解构？

方法就是函数引用，它从始至终不变。只有"会变化的数据"才需要响应式，方法不需要。

### 6.4 解构赋值 `const { xxx } = 对象`

```typescript
const { increment } = counterStore
// 等价于
const increment = counterStore.increment
```

`{}` 就是把对象里的某个属性拆出来，变成一个独立的同名变量。

---

## 七、Element Plus 组件库基础

### 7.1 注册（两件事）

```typescript
// main.ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'  // 别忘了引 CSS！

app.use(ElementPlus)
```

### 7.2 模板组件（写在 `<template>` 里）

#### el-button — 按钮

```html
<el-button>默认</el-button>
<el-button type="primary">主要</el-button>
<el-button type="success">成功</el-button>
<el-button type="warning">警告</el-button>
<el-button type="danger">危险</el-button>
```

`type` 控制颜色，`@click` 绑定点击事件。

#### el-input — 输入框

```html
<el-input v-model="text" placeholder="请输入" />
```

`v-model` 双向绑定：输入框里的内容和 JS 变量 `text` 实时同步。

#### el-select — 下拉选择

```html
<el-select v-model="selected" placeholder="请选择">
  <el-option label="北京" value="beijing" />
  <el-option label="上海" value="shanghai" />
</el-select>
```

- `v-model` 绑定选中的值（取到的就是 option 的 `value`）
- `label` 是显示的文字，`value` 是实际值

#### el-table — 表格

```html
<el-table :data="tableData" border>
  <el-table-column prop="name" label="姓名" />
  <el-table-column prop="age" label="年龄" />
</el-table>
```

- `:data`：数据源数组，数组几个对象就渲染几行
- `border`：加上竖线边框
- `prop`：对应数据里的字段名（必须一致）
- `label`：表头显示的文字（随便写）

### 7.3 函数式组件（写在 `<script>` 里）

`ElMessage` 不需要在模板里写标签，直接在 JS 里调用：

```typescript
import { ElMessage } from 'element-plus'

ElMessage.success('操作成功！')   // 绿色
ElMessage.warning('请注意！')     // 黄色
ElMessage.error('出错了！')       // 红色
ElMessage('普通消息')             // 默认
```

一行代码，弹出、显示、几秒后自动消失。

### 7.4 el-dialog — 对话框的显示/隐藏原理（重点）

```html
<!-- 按钮：只负责改变量 -->
<el-button @click="dialogVisible = true">打开对话框</el-button>

<!-- 对话框：盯着变量，true 就显示，false 就隐藏 -->
<el-dialog v-model="dialogVisible" title="对话框">
  <el-button @click="dialogVisible = false">取消</el-button>
</el-dialog>

<script setup>
const dialogVisible = ref(false)  // 初始隐藏
</script>
```

**变量是按钮和对话框之间唯一的联系方式：**

```
初始：dialogVisible = false → 对话框隐藏
  ↓ 用户点击按钮
@click 把 dialogVisible 改为 true
  ↓ el-dialog 通过 v-model 检测到 true
对话框弹出
  ↓ 用户点击取消
@click 把 dialogVisible 改为 false
  ↓ el-dialog 检测到 false
对话框关闭
```

**为什么 `ref(false)` 不直接写 `true`？** 因为对话框初始应该是隐藏的，用户点了才弹出来。直接写 `true` 会页面一打开就弹框，体验很差。

---

## 八、插槽 slot — 表格操作列（重点）

### 8.1 什么是插槽？

插槽（slot）就是组件留的"填空位置"——组件留一个坑，你来填内容。

### 8.2 `#default="scope"` 详解

```html
<el-table-column label="操作">
  <template #default="scope">
    <el-button @click="deleteRow(scope.$index)">删除</el-button>
  </template>
</el-table-column>
```

逐词解释：

| 部分 | 含义 |
|------|------|
| `<template>` | 定义一个模板片段 |
| `#default` | 默认插槽的名字（`#` 是 `v-slot:` 的简写） |
| `="scope"` | 接收表格传过来的当前行信息，存到 `scope` 变量里 |

### 8.3 scope 对象的内容

```typescript
scope = {
  row:    { name: '张三', age: 28, city: '北京' },  // 当前行的完整数据
  $index: 0,                                         // 当前行号（从 0 开始）
  // ... 还有其他属性
}
```

**`$` 只是一个命名习惯**，表示"系统提供的元数据"，不是用户数据。`$index` 就是一个普通属性名。

### 8.4 scope.row vs scope.$index

| | `scope.row` | `scope.$index` |
|---|---|---|
| 值 | 当前行的数据对象 | 当前行号 |
| 示例 | `{ name: '张三', age: 28 }` | `0`、`1`、`2` |
| 删除用法 | 需要先找位置 | 直接 `splice(index, 1)` |

---

## 九、今日难点速查

| 难点 | 一句话 |
|------|--------|
| `+=` 运算符 | `this.count += value` = `this.count = this.count + value` |
| `computed` | 会自动追踪依赖的数据，数据变它就自动重算，不需要手动调用 |
| 三元表达式 | `条件 ? 真 : 假`，简写的 if...else |
| 模板字符串 | `` `文字${变量}文字` ``，用 `${}` 嵌入变量 |
| `\|\|` 备用值 | `A \|\| B`：A 有值用 A，没值用 B |
| storeToRefs | 解构状态时用它保持响应式，方法直接解构 |
| `const { x } = obj` | 解构赋值：把对象的属性拆出来变成独立变量 |
| Element Plus 注册 | `app.use(ElementPlus)` + 引入 CSS |
| `v-model` | 双向绑定，输入框/下拉和数据实时同步 |
| `el-table` prop vs label | prop 对应数据字段，label 是表头文字 |
| `ElMessage` | 函数式组件，JS 里调用，不用写在模板 |
| 对话框原理 | 按钮改变量 → el-dialog 通过 v-model 盯变量 → true 就弹，false 就关 |
| 插槽 `#default="scope"` | 组件留的坑，scope 传给你当前行的信息 |
| `scope.$index` | 当前行号，用来定位删第几行 |
| `scope.row` | 当前行完整数据对象 |
