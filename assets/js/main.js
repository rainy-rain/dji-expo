/* 大疆出海 · 交互层
   - 滚动淡入 / 淡出（IntersectionObserver）
   - 数字滚动
   - 指针：卡片倾斜、高光跟随、封面淡出、顶部进度条
   无框架，全站约 4KB。 */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------- 顶部进度 + 封面视差 + 章节号视差 ---------------- */
  var bar = document.querySelector('.progress i');
  var hero = document.querySelector('.hero');
  var nums = Array.prototype.slice.call(document.querySelectorAll('.chapter__no'));
  var vh = window.innerHeight;
  var ticking = false;
  var dir = 1;
  var lastY = 0;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    if (y !== lastY) { dir = y > lastY ? 1 : -1; lastY = y; }
    if (bar) {
      var max = root.scrollHeight - vh;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }
    if (hero && !reduce) {
      hero.style.setProperty('--hs', Math.min(y, vh).toFixed(0));
    }
    if (!reduce) {
      for (var i = 0; i < nums.length; i++) {
        var r = nums[i].getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) continue;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;
        nums[i].style.setProperty('--par', (progress * -46).toFixed(1) + 'px');
      }
    }
  }
  function requestScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; requestScroll(); });
  onScroll();

  /* ---------------- 入场 / 出场：逐元素分层 ---------------- */
  var targets = [];

  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }
  function add(el, cls, delay) {
    if (!el || el.nodeType !== 1 || el.__rv) return;
    el.__rv = true;
    el.classList.add('rv', cls || 'rv');
    if (delay) el.style.setProperty('--d', delay + 'ms');
    targets.push(el);
  }

  /* 章节头：编号 / 组名 / 标题 */
  each('.chapter__head', function (head) {
    add(head.querySelector('.chapter__no'), 'rv-clip', 0);
    add(head.querySelector('.chapter__kicker'), 'rv', 80);
    add(head.querySelector('h2'), 'rv-clip', 150);
  });

  /* 小标题 */
  each('.block-title', function (el) { add(el, 'rv-clip', 0); });

  /* 数字条 */
  each('.stats', function (group) {
    Array.prototype.forEach.call(group.children, function (card, i) {
      var d = i * 80;
      add(card, 'rv-pop', d);
      add(card.querySelector('.stat__num'), 'rv-clip', d + 90);
      add(card.querySelector('.stat__desc'), 'rv-clip', d + 170);
    });
  });

  /* 卡片网格 */
  each('.hairgrid', function (grid) {
    Array.prototype.forEach.call(grid.children, function (card, i) {
      var d = i * 90;
      add(card, 'rv-pop', d);
      add(card.querySelector('.card__title'), 'rv-clip', d + 80);
      add(card.querySelector('.card__body'), 'rv-clip', d + 150);
      Array.prototype.forEach.call(
        card.querySelectorAll('.slogan__code, .slogan__text, .kv > div, .step__no, .step__name, .step__body'),
        function (child, j) { add(child, j === 0 ? 'rv' : 'rv-clip', d + 80 + j * 60); }
      );
    });
  });

  /* 两栏：左右并进 */
  each('.split', function (split) {
    Array.prototype.forEach.call(split.children, function (el, i) {
      add(el, i === 0 ? 'rv-left' : 'rv-right', i * 100);
    });
  });

  /* 正文 */
  each('.pull', function (el) { add(el, 'rv-clip', 60); });
  each('.prose p', function (el, i) { add(el, 'rv-clip', 120 + i * 90); });
  each('.note-list li', function (el, i) { add(el, 'rv-clip', i * 90); });
  each('.big-stat__num', function (el) { add(el, 'rv-clip', 0); });
  each('.big-stat__label', function (el) { add(el, 'rv', 140); });

  /* 媒体 */
  each('.map__canvas', function (el) { add(el, 'rv-mask', 0); });
  each('.map-legend span', function (el, i) { add(el, 'rv', 140 + i * 70); });
  each('.caption', function (el) { add(el, 'rv', 220); });
  each('.diagram', function (el) { add(el, 'rv-clip', 0); });
  each('.video-shell', function (el) { add(el, 'rv-mask', 0); });
  each('.video-meta span', function (el, i) { add(el, 'rv', i * 70); });
  each('.video-figure', function (el) { add(el, 'rv-mask', 0); });
  each('.frame-strip figure', function (el, i) { add(el, 'rv-mask', i * 90); });
  each('.photo', function (el, i) { add(el, 'rv-mask', i * 70); });
  each('.poster-frame', function (el) { add(el, 'rv-clip', 0); });
  each('.poster-label', function (el) { add(el, 'rv', 180); });

  /* 表格与规格 */
  each('.table thead th', function (el, i) { add(el, 'rv', i * 60); });
  each('.table tbody tr', function (tr, i) {
    Array.prototype.forEach.call(tr.children, function (cell) {
      add(cell, 'rv', Math.min(i * 60, 300));
    });
  });
  each('.spec__row', function (el, i) { add(el, 'rv', i * 60); });

  /* 时间线 */
  each('.timeline .tl', function (el, i) { add(el, 'rv-pop', i * 90); });
  each('.timeline .tl__year', function (el) { add(el, 'rv-clip', 80); });
  each('.timeline .tl__title', function (el) { add(el, 'rv-clip', 140); });
  each('.timeline .tl__body', function (el) { add(el, 'rv-clip', 200); });

  /* 引文 */
  each('.quotes figure', function (el, i) { add(el, i === 0 ? 'rv-left' : 'rv-right', i * 120); });
  each('.quotes cite', function (el) { add(el, 'rv-clip', 180); });
  each('.slogan__list li', function (el, i) { add(el, 'rv', i * 70); });

  /* 页脚 */
  each('.footer h2', function (el) { add(el, 'rv-clip', 0); });
  each('.credits > div', function (el, i) { add(el, 'rv', 120 + i * 80); });
  each('.sources', function (el) { add(el, 'rv', 260); });
  each('.footer__bottom', function (el) { add(el, 'rv', 340); });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var visible = entry.isIntersecting;
        el.classList.toggle('in', visible);
        if (visible) {
          el.classList.remove('exit-up');
        } else {
          el.classList.toggle('exit-up', dir > 0);
        }
      });
    }, { rootMargin: '-8% 0px 0px 0px', threshold: 0 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- 数字滚动 ---------------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        co.unobserve(el);
        var raw = el.getAttribute('data-count');
        var target = parseFloat(raw);
        var decimals = (raw.split('.')[1] || '').length;
        var node = el.firstChild;
        if (!node || node.nodeType !== 3) return;
        var start = null;
        var guard = window.setTimeout(function () {
          node.nodeValue = target.toFixed(decimals);
        }, 1800);
        function tick(t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / 1100);
          var eased = 1 - Math.pow(1 - p, 3);
          node.nodeValue = (target * eased).toFixed(decimals);
          if (p < 1) window.requestAnimationFrame(tick);
          else { window.clearTimeout(guard); node.nodeValue = target.toFixed(decimals); }
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { co.observe(el); });
  }

  /* ---------------- 地图：定位点错峰浮起 ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.map__canvas'), function (canvas) {
    Array.prototype.forEach.call(canvas.querySelectorAll('.pin'), function (pin, i) {
      pin.style.setProperty('--i', i);
    });
  });
  if ('IntersectionObserver' in window) {
    var pinIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('pins-in');
          pinIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(document.querySelectorAll('.map__canvas'), function (canvas) {
      pinIo.observe(canvas);
    });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.map__canvas'), function (canvas) {
      canvas.classList.add('pins-in');
    });
  }

  /* ---------------- 指针：卡片倾斜 + 高光 ---------------- */
  if (fine && !reduce) {
    var cards = document.querySelectorAll('.stat, .hairgrid > *, .photo, .slogan');
    Array.prototype.forEach.call(cards, function (card) {
      var max = card.classList.contains('photo') ? 7 : 5;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--cx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--cy', (y * 100).toFixed(1) + '%');
        card.style.setProperty('--ry', ((x - 0.5) * 2 * max).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 2 * max).toFixed(2) + 'deg');
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- 指针：区域光斑 ---------------- */
  if (fine && !reduce) {
    var spots = document.querySelectorAll('.hero, .chapter--ink, .poster-section, .map__canvas');
    Array.prototype.forEach.call(spots, function (spot) {
      spot.addEventListener('pointermove', function (e) {
        var r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
        spot.classList.add('is-pointer');
        if (spot.classList.contains('hero')) {
          var nx = (e.clientX - r.left) / r.width - 0.5;
          var ny = (e.clientY - r.top) / r.height - 0.5;
          spot.style.setProperty('--dx', (nx * 26).toFixed(1) + 'px');
          spot.style.setProperty('--dy', (ny * 18).toFixed(1) + 'px');
        }
      }, { passive: true });
      spot.addEventListener('pointerleave', function () {
        if (spot.classList.contains('hero')) {
          spot.style.setProperty('--dx', '0px');
          spot.style.setProperty('--dy', '0px');
        }
      });
    });
  }

  /* ---------------- 视频：悬停轻提示 ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.video-shell'), function (shell) {
    shell.addEventListener('pointerenter', function () { shell.classList.add('is-live'); });
    shell.addEventListener('pointerleave', function () { shell.classList.remove('is-live'); });
  });
})();
