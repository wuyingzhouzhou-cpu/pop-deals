# Pop Deals - 导购/优惠券聚合平台部署及运行文档

本项目是一个基于 **Medusa v2 (后端)** 和 **Next.js (前台)** 的 Monorepo（使用 Turborepo & PNPM 管理）。
我们已经将其从标准的品牌店铺重构为一个**高度定制的社区导购站**（类似 `Slickdeals` / `GoCart`），支持：
- **Affiliate 推广链接管理**（支持 Lazada, AliExpress, TikTok, Shopee, Trip, Shein 等多平台链接在后台自由配置）。
- **Featured Coupons（优惠券）后台动态管理**。
- **全方位点击数据统计（Click Analytics）**：支持记录每个商品的点击时间、来源、国家、设备类型（Mobile/Web/Tablet）并在后台提供直观的图表和数据报表。

---

## 💻 1. 本地运行与开发环境配置

### 🛠️ 环境准备
在开始前，请确保你的电脑上已安装以下软件：
- **Node.js**: `v20` 或以上版本
- **PNPM**: `v10` 或以上版本（项目使用 `pnpm@10.11.1`）
- **PostgreSQL**: 关系型数据库，用于存储后台数据
- **Redis**: 缓存和事件总线服务

---

### 📦 第一步：克隆代码与安装依赖
同事将代码克隆/下载到本地后，在根目录下执行：
```bash
# 安装依赖
pnpm install
```

---

### 🗄️ 第二步：配置 PostgreSQL 数据库
1. 在本地 PostgreSQL 中创建一个空的数据库，例如命名为 `medusa-dtc-starter`：
   ```sql
   CREATE DATABASE "medusa-dtc-starter";
   ```

---

### ⚙️ 第三步：配置环境变量
项目包含两个子应用，都需要配置本地环境变量。

#### 1. 后端配置（`apps/backend`）
在 `apps/backend/` 目录下，确保有名为 `.env` 的文件。你可以从 `.env.template` 复制，并重点修改数据库和 Redis 连接：
```env
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
# 修改为你本地的 PostgreSQL 账号和密码
DATABASE_URL=postgres://你的用户名:你的密码@localhost:5432/medusa-dtc-starter
DB_NAME=medusa-backend
```

#### 2. 前台配置（`apps/storefront`）
在 `apps/storefront/` 目录下，确保有名为 `.env.local` 的文件：
```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_3e6fa46797407acb240de22567d4849955f6bb8e94aed546913f531c6cc44da4
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_DEFAULT_REGION=dk
NEXT_PUBLIC_BASE_URL=https://localhost:8000
NODE_ENV=development
```

---

### 🚀 第四步：初始化数据库与启动项目

在**根目录**下，按顺序执行以下命令：

#### 1. 执行数据库迁移（生成基础表结构）
```bash
pnpm --filter @dtc/backend exec medusa db:migrate
```

#### 2. 执行数据填充（初始化默认商品、默认销售渠道、默认 6 个 coupons 优惠券数据等）
```bash
pnpm --filter @dtc/backend exec medusa db:seed
```

#### 3. 启动开发服务器（前台 + 后台并发启动）
```bash
pnpm dev
```
启动成功后：
- **前台地址 (Next.js Storefront)**: `http://localhost:8000`
- **后台 API 及管理端 (Medusa Admin)**: `http://localhost:9000/app`（账号密码为你 seed 时配置的管理员账号，若为默认 seed 则是 `admin@medusa-test.com` / `supersecret`）

> **💡 温馨提示**：当你第一次启动前台并在浏览器点击任何商品的 `Buy Now` 时，后台会自动检测并在数据库中创建点击统计表（`affiliate_clicks`），无需手动跑 SQL 脚本。

---

## 📈 2. 运营与配置说明

后台启动后，你的同事可以在 Medusa Admin 管理端左侧侧栏看到新增的两个配置栏目：

### 🎫 1. Coupons（优惠券管理）
- **路径**：`http://localhost:9000/app/coupons`
- **功能**：点击 `Add Coupon` 或已有优惠券的 `Edit`，可以自由配置前台右侧展示的优惠卡片。
- **配置项**：
  - **Brand**：品牌名称（例如 `MERRELL`）
  - **Logo**：圆形图标文字（例如 `M`）
  - **Offer**：折扣力度（例如 `40% OFF`）
  - **Code**：折扣码（例如 `EXTRA40`）
  - **Title**：描述文字（例如 `Extra 40% Off Sale Items...`）
  - **Redemptions**：使用次数
  - **Color**：十六进制色值（例如 `#f58220`）

---

### 🔗 2. Affiliate（推广链接管理与数据报表）
- **路径**：`http://localhost:9000/app/affiliate-dashboard`

#### 📊 Stats（点击统计报表）
- 支持 `7d` / `30d` / `90d` 范围切换。
- **核心指标**：总点击量、发生点击的独立商品数、独立访客（按 IP 去重）。
- **时间线趋势**：点击量随时间的柱状图趋势。
- **维度分析**：
  - 点击来源占比（Lazada, Shopee, AliExpress, TikTok, Shein, Trip）
  - 用户点击设备占比（Web, Mobile, Tablet）
  - 访客国家来源占比
  - 最热点击商品 Top 20 榜单
- **实时流水**：最近 50 条点击日志（商品、来源平台、设备、国家、点击时间）。

#### ⚙️ Links（配置各平台推广链接）
- 列出了系统内所有的商品。
- 点击对应商品右侧的 `Edit` 按钮。
- 直接粘贴对应的推广地址（Lazada / Aliexpress / TikTok / Shopee / Trip / Shein）。
- 点击 `Save` 保存。前台该商品的 `Buy Now` 按钮将会立即支持直接跳转并触发点击统计！

---

## ☁️ 3. 生产部署建议 (Vercel + Railway/Render)

若要部署到公网生产环境：

1. **数据库与 Redis 部署**：
   - 推荐使用 **Railway** 或 **Render** 一键部署托管的 **PostgreSQL** 和 **Redis** 服务。
   - 部署后将生产连接串配置给后端的 `DATABASE_URL` 和 `REDIS_URL`。

2. **后端 API 部署 (Node.js)**：
   - 可以部署到 **Railway** 或任何 VPS 服务上（执行 `pnpm --filter @dtc/backend build` 和 `pnpm --filter @dtc/backend start`）。
   - 配置正确的生产环境变量：`STORE_CORS` 为你的生产前台域名，`ADMIN_CORS` 为你的生产后台管理端域名。

3. **前台部署 (Next.js)**：
   - 推荐直接部署到 **Vercel**。
   - 导入该 Git 工程后，配置环境变量 `NEXT_PUBLIC_MEDUSA_BACKEND_URL` 指向你部署的生产后端 API 地址。
