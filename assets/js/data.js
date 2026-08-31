/**
 * 数据加载模块（纯前端自动发现版 v2）
 *
 * 核心设计：纯约定式自动发现，不依赖任何 index.json
 *   - 只需在 posts/ 下新建 YYYY-NNN/ 文件夹（含 meta.json）即可自动识别
 *   - 首次加载自动扫描，结果缓存到 localStorage，二次加载秒开
 *   - 后台静默更新，发现新文章自动触发 posts-updated 事件
 *
 * 自动发现命名约定：posts/YYYY-NNN/meta.json
 *   YYYY = 年份，NNN = 3位序号（001, 002, ...）
 *   例：posts/2025-001/meta.json, posts/2025-026/meta.json
 *
 * 内容格式：meta.json 中 format 字段决定
 *   - "html" → posts/{id}/content.html
 *   - "markdown" → posts/{id}/content.md（marked.js 渲染）
 *
 * 懒加载：只扫描 meta.json，content 在详情页才加载
 */
const DataLoader = (() => {
  let config = null;
  let posts = null;
  const CACHE_KEY = 'jankin-posts-cache-v3';
  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json();
  }
  /**
   * 探测单个 meta.json 是否存在
   * @returns {object|null} meta 数据或 null（不存在）
   */
  async function probeMeta(id) {
    try {
      const res = await fetch(`posts/${id}/meta.json`, { cache: 'no-cache' });
      if (!res.ok) return null;
      const meta = await res.json();
      return meta && meta.id ? meta : null;
    } catch {
      return null;
    }
  }
  /**
   * 约定式自动发现核心算法 v2
   *
   * 优化策略：
   *   1. 从当前年份倒序扫描到 startYear
   *   2. 每年先探测 001，如果不存在直接跳过该年（减少 404）
   *   3. 存在则批量并行探测，连续 2 个空批停止
   *   4. 每批 20 个并行请求
   */
  async function discoverPosts(silent = false) {
    const disc = config.discovery || {};
    const startYear = disc.startYear || 2015;
    const batchSize = disc.batchSize || 20;
    const maxEmptyBatches = disc.maxEmptyBatches || 2;
    const currentYear = new Date().getFullYear();
    const found = [];
    SiteUtils.log && SiteUtils.log(`🔍 自动发现博文：${startYear} ~ ${currentYear}，每批 ${batchSize} 个`);
    const totalYears = currentYear - startYear + 1;
    let scannedYears = 0;
    for (let year = currentYear; year >= startYear; year--) {
      scannedYears++;
      if (!silent) {
        const percent = Math.round((scannedYears / totalYears) * 100);
        document.dispatchEvent(new CustomEvent('discover-progress', { detail: { year, percent } }));
        // 最小延迟：让扫描进度可见（仅首次加载，后台更新不延迟）[frontend: 真实反馈]
        await new Promise(r => setTimeout(r, 90));
      }
      // 快速跳过：先探测该年第一篇，如果不存在直接跳过
      const firstMeta = await probeMeta(`${year}-001`);
      if (!firstMeta) {
        continue; // 该年无文章，跳过
      }
      found.push(firstMeta);
      // 该年有文章，从 002 开始批量连续扫描（001 已单独探测）
      let seq = 2;
      let emptyBatches = 0;
      while (emptyBatches < maxEmptyBatches) {
        const ids = [];
        for (let i = 0; i < batchSize; i++) {
          ids.push(`${year}-${String(seq + i).padStart(3, '0')}`);
        }
        // 并行探测这一批
        const results = await Promise.allSettled(ids.map(id => probeMeta(id)));
        let batchHasContent = false;
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value) {
            found.push(r.value);
            batchHasContent = true;
          }
        });
        if (!batchHasContent) {
          emptyBatches++;
        } else {
          emptyBatches = 0;
        }
        seq += batchSize;
        // 安全上限：每年最多扫描到 1000 篇
        if (seq > 1000) break;
      }
    }
    found.sort((a, b) => new Date(b.date) - new Date(a.date));
    SiteUtils.log && SiteUtils.log(`✅ 自动发现完成：共 ${found.length} 篇博文`);
    return found;
  }
  /** localStorage 缓存：二次加载秒开 */
  function getCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const ttl = (config.discovery?.cacheTTL) || 3600000; // 默认1小时（个人博客更新不频繁，后台静默更新）
      if (Date.now() - data.timestamp > ttl) return null;
      return data.posts;
    } catch { return null; }
  }
  /** 同步检查是否有有效缓存（不依赖 config，用于 init 前判断是否显示骨架屏） */
  function hasValidCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Date.now() - data.timestamp < 3600000; // 默认1小时
    } catch { return false; }
  }
  function setCache(list) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        posts: list
      }));
    } catch {}
  }
  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
  }
  async function init() {
    config = await loadJSON('data/config.json');
    // ── 纯自动发现模式（不依赖 index.json）──
    SiteUtils.log && SiteUtils.log('🔍 纯自动发现模式：扫描 posts/ 目录下的所有文章文件夹');
    const cached = getCache();
    if (cached && cached.length > 0) {
      // 有缓存 → 立即返回，不阻塞首屏 [frontend: 感知性能优化]
      posts = cached;
      SiteUtils.log && SiteUtils.log(`⚡ 使用缓存：${cached.length} 篇`);
      // 后台静默更新文章列表（不触发进度事件，不干扰已显示的内容）[frontend: 后台更新不打扰用户]
      discoverPosts(true).then(found => {
        posts = found;
        setCache(found);
        if (found.length !== cached.length) {
          document.dispatchEvent(new CustomEvent('posts-updated', { detail: { count: found.length } }));
        }
      }).catch(e => SiteUtils.warn && SiteUtils.warn('后台更新失败:', e));
      // 后台加载标签（不阻塞）
      getAllTags().then(tags => {
        document.dispatchEvent(new CustomEvent('tags-loaded', { detail: { tags } }));
      }).catch(() => {});
      return { config, posts, tags: tagsCache || [] };
    }
    // 无缓存 → 首次加载，触发进度事件
    document.dispatchEvent(new CustomEvent('discover-start'));
    posts = await discoverPosts();
    setCache(posts);
    document.dispatchEvent(new CustomEvent('discover-complete', { detail: { count: posts.length } }));
    // 首次加载时 tags 也需要等待（因为要渲染标签筛选）
    const tags = await getAllTags();
    SiteUtils.log && SiteUtils.log(`🏷️ 自动发现标签：${tags.length} 个`, tags.map(t => t.id + '(' + t.count + ')').join(', '));
    return { config, posts, tags };
  }
  /**
   * 详情页懒加载博文内容
   * 支持 HTML 和 Markdown 两种格式（根据 meta.format 判断）
   */
  async function getPostContent(postId, format) {
    const contentFile = format === 'markdown' ? 'content.md' : 'content.html';
    const res = await fetch(`posts/${postId}/${contentFile}`);
    if (!res.ok) throw new Error(`内容加载失败: ${postId}/${contentFile} (HTTP ${res.status})`);
    return res.text();
  }
  async function getPostMeta(postId) {
    if (posts) {
      const found = posts.find(p => p.id === postId);
      if (found) return found;
    }
    return loadJSON(`posts/${postId}/meta.json`);
  }
  function getPostById(id) { return posts?.find(p => p.id === id); }
  function getConfig() { return config; }
  function getPosts() { return posts || []; }
  function getActiveDimensions() { return config.dimensions.filter(d => d.active); }
  function getDimensionById(id) { return config.dimensions.find(d => d.id === id); }
  /**
   * 自动发现所有标签 [hci: 概念模型一致性, 消除附加任务]
   * 从所有文章的 meta.json tags 字段中收集，统计数量
   * 可选合并 data/tags.json 中的元数据（icon/color/name）
   * 没有配置的标签自动生成默认颜色（基于标签名 hash）
   */
  let tagMetaCache = null;
  let tagsCache = null;
  async function loadTagMeta() {
    if (tagMetaCache !== null) return tagMetaCache;
    try {
      const res = await fetch('data/tags.json');
      if (res.ok) {
        tagMetaCache = await res.json();
        return tagMetaCache;
      }
    } catch {}
    tagMetaCache = {};
    return tagMetaCache;
  }
  /** 基于字符串生成稳定的 HSL 颜色（自动配色） */
  function hashColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return {
      color: `hsl(${h}, 65%, 45%)`,
      colorLight: `hsl(${h}, 65%, 92%)`,
      colorDark: `hsl(${h}, 65%, 30%)`,
      bgGradient: `linear-gradient(135deg, hsl(${h}, 65%, 45%) 0%, hsl(${h}, 65%, 55%) 100%)`,
      borderStyle: `2px solid hsl(${h}, 65%, 45%)`,
      cardBg: `hsl(${h}, 65%, 97%)`
    };
  }
  /**
   * 获取所有标签（自动发现 + 元数据合并）
   * @returns {Promise<Array>} 标签数组，按文章数量降序
   */
  async function getAllTags() {
    if (tagsCache) return tagsCache;
    const meta = await loadTagMeta();
    const tagMap = {};
    (posts || []).forEach(p => {
      (p.tags || []).forEach(tid => {
        if (!tagMap[tid]) {
          const custom = meta[tid] || {};
          const auto = hashColor(tid);
          tagMap[tid] = {
            id: tid,
            name: custom.name || tid,
            nameEn: custom.nameEn || tid,
            icon: custom.icon || '🏷️',
            description: custom.description || '',
            active: custom.active !== false,
            count: 0,
            color: custom.color || auto.color,
            colorLight: custom.colorLight || auto.colorLight,
            colorDark: custom.colorDark || auto.colorDark,
            bgGradient: custom.bgGradient || auto.bgGradient,
            borderStyle: custom.borderStyle || auto.borderStyle,
            cardBg: custom.cardBg || auto.cardBg
          };
        }
        tagMap[tid].count++;
      });
    });
    tagsCache = Object.values(tagMap)
      .filter(t => t.active)
      .sort((a, b) => b.count - a.count);
    return tagsCache;
  }
  /** 同步获取标签（需先调用 getAllTags 缓存） */
  function getTagsSync() {
    return tagsCache || [];
  }
  function filterByDimension(list, dimId) {
    return (!dimId || dimId === 'all') ? list : list.filter(p => p.tags.includes(dimId));
  }
  function filterBySearch(list, kw) {
    if (!kw || !kw.trim()) return list;
    kw = kw.toLowerCase();
    return list.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      (p.summary && p.summary.toLowerCase().includes(kw)) ||
      p.tags.some(t => t.toLowerCase().includes(kw))
    );
  }
  return {
    init, getPostContent, getPostMeta, getPostById, getConfig, getPosts, hasValidCache,
    getActiveDimensions, getDimensionById,
    filterByDimension, filterBySearch,
    clearCache, discoverPosts
  };
})();
