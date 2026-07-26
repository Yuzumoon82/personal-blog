---
title: "Mizuki Music Player 实现详解"
published: 2025-07-25
description: "从零拆解音乐播放器组件——Svelte 与 Vue 对照，面向新手"
tags: [Mizuki, MusicPlayer, Svelte, Vue, 前端]
category: 技术文章
draft: false
---

# Mizuki Music Player 实现详解

> 从零拆解一个完整的前端组件——音乐播放器。面向 Vue 新手，每一步都标注 Svelte 和 Vue 的对应写法。

---

## 〇、先理解三个基础概念（Svelte ↔ Vue 对照表）

你看代码时会遇到 Svelte 语法，它们和 Vue 的对应关系如下：

| 概念 | Svelte 写法 | Vue 3 写法 | 作用 |
|------|------|------|------|
| 组件状态 | `let state = ...` | `const state = ref(...)` | 存数据，数据变了自动更新DOM |
| 父传子 | `<Child prop={value} />` | `<Child :prop="value" />` | 把数据传给子组件 |
| 子传父 | `<Child onclick={fn} />` | `<Child @click="fn" />` | 子组件通知父组件"发生了某件事" |
| 组件挂载 | `onMount(() => {...})` | `onMounted(() => {...})` | 组件出现在页面上时执行 |
| 组件销毁 | `onDestroy(() => {...})` | `onUnmounted(() => {...})` | 组件从页面移除时执行（清理定时器、取消订阅） |
| 模板条件 | `{#if condition}...{/if}` | `<div v-if="condition">...</div>` | 条件渲染 |
| 模板列表 | `{#each list as item}...{/each}` | `<div v-for="item in list">...</div>` | 列表渲染 |
| 动态class | `class:active={isActive}` | `:class="{ active: isActive }"` | 条件class |
| 插槽 | `<slot />` | `<slot />` | 父组件往子组件里插内容 |

---

## 一、项目文件地图（你只需要看这 12 个文件）

```
src/
├── config/musicConfig.ts                    ← ① 配置文件：歌单ID、音乐源
├── stores/musicPlayerStore.ts               ← ② ★ 核心大脑：所有状态+所有操作
│
├── components/widgets/music-player/
│   ├── MusicPlayer.svelte                   ← ③ ★ 主组件：组装一切，连接Store
│   ├── constants.ts                         ← ④ 常量：默认歌曲、本地歌单
│   ├── types.ts                             ← ⑤ 类型定义：Song对象长什么样
│   │
│   ├── organisms/                           ← ⑥ 有机体：由多个分子组成的大块
│   │   ├── PlayerBar.svelte                 ←    展开状态面板（全功能）
│   │   ├── MiniPlayer.svelte                ←    收起状态面板（迷你）
│   │   └── Playlist.svelte                  ←    歌单列表弹窗
│   │
│   ├── molecules/                           ← ⑦ 分子：由原子组成的中间块
│   │   ├── TrackDisplay.svelte              ←    歌曲封面+歌名+歌手
│   │   ├── PlayerControls.svelte            ←    播放/上一首/下一首按钮组
│   │   ├── ProgressControl.svelte           ←    进度条
│   │   └── VolumeControl.svelte             ←    音量滑块+静音按钮
│   │
│   └── atoms/                               ← ⑧ 原子：最小的独立UI单元
│       ├── CoverImage.svelte                ←    封面图（可旋转、可点击）
│       ├── TrackInfo.svelte                 ←    歌名+歌手文字
│       ├── PlayButton.svelte                ←    播放/暂停按钮
│       ├── PrevButton.svelte                ←    上一首按钮
│       ├── NextButton.svelte                ←    下一首按钮
│       ├── ModeButton.svelte                ←    随机/循环模式按钮
│       ├── ProgressBar.svelte               ←    进度条滑块
│       ├── VolumeButton.svelte              ←    音量图标按钮
│       └── VolumeSlider.svelte              ←    音量滑动条
│
└── components/control/
    └── MusicFabButton.svelte                ← ⑨ 悬浮按钮：点击展开/收起播放器
```

**组件层级**：MusicPlayer → PlayerBar/MiniPlayer → TrackDisplay/PlayerControls → CoverImage/PlayButton...

---

## 二、从最简单的文件开始看

### 2.1 配置文件 `musicConfig.ts`（你唯一需要改的文件）

```ts
// src/config/musicConfig.ts
export const musicPlayerConfig = {
    enable: true,                    // 总开关，false=整个播放器不加载
    mode: "local",                   // "local"=用本地写死的歌单 / "meting"=连API获取
    // 下面这些只在 mode="meting" 时生效
    id: "14164869977",              // 网易云歌单ID（去网易云网页版URL里找）
    server: "netease",              // 音乐源：netease / tencent / kugou
    type: "playlist",               // "playlist"=歌单 / "song"=单曲 / "album"=专辑
    showFloatingPlayer: true,       // 显示右下角悬浮播放器
    floatingEntryMode: "fab",       // "fab"=集成到悬浮按钮 / "default"=独立悬浮
};
```

**你需要知道的事**：整个音乐播放器的行为由这个文件控制。换歌单只改 `id`，关播放器只改 `enable: false`。

### 2.2 类型定义 `types.ts`（Song 对象长什么样）

```ts
// 这是我们自己定义的数据结构，一首歌就是一个Song对象
export interface Song {
    id: number;        // 歌曲ID
    title: string;     // 歌名，如"晴天"
    artist: string;    // 歌手，如"周杰伦"
    cover: string;     // 封面图URL
    url: string;       // ★ 最关键：音乐文件的URL，浏览器要能直接播放
    duration: number;  // 时长（秒）
}
```

### 2.3 常量 `constants.ts`（默认值和本地歌单）

```ts
// 默认歌曲（歌单还没加载时先显示这个）
export const DEFAULT_SONG: Song = {
    id: 0,
    title: "未知歌曲",
    artist: "未知歌手",
    cover: "",
    url: "",
    duration: 0,
};

// 本地模式用的歌单（mode="local"时直接用这个）
export const LOCAL_PLAYLIST: Song[] = [
    // 你可以把mp3文件放public目录下，然后在这里写路径
    { id: 1, title: "示例歌曲", artist: "示例歌手",
      cover: "/assets/music/cover.jpg",
      url: "/assets/music/song.mp3",
      duration: 0 },
];

// 歌曲加载失败后等5秒自动跳下一首
export const SKIP_ERROR_DELAY = 5000;

// 音量存localStorage的key名
export const STORAGE_KEY_VOLUME = "mizuki-music-volume";
```

---

## 三、核心大脑 `musicPlayerStore.ts`（591行，最重要）

这是整个播放器的灵魂。你先理解下面这张图，再逐段看代码。

### 3.1 整体结构（Vue 等价物：Pinia Store）

```
┌─────────────────────────────────────────────────────┐
│                  musicPlayerStore                    │
│                                                     │
│  state = {                    ← 唯一的数据源         │
│    currentSong: Song,         当前播哪首             │
│    playlist: Song[],          整个歌单               │
│    currentIndex: number,      播到第几首             │
│    isPlaying: boolean,        正在播放？             │
│    currentTime: number,       当前秒数               │
│    duration: number,          总时长                 │
│    volume: number,            音量 0-1               │
│    isShuffled: boolean,       随机？                 │
│    isRepeating: 0|1|2,        0=不循环 1=单曲 2=列表 │
│    isExpanded: boolean,       面板展开？             │
│    isHidden: boolean,         面板隐藏？             │
│  }                                                  │
│                                                     │
│  audio = new Audio()          浏览器原生播放器        │
│                                                     │
│  listeners = Set<fn>          订阅者列表              │
│                                                     │
│  方法（你调这些来控制播放器）：                        │
│  toggle() / play() / pause() / next() / prev()       │
│  setVolume(n) / toggleMute() / seek(秒)              │
│  toggleShuffle() / toggleRepeat()                    │
│  toggleExpanded() / toggleHidden()                   │
│                                                     │
│  subscribe(fn) → 返回 unsubscribe 函数               │
│  broadcastState() → 通知所有订阅者                    │
└─────────────────────────────────────────────────────┘
```

### 3.2 初始化：`initialize()` —— 启动时做了什么

```ts
// musicPlayerStore.ts L105-120
async initialize(): Promise<void> {
    // ① 防止重复初始化（服务器端不初始化，因为没有window）
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    // ② 如果配置里关了播放器，直接返回
    if (!musicPlayerConfig.enable) return;

    // ③ ★ 创建浏览器原生 Audio 对象
    //    Audio 是浏览器内置的，不需要安装任何库
    //    new Audio() 就等于你在HTML里写 <audio></audio>
    this.audio = new Audio();

    // ④ 给 Audio 绑定事件监听（play、pause、ended、error...）
    this.setupAudioListeners();

    // ⑤ 从 localStorage 恢复上次的音量
    this.loadVolumeFromStorage();

    // ⑥ 注册用户交互处理（浏览器禁止自动播放，需等用户点一下页面）
    this.registerInteractionHandler();

    // ⑦ ★ 加载歌单（要么调API，要么用本地歌单）
    await this.loadPlaylist();
}
```

**这一步做完后**：`audio` 对象创建好了，歌单加载了，第一首歌的 URL 设好了（但还没开始播——浏览器禁止自动播放）。

### 3.3 绑定 Audio 事件：`setupAudioListeners()`

```ts
// musicPlayerStore.ts L122-163
private setupAudioListeners(): void {
    // ★ Audio 对象会自己触发这些事件，我们只需要"听"它们

    // 事件1：开始播放了 → 更新 isPlaying = true → 通知所有组件
    this.audio.addEventListener("play", () => {
        this.state.isPlaying = true;
        this.broadcastState();  // ★ 每次状态变化都通知订阅者
    });

    // 事件2：暂停了 → 更新 isPlaying = false → 通知
    this.audio.addEventListener("pause", () => {
        this.state.isPlaying = false;
        this.broadcastState();
    });

    // 事件3：播放进度更新（浏览器每250ms触发一次）→ 更新进度条
    this.audio.addEventListener("timeupdate", () => {
        this.state.currentTime = this.audio.currentTime;
        this.broadcastState();
    });

    // 事件4：播完了 → 自动下一首（或单曲循环）
    this.audio.addEventListener("ended", () => this.handleAudioEnded());

    // 事件5：加载出错了 → 显示错误，5秒后跳下一首
    this.audio.addEventListener("error", () => this.handleAudioError());

    // 事件6：数据加载完成 → 拿到歌曲总时长（duration）
    this.audio.addEventListener("loadeddata", () => this.handleAudioLoaded());

    // 事件7：开始加载 → 显示loading状态
    this.audio.addEventListener("loadstart", () => {
        this.state.isLoading = true;
        this.broadcastState();
    });
}
```

**你需要知道的事**：`audio` 是浏览器原生对象，它会自动触发 `play`、`pause`、`ended` 这些事件。我们要做的只是在事件处理函数里**更新 state 然后 `broadcastState()`**。所有组件都会自动收到新状态。

### 3.4 加载歌单：`loadPlaylist()`

```ts
// musicPlayerStore.ts L249-268
private async loadPlaylist(): Promise<void> {
    const mode = musicPlayerConfig.mode;  // "local" 或 "meting"

    if (mode === "meting") {
        // ★ 在线模式：调Meting API获取歌单
        //   把配置里的 server/type/id 拼到API URL里
        //   例如：https://api.example.com/api?server=netease&type=playlist&id=14164869977
        await this.fetchMetingPlaylist(api, server, type, id);
    } else {
        // ★ 本地模式：直接用 constants.ts 里写死的 LOCAL_PLAYLIST
        this.loadLocalPlaylist();
    }
}
```

**Meting API 是什么**：一个开源的音乐API，能根据网易云/QQ音乐的歌单ID返回歌曲列表（歌名、歌手、封面、mp3地址）。Mizuki 项目自己部署了一个 Meting API 服务，URL 配置在 `musicConfig.meting_api` 里。

### 3.5 加载一首歌：`loadSong()`

```ts
// musicPlayerStore.ts L350-371
private loadSong(song: Song, autoPlay = true): void {
    if (!song?.url) return;  // 没有URL就跳过

    // ★ 把歌曲URL设给 Audio 对象
    //   这就等于 <audio src="https://music.xxx.com/song.mp3"></audio>
    this.audio.src = getAssetPath(song.url);

    // ★ 调 load() 让浏览器开始加载音频数据
    //   加载完成后 Audio 会自动触发 "loadeddata" 事件
    this.audio.load();

    // 更新当前歌曲信息
    this.state.currentSong = { ...song };
    this.state.willAutoPlay = autoPlay;  // 加载完是否自动播放

    this.broadcastState();
}
```

### 3.6 通知所有组件：`broadcastState()` —— 最关键的方法

```ts
// musicPlayerStore.ts L560-575
private broadcastState(): void {
    // ★ 深拷贝一份 state，防止组件意外修改原始数据
    const snapshot = this.createSnapshot();

    // ★ 方式1：通知所有 Svelte 组件（通过 subscribe 注册的回调）
    for (const listener of this.listeners) {
        listener(snapshot);
    }

    // ★ 方式2：同时用浏览器原生 CustomEvent 通知非Svelte代码
    //   这样任何JS代码都可以通过 addEventListener("music-sidebar:state") 收到通知
    window.dispatchEvent(
        new CustomEvent("music-sidebar:state", { detail: snapshot })
    );
}
```

**`broadcastState()` 就是整个播放器的核心机制**。任何操作（播放、暂停、切歌、调音量）最后都会走到这个方法——它保证了所有组件看到的数据永远一致。

### 3.7 核心操作实现

**播放/暂停**：
```ts
// L388-397
toggle(): void {
    if (this.state.isPlaying) {
        this.audio.pause();  // ★ 调浏览器原生方法 → 触发 "pause" 事件
    } else {
        this.audio.play();   // ★ 调浏览器原生方法 → 触发 "play" 事件
    }
}
```

**下一首（随机模式支持）**：
```ts
// L413-435
next(autoPlay = true): void {
    let newIndex: number;
    if (this.state.isShuffled) {
        // ★ 随机模式：在0到歌单长度之间随机选一个，但排除当前这首
        do {
            newIndex = Math.floor(Math.random() * this.state.playlist.length);
        } while (newIndex === this.state.currentIndex && this.state.playlist.length > 1);
    } else {
        // ★ 顺序模式：下一首，到底了回到第一首
        newIndex = this.state.currentIndex < this.state.playlist.length - 1
            ? this.state.currentIndex + 1 : 0;
    }
    this.state.currentIndex = newIndex;
    this.loadSong(this.state.playlist[newIndex], autoPlay);
}
```

**歌曲播完自动处理**：
```ts
// L165-175
private handleAudioEnded(): void {
    if (this.state.isRepeating === 1) {
        // 单曲循环 → 回到开头重新播放
        this.audio.currentTime = 0;
        this.audio.play();
    } else {
        // 否则 → 自动下一首（列表循环到底会回第一首，因为 next() 里处理的）
        this.next(true);
    }
}
```

**歌曲加载失败**：
```ts
// L177-187
private handleAudioError(): void {
    this.state.isLoading = false;
    this.showError("无法播放");  // 弹出红色错误提示，3秒后自动消失
    if (this.state.playlist.length > 1) {
        setTimeout(() => this.next(true), 5000);  // 5秒后自动跳过
    }
}
```

---

## 四、组件层 —— 从外到内看

### 4.1 MusicPlayer.svelte（主组件，相当于 Vue 的页面级组件）

这是整个播放器的**唯一入口组件**，放在 `Layout.astro` 里，所有页面都加载。

**它的三件事**：

**① 挂载时订阅 Store**（Vue 等价：onMounted 里 watch store）：

```svelte
<script>
  // 拿到当前状态的快照
  let state = musicPlayerStore.getState();

  onMount(() => {
    // ★ 订阅：Store 每次 broadcastState() 都会调这个回调
    //   Vue 等价写法：watch(() => store.state, (newVal) => { state = newVal })
    unsubscribe = musicPlayerStore.subscribe((nextState) => {
      state = nextState;  // Svelte 检测到赋值会自动更新所有用到 state 的 DOM
    });

    // ★ 启动：连API拿歌单、创建Audio对象
    musicPlayerStore.initialize();
  });

  onDestroy(() => {
    unsubscribe?.();           // 取消订阅 → 避免内存泄漏
    musicPlayerStore.destroy(); // 清理 Audio 对象 → 释放浏览器资源
  });
</script>
```

**② 事件处理 —— 自己不做逻辑，只调 Store 方法**：

```svelte
<script>
  // ★ 组件里只做一件事：调用 Store 的方法。不自己改状态。
  function togglePlay()   { musicPlayerStore.toggle(); }
  function prev()         { musicPlayerStore.prev(); }
  function next()         { musicPlayerStore.next(); }
  function toggleShuffle(){ musicPlayerStore.toggleShuffle(); }
  function toggleRepeat() { musicPlayerStore.toggleRepeat(); }

  // ★ 进度条拖拽稍微复杂一点：需要根据鼠标位置计算百分比
  function setProgress(event: MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    musicPlayerStore.setProgress(percent);  // 最后也是调Store方法
  }

  // ★ 音量拖拽类似：监听 pointermove 事件，实时计算位置
  function startVolumeDrag(event: PointerEvent) {
    const updateVolume = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      musicPlayerStore.setVolume(percent);
    };
    updateVolume(event.clientX);
    // 监听拖动和释放事件，拖完清理监听器
  }
</script>
```

**③ 模板 —— 条件渲染不同的UI状态**：

```svelte
<!-- 错误提示：state.showError 为 true 时显示红色提示框 -->
{#if state.showError}
  <div class="fixed bottom-20 right-4 bg-red-500 text-white ...">
    {state.errorMessage}
    <button onclick={hideError}>×</button>
  </div>
{/if}

<!-- fab模式：点击悬浮按钮 → 展开面板，Svelte 的 fly 过渡动画 -->
{#if useFabEntry}
  {#if state.isExpanded}
    <div transition:fly={{ y: 16, duration: 280 }}>
      <FabMusicPanel />
    </div>
  {/if}
{/if}

<!-- 展开面板：全部功能 -->
<PlayerBar
  song={state.currentSong}      ← 父传子：把当前歌曲传给子组件
  isPlaying={state.isPlaying}   ← 父传子：播放状态
  onPlayClick={togglePlay}      ← 子传父：子组件点击播放 → 调父组件的togglePlay
  onNextClick={() => next()}    ← 子传父：下一首
  onProgressClick={setProgress} ← 子传父：点击进度条
/>

<!-- 收起面板：迷你模式 -->
<MiniPlayer
  song={state.currentSong}
  isPlaying={state.isPlaying}
  onCoverClick={togglePlay}     ← 点击封面=播放/暂停
  onInfoClick={toggleExpanded}  ← 点击歌名区域=展开
/>
```

### 4.2 PlayerBar.svelte（展开面板）

**这和 Vue 的纯展示组件完全一样**——只接收 props，不访问 Store：

```svelte
<script>
  // ★ 定义 Props 接口（Vue: defineProps<{...}>()）
  interface Props {
    song: Song;                 // 数据：歌曲信息
    isPlaying: boolean;         // 数据：播放状态
    onPlayClick: () => void;    // 事件：点击播放按钮时通知父组件
    onNextClick: () => void;    // 事件：点击下一首时通知父组件
    onProgressClick: (e: MouseEvent) => void;  // 事件：点击进度条
    // ...
  }
  const { song, isPlaying, onPlayClick, onNextClick, ... } = $props();
</script>

<div class="expanded-player ...">
  <!-- 歌曲展示区：封面+歌名+歌手 -->
  <TrackDisplay {song} {isPlaying} />

  <!-- 进度条 -->
  <ProgressControl {currentTime} {duration} onclick={onProgressClick} />

  <!-- 控制按钮组：随机、上一首、播放/暂停、下一首、循环 -->
  <PlayerControls {isPlaying} onPlayClick={onPlayClick} onNextClick={onNextClick} />

  <!-- 音量控制：音量图标+滑块 -->
  <VolumeControl {volume} {isMuted} onclick={onVolumeButtonClick} />
</div>
```

**关键模式**：
- 数据通过 `{变量名}`（即 Vue 的 `:prop="变量"`）传入
- 事件通过 `onClick={回调函数}`（即 Vue 的 `@click="回调"`）传出
- PlayerBar 不知道 Store 的存在——它只是一个数据的搬运工

### 4.3 组件树逐层展开

```
MusicPlayer.svelte  ← 唯一连Store的组件，有subscribe+事件处理+模板
│
├── MiniPlayer.svelte  ← 纯展示，收props传事件。data down, events up
│   └── TrackDisplay.svelte
│       ├── CoverImage.svelte    ← 封面图（播放时旋转，加载时闪动）
│       └── TrackInfo.svelte     ← 歌名+歌手文字
│
├── PlayerBar.svelte  ← 纯展示
│   ├── TrackDisplay.svelte      ← 同上但 expanded 尺寸
│   ├── ProgressControl.svelte   ← 进度条容器
│   │   └── ProgressBar.svelte   ← 实际的进度条div（点击=跳转，拖拽=seek）
│   ├── PlayerControls.svelte    ← 按钮组容器
│   │   ├── ModeButton.svelte    ← 随机/循环模式切换
│   │   ├── PrevButton.svelte    ← 上一首
│   │   ├── PlayButton.svelte    ← 播放/暂停（loading时显示转圈）
│   │   └── NextButton.svelte    ← 下一首
│   └── VolumeControl.svelte     ← 音量控制容器
│       ├── VolumeButton.svelte  ← 音量图标（点一下静音/取消静音）
│       └── VolumeSlider.svelte  ← 音量滑块（拖拽调音量）
│
└── Playlist.svelte  ← 歌单列表
    └── 每个歌单项：封面+歌名+歌手，点击切歌
```

---

## 五、完整数据流（用户点"播放"按钮 → 音乐响起）

```
1. 用户点击播放按钮
        │
        ▼
2. PlayButton.svelte 触发 onclick 事件
        │
        ▼
3. PlayerControls.svelte 转发 onPlayClick 事件
        │
        ▼
4. PlayerBar.svelte 转发 onPlayClick 事件
        │
        ▼
5. MusicPlayer.svelte 的 togglePlay() 执行
        │   function togglePlay() { musicPlayerStore.toggle(); }
        ▼
6. musicPlayerStore.toggle() 执行
        │   if (isPlaying) audio.pause(); else audio.play();
        ▼
7. audio.play() 成功 → 浏览器触发 "play" 事件
        │
        ▼
8. setupAudioListeners 中的 "play" 回调执行
        │   this.state.isPlaying = true;
        │   this.broadcastState();
        ▼
9. broadcastState() → 通知所有订阅者
        │
   ┌────┴──────────────┐
   ▼                   ▼
10a. MusicPlayer      10b. MusicFabButton
   state.isPlaying       playerState.isPlaying
   = true                = true
   │                     │
   ▼                     ▼
11a. Svelte自动更新    11b. 按钮图标从 ▶ 变成 ⏸
   PlayButton图标          按钮开始脉冲动画
   进度条开始走动
   封面开始旋转
```

**每一步都是单向的**：用户操作 → 事件上抛 → Store 方法 → Audio API → 浏览器事件 → Store 状态变化 → 广播 → 组件自动刷新。没有任何一步是"组件A直接改了组件B的数据"。

---

## 六、如果你是 Vue 开发者，这个 Store 用 Pinia 怎么写

```ts
// stores/musicPlayer.ts —— Vue 3 + Pinia 等价实现
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMusicPlayerStore = defineStore('musicPlayer', () => {
  // ★ state：用 ref 替代
  const audio = ref<HTMLAudioElement | null>(null);
  const currentSong = ref<Song>({ ...DEFAULT_SONG });
  const playlist = ref<Song[]>([]);
  const currentIndex = ref(0);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.7);

  // ★ 初始化：相当于 initialize()
  async function init() {
    audio.value = new Audio();
    setupListeners();
    await loadPlaylist();
  }

  // ★ 监听 Audio 事件
  function setupListeners() {
    audio.value!.addEventListener('play', () => {
      isPlaying.value = true;  // Vue: ref 自动触发响应式更新
    });
    audio.value!.addEventListener('timeupdate', () => {
      currentTime.value = audio.value!.currentTime;
    });
    // ...其他事件同理
  }

  // ★ 操作：直接改 ref
  function toggle() {
    if (isPlaying.value) {
      audio.value!.pause();
    } else {
      audio.value!.play();
    }
  }

  function next() {
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length;
    loadSong(playlist.value[currentIndex.value]);
  }

  return { currentSong, playlist, isPlaying, currentTime, duration,
           volume, init, toggle, next };
});
```

**Vue 组件中用**：
```vue
<script setup>
import { useMusicPlayerStore } from '@/stores/musicPlayer';
import { onMounted, onUnmounted } from 'vue';

const store = useMusicPlayerStore();

onMounted(() => store.init());
onUnmounted(() => store.$dispose());
</script>

<template>
  <!-- 直接读 store 的 ref，不用 subscribe -->
  <PlayButton :playing="store.isPlaying" @click="store.toggle()" />
  <ProgressBar :current="store.currentTime" :total="store.duration" />
</template>
```

Vue 的 Pinia 比 Svelte 的 Store 更简单——`ref` 自带响应式，组件直接用 `store.xxx` 就能自动追踪变化，不需要手动 `subscribe/unsubscribe`。

---

## 七、总结：这个播放器设计的四个核心原则

| 原则 | 说明 |
|------|------|
| **单一数据源** | 所有状态存在 `musicPlayerStore.state` 里，组件不自己存状态 |
| **单向数据流** | 事件向上走（组件→回调→Store方法），数据向下走（Store→broadcastState→组件） |
| **组件不碰 Store（除顶层外）** | PlayerBar/MiniPlayer 及以下所有子组件只收 props 和发事件，完全不知道 Store 存在 |
| **原生 Audio API 在 Store 内部封装** | 所有 `audio.play()`、`audio.pause()` 都在 Store 方法里，组件不直接操作 DOM 的 Audio |

---

> 读完这篇，你应该能回答：①播放器是怎么拿到歌单的 ②点播放按钮后数据是怎么流动的 ③如果要把这个播放器用 Vue 重写，Store 怎么写。
