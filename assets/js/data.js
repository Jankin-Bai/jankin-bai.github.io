/**
 * 数据加载模块（纯前端自动发现版 v2）
 *
 * 核心设计：纯约定式自动发现，不依赖任何 index.json
 *   - 只需在 posts/ 下新建 YYYY-NNN/ 文件夹（含 meta.json）即可自动识别
 *   - 首次加载自动扫描，结果缓存到 localStorage，二次加载秒开
 *   - 后台静默更新，发现新文章自动触发 posts-updated 事件
 *
 * 自动发现命名约定：posts/YYYY-NNN/meta.json
 *   YYYY: 4位年份（如2025）
 *   NNN: 3位序号（如001、002）
 *   完整示例：posts/2025-001/meta.json
 */

const DataLoader = (function() {
  const CACHE_KEY = 'jankin_posts_cache';
  const CACHE_VERSION = 'v2';
  const SCAN_BATCH_SIZE = 20;
  const MAX_SCAN_YEARS = 3;

  let postsCache = null;
  let isScanning = false;

  function generateIds() {
    const ids = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - MAX_SCAN_YEARS; year--) {
      for (let seq = 1; seq <= 999; seq++) {
        ids.push(`${year}-${String(seq).padStart(3, '0')}`);
      }
    }
    return ids;
  }

  async function fetchMeta(id) {
    try {
      const resp = await fetch(`posts/${id}/meta.json`, { cache: 'no-cache' });
      if (!resp.ok) return null;
      const meta = await resp.json();
      meta.id = id;
      return meta;
    } catch (e) {
      return null;
    }
  }

  async function scanPosts(onProgress) {
    if (isScanning) return [];
    isScanning = true;

    const allIds = generateIds();
    const found = [];
    let consecutiveMisses = 0;
    const MAX_CONSECUTIVE_MISSES = 50;

    for (let i = 0; i < allIds.length; i += SCAN_BATCH_SIZE) {
      const batch = allIds.slice(i, i + SCAN_BATCH_SIZE);
      const results = await Promise.all(batch.map(id => fetchMeta(id)));
      
      let batchHasHit = false;
      for (const meta of results) {
        if (meta) {
          found.push(meta);
          batchHasHit = true;
          consecutiveMisses = 0;
        } else {
          consecutiveMisses++;
        }
      }

      if (onProgress) {
        onProgress(found.length, i + batch.length);
      }

      if (!batchHasHit && consecutiveMisses >= MAX_CONSECUTIVE_MISSES) {
        break;
      }
    }

    found.sort((a, b) => b.id.localeCompare(a.id));
    isScanning = false;
    return found;
  }

  function saveCache(posts) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        version: CACHE_VERSION,
        timestamp: Date.now(),
        posts: posts
      }));
    } catch (e) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== CACHE_VERSION) return null;
      return data.posts;
    } catch (e) {
      return null;
    }
  }

  async function getPosts(useCache = true) {
    if (postsCache) return postsCache;

    if (useCache) {
      const cached = loadCache();
      if (cached && cached.length > 0) {
        postsCache = cached;
        backgroundRefresh();
        return cached;
      }
    }

    const posts = await scanPosts();
    postsCache = posts;
    saveCache(posts);
    return posts;
  }

  async function backgroundRefresh() {
    try {
      const posts = await scanPosts();
      if (posts.length !== (postsCache?.length || 0)) {
        postsCache = posts;
        saveCache(posts);
        window.dispatchEvent(new CustomEvent('posts-updated', { detail: posts }));
      }
    } catch (e) {}
  }

  async function getPostById(id) {
    const posts = await getPosts();
    return posts.find(p => p.id === id) || null;
  }

  async function getPostContent(id) {
    const meta = await getPostById(id);
    if (!meta) return null;

    const format = meta.format || 'html';
    const file = format === 'markdown' ? 'content.md' : 'content.html';
    
    try {
      const resp = await fetch(`posts/${id}/${file}`);
      if (!resp.ok) return null;
      return await resp.text();
    } catch (e) {
      return null;
    }
  }

  function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    postsCache = null;
  }

  return {
    getPosts,
    getPostById,
    getPostContent,
    clearCache,
    backgroundRefresh
  };
})();
