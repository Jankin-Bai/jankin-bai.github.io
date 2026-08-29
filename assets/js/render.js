/**
 * 渲染模块：时间线视图和矩阵视图
 */
const Renderer = (function() {

  function renderTimeline(posts, container) {
    container.innerHTML = '';
    if (posts.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--color-text-muted);">暂无文章</p>';
      return;
    }

    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    posts.forEach((post, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      
      const dateStr = post.date || '';
      const ganzhi = post.ganzhi || '';
      
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-date">
            <span class="date-main">${dateStr}</span>
            ${ganzhi ? `<span class="date-ganzhi">${ganzhi}</span>` : ''}
            ${post.milestone ? '<span class="milestone-icon">🏁</span>' : ''}
          </div>
          <a href="post.html?id=${post.id}" class="timeline-title">${post.title}</a>
          ${post.summary ? `<p class="timeline-summary">${post.summary}</p>` : ''}
          <div class="timeline-tags">
            ${(post.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      `;
      timeline.appendChild(item);
    });

    container.appendChild(timeline);
  }

  function renderMatrix(posts, container) {
    container.innerHTML = '';
    if (posts.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--color-text-muted);">暂无文章</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'matrix-card';
      card.innerHTML = `
        <a href="post.html?id=${post.id}" style="text-decoration:none;color:inherit;">
          <div class="matrix-card-date">${post.date || ''}</div>
          <h3 class="matrix-card-title">${post.title}</h3>
          ${post.summary ? `<p class="matrix-card-summary">${post.summary}</p>` : ''}
          <div class="matrix-card-tags">
            ${(post.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </a>
      `;
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  function renderDimList(posts, container, activeTags, onToggle) {
    const tagCount = {};
    posts.forEach(p => {
      (p.tags || []).forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });

    const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = '';
    sorted.forEach(([tag, count]) => {
      const item = document.createElement('div');
      item.className = 'dim-item' + (activeTags.includes(tag) ? ' active' : '');
      item.innerHTML = `
        <span class="dim-tag">${tag}</span>
        <span class="dim-count">${count}</span>
      `;
      item.addEventListener('click', () => onToggle(tag));
      container.appendChild(item);
    });
  }

  return {
    renderTimeline,
    renderMatrix,
    renderDimList
  };
})();
