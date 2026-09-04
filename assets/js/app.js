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

  let config, posts, tags = [];
  const $ = id => document.getElementById(id);

  /* ---------- XSS 转义（使用公共工具） ---------- */
  const escapeHtml = window.SiteUtils ? SiteUtils.escapeHtml : (s) => String(s || '');

  /* ---------- 加载状态：扫描进度 [frontend: 感知性能, hci: 反馈] ---------- */
  function showProgress(year, percent) {
    const area = $('content-area');
    if (!area) return;
    let bar = area.querySelector('.loading-progress');
    if (!bar) {
      area.innerHTML = `
        <div class="loading-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
          <div class="progress-text">发现文章中，请稍候</div>
        </div>`;
      bar = area.querySelector('.loading-progress');
    }
    bar.querySelector('.progress-fill').style.width = percent + '%';
  }
  function hideLoading() {
    const area = $('content-area');
    if (area) area.innerHTML = '';
  }

  /* ---------- 数据加载 ---------- */
  // 先注册进度事件监听器（必须在 init() 之前，否则收不到事件）
  document.addEventListener('discover-start', () => {
    showProgress('', 5);
  });
  document.addEventListener('discover-progress', (e) => {
    showProgress(e.detail.year, e.detail.percent);
  });
  document.addEventListener('discover-complete', () => {
    hideLoading();  // 只隐藏加载状态，渲染由 init() 返回后统一处理 [frontend: 避免重复渲染]
  });

  // 有缓存时不显示加载状态；无缓存时显示动态扫描进度动画 [hci: 反馈即时性]
  if (!DataLoader.hasValidCache()) {
    showProgress('准备中', 2);  // 初始进度，等待 discover-start
  }

  // 分页显示：每次渲染 PAGE_SIZE 篇，滚动到底部加载更多
  const PAGE_SIZE = 5;
  let displayCount = PAGE_SIZE;
  let allPostsLoaded = false; // 全量扫描是否完成

  try {
    // 有缓存 → 直接用缓存（全量数据）
    if (DataLoader.hasValidCache()) {
      const data = await DataLoader.init();
      config = data.config;
      posts = data.posts;
      tags = data.tags || [];
      allPostsLoaded = true;
    } else {
      // 无缓存 → 先快速加载最新5篇，立即渲染
      config = await (await fetch('data/config.json')).json();
      posts = await DataLoader.discoverQuick(PAGE_SIZE);
      allPostsLoaded = false;
      // 后台静默全量扫描（不阻塞首屏，用于搜索/筛选准确性）
      DataLoader.init(true).then(data => {
        posts = data.posts;
        tags = data.tags || [];
        allPostsLoaded = true;
        renderTagFilter();
        renderMain();
        SiteUtils.log && SiteUtils.log('✅ 后台全量扫描完成');
      }).catch(() => {});
    }
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
  /* ---------- 标签数据（必须在 renderMain 之前声明，let 不提升） [frontend: 修复变量声明顺序] ---------- */
  let curTag = 'all', keyword = '';

  /* ---------- URL 参数支持：index.html?tag=tech 直接筛选 ---------- */
  (function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tagParam = params.get('tag');
    if (tagParam) curTag = tagParam;
    const kwParam = params.get('q');
    if (kwParam) keyword = kwParam;
  })();

  hideLoading();
  renderMain();  // 首次加载完成后直接渲染

  /* ---------- 标签后台加载完成后更新筛选栏和时间线 ---------- */
  document.addEventListener('tags-loaded', (e) => {
    tags = e.detail.tags || [];
    renderTagFilter();
    renderMain();  // tags 加载完成后重新渲染，使用正确的标签颜色
  });

  /* ---------- 从 bfcache 恢复时重新渲染标签（解决文章页后退后标签消失） ---------- */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      SiteUtils.log && SiteUtils.log('从往返缓存恢复，重新渲染标签筛选');
      if (tags.length === 0 && typeof DataLoader !== 'undefined' && typeof DataLoader.getAllTags === 'function') {
        DataLoader.getAllTags().then(t => { tags = t; renderTagFilter(); renderMain(); }).catch(() => {});
      } else {
        renderTagFilter();
      }
    }
  });

  /* ---------- 主题初始化 ---------- */
  if (window.ThemeManager && typeof ThemeManager.init === 'function') {
    ThemeManager.init();
  }
  /* ---------- 顶栏滚动compact效果 ---------- */
  (function initHeaderCompact() {
    const header = document.querySelector('.site-header-row');
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        header.classList.add('compact');
      } else {
        header.classList.remove('compact');
      }
      lastScroll = scrollY;
    }, { passive: true });
  })();


  /* ---------- 站点信息渲染 ---------- */
  $('site-title').textContent = config.site.title;
  $('site-subtitle').textContent = config.site.subtitle;
  document.title = config.site.title;

  /* ---------- 标签筛选渲染（紧凑 #标签 链接） [ui-ux: 减少视觉噪音] ---------- */
  function renderTagFilter() {
    const allBtn = `<a href="#" class="tag-chip ${curTag === 'all' ? 'active' : ''}" data-tag="all"
                     aria-pressed="${curTag === 'all' ? 'true' : 'false'}">#全部 <span class="tag-chip-count">${posts.length}</span></a>`;
    const tagBtns = tags.map(t => `
      <a href="#" class="tag-chip ${curTag === t.id ? 'active' : ''}" data-tag="${escapeHtml(t.id)}"
         style="--tag-color:${escapeHtml(t.color)};--tag-bg:${escapeHtml(t.colorLight)};"
         aria-pressed="${curTag === t.id ? 'true' : 'false'}">#${escapeHtml(t.name)} <span class="tag-chip-count">${t.count}</span></a>`).join('');
    const html = allBtn + tagBtns;
    // 同时渲染到顶部（手机端）和侧栏（PC端）
    ['dimension-list', 'dimension-list-sidebar'].forEach(function(id) {
      const list = $(id);
      if (!list) return;
      list.innerHTML = html;
      list.querySelectorAll('.tag-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          curTag = btn.dataset.tag;
          applyTagTheme(curTag);
          displayCount = PAGE_SIZE;
          renderTagFilter();
          renderMain();
        });
      });
    });
  }

  /* ---------- 标签主题色应用 ---------- */
  function applyTagTheme(tagId) {
    if (tagId === 'all') {
      document.documentElement.style.setProperty('--theme-color', 'var(--color-primary)');
      return;
    }
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      document.documentElement.style.setProperty('--theme-color', tag.color);
    }
  }

  /* ---------- 筛选 ---------- */
  function getFiltered() {
    let r = posts;
    r = (!curTag || curTag === 'all') ? r : r.filter(p => p.tags.includes(curTag));
    r = DataLoader.filterBySearch(r, keyword);
    return r;
  }

  /* ---------- 主内容渲染（分页显示） ---------- */
  function renderMain() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, displayCount);
    const hasMore = displayCount < filtered.length;
    const area = $('content-area');
    if (area) {
      let html = Renderer.render(visible, tags, config);
      // 加载更多提示
      if (hasMore) {
        html += `<div class="load-more-hint" id="load-more-hint">
          <span>滚动加载更多（已显示 ${visible.length} / ${filtered.length}）</span>
        </div>`;
      } else if (!allPostsLoaded) {
        html += `<div class="load-more-hint" id="load-more-hint">
          <span>正在后台扫描更多文章...</span>
        </div>`;
      }
      area.innerHTML = html;
      // 立即检查是否需要加载更多
      triggerLoadMoreCheck();
    }
    const totalLabel = allPostsLoaded ? filtered.length : `${filtered.length}+`;
    $('stats').innerHTML = `共 <strong>${totalLabel}</strong> 条 · <strong>${tags.length}</strong> 标签`;
  }

  /* ---------- 无限滚动：滚动事件 + 位置检测（更稳定） ---------- */
  let loadMoreTicking = false;
  function checkLoadMore() {
    if (loadMoreTicking) return;
    loadMoreTicking = true;
    requestAnimationFrame(function() {
      loadMoreTicking = false;
      const hint = $('load-more-hint');
      if (!hint) return;
      const rect = hint.getBoundingClientRect();
      // 提示元素进入视口底部300px内时加载更多
      if (rect.top < window.innerHeight + 300) {
        const filtered = getFiltered();
        if (displayCount < filtered.length) {
          displayCount = Math.min(displayCount + PAGE_SIZE, filtered.length);
          renderMain();
        }
      }
    });
  }
  window.addEventListener('scroll', checkLoadMore, { passive: true });
  window.addEventListener('resize', checkLoadMore);
  // renderMain 后立即检查一次（防止提示元素一开始就在视口内）
  function triggerLoadMoreCheck() {
    setTimeout(checkLoadMore, 50);
  }

  /* ---------- 后台更新事件 ---------- */
  document.addEventListener('posts-updated', (e) => {
    SiteUtils.log && SiteUtils.log(`📡 博文列表已更新：${e.detail?.count || posts.length} 篇`);
    posts = DataLoader.getPosts();
    allPostsLoaded = true;
    renderTagFilter();
    renderMain();
  });

  /* ---------- 搜索事件 ---------- */
  const searchInput = $('search-input');
  const searchClear = $('search-clear');

  searchInput.addEventListener('input', e => {
    keyword = e.target.value;
    searchClear.hidden = !keyword;
    displayCount = PAGE_SIZE; // 搜索时重置分页
    renderMain();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    keyword = '';
    searchClear.hidden = true;
    searchInput.focus();
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
      // 延迟隐藏，等过渡动画完成
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
  /* ---------- 侧栏插槽渲染（广告位/公告位） ---------- */
  renderSidebarSlot();
  renderWidgets();

  /* ---------- 初始化 ---------- */
  renderTagFilter();
  updateBackToTop();
  initRevealAnimations();


  /* Widgets 加载使用公共工具 SiteUtils.loadWidgets() */

  function renderWidget(w) {
    const type = w.meta.type || 'custom';
    const dismissible = w.meta.dismissible === true;
    // 检查是否已被用户关闭
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
    const widgets = await SiteUtils.loadWidgets();
    const topContainer = $('widgets-top');
    const bottomContainer = $('widgets-bottom');
    if (!topContainer && !bottomContainer) return;

    const topWidgets = widgets.filter(w => w.position === 'sidebar-top').sort((a, b) => a.order - b.order);
    const bottomWidgets = widgets.filter(w => w.position === 'sidebar-bottom').sort((a, b) => a.order - b.order);

    if (topContainer) {
      topContainer.innerHTML = topWidgets.map(renderWidget).join('');
      topContainer.hidden = topWidgets.length === 0;
      // 绑定关闭按钮
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
    // 检查是否已被用户关闭（公告类型可关闭，关闭状态存 localStorage）
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
      ? cfg.html  // 自定义 HTML（受信任的管理员内容）
      : `<div class="sidebar-slot-content">${escapeHtml(cfg.content || '')}</div>`;
    slot.innerHTML = titleHtml + bodyHtml;
    // 绑定关闭按钮
    const closeBtn = slot.querySelector('.sidebar-slot-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        localStorage.setItem('jankin-slot-dismissed-' + (closeBtn.dataset.slotId || 'default'), '1');
        slot.hidden = true;
      });
    }
  }

  /* ---------- 苹果级滚动淡入动画 [frontend: IntersectionObserver] ---------- */
  function initRevealAnimations() {
    // 支持 IO 才启用, 不支持直接显示
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.timeline-card, .matrix-card, .year-header, .dimension-group').forEach(function(el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    // 给目标元素加 reveal 类并设置 stagger 延迟
    var groups = [
      { selector: '.year-header', delay: 0 },
      { selector: '.timeline-card', delay: 60 },
      { selector: '.matrix-card', delay: 50 },
      { selector: '.dimension-group', delay: 80 }
    ];

    groups.forEach(function(group) {
      var elements = document.querySelectorAll(group.selector);
      elements.forEach(function(el, index) {
        if (el.classList.contains('reveal')) return;
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', Math.min(index * group.delay, 400) + 'ms');
        observer.observe(el);
      });
    });
  }

  // 页面加载后初始化（等渲染完成）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initRevealAnimations, 100); });
  } else {
    setTimeout(initRevealAnimations, 100);
  }

  // 视图切换/筛选后重新初始化
  document.addEventListener('jankin-render-complete', initRevealAnimations);
  /* ---------- 手机端：搜索框与桌面端同步 ---------- */
  var mobileSearch = document.getElementById('mobile-search-input');
  var desktopSearch = document.getElementById('search-input');
  if (mobileSearch && desktopSearch) {
    mobileSearch.addEventListener('input', function() {
      desktopSearch.value = mobileSearch.value;
      desktopSearch.dispatchEvent(new Event('input'));
    });
    desktopSearch.addEventListener('input', function() {
      if (document.activeElement !== mobileSearch) {
        mobileSearch.value = desktopSearch.value;
      }
    });
  }

})();
