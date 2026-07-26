---
title: "Mizuki 文章加密原理详解"
published: 2025-07-26
description: "从构建时 AES-256-GCM 加密到浏览器端 Web Crypto API 解密，逐行拆解 Mizuki 博客的密码保护机制"
tags: [Mizuki, 加密, AES, Web Crypto API, 原理]
category: 技术文章
author: Yuzumoon82
draft: false
---

# Mizuki 文章加密原理详解

> 从构建时到运行时，逐层拆解 Mizuki 博客的文章密码保护机制。

## 整体架构

```
┌──────────────────────────────────────────────────────────┐
│                     构建时 (Node.js)                      │
│                                                          │
│   Markdown  ──►  Astro 渲染  ──►  HTML 字符串             │
│                                       │                  │
│                                       ▼                  │
│                              encryptContent()            │
│                              AES-256-GCM 加密             │
│                                       │                  │
│                                       ▼                  │
│                               base64 密文嵌入页面          │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    运行时 (浏览器)                         │
│                                                          │
│   用户输入密码 ──►  Web Crypto API (PBKDF2 + AES-GCM)     │
│                              │                           │
│                              ▼                           │
│                    验证前缀 "MIZUKI-VERIFY:"              │
│                        │          │                      │
│                    正确 ✅     错误 ❌                     │
│                        │          │                      │
│                        ▼          ▼                      │
│                  注入 HTML    提示重试                     │
└──────────────────────────────────────────────────────────┘
```

---

## 一、文章配置

在 Markdown frontmatter 中只需三行：

```yaml
encrypted: true
password: "你的密码"
passwordHint: "密码提示（可选）"
```

`encrypted: true` + `password` 非空 → 自动启用加密。

---

## 二、构建时加密（Node.js 端）

核心代码在 `src/utils/crypto-utils.ts`：

```typescript
export function encryptContent(html: string, password: string, slug: string): string {
  // 1. 验证前缀：解密后用于快速校验密码正确性
  const plaintext = "MIZUKI-VERIFY:" + html;

  // 2. 用 HMAC-SHA256 从密码派生 salt 和 IV（确定性，同一密码+slug 永远得到相同值）
  const salt = deriveBytes(password, `salt:${slug}`, 16);
  const iv   = deriveBytes(password, `iv:${slug}`,   12);

  // 3. PBKDF2 迭代 10 万次派生 AES 密钥
  const key = pbkdf2Sync(password, salt, 100000, 32, "sha256");

  // 4. AES-256-GCM 加密
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 5. 拼接 salt + iv + authTag + ciphertext，base64 编码
  return Buffer.concat([salt, iv, authTag, encrypted]).toString("base64");
}
```

### 关键设计点

| 设计 | 说明 |
|:-----|:-----|
| **确定性派生** | salt 和 IV 由 HMAC(password, slug) 派生，不随机。好处：同一篇文章多次构建结果相同，方便缓存 |
| **PBKDF2 10万次** | 暴力破解成本极高 |
| **AES-256-GCM** | 认证加密，同时保证机密性和完整性 |
| **验证前缀** | 解密后的前 14 字节是 `MIZUKI-VERIFY:`，客户端可快速判断密码对错，无需等完整解密失败 |

### 输出格式

```
base64( salt[16字节] + iv[12字节] + authTag[16字节] + ciphertext )
```

---

## 三、运行时解密（浏览器端）

核心代码在 `src/components/features/auth/PasswordProtection.astro` 的内联 `<script>` 中。

### 3.1 解密函数

```javascript
async function decryptContent(encData, password) {
  // 1. base64 解码
  const raw = Uint8Array.from(atob(encData), c => c.charCodeAt(0));

  // 2. 拆分各段
  const salt = raw.slice(0, 16);      // 前 16 字节
  const iv = raw.slice(16, 28);       // 接下来 12 字节
  const authTag = raw.slice(28, 44);  // 接下来 16 字节
  const ciphertext = raw.slice(44);   // 剩余即密文

  // 3. PBKDF2 派生密钥（与服务端完全相同的参数）
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // 4. AES-GCM 解密
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: new Uint8Array(0), tagLength: 128 },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintext);
}
```

### 3.2 密码验证流程

```javascript
async function attemptUnlock(inputPassword) {
  const realContent = await decryptContent(encryptedContent, inputPassword);

  // 验证前缀：解密后的内容必须以 "MIZUKI-VERIFY:" 开头
  if (!realContent.startsWith("MIZUKI-VERIFY:")) {
    // 密码错误 → 显示错误提示
    return;
  }

  // 密码正确 → 去除前缀，注入真实 HTML
  const html = realContent.slice("MIZUKI-VERIFY:".length);
  document.getElementById("article-content").innerHTML = html;

  // 缓存到 sessionStorage，刷新页面无需重新输入
  sessionStorage.setItem("page-password-" + window.location.pathname, inputPassword);
}
```

### 3.3 页面加载时的自动恢复

```javascript
window.addEventListener("load", async () => {
  const cachedPassword = sessionStorage.getItem("page-password-" + window.location.pathname);
  if (cachedPassword) {
    await attemptUnlock(cachedPassword); // 有缓存 → 自动解密
  }
});
```

---

## 四、安全分析

| 方面 | 评价 |
|:-----|:-----|
| **算法强度** | ✅ AES-256-GCM + PBKDF2 10万次，业界标准 |
| **密码传输** | ✅ 密码仅在前端使用，不发送到服务器 |
| **密钥派生** | ✅ 确定性 salt 避免了随机性问题，但同一密码+slug 的密文相同 |
| **暴力破解** | ⚠️ 密文在 HTML 中明文传输，可被离线暴力破解。PBKDF2 10万次能有效拖慢破解速度，但密码太短仍不安全 |
| **XSS** | ⚠️ 解密后直接 `innerHTML`，若原文含恶意脚本会有 XSS 风险（但文章是作者自己写的，风险可控） |

---

## 五、总结

Mizuki 的加密方案是一个轻量级的静态博客密码保护实现：

1. **无需后端**：加解密全在浏览器完成
2. **安全适中**：AES-256-GCM 算法可靠，适合个人博客的敏感内容保护
3. **用户体验好**：密码正确后缓存到 sessionStorage，刷新不重复输入
4. **非高安全场景适用**：不适合银行级安全，但保护博客中的私密文章绰绰有余

---

> 💡 这篇加密机制的分析文章本身没有加密，你可以随时查阅。只有那篇 MCP 面试话术设置了密码保护。
