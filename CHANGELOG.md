# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.4.0] - 2026-11-02

### 新增

- **B 站分集导入**（`lib/bili.ts`、`app/api/bili/import/route.ts`、后台「B 站分集导入」页 `/admin/bili`）：
  粘贴 `…/bangumi/play/ep…`、`ss…`、`md…` 任一形式，调 B 站公开接口 `pgc/view/web/season`（实测免登录、免 cookie）
  取回真实分集：ep_id、集序、`long_title` 集名、时长（上游是毫秒，已换算）、官方页 URL。先预览再导入，
  主键用全局唯一的 `ep{epId}`，重复导入自动跳过。同时把番剧官方页追加进详情页外链。
  **只取元数据与官方页地址**：不调 `playurl` 取流、不存储也不代理任何视频地址。
- 播放器支持 B 站番剧官方外链嵌入：`resolveMedia()` 把 `/bangumi/play/epNNN` 归一为
  `player.bilibili.com/player.html?is_bangumi=1&ep=NNN`；实测该外链播放器对番剧只给试看片段（约 17 秒），
  因此播放页新增「在官方站看完整版」按钮（由 `officialPage()` 反推官方页），整集在用户自己的账号里观看。
- **观看进度**：新增 `watchProgress` 表（`(userId, animeId)` 唯一，只留最后看到的一集与秒数）、`/api/progress`（GET 列表 / POST 上报）、
  `components/site/ProgressControl.tsx`。mp4/HLS 直链源每 15 秒 `sendBeacon` 自动上报并在下次打开自动 seek；
  跨域嵌入源读不到播放位置，改为 `mm:ss` 手记。详情页出现「继续观看 {集名} · {mm:ss}」。

### 变更

- 后台导航新增「B 站分集导入」；`docs/API.md` 补 3.6 与 4.5 两节（接口数 24 → 28）。

## [2.3.0] - 2026-10-30

### 变更

- **播放资源换成各作品自己的真实资源**：删掉 `lib/demo-streams.ts` 与种子数据里 169 条与番剧无关的公开测试流
  （Mux / Tears of Steel / Sintel / Big Buck Bunny），改为按 AniList `trailer` 为每部番挂它自己的官方预告 / PV
  （15 条真实资源位；无官方预告的条目不再伪造剧集）。AniList 导入同步改为「最多建 1 条预告位」，
  不再自动编造「第 n 话」。
- 播放页文案与页脚改为如实说明资源来源，并新增「官方观看」渠道按钮组（来自 AniList `externalLinks`）。
- 本站不内置、也不代找未授权的全集片源；`videos.sourceUrl` 留给管理员逐集填入已授权正版源。

### 新增

- `lib/media.ts`：`resolveMedia()` 统一识别四类资源位地址——B 站视频页/番剧播放页（自动转 `player.bilibili.com` 官方嵌入）、
  YouTube 分享或嵌入地址（转 `youtube-nocookie`）、Dailymotion、以及 mp4 / HLS 直链；`VideoPlayer` 据此在 iframe 与
  `<video>` 之间切换，并放进 16:9 自适应容器。无法识别的地址给出「在新窗口打开」而不是黑屏。
- 移动端与窄屏适配：新增 `public/assets/css/responsive.css`（≤1200 / ≤768 / ≤480 三档），覆盖 `base.css` 里
  `body{min-width:1230px}` 这一横向溢出根因，头部纵向堆叠、卡片 4→2→1 列、详情与播放页两栏转单栏、表格横向滚动、
  登录表单自适应。390px 下 10 类页面 `scrollWidth == innerWidth`，桌面端布局实测未变。
- `docs/API.md`：17 个 route / 24 个接口方法的完整文档（参数表、响应示例、错误码、admin 资源表驱动、踩坑清单）。

### 修复

- 安全：`requireApiUser()` / `requireApiAdmin()` 此前只验 JWT 不回查库，管理员禁用或删除账号后旧 cookie 在 7 天内仍可
  下单、评论、收藏；现改为统一走 `getCurrentUser()`。
- 安全：`GET/POST/PUT /api/admin/users` 返回整行导致 bcrypt 密码哈希外泄，且 `password` 还是合法过滤参数（可比对哈希）；
  现由 `sanitizeRow()` 剔除并禁止作为过滤条件。
- 后台列表 `?featured=true` / `?published=false` 恒查不到数据（布尔列存的是 0/1），`buildWhere()` 现按 `boolFields` 归一；
  数值列按 `numFields` 取整，非有限数跳过条件。
- 后台列表 `?page=abc` 会算出 `NaN` 并抛成 500（响应体也不是统一信封）；现 `intParam()` 取整夹取并回落默认值。

## [2.2.0] - 2026-10-30

### 新增

- 动漫列表页筛选条：「动漫类型」「开播年份」两级筛选，候选值来自 `getAnimeFacets()`（只列库里真实存在、且不少于 3 部的类型），
  类型名按中文站习惯翻译（`lib/genres.ts`，未知类型回退英文原文）。详情页的类型标签改为可点链接，直接跳到对应筛选结果。
- `app/sitemap.ts` + `app/robots.ts`：站点地图收录公开首页/列表/制作方与全部已发布详情页（带 `lastModified`，每小时重新验证），
  robots 屏蔽 `/admin`、`/ucenter`、`/order`、`/api`。
- `lib/site.ts` 统一站点域名（`NEXT_PUBLIC_SITE_URL`），`app/layout.tsx`、sitemap、robots 共用同一个来源。

### 修复

- 搜索只认中文标题：`/anime?title=` 现在同时匹配译名 / 日文名 / 英文原名（与搜索建议接口的口径一致），
  搜 `Bocchi` 能出《孤独摇滚！》，此前只在建议下拉里出现、回车后是空结果。
- 分页改为窗口式页码（首尾恒显 + 当前页左右各两页 + 省略号），片库变大后不再铺开上百个按钮。
- 带筛选条件时在标题行显示命中数量与「清除全部筛选」入口。

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
