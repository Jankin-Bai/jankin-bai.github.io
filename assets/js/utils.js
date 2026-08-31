/**
 * 公共工具模块 [frontend: 消除重复代码, 技术债清理]
 *
 * 提供全站通用的工具函数，避免在 app.js / post.js / render.js 中重复实现。
 * 挂载到 window.SiteUtils，所有页面脚本可直接使用。
 */
(function() {
  'use strict';

  /* ---------- Debug 日志控制 ---------- */
  const DEBUG = false; // 生产环境设为 false，开发时设为 true
  function log(...args) {
    if (DEBUG) console.log('[Site]', ...args);
  }
  function warn(...args) {
    if (DEBUG) console.warn('[Site]', ...args);
  }

  /* ---------- XSS 转义（全站统一） ---------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- Widgets 加载（全站统一） ---------- */
  async function loadWidgets() {
    try {
      const resp = await fetch('widgets/index.json');
      if (!resp.ok) return [];
      const data = await resp.json();
      const list = data.widgets || [];
      const widgets = [];
      for (const w of list) {
        try {
          const [metaResp, contentResp] = await Promise.all([
            fetch('widgets/' + w.id + '/meta.json'),
            fetch('widgets/' + w.id + '/content.html')
          ]);
          if (!metaResp.ok || !contentResp.ok) continue;
          const meta = await metaResp.json();
          const html = await contentResp.text();
          if (meta.enabled === false) continue;
          widgets.push({
            id: w.id,
            meta: meta,
            html: html,
            position: meta.position || w.position || 'sidebar-top',
            order: meta.order || w.order || 99
          });
        } catch (e) {
          warn('加载 widget 失败:', w.id, e);
        }
      }
      widgets.sort((a, b) => a.order - b.order);
      return widgets;
    } catch (e) {
      warn('widgets/index.json 加载失败，跳过 widgets:', e);
      return [];
    }
  }

  /* ---------- 渲染 widgets 到容器 ---------- */
  function renderWidgets(widgets, position) {
    const target = document.getElementById('widgets-' + position);
    if (!target) return;
    const matched = widgets.filter(w => w.position === position);
    if (matched.length === 0) {
      target.hidden = true;
      return;
    }
    target.hidden = false;
    target.innerHTML = matched.map(w => `
      <div class="widget widget-${escapeHtml(w.id)}" data-position="${escapeHtml(w.position)}">
        ${w.meta.title ? `<h3 class="widget-title">${escapeHtml(w.meta.title)}</h3>` : ''}
        <div class="widget-content">${w.html}</div>
      </div>
    `).join('');
  }

  /* ---------- URL 参数解析 ---------- */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }

  // 挂载到全局
  window.SiteUtils = {
    escapeHtml,
    loadWidgets,
    renderWidgets,
    getUrlParams,
    log,
    warn,
    DEBUG
  };
})();
