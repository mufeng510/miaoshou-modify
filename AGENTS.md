# AGENTS.md

妙手订单页面修补脚本集（油猴 / Tampermonkey）。

## 项目约定

- 只写油猴脚本，不做后端改动，不请求任何接口，不改任何服务器数据。
- **每次改动本脚本后必须递增 `@version` 并 `git push origin main`**（Tampermonkey 通过
  `@updateURL`/`@downloadURL` 从 GitHub raw 读取并自动更新；版本不升，用户拿不到更新）。
  由 Agent 改脚本时自动执行，不要等用户提醒。脚本 `@name` 保持稳定，不要改名。
- 生产环境页面（妙手 ERP）仅用于**只读**研究：不点击按钮、不提交表单、不做任何会改变数据的操作。
- 研究页面 DOM 用 `browse` 扩展（OpenCode Browse）的 **read-only session**（`session_new { readOnly: true }`），
  且必须由用户手动「借出」标签页后才能读取；结束后用户会收回标签页。
- 脚本里隐藏列一律通过 `class + display:none !important`，禁止用 `visibility` / `opacity` / 负 `width` 等会留空位的手段。
- 妙手是 Vue SPA：表格 `tbody` 会被重建，任何 DOM 修改都要配 MutationObserver 重新应用，且必须幂等（可重复扫描）。

## 关键页面结构（2026-11-13 实测，v2-xhs-od.chengji-inc.com/order/after_sale/index）

- 表格容器：`#J_afs-table table`（无 id/class 的 `<table>`）
- 表头：`thead th`，打印状态列为 `<th prop="printExpress" label="打印状态" width="140">`（第 8 列）
- 每条订单 = 一个 `<tbody>`，含两行：
  - `tr.order-header-tr > td[colspan=9]`（整行横幅）
  - `tr.order-body-tr`，9 个 `<td>` 与表头一一对应（打印状态为第 8 个，内容如「未打印」，无 class/data 属性）
- 全选框列在「商品信息」表头内，不要动它
- 订单整行「处理」下拉（.process-tag-text，位于
  `div.d-flex.flex-1.justify-content-end.flex-gap-20 > .el-dropdown.pro-dropdown`）
  原为靠右对齐且随滚动不可达；本脚本使其 `position:sticky; right:0` 贴可视区右缘，
  z-index:1、背景 rgb(220,239,255)（订单整行底色实测值），与「操作」固定列（sticky+right:0+不透明背景）同款
- 实测页面细节：`.order-header-tr` 背景 rgb(220,239,255)；`#J_afs-table` 为 overflow:auto 滚动容器；
  固定列背景：表头 TH rgb(245,247,250)、表体 TD rgb(255,255,255)（本页固定列无 class，class 为空）
