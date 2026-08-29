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
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* 全局文章列表（用于标签计数和上下篇导航）—— 使用 DataLoader 自动发现，不依赖 index.json */
  let allPosts = [];
  async function loadAllPosts() {
    try {
      if (typeof DataLoader === 'undefined') {
        allPosts = [];
        return;
      }
      await DataLoader.init();
      allPosts = DataLoader.getPosts() || [];
    } catch (e) {
      console.warn('加载文章列表失败:', e.message);
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

  // 加载配置（用于维度信息）
  let config;
  try {
    config = await (await fetch('data/config.json')).json();
  } catch (e) {
    config = { dimensions: [], site: {} };
  }
  const dims = config.dimensions || [];

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
    <span class="post-date-ganzhi">${esc(gz.short)}（${esc(gz.zodiac)}年）</span>
    ${meta.milestone ? '<span class="milestone-badge">★ 里程碑</span>' : ''}
  `;

  $('post-tags').innerHTML = meta.tags.map(tid => {
    const dim = dims.find(x => x.id === tid);
    return dim ? `<a href="index.html?dim=${esc(tid)}" class="tag" style="--tag-color:${esc(dim.color)};--tag-bg:${esc(dim.colorLight)};">
      <span class="tag-icon" aria-hidden="true">${esc(dim.icon)}</span>${esc(dim.name)}</a>` : `<span class="tag">${esc(tid)}</span>`;
  }).join('');

  /* ---------- 先加载文章列表（用于标签计数，必须在标签渲染之前） ---------- */
  await loadAllPosts();

  /* ---------- 侧栏标签导航 ---------- */
  const tagNav = $('post-tag-nav');
  if (tagNav) {
    tagNav.innerHTML = dims.filter(d => d.active).map(d => {
      const isActive = meta.tags.includes(d.id);
      return `<a href="index.html?dim=${esc(d.id)}" class="post-tag-nav-item${isActive ? ' active' : ''}"
              style="--tag-color:${esc(dim.color)};">
        <span aria-hidden="true">${esc(d.icon)}</span>
        <span>${esc(d.name)}</span>
        <span class="tag-count">${posts_count(d.id)}</span>
      </a>`;
    }).join('');
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
      const blockMathPlaceholders = [];
      mdText = mdText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        const idx = blockMathPlaceholders.length;
        blockMathPlaceholders.push(formula);
        return `@@BLOCKMATH_${idx}@@`;
      });

      marked.setOptions({ gfm: true, breaks: false });
      content = marked.parse(mdText);

      // 恢复块级公式
      blockMathPlaceholders.forEach((formula, idx) => {
        content = content.replace(`@@BLOCKMATH_${idx}@@`, `$$${formula}$$`);
      });

      // 后处理：把 mermaid 代码块转换为 div.mermaid
      content = content.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
      );
    } else {
      content = await DataLoader.getPostContent(postId);
    }

    $('post-content').innerHTML = content;

    // 给所有图片添加 referrerpolicy="no-referrer"
    $('post-content').querySelectorAll('img').forEach(img => {
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.addEventListener('error', function() {
        this.style.opacity = '0.3';
        this.style.border = '1px dashed var(--color-border)';
      });
    });

    // 按需加载 KaTeX（同时检测行内公式和块级公式）
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
      } catch (e) { console.warn('KaTeX 加载失败:', e.message); }
    }

    // 按需加载 Mermaid
    if (content.includes('class="mermaid"')) {
      try {
        await loadScript('assets/js/vendor/mermaid.min.js');
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        await mermaid.run({ querySelector: '.mermaid' });
      } catch (e) { console.warn('Mermaid 加载失败:', e.message); }
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

    const headings = contentEl.querySelectorAll('h1, h2, h3, h4');
    if (headings.length === 0) {
      tocEl.innerHTML = '<p class="post-toc-empty">本文暂无目录</p>';
      return;
    }

    let tocHTML = '';
    headings.forEach((heading, idx) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent.trim();
      const id = `heading-${idx}`;
      if (!heading.id) heading.id = id;
      tocHTML += `<a href="#${heading.id}" class="post-toc-item level-${level}" data-target="${heading.id}">
        ${esc(text)}
      </a>`;
    });
    tocEl.innerHTML = tocHTML;

    tocEl.querySelectorAll('.post-toc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', `#${targetId}`);
        }
      });
    });

    let ticking = false;
    function updateActiveTOC() {
      const scrollPos = window.scrollY + 100;
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
    updateActiveTOC();
  }

  // 相关链接
  if (meta.links && meta.links.length) {
    $('post-links').innerHTML = '<h3>相关链接</h3><ul>' +
      meta.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.text)} ↗</a></li>`).join('') + '</ul>';
  }

  // 上一篇/下一篇导航
  try {
    const sorted = (allPosts.length > 0 ? allPosts : (DataLoader.getPosts() || []))
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sorted.length > 0) {
      const idx = sorted.findIndex(p => p.id === postId);
      const prev = sorted[idx + 1];
      const next = sorted[idx - 1];
      $('post-nav').innerHTML = `
        ${prev ? `<a href="post.html?id=${esc(prev.id)}" class="post-nav-prev">← ${esc(prev.title)}</a>` : '<span></span>'}
        <a href="index.html" class="post-nav-home">🏠 首页</a>
        ${next ? `<a href="post.html?id=${esc(next.id)}" class="post-nav-next">${esc(next.title)} →</a>` : '<span></span>'}
      `;
    }
  } catch (e) {
    console.warn('文章导航加载失败:', e.message);
  }

  /* ---------- Widgets ---------- */
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
            id: w.id, meta: meta, html: html,
            position: meta.position || w.position || 'sidebar-top',
            order: meta.order || w.order || 99
          });
        } catch (e) { console.warn('加载 widget 失败:', w.id, e); }
      }
      return widgets;
    } catch (e) { console.warn('widgets 加载失败:', e); return []; }
  }

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
    const widgets = await loadWidgets();
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
  renderWidgets();
})();
