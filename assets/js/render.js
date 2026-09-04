/**
 * 时间线渲染（月分组）
 * 卡片点击跳转到 post.html?id=xxx
 *
 * 架构简化：去掉视图切换（时间线/标签），统一为时间线月分组
 * 里程碑保留为卡片标记（用户可通过自定义标签实现分类）
 */
const Renderer = (() => {
  /* XSS 转义：防止博文标题/摘要/标签中的恶意脚本 */
  const esc = window.SiteUtils ? SiteUtils.escapeHtml : (s) => String(s || "");

  function formatDate(dateStr, config) {
    const d = new Date(dateStr);
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'),
          day = String(d.getDate()).padStart(2, '0'), h = String(d.getHours()).padStart(2, '0'),
          min = String(d.getMinutes()).padStart(2, '0');
    const gz = Ganzhi.getFullGanzhi(dateStr, config.ganzhi);
    return `<span class="date-gregorian">${m}-${day} <span class="date-time">${h}:${min}</span></span>` +
           `<span class="date-ganzhi" title="干支纪日">${esc(gz.short)}</span>`;
  }

  function renderTags(post, tags) {
    return post.tags.map(tid => {
      const tag = tags.find(t => t.id === tid);
      return tag ? `<span class="tag" style="--tag-color:${esc(tag.color)};--tag-bg:${esc(tag.colorLight)};">
        <span class="tag-icon" aria-hidden="true">${esc(tag.icon)}</span>${esc(tag.name)}</span>` : '';
    }).join('');
  }

  function renderCard(post, tags, config) {
    // 防御：tags 未加载完成时使用默认值，避免 TypeError 中断渲染
    const tag = tags.find(t => post.tags.includes(t.id)) || tags[0] || { color: '#888', colorLight: '#f0f0f0', icon: '📄', name: '未分类' };
    const ms = post.milestone ? `<span class="milestone-inline" aria-label="里程碑"><span class="milestone-star">${esc(config.timeline.milestoneMarker)}</span>里程碑</span>` : '';
    const img = post.image ? `<div class="card-image"><img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy" referrerpolicy="no-referrer"></div>` : '';
    return `
      <article class="timeline-card" style="--dim-color:${esc(tag.color)};--dim-bg:${esc(tag.colorLight)};--dim-border:${esc(tag.color)};" data-id="${esc(post.id)}">
        <a href="post.html?id=${esc(post.id)}" class="card-link-overlay" aria-label="阅读：${esc(post.title)}"></a>
        <div class="card-dot" style="background:${esc(tag.color)};"></div>
        <div class="card-header">
          <div class="card-date">${formatDate(post.date, config)}${ms}</div>
          <div class="card-tags">${renderTags(post, tags)}</div>
        </div>
        <h3 class="card-title">${esc(post.title)}</h3>
        ${img}
        <p class="card-summary">${esc(post.summary || '')}</p>
        <div class="card-read-more">阅读全文 →</div>
      </article>`;
  }

  function renderMonthGroup(year, month, posts, tags, config) {
    const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    // 计算干支年和干支月（用该月第一篇文章的真实日期，与卡片内干支计算一致）
    const firstPostDate = posts.length > 0 ? new Date(posts[0].date) : new Date(year, month - 1, 1);
    const yearGZ = Ganzhi.getYearGanzhi(firstPostDate.getFullYear());
    const lunarMonth = Ganzhi.getApproxLunarMonth(firstPostDate);
    const monthGZ = Ganzhi.getMonthGanzhi(yearGZ.gan, lunarMonth);
    const gz = ` <span class="year-ganzhi">${esc(yearGZ.full)} ${esc(monthGZ.full)}</span>`;
    return `<section class="year-group" data-year="${esc(year)}-${String(month).padStart(2,'0')}">
      <h2 class="year-header" role="button" tabindex="0" aria-expanded="true" aria-label="折叠或展开 ${esc(year)}年${esc(monthNames[month-1])}的文章">
        <span class="year-collapse-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
        <span class="year-number">${esc(year)}年 ${esc(monthNames[month-1])}</span>${gz}
        <span class="year-count">${posts.length} 条</span>
      </h2>
      <div class="year-posts">${posts.map(p => renderCard(p, tags, config)).join('')}</div>
    </section>`;
  }

  function renderTimeline(filtered, tags, config) {
    // 按月分组：key = "YYYY-MM"
    const groups = {};
    filtered.forEach(p => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    const months = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    if (!months.length) return `<div class="empty-state"><p>暂无内容</p><p class="empty-hint">在 posts/ 目录添加你的第一篇博文</p></div>`;
    return `<div class="timeline-container" data-era="gregorian"><div class="timeline-axis" aria-hidden="true"></div>
      ${months.map(m => {
        const [y, mo] = m.split('-');
        return renderMonthGroup(parseInt(y), parseInt(mo), groups[m], tags, config);
      }).join('')}</div>`;
  }

  function render(filtered, tags, config) {
    return renderTimeline(filtered, tags, config);
  }

  return {
    render,
    get era() { return 'gregorian'; },
    get view() { return 'timeline'; }
  };
})();
