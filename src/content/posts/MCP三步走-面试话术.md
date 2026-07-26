---
title: "MCP 核心链路面试话术"
published: 2025-07-23
description: "Transport → McpSyncClient → ToolCallback，从架构到代码，讲透 MCP 三步走"
tags: [MCP, 面试, 架构, AI]
category: 面试准备
draft: false
---

# MCP 核心链路面试话术：Transport → McpSyncClient → ToolCallback

> 约 5000 字，面向技术面试。从架构痛点 → 设计原理 → 代码实现 → 生产实践，四个维度讲透 MCP 三步走模式。

---

## 一、开场定调：MCP 解决了什么问题（30 秒，100 字）

**话术**：

"MCP（Model Context Protocol）是一个标准化的工具接入协议。它让 LLM Agent 接入外部工具这件事从'每个工具写一套适配代码'变成'只要支持 MCP 协议，接上去就能用'。类比就是 USB-C——你不用关心设备内部的电路，只要接口匹配，插上就工作。

在我们的项目里，从 Transport 创建到最终注入 Agent，有一个贯穿始终的三步走模式，我来完整讲一下。"

**考察点**：是否一句话说清 MCP 的定位（协议，不是框架），是否有类比能力。

---

## 二、总览：三步走模式是什么（1 分钟，300 字）

**话术**：

"整个链路的入口只有一个模式，我叫它三步走：

**第一步：创建 Transport**——选择你用什么方式连接到 MCP Server。MCP 协议定义了三种标准 Transport：Stdio（子进程通信）、SSE（HTTP 长连接）、Streamable HTTP（标准 REST 短连接）。这一步要回答的问题是：'我的 Agent 和工具 Server 之间，通过什么通道通信？'

**第二步：创建 McpSyncClient 并 initialize**——这是 MCP 协议的握手层。把 Transport 传给 `McpClient.sync(transport).build()` 得到一个 Client 对象，然后调用 `initialize()`。这一步做了两件事：协议版本协商和工具列表发现。握手成功后，Client 内部缓存了 Server 的元信息和所有可用工具的完整 Schema。

**第三步：包装为 ToolCallback[]**——这是 MCP 协议和 Spring AI 框架之间的适配层。`SyncMcpToolCallbackProvider` 遍历 Client 持有的工具列表，把每个 `McpSchema.Tool` 包装为一个 `SyncMcpToolCallback`，最终暴露为 Spring AI 标准的 `ToolCallback[]`，注入 `ChatClient`。

这三步做完，Agent 调用工具的全链路就通了：LLM 输出 tool_call → ChatClient 匹配 ToolCallback → ToolCallback 调用 McpSyncClient → Transport 发送 JSON-RPC → MCP Server 执行 → 原路返回结果。

我用代码来展开每一步。"

**考察点**：是否有全局视角，能否用三层结构讲清复杂链路。

---

## 三、第一步深入：Transport —— 三种通信方式的选型逻辑（1.5 分钟，800 字）

**话术**：

"Transport 是 MCP 架构的第一层抽象，它要解决的问题是：Agent 和工具 Server 可能部署在不同的机器上，可能用不同的通信协议，可能跑在不同的操作系统上。MCP 把所有这些差异抽象成了三种标准 Transport。

**第一种，StdioClientTransport——子进程通信。**

最直接的方式。Agent 通过 `ProcessBuilder` 启动工具 Server 的 JAR 包作为子进程，然后通过子进程的 stdin 发 JSON-RPC 请求，通过 stdout 接收响应。Server 的生命周期和子进程绑定。

代码上就是两步：
```java
ServerParameters params = ServerParameters.builder("java")
    .args("-jar", "mcp-server-stdio.jar").build();
StdioClientTransport transport = new StdioClientTransport(params);
```

Stdio 的特点是：零网络开销，天然安全（进程隔离），但 Server 和 Agent 必须在同一台机器上。适合本地开发和单机部署。

**第二种，HttpClientSseClientTransport——SSE 长连接。**

Server 作为独立的 HTTP 服务部署。Agent 和 Server 之间维持一个 SSE（Server-Sent Events）长连接，Server 可以主动推送事件给 Agent。

```java
HttpClientSseClientTransport transport = HttpClientSseClientTransport
    .builder("http://127.0.0.1:8003")
    .sseEndpoint("/sse")
    .build();
```

SSE 的好处是支持服务端主动推送——比如工具执行进度、日志流。代价是必须维护长连接。网络断开后 Agent 需要感知到并自动重连，否则后续的工具调用全部失败。我们专门写了一个 `RetrySSEMcpService` 来做心跳检测和自动重连——每 5 秒 ping 一次，失败了就 CAS 互斥地启动重连线程，重连成功后必须重建 ChatClient，因为旧的 ToolCallback 持有的 McpSyncClient 引用已经失效了。这是一个很容易踩的坑。

**第三种，HttpClientStreamableHttpTransport——标准 HTTP 短连接。**

我们生产环境实际用的就是这种。它最接近传统 REST API，每次工具调用就是一个独立的 HTTP POST 请求。

```java
HttpClientStreamableHttpTransport transport = HttpClientStreamableHttpTransport
    .builder("https://api.tavily.com/mcp")
    .requestBuilder(r -> r.header("Authorization", "Bearer " + apiKey))
    .build();
```

为什么选它？三个原因：第一，认证友好。我们通过 `requestBuilder` 直接把 API Key 注入到 HTTP Header，网关层可以统一做鉴权。第二，运维简单。没有长连接，不需要负载均衡器维护连接亲和性，Server 重启不影响已经在队列里的请求——它们收到 503 后会重试。第三，和 API 网关天然兼容。限流、鉴权、日志采集这些基础设施全部复用，不需要为 MCP 单独开一条通道。

**选型总结**：选 Transport 的本质是匹配部署场景。Stdio 匹配本地，SSE 匹配需要推送的远程，Streamable HTTP 匹配需要认证和网关的标准云服务。代码逻辑完全一样，换 Transport 只是换一个工厂方法。"

**考察点**：是否亲手用过三种 Transport、是否有选型思考框架、是否踩过生产环境的坑（长连接断开 + 重连机制）。

---

## 四、第二步深入：McpSyncClient.initialize() —— 握手机制（1 分钟，500 字）

**话术**：

"Transport 建好后，下一步就是用 Transport 创建 McpSyncClient 并握手。

```java
McpSyncClient client = McpClient.sync(transport)
    .requestTimeout(Duration.ofSeconds(300))
    .build();
client.initialize();  // ← 握手
```

这里有一个非常重要的设计决策：**initialize() 只在应用启动时调用一次，不在每次请求时调用**。为什么？因为 initialize 内部做了两件事，都有网络开销。

**第一件事：协议版本协商。** Agent 和 Server 交换各自的身份信息和能力声明。Agent 说'我是 dodo-agent v1.0，我支持 tools 能力'，Server 回应'我是 tavily-server v1.0，我支持 tools 能力，以下是我的工具列表'。这一步本质上是一个 HTTP 往返。

**第二件事：工具列表拉取。** Client 内部会自动调用 `tools/list` 获取 Server 暴露的所有工具。每个工具的返回包括它的名称、自然语言描述、参数 JSON Schema——这三个字段是 LLM 决定要不要调、怎么调这个工具的全部依据。

握手成功后，Client 在内存中缓存了 serverInfo 和 toolList。后续 `client.callTool()` 不再需要握手，直接发起 JSON-RPC 调用。

**如果在每次请求时都握手会怎样？** 假设一次 MCP 握手耗时 100ms，那每次用户请求都会额外增加 100ms 的首字响应延迟。而且这是纯浪费——工具的 Schema 不会在两次请求之间发生变化。所以我们把 initialize 放在 `@PostConstruct` 或 `InitializingBean.afterPropertiesSet()` 中，启动时执行一次，缓存结果，请求间复用。

**这个缓存是线程安全的吗？** 是。McpSyncClient 的 `callTool()` 底层用的是 Java 11 的 `HttpClient`，它内部的连接池是线程安全的。ToolCallback 是只读对象，天然线程安全。所以我们可以在高并发下放心地用同一个 client 实例。"

**考察点**：是否理解 initialize 做了什么、为什么只调一次、是否考虑过并发安全性。

---

## 五、第三步深入：ToolCallback[] —— 从 MCP 协议到 Spring AI 框架的适配（1 分钟，500 字）

**话术**：

"握完手后，McpSyncClient 内部已经有了 `List<McpSchema.Tool>`。但这些是 MCP 协议层的对象，Spring AI 不认识。我们需要一个适配层把它们转换成 Spring AI 的 `ToolCallback` 接口。

这就是 `SyncMcpToolCallbackProvider` 做的事情：

```java
List<McpSyncClient> mcpClients = List.of(client);

SyncMcpToolCallbackProvider provider = SyncMcpToolCallbackProvider.builder()
    .mcpClients(mcpClients)
    .toolFilter((conn, tool) -> tool.name().startsWith("goods"))
    .build();

ToolCallback[] callbacks = provider.getToolCallbacks();
```

这个 Provider 做了三件事：

**第一，遍历。** 遍历你给它的所有 McpSyncClient。注意，`mcpClients` 是一个 List，意味着你可以同时连多个 MCP Server——比如 Tavily 搜索、飞书文档、MySQL 查询——一个 Provider 把它们的工具列表合并为一个统一的 ToolCallback[]。

**第二，过滤。** `toolFilter` 是一个可选的 Predicate。比如你的 Agent 只需要搜索工具，可以用 `toolFilter` 把其他工具过滤掉。这在多租户场景下非常有用——不同租户可以看到不同的工具子集，而不需要为每个租户部署一套 Server。

**第三，包装。** 对每个 `McpSchema.Tool`，创建一个 `SyncMcpToolCallback`。这个 Callback 实现了 Spring AI 的 `ToolCallback` 接口，核心方法就是 `call(argsJson)`。内部做的事很简单：把 argsJson 转成 `McpSchema.CallToolRequest`，调 `McpSyncClient.callTool(request)`，返回结果。

然后把 ToolCallback[] 注入 ChatClient：

```java
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(callbacks)
    .build();
```

之后每次 LLM 请求，Spring AI 会自动把这些 Callback 的 Schema 作为 available tools 参数发送给 LLM。LLM 返回 tool_call 时，框架根据 name 匹配到对应的 Callback，调用 `call()` 方法，整个链路就跑通了。

**为什么这一层叫适配层？** 因为它的职责就是解耦——MCP Server 不关心 Agent 用的是什么框架（Spring AI、LangChain、LlamaIndex），Agent 框架也不关心工具 Server 是什么语言实现的。Connector 负责在两者之间做翻译。这是经典的设计模式——适配器模式。"

**考察点**：是否理解 CallbackProvider 的设计意图、是否能讲出多 Server 合并和过滤的能力。

---

## 六、全链路串联：从 LLM 的 tool_call 到工具执行结果返回（1 分钟，600 字）

**话术**：

"三步走完后，Agent 的工具调用链路就完整了。我来串一下一次实际调用的全流程。

用户问'今天北京天气怎么样'，我们来看看数据是怎么流的：

**第 1 步：LLM 分析 + tool_call 生成。** ChatClient 把用户问题 + 聊天历史 + 所有可用工具的 Schema 发给 LLM。LLM 看到有一个 `getWeather` 工具，参数是 `city`，描述是'根据城市名称查询天气'，于是它判断：这个问题需要调用这个工具。LLM 返回一个 tool_call：`{name: "getWeather", arguments: {city: "北京"}}`。

**第 2 步：ChatClient 匹配 ToolCallback。** ChatClient 收到 tool_call，通过 name `getWeather` 在 ToolCallback[] 中找到对应的 `SyncMcpToolCallback`——这一步是纯内存操作，毫秒级。

**第 3 步：ToolCallback.call(argsJson)。** `SyncMcpToolCallback` 内部用 argsJson 构造出 `McpSchema.CallToolRequest`，调用 `McpSyncClient.callTool(request)`。

**第 4 步：McpSyncClient 走 Transport。** Client 把 CallToolRequest 序列化为 JSON-RPC 2.0 格式，通过 Transport 发送 HTTP POST 到 MCP Server 的端点。如果是 Streamable HTTP，这就是一个标准 POST 请求；如果是 SSE，这是一个独立的 HTTP 请求（不经过 SSE 长连接）。

**第 5 步：MCP Server 反射执行。** Server 收到 JSON-RPC 请求，解析出 method 是 `tools/call`，name 是 `getWeather`。通过反射找到 `WeatherService.getWeather("北京")` 方法，执行，拿到返回值 `"北京: 晴, 25°C"`，包装为 `McpSchema.CallToolResult`，序列化为 JSON-RPC 响应，原路返回。

**第 6 步：结果回到 Agent。** ToolCallback 把 CallToolResult 的内容提取出来，包装为 `ToolResponseMessage`，追加到 LLM 的 messages 列表。ChatClient 把这个结果送回 LLM。

**第 7 步：LLM 生成最终回答。** LLM 现在有了工具执行的结果，基于它生成自然语言回答：'根据最新数据，今天北京天气晴朗，气温 25°C，适合出行。'

这 7 步中，前两步和最后两步是 Spring AI 框架层，中间三步是 MCP 协议层。框架层和协议层之间的边界就是 ToolCallback——它既是 Spring AI 的 ToolCallback 实现，又持有一个 MCP Client 引用。这就是适配器模式在真实项目中的体现。"

**考察点**：是否能从单个请求的视角讲清全链路、是否理解每层的职责边界。

---

## 七、生产实践：初始化时机 + 超时 + 健壮性（1 分钟，500 字）

**话术**：

"三步走模式说完了，我再补充三个生产环境的实践细节。

**第一个，初始化时机的选择。** 我们在 `AgentController` 的 `afterPropertiesSet()` 中执行整个三步走流程，把得到的 `ToolCallback[]` 缓存到成员变量。每次 HTTP 请求进来，创建一个新的 Agent 实例，注入同一个 `ToolCallback[]`。这意味着 MCP 握手只在应用启动时执行一次，所有请求共享。ToolCallback[] 是只读的，线程安全，McpSyncClient 下的 HTTP 连接池也是线程安全的。但如果你的 MCP Server 支持热更新工具列表，这种缓存策略就不适用了——你需要定期刷新 ToolCallback[]。

**第二个，超时配置。** 不同工具的执行时间差异很大。天气查询可能 50ms 返回，搜索引擎可能要 5 秒，大数据分析可能要几分钟。我们在创建 McpSyncClient 时用 `requestTimeout` 设置硬超时：`Duration.ofSeconds(300)`。这是 5 分钟，足够覆盖搜索引擎的极端情况。但要注意——这个超时是整个工具调用的超时，不是单次 HTTP 的超时。如果 MCP Server 内部有重试逻辑，需要把重试的时间也考虑进去。

**第三个，SSE 长连接的健壮性。** Streamable HTTP 不需要特别处理，因为每次调用是独立的短连接。但 SSE 不同——它是一个长连接，断开后必须重连。我们的 `RetrySSEMcpService` 做到了三点：心跳检测（5 秒一次 ping）、原子重连（AtomicBoolean CAS 保证只有一个线程重连）、全链路刷新（不只重建 McpSyncClient，还要重建 ToolCallback 和 ChatClient）。第三点很容易漏——你重建了底层 Client，但上层 Agent 持有的 ChatClient 还在用旧的 ToolCallback，而旧的 ToolCallback 内部引用的是已经断了连接的 Client。所以重连后必须全链路刷新，一个都不能漏。"

**考察点**：是否考虑过生产环境的具体问题（启动时初始化、超时配置、长连接断开）。

---

## 八、总结收尾：三步走模式的本质（30 秒，200 字）

**话术**：

"总结一下，Transport → McpSyncClient(+initialize) → ToolCallback[] 这个三步走模式，本质上是用三个抽象层解耦了一个复杂问题：

- **Transport 层**：解耦通信方式。换部署环境只需换一个 Transport 工厂方法。
- **McpSyncClient 层**：解耦协议细节。只需调用 `callTool()`，不关心 JSON-RPC 怎么编解码。
- **ToolCallback 层**：解耦 Agent 框架。Spring AI 不需要知道工具是 MCP 接的还是本地 `@Tool` 注解的。

这三层合在一起，让 Agent 的工具接入从'每个工具写一套代码'变成'支持 MCP 协议即插即用'。这就是 MCP 的核心价值。"

---

## 九、面试追问预案

| 追问 | 回答要点 |
|------|------|
| **MCP 和 Function Calling 的关系？** | MCP 负责工具发现和调用（协议层），Function Calling 负责 LLM 决策（能力层）。MCP 把工具 Schema 送到 LLM 面前，Function Calling 让 LLM 决定要不要用、怎么用 |
| **initialize 握手具体交换了什么？** | Client 发 `protocolVersion` + `clientInfo` + `capabilities`；Server 返回 `serverInfo` + `capabilities`。握手成功后 Client 内部自动调 `tools/list` 获取完整工具 Schema |
| **性能开销多大？** | 握手：1 次 HTTP 往返 + 1 次 tools/list，毫秒级，只在启动时执行。调用：每次 tool_call 多一层 JSON-RPC 包装，开销可忽略。瓶颈在工具执行本身 |
| **为什么不用 gRPC？** | gRPC 需要共享 `.proto` 文件做代码生成。MCP 在握手时动态发现工具 Schema，松耦合，且 JSON 对人类可调试 |
| **多个 MCP Server 怎么合并工具？** | `SyncMcpToolCallbackProvider` 的 `mcpClients` 是 List，遍历所有 Client 的 toolList，合并为一个 ToolCallback[]，LLM 看到的是一份统一列表 |
| **工具 Schema 变更了怎么办？** | 缓存策略下需要重启应用或实现定时刷新。如果对可用性要求高，可以实现类似 `RetrySSEMcpService` 的定期重建机制 |

---

> **最后更新：** 2026-07-23
