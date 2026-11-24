# INAUE — Pet GPS Trackers

参考站：<https://tractive.com/>（宠物 GPS 追踪器 DTC 品牌站，浅底 + 蓝紫、Poppins、圆角卡片、硬件标注图）。

首页主视觉为**背景视频**（即梦图生视频）+ 居中白字 + 两枚白色胶囊按钮，页头在顶部透明叠加、滚动后转白底；
右下角有播放/暂停，尊重 `prefers-reduced-motion`，窄屏自动切 960px 版本。

与茶叶站（INAUE）同架构、同功能集：可卖货的独立站 + 简体中文后台 + 7 语言（含 RTL）+ GEO + 多图图集。

## 运行

```bash
npm install
npm run dev                     # http://localhost:3210
npm run build && npm start
PORT=3220 ADMIN_PASSWORD=INAUE-ADMIN ADMIN_SECRET=32位随机串 npm start
npm run e2e                     # 20 项端到端断言
```

后台：**/admin**，默认密码 `INAUE-ADMIN`。注意：生产模式（`NODE_ENV=production` 或 `VERCEL=1`）下必须同时配置
`ADMIN_PASSWORD`（≥8 位）与 `ADMIN_SECRET`（≥16 位），否则登录接口返回 503 —— 这是防止弱默认密码上线的保护。

## 商品模型

追踪器 = **设备 + 数据套餐**。后台商品页的「规格」承担套餐选择：

| 商品 | 套餐示例 |
| --- | --- |
| DOG 6 Tracker | Device only $49.99 / +1 年 $118.99 / +2 年 $178.99 |
| CAT 6 Tracker | Device only $44.99 / +1 年 $109.99 / +2 年 $164.99 |
| DOG 6 XL / CAT 6 Mini / DOG 6 Pro | 同上结构 |
| Collar Clip / Magnetic Charger | 单一规格 |
| Trail Bundle | 双设备或双设备+套餐 |

筛选维度是**宠物类型**（Dogs / Cats / Multi-Pet），不是茶叶站的咖啡因。

## 功能（与茶叶站一致）

- 商品列表（宠物类型筛选 + 排序）、商品详情（图集、套餐、订阅说明）
- 服务端购物车、结账（运费/税/订单号）、订单确认
- 多币种 USD / EUR / GBP
- 7 语言：EN / zh-TW / ja / ko / es / pt / ar（RTL），203 个界面键
- 后台：仪表盘、商品 CRUD（多图上传 + 拖拽排序）、订单、页面管理（Banner/导航）、GEO、设置
- GEO：`/llms.txt`、`/llms-full.txt`、`/sitemap.xml`、`/robots.txt` + JSON-LD

## 图片

14 张图 + 1 段 6 秒视频，全部由即梦 CLI 生成（图片 Seedream 5.5 / 2K，视频 Seedance 2.5 m2v / 720p）：主视觉、产品图（5 款设备 + 2 配件 + 套装）、
场景图（遛狗、门口、沙发）、细节特写。原始 PNG 已转 1200–1600px JPG，共 3.7 MB。

生成脚本：`scripts/gen.sh`（读 `/tmp/paw-spec.tsv` 的 slug|比例|提示词）。

## 数据

`.data/` 下 products / orders / carts / settings / geo / content 六个 JSON + `uploads/`。
首次访问自动播种自 `lib/products.ts` / `lib/storefront/content.ts`。

## 部署

- 自建服务器：`bash scripts/export.sh` 生成 `dist/inaue-site-<时间>.tar.gz`，解压后 `npm ci && npm run build && npm start`
- Vercel：需 `STORAGE_DRIVER=blob` + `BLOB_READ_WRITE_TOKEN`（同茶叶站方案，代码已内置）

### 当前线上状态

| 项 | 值 |
| --- | --- |
| 仓库 | <https://github.com/qiaovnh/pet-web>（分支 `main`） |
| Vercel 项目 | `pet-web` / `prj_UbBPHIxhrRmCl5yg1rYTjqysSbVW` |
| 线上地址 | <https://pet-web-wine.vercel.app> |
| Blob store | `pet-web-blob` / `store_mqtzjFddeunHmt5m`（**private**，iad1） |

**Blob store 必须选 private**：订单 JSON 含姓名、电话、收货地址、邮箱，
public store 的对象可通过直链免鉴权访问——等于把客户 PII 公开挂网上。
private store 的对象没有公开直链，图片由本站 `/media` 路由代理输出，
所以图片地址是 `/media/xxx.png` 而不是 `*.blob.vercel-storage.com`。

环境变量（Production / Preview / Development 三环境都需配置）：

| 变量 | 说明 |
| --- | --- |
| `STORAGE_DRIVER` | `blob` |
| `BLOB_READ_WRITE_TOKEN` | 连接 Blob 后自动注入 |
| `ADMIN_PASSWORD` | 强密码，≥8 位 |
| `ADMIN_SECRET` | 随机串，≥16 位 |

生成随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> 生产环境（Vercel 或 `NODE_ENV=production`）下，`ADMIN_PASSWORD` / `ADMIN_SECRET`
> 没配好或是弱默认值时，后台登录接口返回 **503 `ADMIN_NOT_CONFIGURED`**——这是防止
> 漏配一次就把管理后台暴露在公网上的保护。

命令记录（重建项目时照抄）：

```bash
vercel blob create-store pet-web-blob --access private --yes
vercel storage connect store_mqtzjFddeunHmt5m --auth oidc --add-rw-token --yes
```

### 开启 GitHub 自动部署（待办）

Vercel 账号还没授权 GitHub 集成（`user.github` 为 `null`），所以
`vercel git connect` 会报 `repo_not_found`——**不是仓库不存在，是集成没授权**。

1. 打开 <https://vercel.com/qiaovnhs-projects/pet-web/settings/git>
2. 点 **Connect Git Repository**
3. 授权 Vercel 访问 GitHub（若列表里没有 `qiaovnh/pet-web`，先去
   <https://github.com/settings/installations> 给 Vercel 这个 App 装上仓库权限）
4. 选 `qiaovnh/pet-web`，Production Branch 选 `main`，保存

之后 `git push` 即自动触发生产部署。

### 上线后必做

后台 → **GEO 优化** → 把「站点域名」改成 `https://pet-web-wine.vercel.app`。
默认是茶叶站的 `https://inaue.co`，不改的话 `sitemap.xml` 和 `llms.txt` 里的链接全是错的。

## 测试

`npm run e2e` 覆盖 57 项：首页/列表/筛选、图集、结构化数据、加购、下单、币种、繁体、阿语 RTL、
llms/sitemap/robots、后台登录、建商品→前台可见→改价→删除、图片上传、图集排序、Banner 与导航、GEO。

- `scripts/e2e.mjs` —— 商店 20 项
- `scripts/e2e-admin.mjs` —— 后台 20 项
- `scripts/e2e-geo.mjs` —— GEO 17 项

**57/57 通过**。
