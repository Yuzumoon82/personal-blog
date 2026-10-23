---
title: "VJudge 使用指南:配置洛谷 / Codeforces / 牛客账号"
published: 2026-10-23
description: "在 VJudge 上绑定洛谷、Codeforces、牛客账号的设置方法,以及 1 Unrated 等常见问题的处理。"
tags: [VJudge, 洛谷, Codeforces, 牛客, ACM, 教程]
category: 教程
draft: false
---

# VJudge 使用指南

## 设置洛谷账号

![](/images/posts/vjudge/01.png)

![](/images/posts/vjudge/03.png)

要填入这两个 key 的 value

![](/images/posts/vjudge/04.png)

创建一个洛谷账号后登陆

在网页里面右键检查

![](/images/posts/vjudge/05.png)

然后找到 Application,再找到 Cookies,里面就有两个 key 的值

![](/images/posts/vjudge/06.png)

## 设置 Codeforces 账号

![](/images/posts/vjudge/07.png)

设置 codeforces 账号方法:

填入一个名字叫 JSESSIONID 的 COOKIE

![](/images/posts/vjudge/08.png)

进入 codeforces 个人主页

[https://codeforces.com/](https://codeforces.com/)

右键点检查

![](/images/posts/vjudge/09.png)

接下来三步

到 COOKIE 里面复制粘贴 JSESSIONID 即可

![](/images/posts/vjudge/10.png)

细节

![](/images/posts/vjudge/11.png)

![](/images/posts/vjudge/12.png)

## 牛客(与洛谷同理)

无非就是进入个人主页

找到浏览器检查

拿到指定名称的 cookie

这边以牛客举例

- Type:类型
- Domain:域
- Name:名称

![](/images/posts/vjudge/13.png)

进入牛客主页

![](/images/posts/vjudge/14.png)

复制粘贴即可

## 出现其他情况:1 Unrated

去原地方交题就行

![](/images/posts/vjudge/15.png)

去对应平台交

![](/images/posts/vjudge/16.png)

根本原因是:只有在 codeforces 上参加了比赛,才能远程交题

我可以共享我的账号,完全没有问题

即可以登陆我的账号,拿我的 token 去交题

![](/images/posts/vjudge/17.png)
