/**
 * Jankin's Timeline — Background Music Player
 * 背景音乐播放器：基于 APlayer + Meting API（网易云音乐源）
 *
 * 添加新歌曲：在 MUSIC_SONGS 数组中追加 { id: '网易云歌曲ID' } 即可
 * 网易云歌曲ID获取：歌曲页面 URL 中 ?id= 后的数字
 */
(function () {
  'use strict';

  // ===== 配置区 =====
  // 歌曲列表：后续添加新歌只需在此追加 { id: 'xxx' }
  var MUSIC_SONGS = [
    { id: '555142' }  // そばにいるね — 青山テルマ / SoulJa
  ];

  // Meting API 地址（injahow 镜像，稳定可用）
  // 格式说明：:type 会被替换为 song/url/pic/lrc，:id 替换为歌曲ID
  var METING_API = 'https://api.injahow.cn/meting/?server=netease&type=:type&id=:id';

  // 播放器配置
  var PLAYER_CONFIG = {
    volume: 0.55,       // 默认音量 0~1
    autoplay: false,    // 浏览器禁止自动播放，改为用户首次交互后触发
    loop: 'all',        // 循环模式：all / one / none
    order: 'list',      // 播放顺序：list / random
    theme: '#00e676',   // 主题色（终端绿）
    position: 'bottom-left' // fixed 位置：bottom-left / bottom-right
  };
  // ===== 配置区结束 =====

  var player = null;
  var hasAttemptedAutoplay = false;

  /**
   * 通过 Meting API 获取单首歌曲信息
   * 兼容两种返回格式：{name,artist} 和 {title,author}
   */
  function fetchSong(songId) {
    var url = METING_API.replace(':type', 'song').replace(':id', songId);
    return fetch(url, { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.length) return null;
        var s = data[0];
        return {
          name: s.name || s.title || '未知歌曲',
          artist: s.artist || s.author || '未知艺术家',
          url: s.url,
          cover: s.pic,
          lrc: s.lrc
        };
      })
      .catch(function (err) {
        console.warn('[Music] 加载歌曲失败 id=' + songId, err);
        return null;
      });
  }

  /**
   * 批量获取所有歌曲信息，过滤掉加载失败的
   */
  function fetchAllSongs() {
    return Promise.all(MUSIC_SONGS.map(function (s) { return fetchSong(s.id); }))
      .then(function (list) {
        return list.filter(function (s) { return s && s.url; });
      });
  }

  /**
   * 初始化 APlayer
   */
  function initPlayer(audioList) {
    if (!audioList.length) {
      console.warn('[Music] 没有可播放的歌曲');
      return;
    }

    var container = document.getElementById('music-player');
    if (!container) return;

    player = new APlayer({
      container: container,
      fixed: true,
      mini: true,
      autoplay: PLAYER_CONFIG.autoplay,
      loop: PLAYER_CONFIG.loop,
      order: PLAYER_CONFIG.order,
      preload: 'auto',
      volume: PLAYER_CONFIG.volume,
      theme: PLAYER_CONFIG.theme,
      audio: audioList
    });

    // 将播放器定位到指定角落
    if (PLAYER_CONFIG.position === 'bottom-left') {
      container.classList.add('aplayer-bottom-left');
    }

    // 监听播放事件，记录状态
    player.on('play', function () {
      try { localStorage.setItem('jankin-music-playing', '1'); } catch (e) {}
    });
    player.on('pause', function () {
      try { localStorage.setItem('jankin-music-playing', '0'); } catch (e) {}
    });

    // 恢复上次播放状态
    try {
      var wasPlaying = localStorage.getItem('jankin-music-playing') === '1';
      if (wasPlaying) {
        // 延迟到用户交互后播放
        tryAutoplay();
      }
    } catch (e) {}

    console.log('[Music] 播放器初始化完成，共 ' + audioList.length + ' 首歌曲');
  }

  /**
   * 尝试自动播放（需在用户交互回调中调用）
   * 浏览器策略：音频播放必须由用户手势触发
   */
  function tryAutoplay() {
    if (hasAttemptedAutoplay) return;
    if (!player) return;
    hasAttemptedAutoplay = true;
    var p = player.play();
    if (p && p.catch) {
      p.catch(function () {
        // 自动播放被阻止，等待用户手动点击
        console.log('[Music] 自动播放被浏览器阻止，请点击播放器播放');
      });
    }
  }

  /**
   * 页面加载完成后初始化
   */
  function boot() {
    // 注入播放器容器
    var div = document.createElement('div');
    div.id = 'music-player';
    div.className = 'jankin-music-player';
    document.body.appendChild(div);

    fetchAllSongs().then(initPlayer);

    // 用户首次交互时尝试播放（绕过浏览器自动播放限制）
    function onFirstInteract() {
      tryAutoplay();
      document.removeEventListener('click', onFirstInteract);
      document.removeEventListener('keydown', onFirstInteract);
      document.removeEventListener('touchstart', onFirstInteract);
    }
    document.addEventListener('click', onFirstInteract, { once: true });
    document.addEventListener('keydown', onFirstInteract, { once: true });
    document.addEventListener('touchstart', onFirstInteract, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
