# miaoshou-modify

妙手订单页面的小修小补，以油猴（Tampermonkey）脚本形式提供。

## 脚本

### `miaoshou-hide-print-status.user.js` — 妙手订单 UI 修补

1. 隐藏妙手订单表格中的「打印状态」列（不影响任何数据，纯视觉隐藏）。
2. 订单整行右侧的「处理」下拉（未处理/已处理）从最右端改为靠左对齐，
   避免表格出现横向滚动时被滚到可视区之外。

- 适用页面（已实测 DOM 结构）：`*://*.chengji-inc.com/*`，
  典型页面 `https://v2-xhs-od.chengji-inc.com/order/after_sale/index`（售后单）
- 隐藏列定位：表头 `th[prop="printExpress"]`，兜底匹配文字「打印状态」
- 下拉对齐：CSS 选择器 `#J_afs-table tr.order-header-tr .flex-1.justify-content-end:has(.process-tag-text)`
- 自动处理 Vue SPA 的动态重渲染（MutationObserver + rAF 节流）
- 订单整行（`tr.order-header-tr`）的 colspan 自动减 1，横幅仍撑满

## 发布 / 自动更新流程（重要）

油猴脚本通过 Tampermonkey 的自动更新读取本仓库 `main` 分支上的
`miaoshou-hide-print-status.user.js`（见脚本头部 `@downloadURL` / `@updateURL`）。

**每次改动本脚本后必须：**

1. 递增脚本头部 `@version`（语义化版本：修复 +patch，新功能 +minor）
2. 更新 `@description`（若改动了行为）
3. 提交并 `git push origin main`

否则 Tampermonkey 检测不到新版本，已安装的用户拿不到更新。

### 安装（Edge + Tampermonkey）

1. 打开 Tampermonkey 图标 →「管理面板」→ 右上角「+」新建脚本
2. 清空默认内容，粘贴 `miaoshou-hide-print-status.user.js` 全文，`Ctrl+S` 保存
   （或直接访问 `https://raw.githubusercontent.com/mufeng510/miaoshou-modify/main/miaoshou-hide-print-status.user.js` 安装，从此自动更新）
3. 刷新妙手页面即可生效（列消失 + 下拉靠左即为成功）

### 验证

- 页面表格中「打印状态」列不再显示，其余列宽度正常
- 订单整行「处理」下拉出现在左侧内容之后，而不是最右边缘
- 搜索 / 翻页 / 切换筛选后，新加载的行同样没有该列

### 移除

Tampermonkey 管理面板中删除该脚本并刷新页面即可恢复。
