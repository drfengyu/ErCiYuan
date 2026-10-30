# ErCiYuan REST API 文档

本文覆盖 `app/api/` 下全部 17 个 `route.ts` 文件、共 24 个接口方法（同一文件的多个 HTTP 方法分别计数）。
所有字段名、路径、默认值、状态码、提示文案均取自当前代码（`lib/api.ts`、`lib/admin-resources.ts`、`lib/queries.ts`、`lib/db/schema.ts` 等），未做任何推测性补充。

## 0. 接口索引

| 方法 | 路径 | 鉴权 | 出处 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | 公开 | `app/api/auth/login/route.ts` |
| POST | `/api/auth/register` | 公开 | `app/api/auth/register/route.ts` |
| POST | `/api/auth/sms` | 公开 | `app/api/auth/sms/route.ts` |
| GET | `/api/auth/me` | 登录用户 | `app/api/auth/me/route.ts` |
| POST | `/api/auth/profile` | 登录用户 | `app/api/auth/profile/route.ts` |
| POST / GET | `/api/auth/logout` | 无（清 cookie） | `app/api/auth/logout/route.ts` |
| GET / POST / DELETE | `/api/favorites/{animeId}` | 登录用户 | `app/api/favorites/[animeId]/route.ts` |
| GET | `/api/comments?animeId=` | 公开 | `app/api/comments/route.ts` |
| POST | `/api/comments` | 登录用户 | `app/api/comments/route.ts` |
| GET | `/api/orders` | 登录用户 | `app/api/orders/route.ts` |
| POST | `/api/orders` | 登录用户 | `app/api/orders/route.ts` |
| DELETE | `/api/orders/{id}` | 本人或管理员 | `app/api/orders/[id]/route.ts` |
| POST | `/api/orders/{id}/pay` | 仅本人 | `app/api/orders/[id]/pay/route.ts` |
| POST | `/api/views` | 公开 | `app/api/views/route.ts` |
| GET | `/api/anime/suggest?keyword=` | 公开 | `app/api/anime/suggest/route.ts` |
| GET | `/api/anilist/search` | 公开 | `app/api/anilist/search/route.ts` |
| POST | `/api/anilist/import` | 管理员 | `app/api/anilist/import/route.ts` |
| GET / POST | `/api/admin/{resource}` | 管理员 | `app/api/admin/[resource]/route.ts` |
| PUT / DELETE | `/api/admin/{resource}/{id}` | 管理员 | `app/api/admin/[resource]/[id]/route.ts` |

---

## 1. 通用约定

### 1.1 Base URL

| 环境 | 地址 |
| --- | --- |
| 线上 | `https://erciyuan.fuwari.fun` |
| 本地开发 | `http://localhost:3000` |

下文路径均相对 base URL，例如 `POST /api/auth/login` 完整为 `https://erciyuan.fuwari.fun/api/auth/login`。

所有路由文件都声明了 `export const dynamic = 'force-dynamic'`，接口结果不会被 Next 的静态/路由缓存固定住（`/api/anilist/*` 对 AniList GraphQL 的上游请求另有 600s/3600s 的 `next.revalidate` 缓存）。

### 1.2 统一响应体

`lib/api.ts` 只有两个封装函数：

```ts
ok(data?, message = '成功')   // NextResponse.json({ success: true, code: 20000, message, data })
fail(message, status = 400)   // NextResponse.json({ success: false, code: status, message }, { status })
```

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `success` | boolean | 成功为 `true`，失败为 `false` |
| `code` | number | 成功固定 `20000`；失败时等于 HTTP 状态码本身（`fail` 把同一个 `status` 同时写进 body 的 `code` 和响应状态行） |
| `message` | string | 成功默认 `成功`，各接口会传自定义文案；失败为 zod 第一条 issue 的 message 或硬编码中文提示 |
| `data` | any | 失败响应**不含** `data` 键（`fail` 没有该参数）；成功但无返回体时为 `null` |

`code` 可能出现的全部取值（来自代码实际调用）：`20000`、`400`、`401`、`403`、`404`、`405`、`409`、`429`、`502`。

特例：`POST /api/auth/logout` 与 `GET /api/auth/logout` 没有走 `ok()`，而是手写 `{ success: true, code: 20000, message: '已退出登录', data: null }`，形状恰好一致。

### 1.3 鉴权方式：httpOnly Cookie，不是 Bearer

`lib/session.ts`：

| 项 | 值 |
| --- | --- |
| Cookie 名 | `token`（常量 `AUTH_COOKIE`） |
| 内容 | HS256 JWT，`sub` = 用户 id，payload `role` = `ADMIN` \| `MEMBER` |
| 有效期 | 7 天（`setExpirationTime('7d')`，`maxAge = 60*60*24*7`） |
| 属性 | `httpOnly: true`、`sameSite: 'lax'`、`secure: NODE_ENV === 'production'`、`path: '/'` |
| 签名密钥 | `AUTH_SECRET`；非 Vercel 生产环境缺失时回落到内置开发密钥，Vercel + production + 缺失则启动即抛错 |

调用方式：浏览器同域 `fetch` 会自动带上 cookie；跨站点用 curl 需要手动带：

```bash
curl -X POST 'https://erciyuan.fuwari.fun/api/orders' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: token=<JWT>' \
  -d '{"animeId":"154587"}'
```

请求头里加 `Authorization: Bearer` **不起作用**，代码从不读该头。

`middleware.ts` 的 matcher 只有 `/ucenter/:path*`、`/order/:path*`、`/admin/:path*`：

- 它**不拦截 `/api/*`**，接口鉴权完全由各 route 自己调用 `requireApiUser()` / `requireApiAdmin()` 完成。
- 对页面：无会话重定向到 `/login?next=<原路径含 query>`；访问 `/admin*` 且 `role !== 'ADMIN'` 重定向到 `/`。

两个守卫函数的实际语义（`lib/api.ts`）：

| 函数 | 行为 |
| --- | --- |
| `requireApiUser()` | 内部调用 `getCurrentUser()`，**每次请求都回查用户表**；用户不存在或 `disabled === true` 时返回 `null` |
| `requireApiAdmin()` | 同上，且要求 `role === 'ADMIN'` |

也就是说：管理员在后台禁用某个账号后，该账号的 token 虽然还在 7 天有效期内，但所有带鉴权的接口会立刻开始返回 401/403，不需要等 cookie 过期。

### 1.4 HTTP 状态码使用规律

| 状态码 | 出现场景（逐条对应代码） |
| --- | --- |
| 200 | 所有 `ok()` 成功响应；`fail()` 的默认参数虽为 400，但只有显式传入才会变成其它码 |
| 400 | zod 校验失败（取 `issues[0].message`，无自定义 message 时为 zod 默认英文文案）；`req.json()` 解析失败后经 zod 得到的参数错误；管理员新建/编辑时 body 为 `null` → `请求体格式错误`；`缺少 animeId`（GET `/api/comments`、POST `/api/orders`）；`手机号格式不正确`（POST `/api/auth/sms`）；`该动漫免费，无需购买`；`订单已支付，无法取消`；`验证码错误或已过期` |
| 401 | `未登录`（`/api/auth/me`）、`请先登录`、`请先登录后再评论`、`请先登录后再下单`、`手机号或密码错误` |
| 403 | `需要管理员权限`（`/api/admin/*`、`/api/anilist/import`）；`账号已被禁用，请联系管理员`（登录）；`无权操作该订单`（DELETE 订单，管理员可通过）；`无权支付该订单`（POST 支付，**管理员也不可通过**） |
| 404 | `动漫不存在`、`父评论不存在`、`订单不存在`、`记录不存在`、`未知资源`（resource 名不在 RESOURCES 表里）、`AniList 未返回该条目`（`/api/anilist/search?id=`） |
| 405 | `「{资源标题}」不支持新建`、`「{资源标题}」不支持删除`（`comments`、`orders`） |
| 409 | `该手机号已注册`、`你已购买过该动漫`、`{id} 已存在，请直接编辑` |
| 429 | `验证码发送过于频繁，请 60 秒后重试` |
| 502 | `AniList 未返回该条目：ID 不存在或接口暂时不可达`（导入时上游 3 次重试后仍无数据） |
| 500 | route 内**没有 try/catch**：数据库唯一约束冲突、空 SET 子句、`paidAt`/列不存在等异常会由 Next 兜底成 500，此时响应体**不是**上述统一 JSON 结构 |

### 1.5 其它通用约定

- 所有写接口只接受 `Content-Type: application/json` 的 JSON body（无表单/multipart 解析分支）。
- ID 规则：`users`/`comments`/`favorites`/`orders`/`ads`/`smsCodes` 及 admin 新建记录的 id 为 `randomUUID().slice(0, 12)`；`anime` 主键为 AniList ID 的字符串形式（如 `154587`）；`chapters` 惯例 `{animeId}-c1`；`videos` 惯例 `{animeId}-v{序号}`。
- 时间戳一律为 `new Date().toISOString()` 输出的 **UTC ISO 8601 字符串**（如 `2026-10-29T13:20:00.000Z`），列类型是 TEXT；`orders.paidAt`、`anime.score`、`anime.anilistId`、`anime.bangumiId` 可为 `null`。
- 布尔列在 SQLite 里是 INTEGER 0/1（`users.disabled`、`anime.featured`、`anime.published`、`videos.isFree`、`smsCodes.used`），Drizzle 的 `mode: 'boolean'` 会在读出时转成 `true/false`，因此接口返回的是布尔值。
- `anime.genres`、`anime.externalLinks` 在库里是 **JSON 字符串**；`/api/admin/anime` 原样返回字符串，只有服务端页面查询（`lib/queries.ts` 的 `decorate`）才会解析成 `genresList` / `links`。

---

## 2. 认证与会话

### 2.1 POST `/api/auth/login`

公开接口。zod：`{ mobile: string.min(6, '请输入手机号'), password: string.min(1, '请输入密码') }`——注意登录**没有**做手机号正则，只要求 ≥6 个字符。

请求参数：

| 字段 | 类型 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- | --- |
| `mobile` | string | 是 | 手机号（≥6 字符即可通过校验） | `13900000000` |
| `password` | string | 是 | 明文密码，服务端 `bcrypt.compareSync` | `demo123` |

成功响应（`message` 为 `登录成功`），并附带 `Set-Cookie: token=...`：

```json
{
  "success": true,
  "code": 20000,
  "message": "登录成功",
  "data": {
    "userInfo": {
      "id": "user-demo",
      "nickname": "次元旅人",
      "avatar": "/assets/img/avatar-boy.gif",
      "role": "MEMBER"
    },
    "redirect": "/"
  }
}
```

| code | message | 触发条件 |
| --- | --- | --- |
| 400 | `请输入手机号` / `请输入密码` | 字段缺失或长度不足 |
| 401 | `手机号或密码错误` | 用户不存在，或 bcrypt 比对失败 |
| 403 | `账号已被禁用，请联系管理员` | `users.disabled === true` |

副作用：签发 7 天 JWT 并写入 `token` cookie；`redirect` 为 `ADMIN` → `/admin`，其他 → `/`。登录不更新任何表数据，也不清空旧 cookie。

### 2.2 POST `/api/auth/register`

公开接口。zod：`nickname` 1–24、`mobile` 正则 `/^1[3-9]\d{9}$/`（`手机号格式不正确`）、`code` 4–8（`请填写验证码`）、`password` 6–64（`密码至少 6 位`），并 `refine` 密码 ≠ 手机号后 6 位（`密码不能与手机号后 6 位相同`）。

| 字段 | 类型 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- | --- |
| `nickname` | string | 是 | 1–24 字符 | `新旅人` |
| `mobile` | string | 是 | 大陆手机号格式 | `13900000001` |
| `code` | string | 是 | 4–8 位验证码 | `123456` |
| `password` | string | 是 | 6–64 位 | `qwer1234` |

```json
{
  "success": true,
  "code": 20000,
  "message": "注册成功",
  "data": {
    "userInfo": { "id": "9f2c1a7b3e4d", "nickname": "新旅人", "role": "MEMBER" },
    "redirect": "/"
  }
}
```

注意 `userInfo` 这里**没有** `avatar`（登录响应有），两者字段集不一致。

| code | message | 触发条件 |
| --- | --- | --- |
| 400 | zod 首条文案 | 任一字段不合法 |
| 409 | `该手机号已注册` | `users.mobile` 已存在 |
| 400 | `验证码错误或已过期` | 无有效验证码 |

副作用（按代码顺序）：

1. 取该手机号**最近一条 `used = false`** 的 `smsCodes` 记录，比对 `code` 与 `expiresAt > now`。
2. 演示模式（`NODE_ENV !== 'production'` 或 `DEMO_SMS === '1'`）允许**万能验证码 `123456`**，此时即使没有任何验证码记录也能通过。
3. 命中真实票据时把该记录 `used` 置为 `true`；万能码路径不写库。
4. 插入 `users`：`avatar` 固定 `/assets/img/avatar-boy.gif`、`role` 固定 `MEMBER`、`disabled` false、`password` 为 `bcrypt.hashSync(password, 10)`、`createdAt` 为当前 ISO 串。
5. 直接为新人签发并种下 `token` cookie（注册即登录）。

### 2.3 POST `/api/auth/sms`

公开接口。仅一个字段，zod 用同一手机号正则，失败固定返回 `手机号格式不正确`（400）。

| 字段 | 类型 | 必填 | 说明 | 示例 |
| --- | --- | --- | --- | --- |
| `mobile` | string | 是 | `/^1[3-9]\d{9}$/` | `13900000001` |

演示模式返回 `data.code`（`message` 为 `演示验证码已“发送”到 {mobile}`）：

```json
{
  "success": true,
  "code": 20000,
  "message": "演示验证码已“发送”到 13900000001",
  "data": { "code": "438920" }
}
```

生产且未设 `DEMO_SMS=1` 时**不回显验证码**：`data` 为 `null`，`message` 为 `验证码已发送`。

| code | message | 触发条件 |
| --- | --- | --- |
| 400 | `手机号格式不正确` | 正则不匹配或 body 非对象 |
| 429 | `验证码发送过于频繁，请 60 秒后重试` | 60 秒内已有该手机号记录 |

副作用：向 `smsCodes` 插入 6 位随机码，`createdAt` 为当前 ISO 串，`expiresAt` 为 **当前时间 +5 分钟**，`used` false。冷却判断是**字符串比较** `smsCodes.createdAt > (now-60s 的 ISO 串)`；没有真实短信通道，验证码只落库。

### 2.4 GET `/api/auth/me`

需登录。无参数。

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {
    "userInfo": {
      "id": "user-demo",
      "mobile": "13900000000",
      "nickname": "次元旅人",
      "avatar": "/assets/img/avatar-boy.gif",
      "role": "MEMBER",
      "createdAt": "2026-10-20T10:00:00.000Z"
    }
  }
}
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `未登录` | cookie 缺失/无效，或用户已被删除、`disabled` 为 true（`getCurrentUser()` 回查库） |

无副作用。这是唯一一个"会感知账号封禁"的接口。

### 2.5 POST `/api/auth/profile`

需登录（`requireApiUser`）。zod：`nickname` 1–24（`昵称不能为空`）、`avatar` ≤500 且**默认 `''`**。

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `nickname` | string | 是 | — | 新昵称 |
| `avatar` | string | 否 | `''` | 头像地址；不传会被写成空串 |

```json
{ "success": true, "code": 20000, "message": "资料已更新", "data": null }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `请先登录` | 无有效 cookie |
| 400 | zod 首条文案 | 昵称为空/超长等 |

副作用：`UPDATE users SET nickname = ?, avatar = ? WHERE id = ?`。**全量覆盖**两列——只传 `nickname` 会把已有头像清空；返回体不含新数据，前端需自行刷新。

### 2.6 POST `/api/auth/logout`（GET 同实现）

无需鉴权，`GET` 直接调用 `POST` 处理函数（`SiteHeader` 里有 `href="/api/auth/logout"` 的链接用法）。

```json
{ "success": true, "code": 20000, "message": "已退出登录", "data": null }
```

副作用：`Set-Cookie: token=; Path=/; Max-Age=0`。带 `maxAge: 0` 而**不带** `httpOnly/sameSite/secure`（与原 cookie 属性不同，但足以让浏览器删除）。无任何数据库操作，JWT 在过期前本身仍然有效——仅删 cookie 不等效于服务端吊销。

---

## 3. 用户数据

### 3.1 `/api/favorites/{animeId}`（GET / POST / DELETE）

三个方法都要求登录，未登录统一 401 `请先登录`。路径参数 `animeId` 为动漫主键。

`GET /api/favorites/154587`

```json
{ "success": true, "code": 20000, "message": "成功", "data": { "isCollect": true } }
```

`POST`（`收藏成功`）与 `DELETE`（`已取消收藏`）：

```json
{ "success": true, "code": 20000, "message": "收藏成功", "data": { "isCollect": true } }
```

| 方法 | code | message | 触发条件 |
| --- | --- | --- | --- |
| GET | 401 | `请先登录` | 无会话；**不校验 animeId 是否存在**，不存在时返回 `isCollect: false` |
| POST | 401 | `请先登录` | 无会话 |
| POST | 404 | `动漫不存在` | `findAnime(animeId)` 无结果 |
| DELETE | 401 | `请先登录` | 无会话；**不校验动漫是否存在**，未收藏过也返回成功 |

副作用：POST 插入 `favorites`（`id` 为 12 位随机串、`createdAt` ISO）；`(userId, animeId)` 上有唯一索引 `favorites_user_anime_idx`，但代码先查 `exists()` 再插，因此**重复收藏是幂等的**（仍返回 `收藏成功`）。DELETE 按 `(userId, animeId)` 删除，与动漫无关。

### 3.2 `/api/comments`

#### GET `/api/comments?animeId={animeId}`

公开、无需登录。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `animeId` | string | 是 | 缺失 → 400 `缺少 animeId`；不校验动漫是否存在 |

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": "comment-1",
        "parentId": "",
        "content": "芙莉莲的节奏太舒服了，战斗作画又突然拉满，一口气看完。",
        "createdAt": "2026-10-20T13:20:00.000Z",
        "nickname": "次元旅人",
        "avatar": "/assets/img/avatar-boy.gif"
      }
    ]
  }
}
```

`items` 来自 `listComments()`：按 `createdAt DESC` 平铺返回，**不组装父子结构**，回复靠 `parentId` 自行拼；作者被删时 `nickname` 回落 `匿名用户`、`avatar` 回落 `/assets/img/avatar-boy.gif`。

#### POST `/api/comments`

需登录。

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `animeId` | string | 是 | — | `min(1)`，必须是已存在的动漫 |
| `content` | string | 是 | — | 1–500 字符，`评论内容不能为空` |
| `parentId` | string | 否 | `''` | ≤64 字符；非空时必须是已存在的评论 |

```json
{
  "success": true,
  "code": 20000,
  "message": "评论成功",
  "data": {
    "id": "7c3d9e1f2a4b",
    "parentId": "",
    "content": "作画神！",
    "createdAt": "2026-10-29T13:20:00.000Z",
    "nickname": "次元旅人",
    "avatar": "/assets/img/avatar-boy.gif"
  }
}
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `请先登录后再评论` | 无会话 |
| 400 | zod 首条文案 | 参数不合法 |
| 404 | `动漫不存在` | `animeId` 查不到 |
| 404 | `父评论不存在` | `parentId` 非空且查不到（**不校验父评论是否属于同一动漫**） |

副作用：插入 `comments` 一行并原样回显（不含 `animeId`、`userId`）。评论数没有上限/频率限制。

### 3.3 `/api/orders`

#### GET `/api/orders`

需登录，无参数。

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": "order-demo-1",
        "orderNo": "ECY202610290001",
        "userId": "user-demo",
        "animeId": "21519",
        "amount": 6,
        "status": 1,
        "payType": 1,
        "paidAt": "2026-10-25T12:00:00.000Z",
        "createdAt": "2026-10-25T11:58:00.000Z",
        "animeTitle": "你的名字。"
      }
    ]
  }
}
```

`items` 按 `createdAt DESC`，每条是订单全列 + `listUserOrders()` 附加的 `animeTitle`（动漫被删时回落为 `animeId`）。`status`：`0` 待支付、`1` 已支付；`payType`：`1`（默认）。无分页、无总量字段。

#### POST `/api/orders`

需登录。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `animeId` | string | 是 | `min(1)`，缺失/zod 失败 → 400 `缺少 animeId` |

```json
{ "success": true, "code": 20000, "message": "订单已创建", "data": { "orderId": "3a7f5c2e9b10" } }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `请先登录后再下单` | 无会话 |
| 400 | `缺少 animeId` | 校验失败 |
| 404 | `动漫不存在` | 查不到动漫 |
| 400 | `该动漫免费，无需购买` | `anime.price <= 0` |
| 409 | `你已购买过该动漫` | 已有该动漫 `status = 1` 的订单（`hasBought`） |

副作用与关键行为：

1. **复用待支付订单**：先查 `(userId, animeId, status = 0)`，命中则不新建，直接返回 200 `{ "orderId": 旧订单 id }`，`message` 为 `已有待支付订单`（`success` 仍为 `true`）。
2. 否则插入新订单：`orderNo` 格式 `ECY` + `YYYYMMDD` + 4 位随机数字（如 `ECY202610290073`，**无唯一性重试**，理论上可撞）；`amount` 取下单瞬间的 `anime.price`（之后改价不影响已生成订单）；`status` 0、`payType` 1、`createdAt` ISO。
3. 只返回 `orderId`（不是 `orderNo`），前端 `CreateOrder` 用它跳 `/order/{orderId}`。

### 3.4 DELETE `/api/orders/{id}`

| 参数 | 位置 | 说明 |
| --- | --- | --- |
| `id` | path | 订单 id（`orders.id`，不是 `orderNo`） |

```json
{ "success": true, "code": 20000, "message": "订单已取消", "data": null }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `请先登录` | 无会话 |
| 404 | `订单不存在` | id 查不到 |
| 403 | `无权操作该订单` | 非本人**且** `role !== 'ADMIN'`（管理员可取消他人订单） |
| 400 | `订单已支付，无法取消` | `status === 1` |

副作用：**物理删除** `orders` 行（`DELETE ... WHERE id = ? AND userId = ?`），没有"已取消"状态位，历史订单不可追溯。删除后该动漫可重新下单（`hasBought` 只看 `status = 1`）。

### 3.5 POST `/api/orders/{id}/pay`

演示支付：不接微信商户号，只做本地状态流转。

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `payType` | number | 否 | `1` | `z.coerce.number()`，body 可为 `{}`；代码不校验取值范围 |

```json
{ "success": true, "code": 20000, "message": "支付成功（演示）", "data": { "paid": true } }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 401 | `请先登录` | 无会话 |
| 400 | `参数错误` | zod 失败（`payType` 传非数字字符串时 `coerce` 失败） |
| 404 | `订单不存在` | id 查不到 |
| 403 | `无权支付该订单` | `order.userId !== session.userId`——**这里没有管理员豁免** |
| 200 | `订单已支付` | `status === 1` 时幂等返回 `{ "paid": true }` |

副作用：`UPDATE orders SET status = 1, payType = ?, paidAt = <ISO now>`。返回体只有 `{ paid: true }`，不带金额/订单号。

---

## 4. 公开数据接口

### 4.1 POST `/api/views`

无鉴权，播放页 `ViewTracker` 在挂载时自动上报一次。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `animeId` | string | 是 | `min(1)` |
| `videoId` | string | 是 | `min(1)` |

```json
{ "success": true, "code": 20000, "message": "成功", "data": null }
```

失败：仅 400 `参数错误`（zod 不通过，包括 body 非 JSON）。**不校验 id 是否真实存在**。

副作用：`anime.viewCount + 1`；`videoId` 非空时 `videos.playCount + 1`。同一浏览器切集/重挂载会重复计数，无去重、无幂等窗口。

### 4.2 GET `/api/anime/suggest?keyword={kw}`

无鉴权。`keyword` 缺省按空串处理；`suggestTitles('')` 直接返回 `[]`。最多 8 条（`limit` 形参默认 8，未对外暴露）。

**注意 `data` 直接就是数组**，没有 `items` 包装：

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": [
    { "id": "154587", "title": "葬送的芙莉莲" },
    { "id": "113415", "title": "咒术回战" }
  ]
}
```

匹配为 `title LIKE %keyword% OR enTitle LIKE %keyword%`，**未转义 `%`/`_`**，输入通配符会当模式使用；结果只含 `id` 与 `title` 两列，且不区分 `published`。无失败分支（恒 200）。

### 4.3 GET `/api/anilist/search`

**公开接口**（route 内没有任何鉴权调用），会直连 AniList GraphQL。

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | number | 否 | — | 非 0 时走单条精确查询，`keyword` 被忽略 |
| `keyword` | string | 否 | `''` | 空白 → 直接返回空列表，不发上游请求 |
| `limit` | number | 否 | `12` | `Math.min(20, limit)`，页码固定为第 1 页 |

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {
    "items": [
      {
        "anilistId": 154587,
        "title": "Frieren: Beyond Journey's End",
        "titleJp": "葬送のフリーレン",
        "romaji": "Souso no Frieren",
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587.jpg",
        "year": 2023,
        "episodes": 28,
        "duration": 24,
        "score": 89,
        "status": "FINISHED",
        "format": "TV",
        "genres": ["Adventure", "Fantasy", "Drama"],
        "studio": "Madhouse",
        "trailer": "n2VwT2jJ3RQ",
        "anilistUrl": "https://anilist.co/anime/154587"
      }
    ]
  }
}
```

字段映射规则（`shape()`）：`title` = english→romaji→native 逐级回落；`titleJp` = native；`score` = `meanScore`，可为 `null`；`year/episodes/duration` 缺失时为 `0`；`trailer` **仅当 `trailer.site === 'youtube'`** 才给 YouTube id，否则 `''`；`studio` 取 `studios(isMain: true)` 的第一个节点名。

| code | message | 触发条件 |
| --- | --- | --- |
| 404 | `AniList 未返回该条目` | `id` 模式上游查不到 |

上游失败对 `keyword` 模式表现为**静默空结果**（`anilistSearch` 3 次重试后返回 `[]`，接口仍是 200 + 空 `items`），只有 `id` 模式才给 404。

### 4.4 POST `/api/anilist/import`

管理员专属（`requireApiAdmin`，否则 403 `需要管理员权限`）。

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `anilistId` | number | 是 | — | `z.coerce.number().min(1)`，`缺少 AniList ID` |
| `categoryId` | string | 否 | `cat-tv` | 落入的分类 id，非空校验 |
| `episodeCount` | number | 否 | `3` | 0–48；>0 表示创建章节与官方预告资源位，0 表示两者都不建（实际最多只建 1 条预告） |
| `price` | number | 否 | `0` | ≥0，0 为免费 |
| `featured` | boolean | 否 | `false` | 首页推荐位 |

```json
{
  "success": true,
  "code": 20000,
  "message": "导入成功：葬送的芙莉莲",
  "data": {
    "animeId": "154587",
    "studio": "Madhouse",
    "bangumi": { "id": 347038, "nameCn": "葬送的芙莉莲" },
    "createdVideos": 1,
    "mode": "created"
  }
}
```

`message` 为 `导入成功：{标题}`（新建）或 `更新成功：{标题}`（已存在）；`mode` 为 `created` / `updated`；Bangumi 未命中时 `bangumi` 为 `null`。

| code | message | 触发条件 |
| --- | --- | --- |
| 403 | `需要管理员权限` | 非管理员 |
| 400 | zod 首条文案 | 参数不合法 |
| 502 | `AniList 未返回该条目：ID 不存在或接口暂时不可达` | 上游三次重试后仍为空 |
| 500 | 非统一响应体 | Bangumi/数据库异常时无 try/catch |

副作用（一次调用会写的东西比较多）：

1. **两次外部请求**：AniList `Media(id)` GraphQL + `matchBangumi()`（按 romaji/native/english 依次搜 `api.bgm.tv`，命中后再拉一次 subject 详情）。
2. **自动创建制作方**：`resolveMaker()` 用 `makers.name LIKE %studio%` 模糊匹配，命中复用其 id；否则插入 `maker-{uuid 前 8 位}`，`sort` 固定 `99`、`intro` 为 `由 AniList 导入时自动创建的制作方条目：{studio}`。
3. **anime upsert**，主键为 `String(media.id)`：新建时 `viewCount` 0、`createdAt`/`updatedAt` 均为当前 ISO；已存在时**不覆盖** `createdAt`、`viewCount`，且当 `Bangumi 不可达` 而库里已有中文标题/简介时保留原值（`keepTitle` / `keepDescription`）；`makerId` 为空串时走 `undefined` 即保持原值。`published` 恒被设为 `true`，`genres`、`externalLinks` 以 **JSON 字符串**入库（外链只保留 `type` 为 `STREAMING` / `INFO` 的条目、最多 8 条）。
4. **章节**：`episodeCount > 0` 且该动漫无章节时，创建 `{animeId}-c1`，标题为 `正片`（`format === 'MOVIE'`）或 `第 1 季`，`sort` 0。
5. **官方预告资源位**：`episodeCount > 0` 且该动漫**一条剧集都没有**时，只在第一个章节下插入 1 条 `{animeId}-v1`，标题 `官方预告 / PV`，`sourceUrl` 为 `trailerEmbed('youtube', anime.trailer)` 得到的 `https://www.youtube-nocookie.com/embed/{id}`；AniList 该条目没有 YouTube 预告（`trailer` 为空）时**不建**资源位。`isFree` 取 `price <= 0`（付费番的预告位同样要购买才打开），`duration` 0、`playCount` 0、`sort` 0，`createdVideos` 只会是 0 或 1。**不自动生成"第 n 话"**：未授权的全集片源不由系统伪造，管理员可在后台「剧集」里按集填入已授权正版源（B 站 / YouTube / Dailymotion 官方页或嵌入地址、或 mp4 / m3u8 直链，见 `lib/media.ts` 的 `resolveMedia()`）。

---

## 5. 管理后台：`/api/admin/[resource]` 的资源表驱动设计

### 5.1 设计说明

`lib/admin-resources.ts` 导出 `RESOURCES: Record<ResourceKey, ResourceDef>`，每个资源描述：`table`（Drizzle 表）、`schema`（zod 校验）、`fields`（管理面板字段元数据，同时决定可作为过滤参数的键）、`search`（`keyword` 命中的列）、`orderBy`（固定排序）、`jsonFields`/`boolFields`/`numFields`、`canCreate`/`canDelete`。两个 route 文件不含任何业务分支，全部按 `findResource(key)` 驱动，因此 9 个资源共用 4 个端点（GET/POST 列表级、PUT/DELETE 记录级）。

`lib/admin-resources.ts` 的写入归一化 `normalizeValues(resource, input, mode)`：

- 丢弃 `undefined`、`id`、以及**不在该表列集合里**的键；
- `jsonFields` 中的非字符串值 `JSON.stringify`（`anime.genres`、`anime.externalLinks`）；
- `boolFields` 转 1/0（`featured`、`published`、`isFree`、`disabled`）；
- `password` 存在则 `bcrypt.hashSync(..., 10)`（空串会被删除该键）；
- `create` 时若有 `createdAt`/`updatedAt` 列则写当前 ISO；`update` 时只刷新 `updatedAt`（9 个资源里只有 `anime` 有 `updatedAt`）。

### 5.2 GET `/api/admin/{resource}`

需管理员。非管理员 → 403 `需要管理员权限`；资源名不在表里 → 404 `未知资源`。

| 参数 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `page` | number | 否 | `1` | 取整并夹在 1–100000；非数字（如 `page=abc`）回落到 1 |
| `size` | number | 否 | `20` | 取整并夹在 1–200；非数字回落到 20 |
| `keyword` | string | 否 | `''` | 对该资源 `search` 列做 `LIKE %kw%` 的 OR 组合 |
| 其余任意 | string | 否 | — | 只要键名出现在该资源 `fields` 里，就作为**等值**（`eq`）过滤条件；空串被忽略。布尔列（`featured`/`published`/`isFree`/`disabled`）接受 `1`/`true`/`on`（不区分大小写）为真、其它值为假；数值列会先取整，非有限数直接跳过该条件 |

`password` 列被显式排除在过滤条件之外（`SECRET_COLUMNS`），传 `?password=xxx` 不产生任何过滤效果。

**不支持自定义排序参数**：顺序由 `RESOURCES[key].orderBy` 写死。

```json
{
  "success": true,
  "code": 20000,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": "154587",
        "title": "葬送的芙莉莲",
        "titleJp": "葬送のフリーレン",
        "enTitle": "Frieren: Beyond Journey's End",
        "description": "讨伐魔王的旅途结束之后……",
        "cover": "https://s4.anilist.co/.../bx154587.jpg",
        "banner": "https://s4.anilist.co/.../154587.jpg",
        "year": 2023,
        "episodesCount": 28,
        "duration": 24,
        "score": 89,
        "genres": "[\"Adventure\",\"Fantasy\",\"Drama\"]",
        "makerId": "maker-madhouse",
        "categoryId": "cat-tv",
        "trailer": "n2VwT2jJ3RQ",
        "externalLinks": "[{\"site\":\"Crunchyroll\",\"url\":\"https://...\",\"type\":\"STREAMING\"}]",
        "anilistId": 154587,
        "bangumiId": 347038,
        "anilistUrl": "https://anilist.co/anime/154587",
        "bangumiUrl": "https://bgm.tv/subject/347038",
        "price": 0,
        "viewCount": 128000,
        "featured": true,
        "published": true,
        "createdAt": "2026-10-20T10:00:00.000Z",
        "updatedAt": "2026-10-28T02:11:00.000Z"
      }
    ],
    "total": 24,
    "page": 1,
    "size": 20
  }
}
```

`items` 是 `db.select()` 的**整行原始列**（经 `sanitizeRow()` 去掉 `password`），没有 `genresList`/`makerName`/`categoryName` 这类装饰字段。

### 5.3 资源总表

| resource | `title` | canCreate | canDelete | 主键 | 固定排序 | `keyword` 搜索列 | 可作过滤参数的键（= `fields`） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `anime` | 动漫 | ✔ | ✔ | `id` | `updatedAt DESC` | `title`、`enTitle`、`titleJp` | `title` `titleJp` `enTitle` `categoryId` `makerId` `cover` `banner` `year` `episodesCount` `duration` `score` `price` `viewCount` `genres` `trailer` `anilistId` `bangumiId` `anilistUrl` `bangumiUrl` `description` `featured` `published` |
| `chapters` | 章节 | ✔ | ✔ | `id` | `sort ASC` | `title`、`animeId` | `animeId` `title` `sort` |
| `videos` | 剧集 | ✔ | ✔ | `id` | `sort ASC` | `title`、`animeId` | `animeId` `chapterId` `title` `sourceUrl` `duration` `isFree` `sort` `playCount` |
| `categories` | 分类 | ✔ | ✔ | `id` | `sort ASC` | `name` | `name` `parentId` `sort` |
| `makers` | 制作方 | ✔ | ✔ | `id` | `sort ASC` | `name` | `name` `avatar` `career` `intro` `sort` |
| `ads` | 首页轮播 | ✔ | ✔ | `id` | `sort ASC` | `title` | `title` `imageUrl` `linkUrl` `color` `sort` `typeId` |
| `comments` | 评论 | ✘ | ✔ | `id` | `createdAt DESC` | `content`、`animeId` | `animeId` `userId` `content` |
| `orders` | 订单 | ✘ | ✔ | `id` | `createdAt DESC` | `orderNo`、`userId`、`animeId` | `orderNo` `userId` `animeId` `amount` `status` |
| `users` | 用户 | ✔ | ✔ | `id` | `createdAt DESC` | `nickname`、`mobile` | `mobile` `nickname` `avatar` `role` `disabled`（`password` 只写不读、不可过滤） |

主键统一由 `pkOf()` 取表的 `id` 列；新建时 `id` 可由 body 指定，否则 `newId()` = 12 位随机串。

### 5.4 POST `/api/admin/{resource}`

请求体 = 对应资源 zod schema（见 5.6），整体校验、缺省字段用 schema 默认值填充。

```json
{ "success": true, "code": 20000, "message": "创建成功", "data": { "item": { "id": "cat-mecha", "name": "机甲", "parentId": "", "sort": 0 } } }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 403 | `需要管理员权限` | 非管理员 |
| 404 | `未知资源` | resource 名不在 RESOURCES |
| 405 | `「评论」不支持新建` / `「订单」不支持新建` | `canCreate === false` |
| 400 | `请求体格式错误` | body 解析结果为 `null` |
| 400 | zod 首条文案 | 字段校验失败 |
| 409 | `{id} 已存在，请直接编辑` | 指定了已存在的 `id` |

副作用：插入一行后**回读并返回整行**（`data.item`）。`createdAt`/`updatedAt` 被服务端覆盖为当前时间，客户端传了也无效。

### 5.5 DELETE `/api/admin/{resource}/{id}`

```json
{ "success": true, "code": 20000, "message": "删除成功", "data": null }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 403 | `需要管理员权限` | 非管理员 |
| 404 | `未知资源` | resource 名非法 |
| 405 | `「评论」不支持删除` | `canDelete === false`（当前 9 个资源都为 `true`，实际不会触发） |

级联（硬编码在 route 内）：

- `anime`：先删该动漫的 `chapters`、`videos`、`comments`、`favorites`、`orders`；
- `chapters`：先删 `videos WHERE chapterId = id`；
- 其它资源：只删自己一行。

**不检查记录是否存在**，删不存在的 id 也返回 `删除成功`。删除 `anime` 会连带清掉付费订单记录，不可恢复。

### 5.6 PUT `/api/admin/{resource}/{id}` 与各资源可写字段

`parsePartial()` 只把 **body 中出现的键** 装进一份 zod object 再校验，因此支持局部更新；body 中**不在该资源 schema 内的键会被 zod 剥离**（例如 `createdAt`、`orderNo`、`amount` 无法通过 PUT 修改）。

```json
{ "success": true, "code": 20000, "message": "保存成功", "data": { "item": { "id": "cat-mecha", "name": "机战", "parentId": "", "sort": 3 } } }
```

| code | message | 触发条件 |
| --- | --- | --- |
| 403 | `需要管理员权限` | 非管理员 |
| 404 | `未知资源` | resource 名非法 |
| 404 | `记录不存在` | id 查不到 |
| 400 | `请求体格式错误` | body 为 `null` |
| 400 | zod 首条文案 | 提供的字段不合法 |

`canCreate` 为 false 不影响 PUT：`comments`、`orders` 仍可编辑各自 schema 声明的字段。

**anime**（`genres`、`externalLinks` 存 JSON 文本；`featured`/`published` 存 1/0）

| 字段 | 类型 | 必填(POST) | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | string | 否 | 随机 12 位 | 1–64 字符 |
| `title` | string | 是 | — | `标题不能为空` |
| `titleJp` / `enTitle` / `description` / `banner` | string | 否 | `''` | |
| `cover` | string | 是 | — | `封面地址不能为空` |
| `year` / `episodesCount` | number(coerce) | 否 | `0` | |
| `duration` | number | 否 | `24` | |
| `score` | number \| null | 否 | `null` | |
| `genres` | string[] | 否 | `[]` | 面板以逗号分隔输入 |
| `makerId` | string ≤64 | 否 | `''` | |
| `categoryId` | string | 是 | — | `请选择分类`，如 `cat-tv` |
| `trailer` | string | 否 | `''` | YouTube 视频 ID |
| `externalLinks` | `{site,url,type}[]` | 否 | `[]` | `type` 默认 `INFO` |
| `anilistId` / `bangumiId` | number \| null | 否 | `null` | |
| `anilistUrl` / `bangumiUrl` | string | 否 | `''` | |
| `price` | number | 否 | `0` | |
| `viewCount` | number | 否 | `0` | |
| `featured` | boolean | 否 | `false` | |
| `published` | boolean | 否 | `true` | |

**chapters**：`id`(可选)、`animeId`(必填，`请选择动漫`)、`title`(必填，`标题不能为空`)、`sort`(默认 0)。
**videos**：`id`(可选)、`animeId`(必填)、`chapterId`(必填，`请选择章节`)、`title`(必填)、`sourceUrl`(必填，`播放地址不能为空`)、`duration`(0)、`isFree`(true)、`sort`(0)、`playCount`(0)。
**categories**：`id`(可选)、`name`(必填，`名称不能为空`)、`parentId`(默认 `''`)、`sort`(0)。
**makers**：`id`(可选)、`name`(必填)、`avatar`('')、`intro`('')、`career`('')、`sort`(0)。
**ads**：`id`(可选)、`title`(必填)、`imageUrl`(必填，`图片地址不能为空`)、`linkUrl`('')、`color`(`#0f172a`)、`sort`(0)、`typeId`('1')。
**comments**（仅 PUT）：`animeId`、`userId`、`parentId`('')、`content`(必填，`内容不能为空`)。
**orders**（仅 PUT）：`status`(默认 0)、`payType`(默认 1)；`amount`/`orderNo`/`userId`/`animeId` 只读。
**users**：`id`(可选)、`mobile`(必填，仅 `min(6)`，文案 `手机号格式不正确`)、`nickname`(必填)、`avatar`('')、`role`(`ADMIN`|`MEMBER`，默认 `MEMBER`)、`disabled`(默认 false)、`password`(可选，`min(6)`)。

---

## 6. 未文档化行为与踩坑清单

1. **（v2.3.0 已修复）`requireApiUser()` 曾经不回查数据库**：早期版本除 `GET /api/auth/me` 外只看 JWT，管理员把 `users.disabled` 置 `true` 甚至删行后，旧 cookie 在 7 天内仍能下单评论。现在两个守卫都走 `getCurrentUser()`。
2. **（v2.3.0 已修复）`/api/admin/users` 曾泄漏密码哈希**：`items` 与 `data.item` 现在都经 `sanitizeRow()` 去掉 `password`，且 `password` 不再被接受为过滤参数。
3. **支付与取消订单的鉴权不一致**：`DELETE /api/orders/{id}` 允许 `role === 'ADMIN'` 越权操作他人订单，`POST /api/orders/{id}/pay` 只认 `order.userId !== session.userId`，管理员也拿 403。
4. **`data` 层级不统一**：列表类是 `data.items`（`comments`、`orders`、`admin`、`anilist/search`），`admin` 单条是 `data.item`，收藏是 `data.isCollect`，下单只回 `data.orderId`，而 `GET /api/anime/suggest` **直接 `data` = 数组**。前端 `json.data.items` 之类的取值路径不可复用。
5. **成功但语义是"复用"的分支**：`POST /api/orders` 命中待支付订单时返回 200 / `success: true`，`message` 是 `已有待支付订单`；`POST /api/orders/{id}/pay` 对已支付订单同样 200 + `订单已支付`。调用方只能靠 message 区分"新建/幂等命中"。
6. **（v2.3.0 已修复）布尔字段的查询过滤**：`buildWhere()` 现在按 `boolFields` 把 `1`/`true`/`on` 归一为 `1`、其余为 `0`，`?featured=true`、`?published=false` 可正常命中。
7. **（v2.3.0 已修复）`resource.numFields` 曾是死元数据**：现在 `buildWhere()` 用它对数字列先 `Number()` + `Math.trunc()`，非有限数直接跳过该条件，`?score=abc` 不再按字符串比较。
8. **（v2.3.0 已修复）`page`/`size` 无非法值兜底**：过去 `Math.max(1, Number('abc'))` = `NaN`，`limit(NaN)` 抛到 Next 的 500（响应体不是统一信封）。现在两者都走 `intParam()` 取整夹取，非法值回落默认。数据库异常（唯一约束、`users` 建号未传 `password` 触发 NOT NULL）仍会走 500 分支。
9. **PUT 的空 SET 风险**：若 body 的键全部不在该资源 schema 内（例如给 `orders` 传 `{"amount": 10}`），`normalizeValues` 结果为 `{}`（`orders` 无 `updatedAt` 列），生成的 UPDATE 没有 SET 子句——从代码推演会得到运行时错误而非 400（`anime` 因总会刷新 `updatedAt` 不会触发）。
10. **命名与存储类型的几处落差**：
    - 库表名与列名**本身就是 camelCase**（`titleJp`、`parentId`、`anilistId`、表 `smsCodes`，见 `lib/db/ddl.ts`），接口字段与库列同名，**不存在** snake_case ↔ camelCase 的映射层。
    - 布尔：JS/接口 `true|false` ↔ SQLite `INTEGER 1|0`（`featured`、`published`、`isFree`、`disabled`、`used`）。
    - JSON：SQLite 没有 JSON 列，`anime.genres`、`anime.externalLinks` 在库里和 `/api/admin/anime` 的返回值里都是**字符串化的 JSON**（如 `"[\"Fantasy\"]"`），需调用方自行 `JSON.parse`；只有服务端页面查询经 `lib/queries.ts` 的 `decorate()` 才会转成 `genresList` / `links`，而这两个字段在任何 API 响应中都不出现。
    - 时间：全部 TEXT 存 UTC ISO 串，展示层用 `formatDate()` 按 `Asia/Shanghai` 格式化。
11. **手机号校验强度不一致**：注册 `/^1[3-9]\d{9}$/`、短信同一正则，但登录只 `min(6)`、`admin/users` 只 `min(6)`。管理员可建出登录不了的账号，也能用非手机号字符串尝试登录。
12. **`/api/auth/*` 返回体形状各异**：`login` 的 `userInfo` 含 `avatar` 不含 `mobile`；`register` 两者都不含；`me` 含 `mobile`/`createdAt` 但不含 `redirect`。`profile`、`logout`、`views` 一律 `data: null`，前端改完资料必须再调 `me` 才能刷新展示。
13. **评论父子结构是平的**：`GET /api/comments` 按时间倒序返回单层数组，`parentId` 需前端自行挂树；`POST` 只验证父评论存在，不校验它与 `animeId` 是否同属一部动漫。
14. **公开接口面比页面鉴权面宽**：`middleware.ts` 只匹配 `/ucenter`、`/order`、`/admin` 三条页面路径。`GET /api/anilist/search` 无需登录即可让服务端反复打 AniList GraphQL（`limit` 上限 20，无速率限制），`POST /api/views` 可被无限刷 `viewCount`/`playCount`。
15. **AniList 上游失败的表现不一致**：搜索关键词模式下游失败 → 200 + 空 `items`（与"真的没结果"不可区分）；`?id=` 模式 → 404；导入 → 502。
16. **`orderNo` 与订单删除**：单号 `ECY{YYYYMMDD}{4 位随机}` 仅靠 `orders.orderNo` 的唯一约束保证，冲突时不重试而是抛 500；取消订单是物理删除，`GET /api/admin/orders` 之后查不到取消记录。
