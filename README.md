# 二刺螈 ErCiYuan · Next.js / Vercel 版

原项目是 Spring Cloud 微服务 + Nuxt 2 + Vue 2 后台的二次元视频站，无法直接部署到 Vercel。
本仓库把它重写成**一个可部署到 Vercel 的 Next.js 15 全栈应用**：页面、API、鉴权、数据库访问全在同一进程内，
番剧元数据、封面、预告片与观看链接对接 **AniList / Bangumi 公开接口**，播放链路挂载**各作品自己的官方预告与已授权正版源**。

原有的 Java 后端、Nuxt 前台、Vue 后台代码保留在 `er_ci_yuan/`、`er_ci_yuan_site/`、`er_ci_yuan_front/` 目录，仅作参考，不参与新应用构建。

> 在线演示：<https://erciYuan.fuwari.fun>（备用域名 <https://erciyuan-seven.vercel.app>）
> 未绑定 Turso，运行在内存库上：冷启动会重建种子数据，新写入不持久；登录见下方演示账号。

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
| 视频 | 阿里云 VOD 转码播放地址 | 资源位存 `videos.sourceUrl`，支持 B 站 / YouTube / Dailymotion 官方嵌入与 mp4 / HLS 直链；种子只挂各作品官方预告 |
| 图片 | 阿里云 OSS | 直接引用 AniList CDN 图，或后台填入任意 URL |
| 短信 | 阿里云 SMS | 演示通道（本地/`DEMO_SMS=1` 直接返回验证码），可替换为任意服务商 |
| 支付 | 微信 Native 支付 | 本地订单状态流转的演示支付（真实商户号/回调未接入） |
| 弹幕 | DPlayer-node | 评论/回复列表（无实时弹幕） |

## 外部资源对接

* **AniList GraphQL**（`lib/anilist.ts`）：首页「本季新番」实时榜单、后台搜索与导入。取回标题、封面、横幅、集数、评分、标签、制作公司、YouTube 预告片、`externalLinks` 里的官方观看渠道（Crunchyroll / Bilibili / Netflix 等），详情页直接展示为「官方资源」。请求带超时与重试，失败时降级为本地数据。
* **Bangumi**（`lib/bangumi.ts`）：导入时用罗马音/日文标题检索条目，补中文名与中文简介。种子数据里的 16 部番（葬送的芙莉莲、进击的巨人、咒术回战、你的名字。、空之境界…）的中文标题与简介均来自这两个接口。
* **B 站公开接口**（`lib/bili.ts`）：后台「B 站分集导入」粘贴番剧链接（`ep…` / `ss…` / `md…`）即可取回真实分集——ep_id、集序、`long_title` 集名、时长、官方页 URL，免登录免 cookie。只取元数据与官方页地址：不调 `playurl` 取流、不存储也不代理视频地址。
* **播放器资源位**（`lib/media.ts`）：`videos.sourceUrl` 支持四类地址——B 站视频/番剧页（自动转 `player.bilibili.com` 官方嵌入）、YouTube 分享或嵌入地址（转 `youtube-nocookie`）、Dailymotion、以及 mp4 / HLS 直链（HLS 按需加载 `hls.js`）。种子数据里每部番只挂**它自己的官方预告 / PV**（取自 AniList `trailer`）。B 站番剧的外链播放器实测只放试看片段，整集由播放页「在官方站看完整版」跳回你自己的账号。本站不内置、也不代找未授权的全集片源。
* **观看进度**（`watchProgress` 表 + `/api/progress`）：每部番记住最后看到的一集与秒数，详情页给出「继续观看」。直链源每 15 秒自动上报并续播；嵌入源因跨域读不到播放位置，提供 `mm:ss` 手记。

## 目录结构

```
app/
  (site)/        首页、/anime 列表与详情、/player、/maker、/ucenter、/order
  (auth)/        /login、/register（沿用原站 sign.css 视觉）
  admin/         后台：概览、AniList 导入、B 站分集导入、各资源 CRUD
  api/           REST 接口（auth / favorites / comments / orders / views / progress / anilist / bili / admin）
  sitemap.ts     /sitemap.xml（公开条目 + lastModified，每小时重新验证）
  robots.ts      /robots.txt（屏蔽 /admin /ucenter /order /api）
components/      site 与 admin 组件
lib/             db(schema/ddl/seed)、queries、auth、anilist、bangumi、bili、admin-resources、media、site、genres
public/assets/   原站 CSS / 图片 / 字体（保持原有视觉）+ responsive.css（窄屏覆盖）
docs/API.md      全部 REST 接口的参数、响应示例与错误码
```

`/anime` 列表页支持关键词（译名 / 日文名 / 英文原名）、分类、类型、年份筛选与四种排序，筛选候选值取自库里真实存在的条目。

界面在 ≤1200 / ≤768 / ≤480 三档做响应式覆盖（`public/assets/css/responsive.css`）：栅格容器自适应、头部纵向堆叠、卡片 4→2→1 列、
详情与播放页两栏转单栏、播放器保持 16:9。390px 视口下全部公开页面无横向溢出，桌面端布局不变。

接口清单见 [docs/API.md](./docs/API.md)。

后台的增删改查由 `lib/admin-resources.ts` 的资源表驱动（anime / chapters / videos / categories / makers / ads / comments / orders / users），
统一走 `/api/admin/[resource]`，字段用 zod 校验、按列白名单写入，删除动漫会级联清理章节、剧集、评论、收藏与订单。

## 部署到 Vercel

> **不配数据库会怎样**：Vercel 上每个路由是独立的函数实例，`DATABASE_URL` 缺失时各自持有一份内存库，
> 因此「在 `/api/xxx` 写入、在另一个页面读取」会看不到对方的数据，实例回收后数据也会消失。
> 站点顶部会显示演示模式提示。要正常收藏/评论/下单，请绑定 Turso（免费额度即可），无需迁移。

1. Fork / 推送本仓库，在 Vercel 导入（框架会被识别为 Next.js，无需额外配置）。
2. 绑定一个 Turso（或任意 LibSQL）实例，否则每次实例冷启动都会用内存库重建种子数据，用户写入不持久：
   * `DATABASE_URL=libsql://xxx.turso.io`
   * `DATABASE_AUTH_TOKEN=...`
   首次连接会自动执行建表 DDL 并写入种子数据，不需要跑迁移。
3. 设置 `AUTH_SECRET`（随机长字符串）。生产环境未设置时 JWT 会退回内置占位密钥，务必改掉。
4. 可选 `DEMO_SMS=1` 保留演示验证码；不设置则注册接口只报「已发送」，需要自行接入短信通道。
5. 可选 `BANGUMI_API_BASE` 指向可访问的镜像；大陆网络直连 `api.bgm.tv` 受阻时，导入会退回 AniList 的英文标题与简介。
6. 自定义域名（已配置）：`vercel domains add erciYuan.fuwari.fun` 后，在 DNS 加
   `A 记录 erciyuan → 76.76.21.21`（Cloudflare 需设为「仅 DNS」，橙云会导致验证失败），
   并设置环境变量 `NEXT_PUBLIC_SITE_URL=https://erciYuan.fuwari.fun` 让分享卡片与 sitemap 用正式域名。

## 本地网络说明

AniList 与 Bangumi 在部分网络环境不可直连。若接口状态面板（后台首页）显示不可用，请为本机配置代理后再访问，
或把 `BANGUMI_API_BASE` 指向可用网关。首页、列表、播放与后台功能均不依赖外部接口，只有「本季新番」和「导入」需要联网。

## 合规提醒

本项目仅作为技术迁移演示：元数据来自公开 API，播放内容只挂各作品自己公开的官方预告，或管理员自行填入的已授权正版源。
未授权的全集片源不在本项目范围内——「资源来自互联网，侵删」这类声明并不构成免责，本站不采用。

## 版本

当前版本见 `package.json`，每个版本的改动记录在 [CHANGELOG.md](./CHANGELOG.md)。
