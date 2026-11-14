# miaoshou-modify

妙手订单页面的小修小补，以油猴（Tampermonkey）脚本形式提供。

## 脚本

### `miaoshou-hide-print-status.user.js` — 隐藏「打印状态」列

隐藏妙手订单表格中的「打印状态」列（不影响任何数据，纯视觉隐藏）。

- 适用页面（已实测 DOM 结构）：`*://*.chengji-inc.com/*`，
  典型页面 `https://v2-xhs-od.chengji-inc.com/order/after_sale/index`（售后单）
- 定位方式：表头 `th[prop="printExpress"]`，兜底匹配文字「打印状态」
- 自动处理 Vue SPA 的动态重渲染（MutationObserver + rAF 节流）
- 订单整行（`tr.order-header-tr`）的 colspan 自动减 1，横幅仍撑满

### 安装（Edge + Tampermonkey）

1. 打开 Tampermonkey 图标 →「管理面板」→ 右上角「+」新建脚本
2. 清空默认内容，粘贴 `miaoshou-hide-print-status.user.js` 全文，`Ctrl+S` 保存
3. 刷新妙手页面即可生效（列消失即为成功）

### 验证

- 页面表格中「打印状态」列不再显示，其余列宽度正常
- 搜索 / 翻页 / 切换筛选后，新加载的行同样没有该列

### 移除

Tampermonkey 管理面板中删除该脚本并刷新页面即可恢复。
