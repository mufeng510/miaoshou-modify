// ==UserScript==
// @name         妙手订单 - 隐藏「打印状态」列
// @namespace    miaoshou-modify
// @version      1.2.0
// @description  妙手订单：隐藏「打印状态」列；订单整行「处理」下拉改为 position:sticky 贴可视区右缘，横向滚动也始终可点
// @author       dev-lead
// @match        *://*.chengji-inc.com/*
// @downloadURL  https://raw.githubusercontent.com/mufeng510/miaoshou-modify/main/miaoshou-hide-print-status.user.js
// @updateURL    https://raw.githubusercontent.com/mufeng510/miaoshou-modify/main/miaoshou-hide-print-status.user.js
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==

/*
 * 适用页面（已实测）：
 *   https://v2-xhs-od.chengji-inc.com/order/after_sale/index （妙手订单 - 售后单）
 *
 * 实现思路：
 *   1. 找到表头「打印状态」所在列：优先按 <th prop="printExpress"> 定位，
 *      找不到时退化为匹配表头文字「打印状态」。
 *   2. 给该表头、以及同列的所有 body 单元格加上 display:none 样式类。
 *   3. 订单整行（.order-header-tr，td 带 colspan）不占用真实列，只把 colspan 减 1，
 *      保证整行横幅仍撑满宽度。
 *   4. 页面是 Vue SPA，搜索/翻页/筛选会重建 tbody，用 MutationObserver
 *      + requestAnimationFrame 节流重新扫描，新增的行也会被隐藏。
 *   5. 订单整行右侧的「处理」下拉（未处理/已处理）原靠右对齐，表格出现横向
 *      滚动时会不可见。现改为 position:sticky 贴可视区右缘（参考页面「操作」
 *      固定列的实现：sticky + right:0 + z-index:1 + 不透明背景），无论滚动到
 *      何处都始终可见、可点；背景色 rgb(220,239,255) 贴合订单整行的浅蓝底色。
 *
 * 只调样式、不改任何数据，不发起任何网络请求，不点击任何按钮。
 */
(function () {
  'use strict';

  const HIDE_CLASS = 'ms-userscript-hide-print-col';
  const COL_PROP = 'printExpress';
  const COL_TEXT = '打印状态';

  const style = document.createElement('style');
  style.textContent = `
    .${HIDE_CLASS} { display: none !important; }
    /* 订单整行「处理」下拉：贴可视区右缘，滚动时始终可见可点 */
    #J_afs-table tr.order-header-tr .flex-1.justify-content-end > .el-dropdown.pro-dropdown {
      position: sticky;
      right: 0;
      z-index: 1;
      background: rgb(220, 239, 255); /* 贴合订单整行浅蓝底色 rgb(220,239,255) */
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  const compact = (s) => (s || '').replace(/\s+/g, '');

  function locatePrintColumn(table) {
    const ths = Array.from(table.querySelectorAll('thead th'));
    if (ths.length === 0) return null;
    for (let i = 0; i < ths.length; i++) {
      if (ths[i].getAttribute('prop') === COL_PROP) {
        return { index: i, count: ths.length, header: ths[i] };
      }
    }
    for (let i = 0; i < ths.length; i++) {
      if (compact(ths[i].innerText).includes(COL_TEXT)) {
        return { index: i, count: ths.length, header: ths[i] };
      }
    }
    return null;
  }

  function processTable(table) {
    const located = locatePrintColumn(table);
    if (!located) return;
    const { index, count } = located;

    // 1) 表头
    const ths = table.querySelectorAll('thead th');
    if (ths[index]) ths[index].classList.add(HIDE_CLASS);

    // 2) 表体每一行
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const cells = Array.from(tr.children).filter(
        (el) => el.tagName === 'TD' || el.tagName === 'TH'
      );

      if (cells.length === count && count > 1) {
        // 普通数据行：按列位置隐藏
        cells[index].classList.add(HIDE_CLASS);
        return;
      }

      // 整行横幅（如 .order-header-tr）：没有真实列，把 colspan 减 1
      cells.forEach((td) => {
        const span = parseInt(td.getAttribute('colspan') || '1', 10);
        if (span > 1) {
          if (td.dataset.msOrigColspan === undefined) {
            td.dataset.msOrigColspan = String(span); // 记录原始值，保证重复扫描幂等
          }
          const orig = parseInt(td.dataset.msOrigColspan, 10);
          td.setAttribute('colspan', String(Math.max(1, orig - 1)));
        }
      });
    });
  }

  function scan() {
    document.querySelectorAll('table').forEach(processTable);
  }

  scan();

  // 3) 监听 Vue 动态渲染（搜索、分页、筛选、展开等）
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
