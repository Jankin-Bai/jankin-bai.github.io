/**
 * 首页：时间线
 * 修复内容：
 *   - 加载状态指示
 *   - 搜索清除按钮
 *   - aria-pressed 状态同步
 *   - back-to-top 用 class 控制显示
 *   - XSS 转义
 *   - 错误处理优化
 */
(async function() {
  'use strict';

  let config, posts;
  const $ = id => document.getElementById(id);

  /* ---------- XSS 转义工具 ---------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- 加载状态 ---------- */
  function showLoading() {
    const area = $('content-area');
    if (area) {
      area.innerHTML = '<div class="loading-state"><div class="loading-spinner" aria-hidden="true"></div><p>正在加载时间线...</p></div>';
    }
  }

  function hideLoading() {
    const area = $('content-area');
    if (area) area.innerHTML = '';
  }

  /* ---------- 数据加载 ---------- */
  showLoading();
  try {
    const data = await DataLoader.init();
    config = data.config;
    posts = data.posts;
  } catch (e) {
    const area = $('content-area');
    if (area) {
      area.innerHTML = `<div class="empty-state">
        <p>数据加载失败</p>
        <p class="empty-hint">${escapeHtml(e.message)}</p>
        <p class="empty-hint">请通过 HTTP 服务器访问（不能直接 file:// 打开），并确保 posts/ 目录下存在文章文件夹（posts/YYYY-NNN/meta.json）。</p>
      </div>`;
    }
    return;
  }
  hideLoading();

  /* ---------- 主题初始化 ---------- */
  if (window.ThemeManager && typeof ThemeManager.init === 'function') {
    ThemeManager.init();
  }

  /* ---------- 维度数据 ---------- */
  const dims = DataLoader.getActiveDimensions();
  let curDim = 'all', keyword = '', onlyMS = false;

  /* ---------- 站点信息渲染 ---------- */
  $('site-title').textContent = config.site.title;
  $('site-subtitle').textContent = config.site.subtitle;
  document.title = config.site.title;

  /* ---------- 维度列表渲染 ---------- */
  function renderDimList() {
    $('dimension-list').innerHTML = dims.map(d => `
      <button class="dim-item ${curDim === d.id ? 'active' : ''}" data-dim="${escapeHtml(d.id)}"
              style="--dim-color:${escapeHtml(d.color)};--dim-bg:${escapeHtml(d.colorLight)};"
              aria-pressed="${curDim === d.id ? 'true' : 'false'}">
        <span class="dim-icon" aria-hidden="true">${escapeHtml(d.icon)}</span>
        <span class="dim-name">${escapeHtml(d.name)}</span>
        <span class="dim-count">${posts.filter(p => p.tags.includes(d.id)).length}</span>
      </button>`).join('');

    $('dimension-list').querySelectorAll('.dim-item').forEach(btn => {
      btn.addEventListener('click', () => {
        curDim = btn.dataset.dim;
        applyDimTheme(curDim);
        renderDimList();
        renderMain();
      });
    });
  }

  /* ---------- 维度主题色应用 ---------- */
  function applyDimTheme(dimId) {
    if (dimId === 'all') {
      document.documentElement.style.setProperty('--theme-color', 'var(--color-primary)');
      return;
    }
    const dim = DataLoader.getDimensionById(dimId);
    if (dim) {
      document.documentElement.style.setProperty('--theme-color', dim.color);
    }
  }

  /* ---------- 筛选 ---------- */
  function getFiltered() {
    let r = posts;
    r = DataLoader.filterByDimension(r, curDim);
    r = DataLoader.filterBySearch(r, keyword);
    r = DataLoader.filterByMilestone(r, onlyMS);
    return r;
  }

  /* ---------- 主内容渲染 ---------- */
  function renderMain() {
    const filtered = getFiltered();
    const area = $('content-area');
    if (area) {
      area.innerHTML = Renderer.render(filtered, dims, config);
    }
    const ty = new Set(filtered.map(p => new Date(p.date).getFullYear())).size;
    $('stats').innerHTML = `共 <strong>${filtered.length}</strong> 条 · <strong>${ty}</strong> 年 · <strong>${dims.length}</strong> 标签`;
  }

  /* ---------- 工具栏按钮 aria 状态同步 ---------- */
  function setActiveButtons(selector, value) {
    document.querySelectorAll(selector).forEach(btn => {
      const active = btn.dataset.view === value;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  /* ---------- 后台更新事件 ---------- */
  document.addEventListener('posts-updated', (e) => {
    console.log(`📡 博文列表已更新：${e.detail?.count || posts.length} 篇`);
    posts = DataLoader.getPosts();
    renderDimList();
    renderMain();
  });

  /* ---------- 搜索事件 ---------- */
  const searchInput = $('search-input');
  const searchClear = $('search-clear');
  searchInput.addEventListener('input', e => {
    keyword = e.target.value;
    searchClear.hidden = !keyword;
    renderMain();
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    keyword = '';
    searchClear.hidden = true;
    searchInput.focus();
    renderMain();
  });

  /* ---------- 视图切换 ---------- */
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveButtons('.view-btn', btn.dataset.view);
      Renderer.setView(btn.dataset.view);
      renderMain();
    });
  });

  /* ---------- 里程碑切换 ---------- */
  $('milestone-toggle').addEventListener('change', e => {
    onlyMS = e.target.checked;
    renderMain();
  });

  /* ---------- 回到顶部 ---------- */
  const btt = $('back-to-top');
  function updateBackToTop() {
    const visible = window.scrollY > 300;
    btt.classList.toggle('visible', visible);
    if (visible) {
      btt.hidden = false;
    } else {
      setTimeout(() => {
        if (!btt.classList.contains('visible')) {
          btt.hidden = true;
        }
      }, 300);
    }
  }
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 标签列表折叠/展开 ---------- */
  const tagToggle = $('tag-toggle');
  const tagList = $('dimension-list');
  if (tagToggle && tagList) {
    tagToggle.addEventListener('click', () => {
      const expanded = tagToggle.getAttribute('aria-expanded') === 'true';
      tagToggle.setAttribute('aria-expanded', !expanded);
      tagList.classList.toggle('collapsed', expanded);
      tagToggle.querySelector('svg').style.transform = expanded ? 'rotate(-90deg)' : 'rotate(0)';
    });
  }

  /* ---------- 侧栏插槽渲染（广告位/公告位） ---------- */
  renderSidebarSlot();
  renderWidgets();

  /* ---------- 初始化 ---------- */
  renderDimList();
  Renderer.setView(config.timeline.defaultView);
  setActiveButtons('.view-btn', config.timeline.defaultView);
  renderMain();
  updateBackToTop();

  /* ---------- Widgets：文件夹式自定义内容（广告/公告/自定义HTML） ---------- */
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
          if (!meta.enabled) continue;
          widgets.push({
            id: w.id,
            meta: meta,
            html: html,
            position: meta.position || w.position || 'sidebar-top',
            order: meta.order || w.order || 99
          });
        } catch (e) {
          console.warn('加载 widget 失败:', w.id, e);
        }
      }
      return widgets;
    } catch (e) {
      console.warn('widgets/index.json 加载失败，跳过 widgets:', e);
      return [];
    }
  }

  function renderWidget(w) {
    const type = w.meta.type || 'custom';
    const dismissible = w.meta.dismissible === true;
    if (dismissible) {
      const dismissed = localStorage.getItem('jankin-widget-dismissed-' + w.id);
      if (dismissed === '1') return '';
    }
    const typeLabel = type === 'ad' ? '<span class="widget-type-label">广告</span>' : '';
    const closeBtn = dismissible
      ? `<button class="widget-close" type="button" aria-label="关闭" data-widget-id="${escapeHtml(w.id)}">&times;</button>`
      : '';
    const titleHtml = w.meta.title
      ? `<div class="widget-title">${escapeHtml(w.meta.title)}${typeLabel}${closeBtn}</div>`
      : (typeLabel ? `<div class="widget-title">${typeLabel}${closeBtn}</div>` : '');
    return `<div class="widget widget-${escapeHtml(type)}" data-widget-id="${escapeHtml(w.id)}">${titleHtml}<div class="widget-body">${w.html}</div></div>`;
  }

  async function renderWidgets() {
    const widgets = await loadWidgets();
    const topContainer = $('widgets-top');
    const bottomContainer = $('widgets-bottom');
    if (!topContainer && !bottomContainer) return;
    const topWidgets = widgets.filter(w => w.position === 'sidebar-top').sort((a, b) => a.order - b.order);
    const bottomWidgets = widgets.filter(w => w.position === 'sidebar-bottom').sort((a, b) => a.order - b.order);
    if (topContainer) {
      topContainer.innerHTML = topWidgets.map(renderWidget).join('');
      topContainer.hidden = topWidgets.length === 0;
      topContainer.querySelectorAll('.widget-close').forEach(btn => {
        btn.addEventListener('click', () => {
          localStorage.setItem('jankin-widget-dismissed-' + btn.dataset.widgetId, '1');
          const widget = btn.closest('.widget');
          if (widget) widget.style.display = 'none';
        });
      });
    }
    if (bottomContainer) {
      bottomContainer.innerHTML = bottomWidgets.map(renderWidget).join('');
      bottomContainer.hidden = bottomWidgets.length === 0;
      bottomContainer.querySelectorAll('.widget-close').forEach(btn => {
        btn.addEventListener('click', () => {
          localStorage.setItem('jankin-widget-dismissed-' + btn.dataset.widgetId, '1');
          const widget = btn.closest('.widget');
          if (widget) widget.style.display = 'none';
        });
      });
    }
  }

  /* ---------- 侧栏插槽：广告位/公告位/临时展示 ---------- */
  function renderSidebarSlot() {
    const slot = $('sidebar-slot');
    if (!slot) return;
    const cfg = config.sidebarSlot;
    if (!cfg || !cfg.enabled) {
      slot.hidden = true;
      return;
    }
    if (cfg.type === 'announcement' && cfg.dismissible !== false) {
      const dismissed = localStorage.getItem('jankin-slot-dismissed-' + (cfg.id || 'default'));
      if (dismissed === '1') {
        slot.hidden = true;
        return;
      }
    }
    slot.hidden = false;
    slot.className = 'sidebar-slot ' + (cfg.type || 'custom');
    const titleHtml = cfg.title ? `<div class="sidebar-slot-title">${escapeHtml(cfg.title)}${
      (cfg.type === 'announcement' && cfg.dismissible !== false)
        ? `<button class="sidebar-slot-close" type="button" aria-label="关闭" data-slot-id="${escapeHtml(cfg.id || 'default')}">&times;</button>`
        : ''
    }</div>` : '';
    const bodyHtml = cfg.html
      ? cfg.html
      : `<div class="sidebar-slot-content">${escapeHtml(cfg.content || '')}</div>`;
    slot.innerHTML = titleHtml + bodyHtml;
    const closeBtn = slot.querySelector('.sidebar-slot-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        localStorage.setItem('jankin-slot-dismissed-' + (closeBtn.dataset.slotId || 'default'), '1');
        slot.hidden = true;
      });
    }
  }
})();
