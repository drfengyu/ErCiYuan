# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.1.1] - 2026-10-30

### 修复

- 线上「下单成功但订单页 404」：定位到 Vercel 上每个路由是独立函数实例，`DATABASE_URL` 缺失时各函数各持一份内存库，
  `/api/orders` 写入的订单在 `/order/[id]` 里读不到（实测同一订单 id：列表接口稳定返回 2 条，订单页 8/8 次 404）。
  本版无法用代码绕过（属于运行时隔离），改为显式暴露：站点顶部在内存库模式下常驻提示，README 补「不配数据库会怎样」说明。
- 安全：部署在 Vercel 生产环境却未配 `AUTH_SECRET` 时直接启动失败，不再退回写在公开源码里的占位密钥（否则任何人可伪造管理员 token）。

### 新增

- 内存库模式下的站点提示条（`app/(site)/layout.tsx`），与后台概览页的告警一致。

## [2.1.0] - 2026-10-30

### 新增

- `middleware.ts`：`/ucenter`、`/order`、`/admin` 前置鉴权，未登录直接 307 到 `/login?next=原始路径（含查询串）`，普通用户访问 `/admin` 由中间件挡在站点首页。
- `app/not-found.tsx`：带站点头尾与 `404.jpg` 的品牌化 404 页，替代 Next 默认空白 404。
- `app/(site)/loading.tsx`、`app/admin/loading.tsx`：路由级骨架屏（原站 `loading.gif` / Tailwind 占位块）。
- SEO：根布局 `metadataBase` + 标题模板；番剧详情、制作方详情提供 `generateMetadata`（标题、描述、OG 封面图），列表/登录/注册/播放页补静态标题。
- `.env.example` 增加 `NEXT_PUBLIC_SITE_URL`；README 补自定义域名（`erciYuan.fuwari.fun`）与 Cloudflare 记录要求。

### 修复

- **详情页与播放页 React hydration 报错 #418**：`lib/format.ts` 的 `formatDate` 原先跟随服务器时区，Vercel 运行时为 UTC、浏览器为 +08，评论时间文本两端不一致。现固定 `Asia/Shanghai` 输出，两端文本一致（已在 UTC 进程下验证：旧实现 `10:12`，新实现 `18:12`）。
- 受保护页面因骨架屏改为流式响应、返回 200 而非 307 的问题：由中间件在渲染前重定向解决，爬虫与无 JS 场景不再拿到空壳页面。
- `/order/new` 未登录时丢失下单上下文：`next` 参数改为携带 `animeId`，登录后回到原流程。
- 首页「本季新番」在 AniList 不可达时只显示一行错误文案：改为整段隐藏，不留空板块。

### 变更

- 会话逻辑拆出 `lib/session.ts`（jose 签名/校验、Cookie 名与属性），供 Edge 中间件复用；`lib/auth.ts` 保留依赖数据库的 `getCurrentUser` / `requireUser` / `requireAdmin` 并继续 re-export，调用方无需改动。

## [2.0.0] - 2026-10-29

### 新增

- 迁移到 Next.js 15 App Router + React 19 + TypeScript 单应用，可直接部署到 Vercel；页面、Route Handler API、鉴权、数据库访问同进程。
- 数据层：Drizzle ORM + LibSQL（本地文件库 / Turso / Vercel 无配置时内存库），启动自动执行 DDL 并写入种子数据，无需迁移工具。
- 真实资源对接：AniList GraphQL（首页当季榜、后台搜索与导入、封面/横幅/评分/集数/制作公司/YouTube 预告片/官方观看渠道）、Bangumi（中文名与中文简介）；外部请求带超时与重试，失败自动降级。
- 种子内容：16 部真实番剧、10 家制作公司、10 个分类、169 段可商用开源测试视频（Mux / Unified Streaming / W3C Sintel / Big Buck Bunny）、演示评论与订单。
- 前台：首页（轮播 + 推荐 + 当季榜 + 排行 + 制作方）、番剧列表（分类/排序/分页/搜索）、详情（收藏、购买、目录、评论、官方链接、预告片）、播放器（hls.js 按需加载）、制作方列表与详情、登录/注册、用户中心（资料/收藏/订单）、下单与模拟支付。
- 后台：数据概览（含外部接口可用性探测）、AniList 导入、动漫/章节/剧集/分类/制作方/轮播/评论/订单/用户的表驱动增删改查，zod 校验 + 列白名单写入，删除动漫级联清理关联数据。
- 视觉沿用原站 CSS 资源（`public/assets`，11MB 原样迁移），Tailwind 关闭 preflight 以免污染原站样式。

### 变更

- 原 Spring Cloud 后端、Nuxt 2 前台、Vue 2 后台保留在 `er_ci_yuan/`、`er_ci_yuan_site/`、`er_ci_yuan_front/`，不参与构建；`.vercelignore` 已排除，避免上传无关源码。
- 微信 Native 支付改为本地订单状态流转的演示支付；阿里云 SMS 改为演示验证码通道。
