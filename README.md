# 二刺螈 ErCiYuan · Next.js / Vercel 版

原项目是 Spring Cloud 微服务 + Nuxt 2 + Vue 2 后台的二次元视频站，无法直接部署到 Vercel。
本仓库把它重写成**一个可部署到 Vercel 的 Next.js 15 全栈应用**：页面、API、鉴权、数据库访问全在同一进程内，
番剧元数据、封面、预告片与观看链接对接 **AniList / Bangumi 公开接口**，播放链路使用**可商用的开源测试流**。

原有的 Java 后端、Nuxt 前台、Vue 后台代码保留在 `er_ci_yuan/`、`er_ci_yuan_site/`、`er_ci_yuan_front/` 目录，仅作参考，不参与新应用构建。

> 在线演示：<https://erciyuan-seven.vercel.app>（未绑定 Turso，运行在内存库上：冷启动会重建种子数据，新写入不持久；登录见下方演示账号）

## 快速开始

```bash
npm install
npm run dev          # http://localhost:3000，首次启动自动建表并写入种子数据
```

本地默认使用 `data/erciyuan.db`（LibSQL 文件库，已在 .gitignore 中）。删除该文件即可重置数据。

### 演示账号

| 角色 | 手机号 | 密码 | 说明 |
| --- | --- | --- | --- |
| 管理员 | `13800000000` | `admin123` | 登录后进入 `/admin` |
| 普通用户 | `13900000000` | `demo123` | 已购买《你的名字。》，收藏了 2 部番 |

注册流程需要短信验证码：开发环境或 `DEMO_SMS=1` 时接口直接返回验证码，也可使用万能码 `123456`。

## 技术栈对照

| 能力 | 原实现 | 现在 |
| --- | --- | --- |
| 运行时 | Spring Cloud 微服务 + Nacos + Sentinel + Gateway | Next.js 15 App Router（Server Components + Route Handlers），单应用 |
| 前台 | Nuxt 2 + element-ui + DPlayer | React 19 + 原站 CSS（`public/assets`）+ hls.js 播放器 |
| 后台 | Vue 2 + vue-element-admin | Next.js + Tailwind（关闭 preflight，避免污染原站样式） |
| 数据库 | MySQL 5.7 + MyBatis Plus | LibSQL / Turso + Drizzle ORM，启动时自动建表与种子 |
| 缓存 | Redis | AniList 查询走 Next 数据缓存（`revalidate`），会话为无状态 JWT |
| 鉴权 | Spring Security + JWT + Redis refresh | `jose` 签发 HS256 JWT，httpOnly Cookie，服务端 `requireUser` / `requireAdmin` |
| 视频 | 阿里云 VOD 转码播放地址 | 开源可商用测试流（HLS/MP4），播放地址存在 `videos.sourceUrl`，可换成任意 CDN |
| 图片 | 阿里云 OSS | 直接引用 AniList CDN 图，或后台填入任意 URL |
| 短信 | 阿里云 SMS | 演示通道（本地/`DEMO_SMS=1` 直接返回验证码），可替换为任意服务商 |
| 支付 | 微信 Native 支付 | 本地订单状态流转的演示支付（真实商户号/回调未接入） |
| 弹幕 | DPlayer-node | 评论/回复列表（无实时弹幕） |

## 外部资源对接

* **AniList GraphQL**（`lib/anilist.ts`）：首页「本季新番」实时榜单、后台搜索与导入。取回标题、封面、横幅、集数、评分、标签、制作公司、YouTube 预告片、`externalLinks` 里的官方观看渠道（Crunchyroll / Bilibili / Netflix 等），详情页直接展示为「官方资源」。请求带超时与重试，失败时降级为本地数据。
* **Bangumi**（`lib/bangumi.ts`）：导入时用罗马音/日文标题检索条目，补中文名与中文简介。种子数据里的 16 部番（葬送的芙莉莲、进击的巨人、咒术回战、你的名字。、空之境界…）的中文标题与简介均来自这两个接口。
* **演示视频源**（`lib/demo-streams.ts`）：Mux 公开 HLS、Unified Streaming《Tears of Steel》HLS、W3C《Sintel》MP4、Big Buck Bunny MP4。仅用于验证播放链路，**不含任何正版番剧内容**。

## 目录结构

```
app/
  (site)/        首页、/anime 列表与详情、/player、/maker、/ucenter、/order
  (auth)/        /login、/register（沿用原站 sign.css 视觉）
  admin/         后台：概览、AniList 导入、各资源 CRUD
  api/           REST 接口（auth / favorites / comments / orders / views / anilist / admin）
components/      site 与 admin 组件
lib/             db(schema/ddl/seed)、queries、auth、anilist、bangumi、admin-resources
public/assets/   原站 CSS / 图片 / 字体（保持原有视觉）
```

后台的增删改查由 `lib/admin-resources.ts` 的资源表驱动（anime / chapters / videos / categories / makers / ads / comments / orders / users），
统一走 `/api/admin/[resource]`，字段用 zod 校验、按列白名单写入，删除动漫会级联清理章节、剧集、评论、收藏与订单。

## 部署到 Vercel

1. Fork / 推送本仓库，在 Vercel 导入（框架会被识别为 Next.js，无需额外配置）。
2. 绑定一个 Turso（或任意 LibSQL）实例，否则每次实例冷启动都会用内存库重建种子数据，用户写入不持久：
   * `DATABASE_URL=libsql://xxx.turso.io`
   * `DATABASE_AUTH_TOKEN=...`
   首次连接会自动执行建表 DDL 并写入种子数据，不需要跑迁移。
3. 设置 `AUTH_SECRET`（随机长字符串）。生产环境未设置时 JWT 会退回内置占位密钥，务必改掉。
4. 可选 `DEMO_SMS=1` 保留演示验证码；不设置则注册接口只报「已发送」，需要自行接入短信通道。
5. 可选 `BANGUMI_API_BASE` 指向可访问的镜像；大陆网络直连 `api.bgm.tv` 受阻时，导入会退回 AniList 的英文标题与简介。

## 本地网络说明

AniList 与 Bangumi 在部分网络环境不可直连。若接口状态面板（后台首页）显示不可用，请为本机配置代理后再访问，
或把 `BANGUMI_API_BASE` 指向可用网关。首页、列表、播放与后台功能均不依赖外部接口，只有「本季新番」和「导入」需要联网。

## 合规提醒

本项目仅作为技术迁移演示：元数据来自公开 API，播放内容为开源可商用测试片段。请勿在未获授权的情况下接入真实番剧资源。
