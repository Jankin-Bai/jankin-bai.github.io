/**
 * 博文详情页：post.html?id=xxx
 * 加载 meta.json + content.html，支持主题切换面板
 *
 * 修复：
 *   - XSS 转义（meta.title, meta.summary 等）
 *   - 错误处理优化
 *   - 加载状态
 */
(async function() {
  'use strict';

  /* XSS 转义 */
  const esc = window.SiteUtils ? SiteUtils.escapeHtml : (s) => String(s || "");

  /* 全局文章列表（用于标签计数和上下篇导航）—— 使用 DataLoader 自动发现，不依赖 index.json */
  let allPosts = [];
  async function loadAllPosts() {
    try {
      // const 声明的全局变量不会成为 window 属性，直接用 typeof 检查
      if (typeof DataLoader === 'undefined') {
        allPosts = [];
        return;
      }
      await DataLoader.init();
      allPosts = DataLoader.getPosts() || [];
    } catch (e) {
      SiteUtils.warn && SiteUtils.warn('加载文章列表失败:', e.message);
      allPosts = [];
    }
  }
  function posts_count(tagId) {
    return allPosts.filter(p => p.tags && p.tags.includes(tagId)).length;
  }

  if (window.ThemeManager && typeof ThemeManager.init === 'function') {
    ThemeManager.init();
  }

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const $ = id => document.getElementById(id);

  if (!postId) {
    document.body.innerHTML = '<div style="padding:60px;text-align:center;"><h2>未指定博文</h2><p><a href="index.html">返回首页</a></p></div>';
    return;
  }

  // 加载元数据
  let meta;
  try {
    const res = await fetch(`posts/${esc(postId)}/meta.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    meta = await res.json();
  } catch (e) {
    document.body.innerHTML = `<div style="padding:60px;text-align:center;">
      <h2>博文不存在</h2><p>ID: ${esc(postId)}</p><p>${esc(e.message)}</p>
      <p><a href="index.html">返回首页</a></p></div>`;
    return;
  }

  // 如果博文指定了默认主题，且用户未手动选择过，则应用
  if (meta.theme && !localStorage.getItem('jankin-theme')) {
    if (window.ThemeManager && typeof ThemeManager.apply === 'function') {
      ThemeManager.apply(meta.theme);
    }
  }

  // 配置（仅用于站点标题，标签元数据由 DataLoader 自动发现）
  let config;
  try {
    config = await (await fetch('data/config.json')).json();
  } catch (e) {
    config = { site: {} };
  }
  let tags = []; // 标签列表，在 loadAllPosts 后自动发现

  // 渲染头部
  document.title = `${meta.title} - ${config.site?.title || 'Blog'}`;
  $('post-title').textContent = meta.title;

  const d = new Date(meta.date);
  const gz = Ganzhi.getFullGanzhi(meta.date, {
    showYear: true, showMonth: true, showDay: true,
    showHour: false, showZodiac: true
  });

  $('post-date').innerHTML = `
    <span class="post-date-gregorian">${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}</span>
    <!-- 修复：移除硬编码括号，CSS .post-date-ganzhi::before/::after 统一添加 [hci: 干支弱化] -->
    <span class="post-date-ganzhi">${esc(gz.short)} ${esc(gz.zodiac)}年</span>
    ${meta.milestone ? '<span class="milestone-badge">★ 里程碑</span>' : ''}
  `;

  /* ---------- 先加载文章列表和标签（必须在标签渲染之前） ---------- */
  await loadAllPosts();
  // 自动发现所有标签（从文章 meta.json 中收集）
  if (typeof DataLoader !== 'undefined' && typeof DataLoader.getAllTags === 'function') {
    tags = await DataLoader.getAllTags();
  }

  // 渲染文章标签：#全部 + 当前文章所属标签
  const allTagLink = `<a href="index.html" class="tag" style="--tag-color:var(--color-text-muted);--tag-bg:var(--color-surface-alt);">
    <span class="tag-icon" aria-hidden="true">#</span>全部</a>`;
  const articleTagLinks = meta.tags.map(tid => {
    const tag = tags.find(t => t.id === tid);
    return tag ? `<a href="index.html?tag=${esc(tid)}" class="tag" style="--tag-color:${esc(tag.color)};--tag-bg:${esc(tag.colorLight)};">
      <span class="tag-icon" aria-hidden="true">${esc(tag.icon)}</span>${esc(tag.name)}</a>` : `<a href="index.html?tag=${esc(tid)}" class="tag">#${esc(tid)}</a>`;
  }).join('');
  $('post-tags').innerHTML = allTagLink + articleTagLinks;

  /* ---------- 侧栏标签导航 ---------- */
  const tagNav = $('post-tag-nav');
  if (tagNav) {
    // #全部 链接（跳转到主页，显示所有文章）
    const allLink = `<a href="index.html" class="post-tag-nav-item" style="--tag-color:var(--color-text-muted);">
      <span aria-hidden="true">#</span><span>全部</span><span class="tag-count">${allPosts.length}</span></a>`;
    // 当前文章所属标签优先显示
    const currentTags = tags.filter(t => t.active && meta.tags.includes(t.id));
    const otherTags = tags.filter(t => t.active && !meta.tags.includes(t.id));
    const tagLinks = [...currentTags, ...otherTags].map(t => {
      const isActive = meta.tags.includes(t.id);
      return `<a href="index.html?tag=${esc(t.id)}" class="post-tag-nav-item${isActive ? ' active' : ''}"
              style="--tag-color:${esc(t.color)};">
        <span aria-hidden="true">${esc(t.icon)}</span>
        <span>${esc(t.name)}</span>
        <span class="tag-count">${posts_count(t.id)}</span>
      </a>`;
    }).join('');
    tagNav.innerHTML = allLink + tagLinks;
  }

  if (meta.summary) {
    $('post-summary').textContent = meta.summary;
  } else {
    $('post-summary').style.display = 'none';
  }

  if (meta.image) {
    $('post-image').innerHTML = `<img src="${esc(meta.image)}" alt="${esc(meta.title)}" referrerpolicy="no-referrer">`;
  }

  /* ---------- 动态加载工具函数 ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('脚本加载失败: ' + src));
      document.head.appendChild(script);
    });
  }
  function loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) { resolve(); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error('样式加载失败: ' + href));
      document.head.appendChild(link);
    });
  }

  /* ---------- 加载内容（支持 Markdown / HTML 双格式） ---------- */
  try {
    const format = meta.format || 'html';
    let content;

    if (format === 'markdown') {
      await loadScript('assets/js/vendor/marked.min.js');
      const mdResp = await fetch(`posts/${esc(postId)}/content.md`);
      if (!mdResp.ok) throw new Error('content.md 加载失败: HTTP ' + mdResp.status);
      let mdText = await mdResp.text();

      // 【关键修复】保护块级公式 $$...$$，避免 marked.js 把它们拆分成多个 <p> 段落
      // 块级公式可能跨越多行，用非贪婪匹配捕获，替换为占位符
      const blockMathPlaceholders = [];
      mdText = mdText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        const idx = blockMathPlaceholders.length;
        blockMathPlaceholders.push(formula);
        return `@@BLOCKMATH_${idx}@@`;
      });

      // 配置 marked.js（v11 API）
      // 注意：breaks 设为 false，避免换行符被转成 <br> 影响公式和表格
      marked.setOptions({ gfm: true, breaks: false });

      // 解析 Markdown
      content = marked.parse(mdText);

      // 恢复块级公式：把占位符替换回 $$...$$
      blockMathPlaceholders.forEach((formula, idx) => {
        content = content.replace(`@@BLOCKMATH_${idx}@@`, `$$${formula}$$`);
      });

      // 后处理：把 mermaid 代码块转换为 div.mermaid
      content = content.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
      );

    } else {
      const htmlRes = await fetch(`posts/${postId}/content.html?t=${Date.now()}`);
      content = await htmlRes.text();
    }

    $('post-content').innerHTML = content;

    // HTML格式文章：手动执行插入的script标签（innerHTML不会自动执行script，导致Canvas动画不初始化）
    if (format === 'html') {
      const pc = $('post-content');
      const oldScripts = pc.querySelectorAll('script');
      oldScripts.forEach(oldSc => {
        const newSc = document.createElement('script');
        if (oldSc.src) { newSc.src = oldSc.src; } else { newSc.textContent = oldSc.textContent; }
        Array.from(oldSc.attributes).forEach(a => { if (a.name !== 'src') newSc.setAttribute(a.name, a.value); });
        oldSc.parentNode.replaceChild(newSc, oldSc);
      });
      // 重新创建style标签，确保CSS变量正确继承页面主题（innerHTML插入的style中部分CSS变量继承异常）
      const oldStyles = pc.querySelectorAll('style');
      oldStyles.forEach(oldSt => {
        const newSt = document.createElement('style');
        newSt.textContent = oldSt.textContent;
        Array.from(oldSt.attributes).forEach(a => newSt.setAttribute(a.name, a.value));
        oldSt.parentNode.replaceChild(newSt, oldSt);
      });
    }

    // 给所有图片添加 referrerpolicy="no-referrer"，绕过 CSDN 等防盗链
    $('post-content').querySelectorAll('img').forEach(img => {
      img.setAttribute('referrerpolicy', 'no-referrer');
      // 图片加载失败时显示占位
      img.addEventListener('error', function() {
        this.style.opacity = '0.3';
        this.style.border = '1px dashed var(--color-border)';
      });
    });

    // 按需加载 KaTeX（同时检测行内公式 $...$ 和块级公式 $$...$$）
    if (format === 'markdown' && (/\$[^$]+\$/.test(content) || /\$\$[\s\S]*?\$\$/.test(content))) {
      try {
        await loadStyle('assets/css/vendor/katex.min.css');
        await loadScript('assets/js/vendor/katex.min.js');
        await loadScript('assets/js/vendor/auto-render.min.js');
        renderMathInElement($('post-content'), {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        });
      } catch (e) { SiteUtils.warn && SiteUtils.warn('KaTeX 加载失败:', e.message); }
    }

    // 按需加载 Mermaid
    if (content.includes('class="mermaid"')) {
      try {
        await loadScript('assets/js/vendor/mermaid.min.js');
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        await mermaid.run({ querySelector: '.mermaid' });
      } catch (e) { SiteUtils.warn && SiteUtils.warn('Mermaid 加载失败:', e.message); }
    }

    generateTOC();
  } catch (e) {
    $('post-content').innerHTML = `<div class="content-error"><p>内容加载失败：${esc(e.message)}</p></div>`;
    const toc = $('post-toc');
    if (toc) toc.innerHTML = '<p class="post-toc-empty">暂无目录</p>';
  }

  /* ---------- 文章目录 TOC 生成 ---------- */
  function generateTOC() {
    const tocEl = $('post-toc');
    const contentEl = $('post-content');
    if (!tocEl || !contentEl) return;

    // 扫描 h1-h4 标题（Markdown 文章可能有 h1-h4）
    const headings = contentEl.querySelectorAll('h1, h2, h3, h4');
    if (headings.length === 0) {
      tocEl.innerHTML = '<p class="post-toc-empty">本文暂无目录</p>';
      return;
    }

    let tocHTML = '';
    headings.forEach((heading, idx) => {
      const level = heading.tagName.toLowerCase(); // h2 or h3
      const text = heading.textContent.trim();
      const id = `heading-${idx}`;
      // 给标题添加 id（如果没有的话）
      if (!heading.id) heading.id = id;

      tocHTML += `<a href="#${heading.id}" class="post-toc-item level-${level}" data-target="${heading.id}">
        ${esc(text)}
      </a>`;
    });
    tocEl.innerHTML = tocHTML;

    // 目录点击平滑滚动
    tocEl.querySelectorAll('.post-toc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // 更新 URL hash（不触发滚动）
          history.replaceState(null, '', `#${targetId}`);
        }
      });
    });

    // 滚动时高亮当前段落
    let ticking = false;
    function updateActiveTOC() {
      const scrollPos = window.scrollY + 100; // 偏移量
      let currentId = null;
      headings.forEach(heading => {
        if (heading.offsetTop <= scrollPos) {
          currentId = heading.id;
        }
      });
      tocEl.querySelectorAll('.post-toc-item').forEach(item => {
        item.classList.toggle('active', item.dataset.target === currentId);
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateActiveTOC);
        ticking = true;
      }
    }, { passive: true });
    // 初始化一次
    updateActiveTOC();
  }

  // 相关链接
  if (meta.links && meta.links.length) {
    $('post-links').innerHTML = '<h3>相关链接</h3><ul>' +
      meta.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.text)} ↗</a></li>`).join('') + '</ul>';
  }

  // 上一篇/下一篇导航（使用 DataLoader 自动发现的文章列表，不依赖 index.json）
  try {
    const sorted = (allPosts.length > 0 ? allPosts : (DataLoader.getPosts() || []))
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sorted.length > 0) {
      const idx = sorted.findIndex(p => p.id === postId);
      const prev = sorted[idx + 1]; // 更早的
      const next = sorted[idx - 1]; // 更新的
      $('post-nav').innerHTML = `
        ${prev ? `<a href="post.html?id=${esc(prev.id)}" class="post-nav-prev">← ${esc(prev.title)}</a>` : '<span></span>'}
        <a href="index.html" class="post-nav-home">🏠 首页</a>
        ${next ? `<a href="post.html?id=${esc(next.id)}" class="post-nav-next">${esc(next.title)} →</a>` : '<span></span>'}
      `;
    }
  } catch (e) {
    // 导航可选，失败不影响
    SiteUtils.warn && SiteUtils.warn('文章导航加载失败:', e.message);
  }

  /* Widgets 加载使用公共工具 SiteUtils.loadWidgets() */

  function renderWidget(w) {
    const type = w.meta.type || 'custom';
    const dismissible = w.meta.dismissible === true;
    if (dismissible && localStorage.getItem('jankin-widget-dismissed-' + w.id) === '1') return '';
    const typeLabel = type === 'ad' ? '<span class="widget-type-label">广告</span>' : '';
    const closeBtn = dismissible
      ? `<button class="widget-close" type="button" aria-label="关闭" data-widget-id="${esc(w.id)}">&times;</button>` : '';
    const titleHtml = w.meta.title
      ? `<div class="widget-title">${esc(w.meta.title)}${typeLabel}${closeBtn}</div>`
      : (typeLabel ? `<div class="widget-title">${typeLabel}${closeBtn}</div>` : '');
    return `<div class="widget widget-${esc(type)}" data-widget-id="${esc(w.id)}">${titleHtml}<div class="widget-body">${w.html}</div></div>`;
  }

  async function renderWidgets() {
    const widgets = await SiteUtils.loadWidgets();
    ['top', 'bottom'].forEach(pos => {
      const container = document.getElementById('widgets-' + pos);
      if (!container) return;
      const list = widgets.filter(w => w.position === 'sidebar-' + pos).sort((a, b) => a.order - b.order);
      container.innerHTML = list.map(renderWidget).join('');
      container.hidden = list.length === 0;
      container.querySelectorAll('.widget-close').forEach(btn => {
        btn.addEventListener('click', () => {
          localStorage.setItem('jankin-widget-dismissed-' + btn.dataset.widgetId, '1');
          const widget = btn.closest('.widget');
          if (widget) widget.style.display = 'none';
        });
      });
    });
  }
  await renderWidgets();

  /* ---------- 苹果级滚动淡入：所有内容渲染完成后初始化 ---------- */
  initRevealAnimations();

  /* ---------- 修复：复制链接按钮 [hci: 消除附加任务] ---------- */
  const copyBtn = $('copy-link-btn');
  const copyText = $('copy-link-text');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (copyText) {
          copyText.textContent = '已复制!';
          setTimeout(() => { copyText.textContent = '复制链接'; }, 2000);
        }
      } catch (e) {
        // 降级方案：创建临时 input
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); } catch (e2) {}
        document.body.removeChild(input);
        if (copyText) {
          copyText.textContent = '已复制!';
          setTimeout(() => { copyText.textContent = '复制链接'; }, 2000);
        }
      }
    });
  }

  /* ---------- 修复：打印按钮 ---------- */
  const printBtn = $('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  /* ---------- 苹果级滚动淡入动画 [frontend: IntersectionObserver] ---------- */
  function initRevealAnimations() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.post-header, .post-content > *, .post-nav, .post-image, .post-links').forEach(function(el) {
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
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    // 文章头部: 标题→元信息→标签→摘要, 依次淡入
    var headerItems = document.querySelectorAll('.post-title, .post-meta, .post-tags, .post-summary');
    headerItems.forEach(function(el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (i * 100) + 'ms');
      observer.observe(el);
    });

    // 文章图片
    var postImage = document.querySelector('.post-image');
    if (postImage) {
      postImage.classList.add('reveal');
      postImage.style.setProperty('--reveal-delay', '150ms');
      observer.observe(postImage);
    }

    // 正文每个子元素: 段落、标题、代码块等, 依次淡入
    var contentItems = document.querySelectorAll('.post-content > *');
    contentItems.forEach(function(el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min(i * 40, 300) + 'ms');
      observer.observe(el);
    });

    // 文章导航
    var postNav = document.querySelector('.post-nav');
    if (postNav) {
      postNav.classList.add('reveal');
      postNav.style.setProperty('--reveal-delay', '100ms');
      observer.observe(postNav);
    }
  }


  /* ---------- 手机端：文章侧栏折叠切换 ---------- */
  var postSidebarToggle = document.querySelector('.post-sidebar .sidebar-toggle-btn');
  var postSidebarContent = document.getElementById('post-sidebar-content');
  if (postSidebarToggle && postSidebarContent) {
    postSidebarToggle.addEventListener('click', function() {
      var isOpen = postSidebarContent.classList.toggle('open');
      postSidebarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ---------- 手机端：TOC 浮动按钮 + 模态框 ---------- */
  var tocFab = document.getElementById('tocFab');
  var tocModal = document.getElementById('tocModal');
  var tocModalClose = document.getElementById('tocModalClose');
  var tocModalList = document.getElementById('tocModalList');
  var postToc = document.getElementById('post-toc');

  if (tocFab && tocModal && postToc) {
    // 有目录时显示浮动按钮
    var tocLinks = postToc.querySelectorAll('a');
    if (tocLinks.length > 0) {
      tocFab.hidden = false;
      // 复制目录到模态框
      tocModalList.innerHTML = postToc.innerHTML;
      // 模态框内点击链接后关闭
      tocModalList.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          tocModal.classList.remove('open');
          tocModal.hidden = true;
        }
      });
    }

    tocFab.addEventListener('click', function() {
      tocModal.hidden = false;
      requestAnimationFrame(function() {
        tocModal.classList.add('open');
      });
    });

    function closeTocModal() {
      tocModal.classList.remove('open');
      setTimeout(function() { tocModal.hidden = true; }, 300);
    }
    if (tocModalClose) tocModalClose.addEventListener('click', closeTocModal);
    tocModal.addEventListener('click', function(e) {
      if (e.target === tocModal) closeTocModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && tocModal.classList.contains('open')) closeTocModal();
    });
  }

  /* ---------- 手机端：搜索框同步 ---------- */
  var mobileSearchPost = document.getElementById('mobile-search-input');
  var desktopSearchPost = document.getElementById('search-input');
  if (mobileSearchPost && desktopSearchPost) {
    mobileSearchPost.addEventListener('input', function() {
      desktopSearchPost.value = mobileSearchPost.value;
    });
  }

})();
