/**
 * 动态主题引擎
 * 从 data/themes.json 读取主题配置，动态注入 CSS 变量
 * 右上角下拉式切换，localStorage 持久化
 *
 * 暴露全局对象 ThemeManager：
 *   init()              初始化主题切换器
 *   apply(key)          应用指定主题
 *   renderSelect(id)    在指定容器渲染主题选择器（兼容旧接口）
 *   renderPanel(id)     在指定容器渲染主题面板（兼容旧接口）
 *   getCurrent()        获取当前主题 key
 *   getThemes()         获取所有主题配置
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'jankin-theme';
  var DEFAULT_THEME = 'mono';
  var CONFIG_URL = 'data/themes.json';
  var themes = {};
  var currentKey = DEFAULT_THEME;
  var initialized = false;

  /* ---------- Cookie 工具（跨子域共享主题） ---------- */
  function getCookieDomain() {
    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return '';
    }
    var parts = host.split('.');
    if (parts.length >= 2) {
      return '.' + parts.slice(-2).join('.');
    }
    return '';
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + d.toUTCString();
    }
    var domain = getCookieDomain();
    var domainStr = domain ? '; domain=' + domain : '';
    document.cookie = name + '=' + encodeURIComponent(value) + expires + domainStr + '; path=/; SameSite=Lax';
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /* ---------- DOM 引用（延迟获取，确保 DOM 就绪） ---------- */
  function getEls() {
    return {
      switcher: document.getElementById('themeSwitcher'),
      trigger:  document.getElementById('themeTrigger'),
      dropdown: document.getElementById('themeDropdown'),
      nameEl:   document.getElementById('themeCurrentName')
    };
  }

  /* ---------- 加载 themes.json ---------- */
  function loadThemes() {
    return fetch(CONFIG_URL, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        themes = data;
        buildDropdown();
        applyTheme(readStorage());
      })
      .catch(function () {
        themes = {
          mono: {
            name: '终端极客',
            preview: { bg: '#0d1117', accent: '#58a6ff' },
            vars: {
              '--color-bg': '#0d1117',
              '--color-surface': '#161b22',
              '--color-text': '#c9d1d9',
              '--color-text-secondary': '#8b949e',
              '--color-text-muted': '#8b949e',
              '--color-border': '#30363d',
              '--color-border-light': '#21262d',
              '--color-primary': '#58a6ff',
              '--color-primary-light': '#1f2d3d',
              '--color-primary-dark': '#388bfd',
              '--color-accent': '#7ee787',
              '--font-family': "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              '--font-family-serif': "'JetBrains Mono', Consolas, monospace",
              '--font-family-mono': "'JetBrains Mono', Consolas, monospace",
              '--border-radius': '4px',
              '--border-radius-sm': '2px',
              '--card-shadow': '0 0 0 1px rgba(88,166,255,0.1)',
              '--card-shadow-hover': '0 0 0 1px rgba(88,166,255,0.3), 0 4px 12px rgba(0,0,0,0.4)',
              '--timeline-color': '#58a6ff',
              '--link-color': '#58a6ff',
              '--code-bg': '#0d1117',
              '--blockquote-border': '#58a6ff',
              '--transition': '150ms ease'
            }
          }
        };
        buildDropdown();
        applyTheme(DEFAULT_THEME);
      });
  }

  /* ---------- 动态生成下拉选项 ---------- */
  function buildDropdown() {
    var els = getEls();
    if (!els.dropdown) return;
    els.dropdown.innerHTML = '';
    Object.keys(themes).forEach(function (key) {
      var t = themes[key];
      var btn = document.createElement('button');
      btn.className = 'theme-option';
      btn.dataset.theme = key;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');
      btn.tabIndex = -1;
      var dot = document.createElement('span');
      dot.className = 'theme-option-dot';
      var bg = t.preview ? t.preview.bg : '#ffffff';
      var ac = t.preview ? t.preview.accent : '#333333';
      dot.style.background =
        'linear-gradient(135deg, ' + bg + ' 50%, ' + ac + ' 50%)';
      var name = document.createElement('span');
      name.className = 'theme-option-name';
      name.textContent = t.name;
      var check = document.createElement('span');
      check.className = 'theme-option-check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      btn.appendChild(dot);
      btn.appendChild(name);
      btn.appendChild(check);
      btn.addEventListener('click', function () {
        applyTheme(key);
        setDropdown(false);
        var e = getEls();
        if (e.trigger) e.trigger.focus();
      });
      els.dropdown.appendChild(btn);
    });
  }

  /* ---------- 应用主题：注入 CSS 变量 ---------- */
  function applyTheme(key) {
    if (!themes[key]) key = DEFAULT_THEME;
    var t = themes[key];
    var root = document.documentElement;
    Object.keys(t.vars).forEach(function (varName) {
      root.style.setProperty(varName, t.vars[varName]);
    });
    root.setAttribute('data-theme', key);
    var els = getEls();
    if (els.nameEl) els.nameEl.textContent = t.name;
    if (els.trigger) els.trigger.setAttribute('title', '当前主题：' + t.name + '（点击切换）');
    var opts = document.querySelectorAll('.theme-option');
    opts.forEach(function (opt) {
      var selected = opt.dataset.theme === key;
      opt.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    try {
      setCookie(STORAGE_KEY, key, 365);
      localStorage.setItem(STORAGE_KEY, key);
    } catch (e) {}
    currentKey = key;
    document.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: key, name: t.name }
    }));
  }

  /* ---------- 下拉开关 ---------- */
  function setDropdown(open) {
    var els = getEls();
    if (!els.dropdown) return;
    els.dropdown.hidden = !open;
    if (els.trigger) els.trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var active = els.dropdown.querySelector('.theme-option[aria-selected="true"]');
      if (active) active.focus();
    }
  }

  /* ---------- 键盘导航 ---------- */
  function handleKeydown(e) {
    var els = getEls();
    if (!els.dropdown || els.dropdown.hidden) return;
    var opts = Array.prototype.slice.call(
      els.dropdown.querySelectorAll('.theme-option')
    );
    if (!opts.length) return;
    var currentIdx = opts.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = (currentIdx + 1) % opts.length;
      opts[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = (currentIdx - 1 + opts.length) % opts.length;
      opts[prev].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdown(false);
      if (els.trigger) els.trigger.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (currentIdx >= 0) {
        e.preventDefault();
        opts[currentIdx].click();
      }
    }
  }

  /* ---------- 工具函数 ---------- */
  function readStorage() {
    try {
      var fromCookie = getCookie(STORAGE_KEY);
      if (fromCookie) return fromCookie;
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCookie(STORAGE_KEY, saved, 365);
        return saved;
      }
    } catch (e) {}
    return DEFAULT_THEME;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (initialized) return;
    initialized = true;
    var els = getEls();
    if (els.trigger) {
      els.trigger.addEventListener('click', function () {
        var e = getEls();
        setDropdown(e.dropdown ? e.dropdown.hidden : false);
      });
    }
    document.addEventListener('click', function (e) {
      var el = getEls();
      if (el.switcher && !el.switcher.contains(e.target)) {
        setDropdown(false);
      }
    });
    document.addEventListener('keydown', handleKeydown);
    loadThemes();
  }

  /* ---------- 兼容旧接口 ---------- */
  function renderSelect(containerId) {
    var container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.setAttribute('aria-hidden', 'true');
      container.style.display = 'none';
    }
  }

  function renderPanel(containerId) {
    var container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.setAttribute('aria-hidden', 'true');
      container.style.display = 'none';
    }
  }

  /* ---------- 暴露全局对象 ---------- */
  window.ThemeManager = {
    init: init,
    apply: applyTheme,
    renderSelect: renderSelect,
    renderPanel: renderPanel,
    getCurrent: function () { return currentKey; },
    getThemes: function () { return themes; }
  };

  /* ---------- DOM 就绪后自动初始化 ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
