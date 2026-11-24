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

## 测试

`npm run e2e` 覆盖：首页/列表/筛选、图集、结构化数据、加购、下单、币种、繁体、阿语 RTL、
llms/sitemap/robots、后台登录、建商品→前台可见→删除、图片上传。**20/20 通过**。
