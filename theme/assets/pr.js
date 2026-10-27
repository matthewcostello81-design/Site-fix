/* Pocket Era redesign (2026-10-23) - the one script for the new pages (v3: pinned Select bundle pill, add-ons on Single/Duo only, films, switch + size modules, footer de-hijack).
   Header menu sheet + cart count, marquee doubling, product gallery counter/arrows, the buy box
   (colour swatches, pack rows priced from #pr-data, add-ons, add to bag -> the theme's drawer),
   the reviews wall from Judge.me's public widget feed, the reviews strip drift, and the canvas scrub
   that keeps a pg-* script from painting the old dark background back onto #root / #content. */
(function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var money = function(c){ var cur = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD'; try { return new Intl.NumberFormat(document.documentElement.lang || 'en', {style: 'currency', currency: cur}).format(c / 100); } catch (e){ return '$' + (c / 100).toFixed(2); } };

  /* ---------- canvas ---------- */
  function canvas(){
    if (!document.body.classList.contains('pr-page')) return;
    var els = [document.documentElement, document.body, document.getElementById('root'), document.getElementById('content')].concat($$('.shopify-section, footer, .pr-foot, .pr-head, main')).filter(Boolean);
    function clean(el){ if (!el || !el.getAttribute('style')) return; ['background', 'background-color', 'background-image', 'color'].forEach(function(p){ if (el.style.getPropertyValue(p)) el.style.removeProperty(p); }); }
    els.forEach(clean);
    if (window.MutationObserver){ var mo = new MutationObserver(function(ms){ ms.forEach(function(m){ clean(m.target); }); }); els.forEach(function(el){ mo.observe(el, {attributes: true, attributeFilter: ['style']}); }); }
    setTimeout(function(){ els.forEach(clean); }, 1200); setTimeout(function(){ els.forEach(clean); }, 3500);
  }

  /* ---------- header ---------- */
  function header(){
    var b = $('.pr-burger'), m = $('.pr-menu'); if (b && m){
      var shut = function(){ m.classList.remove('on'); document.documentElement.style.overflow = ''; document.documentElement.classList.remove('pr-menu-open'); };
      b.addEventListener('click', function(){ m.classList.add('on'); document.documentElement.style.overflow = 'hidden'; document.documentElement.classList.add('pr-menu-open'); });
      $$('.pr-menu-close', m).forEach(function(x){ x.addEventListener('click', shut); });
      document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && m.classList.contains('on')) shut(); });
    }
    $$('.pr-cart-open').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); if (window.pgOpenCart) window.pgOpenCart(); else location.href = '/cart'; }); });
    count();
    document.addEventListener('cart:updated', count);
    /* top bar: one message at a time, sliding up every 3.2 s */
    $$('[data-pr-ann]').forEach(function(bar){
      var it = $$('.pr-ann-i', bar), i = 0; if (it.length < 2) return;
      setInterval(function(){ if (document.hidden) return; var a = it[i]; i = (i + 1) % it.length; var b = it[i]; a.classList.remove('on'); a.classList.add('out'); a.setAttribute('aria-hidden', 'true'); b.classList.remove('out'); b.classList.add('on'); b.removeAttribute('aria-hidden'); setTimeout(function(){ a.classList.remove('out'); }, 600); }, 3200);
    });
  }
  function count(){
    fetch('/cart.js', {credentials: 'same-origin'}).then(function(r){ return r.json(); }).then(function(c){
      var n = 0; (c.items || []).forEach(function(it){ if (it.handle !== 'shipping-protection' && it.price > 0) n += it.quantity; });
      $$('[data-pr-count]').forEach(function(el){ el.textContent = n; el.hidden = n < 1; });
    }).catch(function(){});
  }

  /* ---------- marquee ---------- */
  function marquee(){
    $$('.pr-marq .pr-marq-track').forEach(function(t){ if (t.getAttribute('data-pr-dup')) return; t.setAttribute('data-pr-dup', '1'); t.innerHTML = t.innerHTML + t.innerHTML; });
  }

  /* ---------- gallery ---------- */
  function gallery(){
    var g = $('.pr-gal'); if (!g) return;
    var track = $('.pr-gal-track', g), all = $$(':scope > *', track), slides = [], n = $('.pr-gal-n', g), prev = $('.pr-gal-prev', g), next = $('.pr-gal-next', g);
    if (!all.length) return;
    function idx(){ return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
    /* a strip of small photos under the gallery on every product (owner 2026-10-25 "make scrolling the photos easier and quicker", "show the ones behind and in front in small", "shouldn't all have the photo strip") */
    var th = $('.pr-gal-thumbs', g), tbs = [], on = -1;
    function small(u){ return String(u || '').replace(/([?&])width=\d+/, '$1width=160').replace(/_\d+x\./, '_160x.'); }
    function build(){
      slides = all; tbs = []; on = -1;
      g.classList.toggle('pr-gal-one', slides.length < 2);
      if (!th) return; th.innerHTML = '';
      slides.forEach(function(sl, j){
        var im = $('img', sl), vid = $('video', sl), src = im ? im.getAttribute('src') : vid && vid.getAttribute('poster'), b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', (vid ? 'Video, ' : 'Photo ') + (j + 1) + ' of ' + slides.length); b.setAttribute('data-media', sl.getAttribute('data-media') || '');
        if (src) b.innerHTML = '<img src="' + small(src) + '" alt="" width="160" height="160" loading="lazy" decoding="async">';
        /* the clip slides (orb, R36S Pro, Ultra Max) have no poster: a dark tile with a play mark */
        if (vid){ b.className = 'vid'; b.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'); }
        if (sl.classList.contains('pr-gal-fl')) b.className = 'fl';
        b.addEventListener('click', function(){ go(j); });
        th.appendChild(b); tbs.push(b);
      });
    }
    build();
    /* only the photo on screen and its two neighbours hover: two dozen floats and their shadows animating at once (83 animations) ran iPhone Safari out of
       layer memory and it left photos blank (owner 2026-10-25 "some of pictures arnt loading ... pokemon") */
    var live = -1;
    function paint(){
      var i = Math.min(slides.length - 1, idx());
      if (n) n.textContent = (i + 1) + ' \\ ' + slides.length;
      if (i !== live){ live = i; slides.forEach(function(s, j){ s.classList.toggle('pr-gal-live', Math.abs(j - i) <= 1); }); }
      if (!tbs.length || i === on) return;
      if (tbs[on]) tbs[on].classList.remove('on');
      on = i; tbs[i].classList.add('on');
      /* phones: a row under the photo; desktop: a column beside it */
      var col = getComputedStyle(th).flexDirection === 'column', b = tbs[i];
      if (col) glide('scrollTop', Math.max(0, Math.min(th.scrollHeight - th.clientHeight, b.offsetTop - (th.clientHeight - b.offsetHeight) / 2)));
      else glide('scrollLeft', Math.max(0, Math.min(th.scrollWidth - th.clientWidth, b.offsetLeft - (th.clientWidth - b.offsetWidth) / 2)));
    }
    /* the strip glides by hand: Chrome runs one smooth scroll at a time, and the photo track's own scroll cancelled the strip's */
    var raf = 0;
    function glide(prop, to){
      cancelAnimationFrame(raf);
      var from = th[prop], d = to - from, t0 = 0;
      if (reduce || Math.abs(d) < 2){ th[prop] = to; return; }
      raf = requestAnimationFrame(function f(t){ if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 280); th[prop] = from + d * (1 - Math.pow(1 - k, 3)); if (k < 1) raf = requestAnimationFrame(f); });
    }
    /* a jump of more than two photos lands at once instead of gliding past the ones between */
    function go(i){ i = (i + slides.length) % slides.length; var far = Math.abs(i - idx()) > 2; try { track.scrollTo({left: i * track.clientWidth, behavior: reduce || far ? 'auto' : 'smooth'}); } catch (e){ track.scrollLeft = i * track.clientWidth; } }
    if (prev) prev.addEventListener('click', function(){ go(idx() - 1); });
    if (next) next.addEventListener('click', function(){ go(idx() + 1); });
    track.addEventListener('scroll', paint, {passive: true});
    paint();
    document.addEventListener('pr:show-media', function(e){ var k = e.detail && e.detail.id; if (!k) return; var i = -1; slides.forEach(function(s, j){ if (s.getAttribute('data-media') == k) i = j; }); if (i >= 0) go(i); }); /* desktop uses the same slider as phones since pass 93 */
    /* a pick in the floating gallery jumps to that character's photo in the size picked, or its first photo (the side-by-side when it comes in both sizes);
       every character stays in the gallery (owner 2026-10-25 rejected showing only the picked one) */
    document.addEventListener('pr:gal-name', function(e){
      var d = e.detail || {}, i = -1, f = -1;
      slides.forEach(function(s, j){ if (s.getAttribute('data-pick') === d.pick) i = j; if (f < 0 && s.getAttribute('data-name') === d.name) f = j; });
      if (i < 0) i = f; if (i >= 0) go(i);
    });
  }

  /* ---------- buy box ---------- */
  function buy(){
    var box = $('.pr-buy[data-pr-product]'); if (!box) return;
    var data; try { data = JSON.parse($('#pr-data').textContent); } catch (e){ return; }
    var colorOpt = data.colorOpt || 0; /* 1 = option1 is the colour (hoodie, orb), 2 = option2 is the colour, 0 = no colour */
    var state = {bundle: null, qty: 1, color: null};
    var rows = $$('.pr-row', box), sws = $$('.pr-sw button', box), adds = $$('.pr-add', box), btn = $('.pr-atc', box), priceEl = $('.pr-price', box), note = $('.pr-cta-note', box);
    var addsBlk = adds.length ? adds[0].closest('.pr-blk') : null, touched = false, stick = null, stickBtn = null, stickT = null, stickP = null, stickS = null, sheet = null, hasRows = rows.filter(function(r){ return !r.closest('.pr-rows-hidden'); }).length > 0;
    function variantFor(bundle, color){
      var hit = null;
      data.variants.forEach(function(v){
        if (hit) return;
        var ok = true;
        if (colorOpt === 1){ ok = (!color || v.o1 === color) && (!bundle || v.o2 === bundle); }
        else if (colorOpt === 2){ ok = (!bundle || v.o1 === bundle) && (!color || v.o2 === color); }
        else { ok = (!bundle || v.o1 === bundle); }
        if (ok) hit = v;
      });
      return hit;
    }
    function rowPrice(row){
      var b = row.getAttribute('data-bundle') || '', qty = parseInt(row.getAttribute('data-qty') || '1', 10) || 1, off = parseInt(row.getAttribute('data-off') || '0', 10) || 0, pay = parseInt(row.getAttribute('data-pay') || '0', 10) || 0, mode = row.getAttribute('data-offmode') || 'each';
      var v = variantFor(b, state.color); if (!v) return null;
      var total; if (pay) total = v.p * pay; else if (mode === 'total') total = v.p * qty - off; else total = (v.p - off) * qty;
      var cap = (v.cap || 0) * qty; if (!(cap > total)) cap = (v.p * qty > total) ? v.p * qty : 0;
      /* picks at different prices (plushies are priced by size, 2026-10-24): a Buy X Get Y row charges the dearest "pay" units and frees the cheapest, as the cart's BXGY does */
      if (pay && state.mix.length){
        var us = []; for (var k = 0; k < qty; k++){ us.push(variantFor(unitSize(k, b), state.mix[k] || state.color) || v); }
        if (us.some(function(u){ return u.p !== v.p || (u.cap || 0) !== (v.cap || 0); })){
          var ps = us.map(function(u){ return u.p; }).sort(function(x, y){ return y - x; });
          total = 0; for (var q = 0; q < pay && q < ps.length; q++) total += ps[q];
          var full = 0, cs = 0; us.forEach(function(u){ full += u.p; cs += u.cap || 0; });
          cap = cs > total ? cs : (full > total ? full : 0);
        }
      }
      /* offmode "pct" (plushie packs since 2026-10-24: Buy 2 save 10%, Buy 3 save 15%): off is the percent x 100, taken off every picked unit; Shopify rounds each line's percentage discount DOWN to the cent, so floor it here too or the row shows 1-3c less than the cart */
      if (mode === 'pct'){
        var tot = 0, fp = 0, cp = 0;
        for (var j = 0; j < qty; j++){ var u = variantFor(unitSize(j, b), state.mix[j] || state.color) || v; tot += u.p - Math.floor(u.p * off / 10000); fp += u.p; cp += u.cap || 0; }
        total = tot; cap = cp > total ? cp : (fp > total ? fp : 0);
      }
      return {v: v, qty: qty, total: total, unit: Math.round(total / qty), cap: cap};
    }
    function paintRows(){
      rows.forEach(function(row){
        var r = rowPrice(row), p = $('.pr-row-p', row);
        row.classList.toggle('pr-row-off', !r);
        if (p){ if (!r){ p.innerHTML = '<em>Not in this color</em>'; } else { var html = ''; if (r.cap) html += '<s>' + money(r.cap) + '</s>'; html += money(r.total); if (r.cap > r.total) html += '<i class="pr-row-save">Save ' + Math.round((1 - r.total / r.cap) * 100) + '%</i>'; p.innerHTML = html; } }
        var on = row.getAttribute('data-bundle') === state.bundle && (parseInt(row.getAttribute('data-qty') || '1', 10) || 1) === state.qty && (row.getAttribute('data-pay') || '') === (state.pay || '');
        row.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      var cur = rows.filter(function(r){ return r.getAttribute('aria-checked') === 'true'; })[0];
      var r = cur ? rowPrice(cur) : null;
      /* add-ons belong to Single and Duo only: a Max row already carries the kit (owner 2026-10-23) */
      var kitRow = !!(cur && cur.getAttribute('data-kit') === '1');
      if (addsBlk){ addsBlk.hidden = kitRow; if (kitRow) adds.forEach(function(a){ a.setAttribute('aria-checked', 'false'); }); }
      var addTotal = 0; adds.forEach(function(a){ if (a.getAttribute('aria-checked') === 'true') addTotal += parseInt(a.getAttribute('data-price') || '0', 10); });
      if (priceEl){
        if (r){
          priceEl.innerHTML = (r.cap ? '<s>' + money(r.cap) + '</s>' : '') + '<span class="pr-price-now">' + money(r.total + addTotal) + '</span>' + (r.cap ? '<span class="pr-tag">Save ' + Math.round((1 - r.total / r.cap) * 100) + '%</span>' : '');
        } else { priceEl.innerHTML = '<span class="pr-price-now">' + money(data.variants[0].p) + '</span>'; }
      }
      /* dim swatches that do not exist in the chosen pack */
      sws.forEach(function(s){ var c = s.getAttribute('data-color'); var exists = !!variantFor(state.bundle, c); s.classList.toggle('pr-sw-off', !exists); });
      if (btn){ var okv = r && r.v.av; btn.disabled = !okv; btn.textContent = okv ? (firstEmpty(0) >= 0 ? 'Choose your ' + state.qty + ' ' + unitWord.toLowerCase() + 's' : (btn.getAttribute('data-label') || 'Add to bag')) : (r ? 'Sold out' : 'Pick another color'); }
      /* every pack row carries its own Add to bag (owner 2026-10-23); the big button below only shows while the add-on cases are on offer, so it can add pack + cases together */
      rowBtns.forEach(function(b){ if (b.getAttribute('data-busy')) return; var rr = rowPrice(b.parentNode); b.disabled = !rr || !rr.v.av; b.textContent = !rr ? 'Not in this color' : (rr.v.av ? (b.parentNode.getAttribute('aria-checked') === 'true' && firstEmpty(0) >= 0 ? 'Choose your ' + state.qty + ' ' + unitWord.toLowerCase() + 's' : (btn.getAttribute('data-label') || 'Add to bag')) : 'Sold out'); });
      if (rowBtns.length && ctaBox) ctaBox.classList.toggle('pr-cta-off', !(addsBlk && !addsBlk.hidden));
      /* pinned pill (rad's SELECT SIZE): with pack rows it opens the pack sheet, the price shows the current pick (owner preferred this over the pg-clean style dock, 2026-10-23) */
      /* owner 2026-10-24 "it should show cheapest price in the sticky cart": with pack rows the pill shows the cheapest pack ("From $34.99") and the best saving on the page */
      if (stick && btn){
        stickT.textContent = hasRows ? 'Choose your bundle' : btn.textContent;
        if (hasRows){
          var lo = null, best = 0;
          rows.forEach(function(row){ if (row.closest('.pr-rows-hidden')) return; var rr = rowPrice(row); if (!rr || !rr.v.av) return; if (lo === null || rr.total < lo) lo = rr.total; if (rr.cap > rr.total) best = Math.max(best, Math.round((1 - rr.total / rr.cap) * 100)); });
          stickP.innerHTML = lo !== null ? '<small>From</small>' + money(lo) : ''; stickS.textContent = best ? 'Save up to ' + best + '%' : '';
        } else { stickP.textContent = r && !btn.disabled ? money(r.total + addTotal) : ''; stickS.textContent = r && !btn.disabled && r.cap > r.total ? 'Save ' + Math.round((1 - r.total / r.cap) * 100) + '%' : ''; } stickBtn.disabled = !hasRows && btn.disabled; }
      mixSync(); rows.forEach(function(row){ if (row.getAttribute('aria-checked') === 'true' && !row.closest('.pr-rows-hidden')) mixBuild(row); else { var mx = row.querySelector(':scope > .pr-mix'); if (mx) mx.remove(); } });
      if (sheet && !sheet.hidden) fill();
    }
    /* mixed colours in a pack (owner 2026-10-23: "eden hoodie should let you choose 2 or 3 different colors", "duo max and duo bundles should be able to choose different colors"):
       a pack of 2+ shows one picker per unit inside its row and in the pack sheet; the main swatch still sets every unit;
       Add to bag sends one line per colour, and the Duo / Trio discounts (whole product or every colour variant, minimum quantity) still apply */
    var unitWord = /hoodie/i.test(location.pathname) ? 'Hoodie' : (/crystal|orb/i.test(location.pathname) ? 'Orb' : (/plush/i.test(location.pathname) ? 'Plushie' : (/ball-cushion/i.test(location.pathname) ? 'Cushion' : 'Console')));
    state.mix = []; state.mixSize = []; state.picked = [];
    /* Small / Large switch (plushies and ball cushions, owner 2026-10-24 "one page, Small/Big switch"; Big renamed Large 2026-10-25): the size is option2, so it rides in every pack row's bundle;
       each name carries its exact size from the variant's custom.size_cm, and a character not made in the chosen size is greyed out */
    var sizeBtns = $$('.pr-szw-b', box), sizeOn = sizeBtns.length > 1 && colorOpt === 1, mixBtn = null;
    state.mixMode = false;
    /* every pick in a pack carries its own size (owner 2026-10-25 "can't they choose small and big combo"): the switch sets all of them, each dropdown can change one */
    function unitSize(i, b){ return sizeOn ? (state.mixSize[i] || b || state.bundle) : b; }
    function markSize(){
      var all = state.mixSize.length ? state.mixSize : [state.bundle], same = all.every(function(x){ return x === all[0]; });
      if (!same && state.qty > 1) state.mixMode = true;
      sizeBtns.forEach(function(b){ b.setAttribute('aria-checked', !state.mixMode && same && b.getAttribute('data-size') === all[0] ? 'true' : 'false'); });
      if (mixBtn) mixBtn.setAttribute('aria-checked', state.mixMode ? 'true' : 'false');
    }
    function setBundle(sv){ state.bundle = sv; rows.forEach(function(r){ if (!r.closest('.pr-rows-hidden')) r.setAttribute('data-bundle', sv); }); }
    function nameOf(cc){ var vv = sizeOn ? variantFor(state.bundle, cc) : null; return cc + (vv && vv.cm ? ' \u00b7 ' + vv.cm : ''); }
    function setSize(sv, byUser){
      state.mixMode = false; if (mixBtn) mixBtn.setAttribute('aria-checked', 'false');
      setBundle(sv);
      state.mixSize = state.mixSize.map(function(){ return sv; });
      sizeBtns.forEach(function(b){ b.setAttribute('aria-checked', b.getAttribute('data-size') === sv ? 'true' : 'false'); });
      var firstOk = null; sws.forEach(function(x){ var c = x.getAttribute('data-color'); if (!firstOk && mixOk(c)) firstOk = c; });
      if (firstOk && !mixOk(state.color)){ state.color = firstOk; sws.forEach(function(x){ x.setAttribute('aria-checked', x.getAttribute('data-color') === firstOk ? 'true' : 'false'); }); var l = $('.pr-sw-name', box); if (l) l.textContent = firstOk; }
      state.mix = state.mix.map(function(c){ return mixOk(c) ? c : (firstOk || c); });
      var v = variantFor(sv, state.color); if (byUser && v && v.media) document.dispatchEvent(new CustomEvent('pr:show-media', {detail: {id: v.media}}));
      paintRows();
    }
    if (sizeOn) sizeBtns.forEach(function(b){
      var sv = b.getAttribute('data-size'), lo = null, cms = [];
      data.variants.forEach(function(v){ if (v.o2 !== sv) return; if (lo === null || v.p < lo) lo = v.p; String(v.cm || '').replace(/\d+(\.\d+)?/g, function(n){ cms.push(parseFloat(n)); return n; }); });
      var ce = $('.pr-szw-cm', b), pe = $('.pr-szw-p', b);
      if (ce && cms.length){ var a = Math.min.apply(null, cms), z = Math.max.apply(null, cms); ce.textContent = (a === z ? a : a + '\u2013' + z) + ' cm'; }
      if (pe && lo !== null) pe.textContent = 'From ' + money(lo);
      b.addEventListener('click', function(){ touched = true; setSize(sv, true); });
    });
    /* the size is picked per plushie inside the pack (owner 2026-10-25 "there should not be the 2 options at top if they choose in bundle"):
       the Small / Large cards above the packs are hidden by CSS and only feed sizeBtns; every pick row carries its own Small | Large toggle */
    function pickIn(sz, c){ var v = variantFor(sz, c); if (v && v.av) return c; var hit = null; sws.forEach(function(sw){ var cc = sw.getAttribute('data-color'), vv = variantFor(sz, cc); if (!hit && vv && vv.av) hit = cc; }); return hit || c; }
    function setMix(){
      state.mixMode = true;
      if (state.qty < 2){ var r2 = liveRows().filter(function(r){ return (parseInt(r.getAttribute('data-qty') || '1', 10) || 1) === 2; })[0] || liveRows().filter(function(r){ return (parseInt(r.getAttribute('data-qty') || '1', 10) || 1) > 1; })[0]; if (r2){ state.qty = parseInt(r2.getAttribute('data-qty'), 10) || 2; state.pay = r2.getAttribute('data-pay') || ''; } }
      mixSync();
      var zs = sizeBtns.map(function(b){ return b.getAttribute('data-size'); });
      state.mixSize = state.mix.map(function(c, i){ return zs[i % 2] || zs[0]; });
      state.mix = state.mix.map(function(c, i){ return pickIn(state.mixSize[i], c); });
      setBundle(state.mixSize[0]); markSize(); paintRows();
      var v = variantFor(state.mixSize[1] || state.mixSize[0], state.mix[1] || state.mix[0]); if (v && v.media) document.dispatchEvent(new CustomEvent('pr:show-media', {detail: {id: v.media}}));
    }
    /* since 2026-10-23 (owner "colors should all be in the bundles not above") every pack row carries the colour pick, a single unit too; the colour block above the packs is hidden by CSS */
    function mixOn(){ return sws.length > 1 && state.qty >= 1; }
    /* packs of 2+ on the many-character products start with empty "Choose" slots (owner 2026-10-25 "shouldn't have pre filled slots, it makes it confusing
       in the picker, should just be like choose"); state.mix still carries a stand-in so prices work, state.picked says which slots the shopper chose */
    function emptyOn(){ return (sizeOn || sws.length > 10) && state.qty > 1; }
    function isEmpty(k){ return emptyOn() && !state.picked[k]; }
    function firstEmpty(from){ for (var j = 0; j < state.qty; j++){ var k = ((from || 0) + j) % state.qty; if (isEmpty(k)) return k; } return -1; }
    function mixSync(){ if (!mixOn()){ state.mix = []; state.mixSize = []; state.picked = []; return; } var m = state.mix.slice(0, state.qty); while (m.length < state.qty) m.push(state.color); state.mix = m; state.picked = state.picked.slice(0, state.qty);
      var z = state.mixSize.slice(0, state.qty); while (z.length < state.qty) z.push(z.length ? z[0] : state.bundle); state.mixSize = z; }
    function mixOk(c){ var v = variantFor(state.bundle, c); return !!(v && v.av); }
    function mixSet(i, c, sz){
      state.mix[i] = c; state.picked[i] = true;
      if (sizeOn && sz){ state.mixSize[i] = sz; if (i === 0) setBundle(sz); markSize(); }
      if (i === 0){ state.color = c; sws.forEach(function(x){ x.setAttribute('aria-checked', x.getAttribute('data-color') === c ? 'true' : 'false'); }); var l = $('.pr-sw-name', box); if (l) l.textContent = c; }
      var v = variantFor(unitSize(i, state.bundle), c) || variantFor('', c);
      if (!showFloat(c, unitSize(i, state.bundle)) && (i === 0 || sizeOn) && v && v.media) document.dispatchEvent(new CustomEvent('pr:show-media', {detail: {id: v.media}}));
      paintRows();
    }
    /* the first photo is the picked character floating on white, files/pr-float-<name>.png (owner 2026-10-25: "first photo should be where it's
       hovering in white like the other items and then gloves", "every new pokemon or ball it turns to new hovering so they know it's different") */
    function showFloat(cc, sz){
      if ($('.pr-gal-track > .pr-gal-fl')){ document.dispatchEvent(new CustomEvent('pr:gal-name', {detail: {name: cc, pick: cc + '|' + sz}})); return true; }
      if (!sizeOn) return false;
      var fi = $('.pr-gal-track > [data-media="float"] img'); if (!fi) return false;
      var k = slugOf(cc), kz = k + '-' + slugOf(sz || ''); if (SPR.k.indexOf(kz) >= 0) k = kz;
      if (fi.getAttribute('data-k') !== k){
        fi.setAttribute('data-k', k); fi.removeAttribute('srcset'); fi.src = '/cdn/shop/files/pr-float-' + k + '.png?width=1200'; fi.alt = cc;
        var nm = fi.parentNode.querySelector('.pr-gal-name'), ft = $('.pr-gal-thumbs > [data-media="float"] img');
        if (nm) nm.textContent = cc;
        if (ft) ft.src = '/cdn/shop/files/pr-float-' + k + '.png?width=160';
      }
      document.dispatchEvent(new CustomEvent('pr:show-media', {detail: {id: 'float'}}));
      return true;
    }
    function mixBuild(host){
      var el = host.querySelector(':scope > .pr-mix');
      if (!mixOn()){ if (el) el.remove(); return; }
      if (!el){ el = document.createElement('div'); el.className = 'pr-mix'; el.addEventListener('click', function(e){ e.stopPropagation(); }); el.addEventListener('keydown', function(e){ e.stopPropagation(); }); host.insertBefore(el, host.querySelector(':scope > .pr-row-add')); }
      /* the hoodie keeps its colour dots in the pack (owner 2026-10-25, after a try with the plush rows: "do color regular picked in bundle for hoodie") */
      if (sizeOn || sws.length > 10){ sizeRows(el); return; }
      /* a product with the Small / Big switch always gets dropdowns (owner 2026-10-25 "the poke balls should be dropdown too like plushy") */
      var many = sws.length > 10 || sizeOn, single = state.qty === 1, word = unitWord.toLowerCase(), what = unitWord === 'Orb' || unitWord === 'Plushie' ? 'character' : (unitWord === 'Cushion' ? 'design' : 'color');
      el.classList.toggle('pr-mix-one', single); el.classList.toggle('pr-mix-many', many && !single); el.classList.toggle('pr-mix-n2', many && state.qty === 2);
      var wz = sizeOn ? what + ' and size' : what;
      el.innerHTML = '<p class="pr-mix-h">' + (single ? 'Pick a ' + wz : 'Pick a ' + wz + ' for each ' + word) + '</p>';
      /* 10+ choices (the orb's 36 characters) = a dropdown per unit, the single pack too (owner 2026-10-24 "the single orb should be a drop down too") */
      var list = document.createElement('div'); list.className = 'pr-mix-list' + (many ? ' pr-mix-sel' : ''); el.appendChild(list);
      state.mix.forEach(function(c, i){
        var u = document.createElement('div'); u.className = 'pr-mix-u';
        if (!single){ var lb = document.createElement('span'); lb.className = 'pr-mix-l'; lb.textContent = unitWord + ' ' + (i + 1); u.appendChild(lb); }
        if (many){
          var sel = document.createElement('select'); sel.setAttribute('aria-label', single ? 'Pick a ' + what : unitWord + ' ' + (i + 1));
          if (sizeOn){
            var mine = unitSize(i, state.bundle);
            sizeBtns.forEach(function(b){
              var sz = b.getAttribute('data-size'), og = document.createElement('optgroup'), lo = null;
              sws.forEach(function(sw){ var vv = variantFor(sz, sw.getAttribute('data-color')); if (vv && (lo === null || vv.p < lo)) lo = vv.p; });
              og.label = sz + (lo !== null ? ' \u00b7 ' + money(lo) : '');
              sws.forEach(function(sw){ var cc = sw.getAttribute('data-color'), vv = variantFor(sz, cc); if (!vv) return; var o = document.createElement('option'); o.value = sz + '|' + cc; o.textContent = cc + (vv.cm ? ' \u00b7 ' + vv.cm : ''); o.disabled = !vv.av; if (cc === c && sz === mine) o.selected = true; og.appendChild(o); });
              sel.appendChild(og);
            });
            sel.addEventListener('change', function(){ var pr = sel.value.split('|'); mixSet(i, pr.slice(1).join('|'), pr[0]); });
          } else {
            sws.forEach(function(sw){ var cc = sw.getAttribute('data-color'), o = document.createElement('option'); o.value = cc; o.textContent = nameOf(cc); o.disabled = !mixOk(cc); if (cc === c) o.selected = true; sel.appendChild(o); });
            sel.addEventListener('change', function(){ mixSet(i, sel.value); });
          }
          /* three pickers share a row, so the chosen name shows in a span that can wrap to two lines; the real select sits on top, invisible, and opens the native list */
          var pk = document.createElement('label'); pk.className = 'pr-mix-pick'; var pv = document.createElement('span'); pv.className = 'pr-mix-v'; var vc = sizeOn ? variantFor(unitSize(i, state.bundle), c) : null;
          /* the size sits on its own line and never breaks ("Pikachu · 20-" / "25 cm" was too crammed, owner 2026-10-25) */
          if (vc && vc.cm){ pv.className += ' pr-mix-v2'; var pn = document.createElement('span'); pn.className = 'pr-mix-nm'; pn.textContent = c; var pc = document.createElement('span'); pc.className = 'pr-mix-cm'; pc.textContent = vc.o2 + ' \u00b7 ' + String(vc.cm).replace(/-/g, '\u2011').replace(/ /g, '\u00a0'); pv.appendChild(pn); pv.appendChild(pc); } else pv.textContent = nameOf(c); pk.appendChild(pv); pk.appendChild(sel); u.appendChild(pk);
        } else {
          var dots = document.createElement('div'); dots.className = 'pr-mix-dots'; dots.setAttribute('role', 'radiogroup'); dots.setAttribute('aria-label', unitWord + ' ' + (i + 1));
          sws.forEach(function(sw){
            var cc = sw.getAttribute('data-color'), d = document.createElement('button'); d.type = 'button'; d.className = 'pr-mix-dot'; d.setAttribute('role', 'radio'); d.setAttribute('aria-checked', cc === c ? 'true' : 'false'); d.setAttribute('aria-label', cc); d.title = cc;
            var inner = sw.firstElementChild; if (inner) d.appendChild(inner.cloneNode(true));
            if (!mixOk(cc)){ d.disabled = true; d.classList.add('pr-off'); if (sizeOn) d.title = cc + ' (not made in ' + state.bundle + ')'; }
            d.addEventListener('click', function(){ mixSet(i, cc); }); dots.appendChild(d);
          });
          u.appendChild(dots);
          var nm = document.createElement('em'); nm.className = 'pr-mix-n'; nm.textContent = nameOf(c); u.appendChild(nm);
        }
        list.appendChild(u);
      });
      /* long names (Mega Charizard X) step the font down until whole words fit on two lines */
      [].forEach.call(el.querySelectorAll('.pr-mix-v:not(.pr-mix-v2)'), function(v){
        if (!v.clientWidth) return;
        for (var fs = 12.5; fs >= 9.5; fs -= .5){ v.style.fontSize = fs + 'px'; if (v.scrollWidth <= v.clientWidth + 1 && v.scrollHeight <= v.clientHeight + 1) break; }
      });
    }
    /* plushies and ball cushions (owner 2026-10-25 "simple and not huge lists", "pick 3 is getting cut out of box", "the size under name is indented too far right"):
       one full-width row per pick with its photo, name and size on one line; tapping it opens a photo grid of ONLY that size's characters.
       In Mix & match each row carries a Small | Large toggle. Thumbnails use the larger size's studio photo, a close shot of every character */
    function thumbOf(cc, sz){
      var big = sizeBtns.length ? sizeBtns[sizeBtns.length - 1].getAttribute('data-size') : sz, v = variantFor(big, cc) || variantFor(sz, cc), s = v && v.media ? $('.pr-gal-track > [data-media="' + v.media + '"] img') : null, u = s ? (s.getAttribute('src') || '') : (v && v.img ? v.img : '');
      return u ? u.replace(/([?&])width=\d+/, '$1width=240') : '';
    }
    /* the picker thumbnails are label-free studio crops on one sprite (files/pr-pick-sprite-1025.jpg, 6 x 5 cells of 240px), keyed by name;
       "-large" where the Large is a different plush (Jigglypuff); Gengar (2026-10-27) fills the last cell. A name not on the sprite falls back to its
       gallery photo, or to the variant's own photo when that photo is not a gallery slide (the floating gallery only shows the ", floating" shots) */
    var SPR = {u: '/cdn/shop/files/pr-pick-sprite-1027.jpg?width=1080', c: 6, r: 5, k: ['pikachu', 'charmander', 'sleeping-charizard', 'sleeping-black-charizard', 'squirtle', 'bulbasaur', 'venusaur', 'snorlax', 'mew', 'jigglypuff', 'jigglypuff-large', 'eevee', 'umbreon', 'standing-umbreon', 'shiny-umbreon', 'vaporeon', 'flareon', 'sylveon', 'sitting-sylveon', 'vulpix', 'espurr', 'cubone', 'cyndaquil', 'turtwig', 'chimchar', 'poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'gengar']};
    function slugOf(t){ return String(t).toLowerCase().replace(/\u00e9/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
    function thumbHTML(cc, sz, now){
      var k = slugOf(cc), i = sizeOn ? SPR.k.indexOf(k + '-' + slugOf(sz)) : -1; if (sizeOn && i < 0) i = SPR.k.indexOf(k);
      if (i < 0){ var u = thumbOf(cc, sz); return u ? '<img src="' + u + '" alt=""' + (now ? '' : ' loading="lazy"') + '>' : ''; }
      return '<i class="pr-spr" style="background-image:url(' + SPR.u + ');background-position:' + ((i % SPR.c) * 100 / (SPR.c - 1)) + '% ' + (Math.floor(i / SPR.c) * 100 / (SPR.r - 1)) + '%"></i>';
    }
    /* one slim row per pick (owner 2026-10-25 "little confusing w duos bc trio and cluttered"): numbered photo, name, size and cm, an arrow.
       Size AND character are chosen in the sheet the row opens, so the pack itself stays a short list */
    function sizeRows(el){
      var single = state.qty === 1, word = unitWord.toLowerCase(), what = unitWord === 'Cushion' ? 'design' : (unitWord === 'Hoodie' ? 'color' : 'character');
      el.className = 'pr-mix pr-mix-sz' + (single ? ' pr-mix-one' : '');
      var left = 0; for (var q = 0; q < state.qty; q++) if (isEmpty(q)) left++;
      el.innerHTML = '<p class="pr-mix-h">' + (single ? 'Your ' + word : 'Your ' + state.qty + ' ' + word + 's') + '<span>' + (left ? 'Choose ' + left + ' more' : 'Tap to change ' + (sizeOn ? 'size or ' : '') + what) + '</span></p>';
      var list = document.createElement('div'); list.className = 'pr-mix-zl'; el.appendChild(list);
      state.mix.forEach(function(c, i){
        var sz = unitSize(i, state.bundle), v = variantFor(sz, c), pk = document.createElement('button'), none = isEmpty(i); pk.type = 'button'; pk.className = 'pr-mix-card' + (none ? ' pr-mix-empty' : '');
        pk.innerHTML = '<span class="pr-mix-ph">' + (none ? '<i class="pr-mix-plus" aria-hidden="true"></i>' : thumbHTML(c, sz)) + (single ? '' : '<em class="pr-mix-no">' + (i + 1) + '</em>') + '</span><span class="pr-mix-ct"><b></b><small></small></span><svg class="pr-mix-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
        if (none){ $('b', pk).textContent = 'Choose ' + word + ' ' + (i + 1); $('small', pk).textContent = 'Tap to pick ' + (sizeOn ? 'a size and ' : 'a ') + what; }
        else { $('b', pk).textContent = c; $('small', pk).textContent = sizeOn ? sz + (v && v.cm ? ' · ' + v.cm : '') + (v && !v.av ? ' · Sold out' : '') : (v && !v.av ? 'Sold out' : ''); }
        pk.setAttribute('aria-label', (single ? '' : unitWord + ' ' + (i + 1) + ': ') + (none ? 'not chosen yet. Choose' : c + (sizeOn ? ', ' + sz : '') + '. Change'));
        pk.addEventListener('click', function(){ openPick(i); });
        list.appendChild(pk);
      });
    }
    var pickEl = null, pickFor = 0;
    function closePick(){ if (!pickEl || pickEl.hidden) return; pickEl.classList.remove('in'); document.documentElement.classList.remove('pr-pick-open'); setTimeout(function(){ if (!pickEl.classList.contains('in')) pickEl.hidden = true; }, 260); }
    function openPick(i){
      pickFor = i;
      if (!pickEl){
        pickEl = document.createElement('div'); pickEl.className = 'pr-pick'; pickEl.hidden = true;
        pickEl.innerHTML = '<div class="pr-pick-bg"></div><div class="pr-pick-card" role="dialog" aria-modal="true"><div class="pr-pick-head"><b></b><button type="button" class="pr-pick-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="pr-pick-slots" hidden></div><div class="pr-pick-tabs" role="tablist"></div><p class="pr-pick-note" hidden></p><div class="pr-pick-grid"></div></div>';
        document.body.appendChild(pickEl);
        $('.pr-pick-bg', pickEl).addEventListener('click', closePick); $('.pr-pick-x', pickEl).addEventListener('click', closePick);
        document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closePick(); });
      }
      var what = unitWord === 'Cushion' ? 'design' : (unitWord === 'Hoodie' ? 'color' : 'character');
      paintSlots();
      $('.pr-pick-card', pickEl).setAttribute('aria-label', 'Pick a ' + (sizeOn ? 'size and ' : '') + what);
      /* Small | Large tabs on top; switching a tab only changes the view, tapping a picture picks it */
      var tabs = $('.pr-pick-tabs', pickEl); tabs.innerHTML = ''; tabs.hidden = !sizeOn;
      if (sizeOn) sizeBtns.forEach(function(sb){
        var z = sb.getAttribute('data-size'), t = document.createElement('button'), up = unitPrice(z), zc = sizeCm(z); t.type = 'button'; t.setAttribute('role', 'tab'); t.setAttribute('data-size', z); t.innerHTML = '<b></b>' + (up ? '<span></span>' : ''); $('b', t).textContent = z + (zc ? ' \u00b7 ' + zc : ''); if (up) $('span', t).textContent = up;
        t.addEventListener('click', function(){ pickGrid(z); }); tabs.appendChild(t);
      });
      pickGrid(unitSize(i, state.bundle));
      var pb = document.getElementById('PBarNextFrameWrapper'), pt = pb ? pb.getBoundingClientRect().top : 0;
      $('.pr-pick-card', pickEl).style.bottom = pb && pt > 0 && pt < innerHeight ? (innerHeight - pt) + 'px' : '';
      pickEl.hidden = false; document.documentElement.classList.add('pr-pick-open'); void pickEl.offsetHeight; setTimeout(function(){ pickEl.classList.add('in'); }, 20);
    }
    /* a pack picks 1, 2, 3 in one sheet (owner 2026-10-25 "should just highlight 1 2 3", brought back after a tap-to-add try): a numbered tile per pick on top,
       the one being chosen in purple, and each pick steps on to the next; tap a tile to change that one. Big packs (the orb's 9) get small photo-only tiles in
       one sliding row and a single x5 badge per photo (owner: the 9 named tiles and 5-6-7-8-9 badges "looks awful") */
    function paintSlots(){
      var sl = $('.pr-pick-slots', pickEl), many = state.qty > 1, big = state.qty > 3;
      $('.pr-pick-head b', pickEl).textContent = many ? unitWord + ' ' + (pickFor + 1) + ' of ' + state.qty : 'Your ' + unitWord.toLowerCase();
      sl.hidden = !many; sl.innerHTML = ''; sl.classList.toggle('pr-pick-slots-big', big);
      if (!many) return;
      state.mix.forEach(function(c, k){
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pr-pick-slot'; b.setAttribute('aria-pressed', k === pickFor ? 'true' : 'false'); b.setAttribute('aria-label', unitWord + ' ' + (k + 1) + ': ' + c);
        var none = isEmpty(k); if (none) b.classList.add('pr-pick-slot-empty');
        b.innerHTML = '<span class="pr-pick-sph">' + (none ? '<i class="pr-mix-plus" aria-hidden="true"></i>' : thumbHTML(c, unitSize(k, state.bundle), true)) + '</span><em>' + (k + 1) + '</em>' + (big ? '' : '<small></small>');
        if (!big) $('small', b).textContent = none ? 'Choose' : c;
        b.addEventListener('click', function(){ pickFor = k; paintSlots(); pickGrid(unitSize(k, state.bundle)); });
        sl.appendChild(b);
      });
      var on = sl.children[pickFor]; if (big && on) sl.scrollLeft = on.offsetLeft - (sl.clientWidth - on.offsetWidth) / 2;
    }
    /* ONE order for every size (owner 2026-10-25 "keep the small and large in same order on chooser so people can see right away if they have em in same size"):
       every character keeps its place; one not made in this size is faded with "Large only · 45 cm", and picking it takes that size */
    function unitPrice(z){
      var lo = null; data.variants.forEach(function(v){ if (v.o2 === z && (lo === null || v.p < lo)) lo = v.p; }); if (lo === null) return '';
      var cur = rows.filter(function(r){ return r.getAttribute('aria-checked') === 'true'; })[0], off = cur ? parseInt(cur.getAttribute('data-off') || '0', 10) || 0 : 0;
      if (cur && cur.getAttribute('data-offmode') === 'pct' && off) lo -= Math.floor(lo * off / 10000);
      return money(lo) + (state.qty > 1 ? ' each' : '');
    }
    function sizeCm(z){ var c = null; data.variants.forEach(function(v){ if (v.o2 === z && v.cm){ c = c === null || c === v.cm ? v.cm : ''; } }); return c || ''; }
    function pickGrid(sz){
      var i = pickFor, gd = $('.pr-pick-grid', pickEl), alts = 0, cur = unitSize(i, state.bundle);
      $$('.pr-pick-tabs button', pickEl).forEach(function(t){ t.setAttribute('aria-selected', t.getAttribute('data-size') === sz ? 'true' : 'false'); });
      gd.innerHTML = '';
      sws.forEach(function(sw){
        var cc = sw.getAttribute('data-color'), vv = variantFor(sz, cc), useSz = sz;
        if (!vv && sizeOn) sizeBtns.forEach(function(sb){ var z = sb.getAttribute('data-size'); if (!vv && z !== sz && variantFor(z, cc)){ vv = variantFor(z, cc); useSz = z; } });
        if (!vv) return;
        var alt = useSz !== sz; if (alt) alts++;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'pr-pick-it' + (alt ? ' pr-pick-alt' : ''); b.setAttribute('aria-pressed', !isEmpty(i) && cc === state.mix[i] && useSz === cur ? 'true' : 'false'); if (!vv.av) b.disabled = true;
        var nos = []; if (state.qty > 1) state.mix.forEach(function(m, k){ if (!isEmpty(k) && m === cc && unitSize(k, state.bundle) === useSz) nos.push(k + 1); });
        var badge = !nos.length ? '' : (state.qty > 3 || nos.length > 2 ? '<i class="pr-pick-n">\u00d7' + nos.length + '</i>' : nos.map(function(x){ return '<i>' + x + '</i>'; }).join(''));
        b.innerHTML = '<span class="pr-pick-ph">' + thumbHTML(cc, useSz, true) + (badge ? '<span class="pr-pick-nos">' + badge + '</span>' : '') + '</span><b></b><small></small>';
        $('b', b).textContent = cc; $('small', b).textContent = !vv.av ? 'Sold out' : (alt ? useSz + ' only' : (sizeOn && vv.cm !== sizeCm(sz) ? (vv.cm || '') : ''));
        b.addEventListener('click', function(){
          var k = pickFor; mixSet(k, cc, useSz);
          if (state.qty < 2){ closePick(); return; }
          /* the next pick opens in place; after the last one the sheet shows the whole pack for a beat, then closes */
          var nx = firstEmpty(k + 1); if (nx >= 0) pickFor = nx; else if (k < state.qty - 1 && !emptyOn()) pickFor = k + 1;
          paintSlots(); pickGrid(unitSize(pickFor, state.bundle));
          if (nx < 0 && (emptyOn() || k >= state.qty - 1)) setTimeout(closePick, 450);
        });
        gd.appendChild(b);
      });
      var n = gd.children.length; gd.style.gridTemplateColumns = n && n <= 4 ? 'repeat(' + n + ', minmax(0, 84px))' : '';
      /* owner 2026-10-25 "make the chooser screen for orbs and pillows smaller": over 8 choices (orbs 36, plushies 24) get five small tiles a row in a
         short sheet; four or fewer (the balls) stay one row of small tiles */
      gd.classList.toggle('pr-pick-dense', n > 8); gd.classList.toggle('pr-pick-few', n > 0 && n <= 4); $('.pr-pick-card', pickEl).classList.toggle('pr-pick-short', n > 8);
      var pn = $('.pr-pick-note', pickEl);
      pn.hidden = true;
    }
    /* every pack keeps its own picks, and a pack not opened yet starts with empty slots (owner 2026-10-25 "the stuff w the picker should start empty until
       they select and it should save for that bundle only"): Buy 2's choices no longer spill into Buy 3, and going back to Buy 2 shows them again */
    var packs = {};
    function packKey(){ return state.qty + '|' + (state.pay || ''); }
    function pick(row, byUser){
      if (byUser) touched = true;
      var was = packKey();
      state.bundle = row.getAttribute('data-bundle') || ''; state.qty = parseInt(row.getAttribute('data-qty') || '1', 10) || 1; state.pay = row.getAttribute('data-pay') || '';
      var now = packKey();
      if (now !== was){
        packs[was] = {mix: state.mix.slice(), size: state.mixSize.slice(), picked: state.picked.slice(), mode: state.mixMode};
        var kept = packs[now];
        state.mix = kept ? kept.mix.slice() : []; state.mixSize = kept ? kept.size.slice() : []; state.picked = kept ? kept.picked.slice() : []; state.mixMode = kept ? kept.mode : false;
      }
      if (sizeOn && state.mixMode && state.qty < 2) state.mixMode = false; paintRows(); if (sizeOn) markSize();
    }
    var ctaBox = $('.pr-cta', box), rowBtns = [];
    if (btn) rows.filter(function(x){ return !x.closest('.pr-rows-hidden'); }).forEach(function(row){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pr-row-add'; b.textContent = 'Add to bag'; row.appendChild(b); rowBtns.push(b);
      b.addEventListener('click', function(e){
        e.stopPropagation(); pick(row, true); if (btn.disabled) return;
        b.setAttribute('data-busy', '1'); b.disabled = true; b.textContent = 'Adding...'; btn.click();
        var n = 0, t = setInterval(function(){ if ((!btn.disabled && btn.textContent !== 'Adding...') || ++n > 50){ clearInterval(t); b.removeAttribute('data-busy'); paintRows(); } }, 200);
      });
    });
    rows.forEach(function(row){ row.addEventListener('click', function(){ pick(row, true); }); row.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); pick(row, true); } }); });
    sws.forEach(function(s){ s.addEventListener('click', function(){ state.color = s.getAttribute('data-color'); state.mix = []; state.picked = []; sws.forEach(function(x){ x.setAttribute('aria-checked', x === s ? 'true' : 'false'); }); var lbl = $('.pr-sw-name', box); if (lbl) lbl.textContent = state.color; var v = variantFor(state.bundle, state.color) || variantFor('', state.color); if (!showFloat(state.color, '') && v && v.media) document.dispatchEvent(new CustomEvent('pr:show-media', {detail: {id: v.media}})); paintRows(); }); });
    adds.forEach(function(a){ a.addEventListener('click', function(){ a.setAttribute('aria-checked', a.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); paintRows(); }); a.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); a.click(); } }); });
    var sw0 = sws.filter(function(s){ return s.getAttribute('aria-checked') === 'true'; })[0] || sws[0];
    if (sw0){ state.color = sw0.getAttribute('data-color'); sw0.setAttribute('aria-checked', 'true'); var lbl0 = $('.pr-sw-name', box); if (lbl0) lbl0.textContent = state.color; }
    /* the pack sheet: color dots + every pack row + Add to bag, sliding up from the pinned pill. It drives the real rows and swatches, so the page and the sheet never disagree */
    function liveRows(){ return rows.filter(function(x){ return !x.closest('.pr-rows-hidden'); }); }
    function fill(){
      var cur = rows.filter(function(x){ return x.getAttribute('aria-checked') === 'true'; })[0], r = cur ? rowPrice(cur) : null, addTotal = 0;
      adds.forEach(function(a){ if (a.getAttribute('aria-checked') === 'true') addTotal += parseInt(a.getAttribute('data-price') || '0', 10); });
      var cl = $('.pr-sheet-cl em', sheet); if (cl) cl.textContent = state.color || '';
      $$('.pr-sheet-dot', sheet).forEach(function(d, i){ d.setAttribute('aria-checked', sws[i].getAttribute('aria-checked') || 'false'); d.classList.toggle('pr-off', sws[i].classList.contains('pr-sw-off')); });
      var lr = liveRows();
      $$('.pr-sheet-row', sheet).forEach(function(b, i){ var src = lr[i]; if (!src) return; b.setAttribute('aria-checked', src.getAttribute('aria-checked') || 'false'); b.classList.toggle('pr-off', src.classList.contains('pr-row-off')); var pp = $('.pr-row-p', src); $('.pr-sheet-p', b).innerHTML = pp ? pp.innerHTML : ''; });
      var sm = $('.pr-sheet-mix', sheet); if (sm) mixBuild(sm);
      var add = $('.pr-sheet-add', sheet); add.disabled = btn.disabled;
      add.innerHTML = '<span>' + btn.textContent + '</span>' + (r && !btn.disabled ? '<span class="pr-sheet-addp">' + money(r.total + addTotal) + '</span>' : '');
    }
    function closeSheet(){
      if (!sheet || sheet.hidden) return;
      sheet.classList.remove('in'); document.documentElement.classList.remove('pr-sheet-open');
      setTimeout(function(){ if (!sheet.classList.contains('in')) sheet.hidden = true; }, 280);
    }
    function openSheet(){
      if (!sheet){
        sheet = document.createElement('div'); sheet.className = 'pr-sheet'; sheet.hidden = true;
        var h = '<div class="pr-sheet-bg"></div><div class="pr-sheet-card" role="dialog" aria-modal="true" aria-label="Choose your bundle"><div class="pr-sheet-head"><b>Choose your bundle</b><button type="button" class="pr-sheet-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><span>Close</span></button></div>';
        if (sws.length > 1) h += '<div class="pr-sheet-cl">Color: <em></em></div><div class="pr-sheet-dots"></div>';
        h += '<div class="pr-sheet-rows"></div><div class="pr-sheet-mix"></div><button type="button" class="pr-sheet-add"></button></div>';
        sheet.innerHTML = h; document.body.appendChild(sheet);
        var dots = $('.pr-sheet-dots', sheet);
        if (dots) sws.forEach(function(sw){ var d = document.createElement('button'); d.type = 'button'; d.className = 'pr-sheet-dot'; d.setAttribute('aria-label', sw.getAttribute('data-color') || ''); var inner = sw.firstElementChild; if (inner) d.appendChild(inner.cloneNode(true)); d.addEventListener('click', function(){ sw.click(); }); dots.appendChild(d); });
        var list = $('.pr-sheet-rows', sheet);
        liveRows().forEach(function(src){
          var b = document.createElement('button'); b.type = 'button'; b.className = 'pr-sheet-row'; b.setAttribute('role', 'radio');
          var t = $('.pr-row-t', src), sub = $('.pr-row-s', src);
          b.innerHTML = '<span class="pr-sheet-radio"></span><span class="pr-sheet-info"><span class="pr-sheet-t">' + (t ? t.innerHTML : '') + '</span>' + (sub ? '<span class="pr-sheet-s">' + sub.textContent.replace(/[&<>]/g, function(ch){ return {'&': '&amp;', '<': '&lt;', '>': '&gt;'}[ch]; }) + '</span>' : '') + '</span><span class="pr-sheet-p"></span>';
          b.addEventListener('click', function(){ pick(src, true); }); list.appendChild(b);
        });
        $('.pr-sheet-bg', sheet).addEventListener('click', closeSheet); $('.pr-sheet-x', sheet).addEventListener('click', closeSheet);
        $('.pr-sheet-add', sheet).addEventListener('click', function(){ if (btn.disabled) return; closeSheet(); btn.click(); });
        document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeSheet(); });
      }
      /* sit above Shopify's preview bar on draft links, like the pill */
      var pb = document.getElementById('PBarNextFrameWrapper'), pt = pb ? pb.getBoundingClientRect().top : 0;
      $('.pr-sheet-card', sheet).style.bottom = pb && pt > 0 && pt < innerHeight ? (innerHeight - pt) + 'px' : '';
      fill(); sheet.hidden = false; document.documentElement.classList.add('pr-sheet-open');
      void sheet.offsetHeight; setTimeout(function(){ sheet.classList.add('in'); }, 20);
    }
    /* the pinned pill, phones only (CSS hides it from 900px, where the buy column is sticky) */
    if (btn){
      stick = document.createElement('div'); stick.className = 'pr-stick';
      /* owner 2026-10-24 "sticky cart should have bigger price and discount": the price and a Save % tag stack on the right */
      stick.innerHTML = '<button type="button" class="pr-btn pr-stick-btn"><span class="pr-stick-t">Choose your bundle</span><span class="pr-stick-v"><span class="pr-stick-p"></span><span class="pr-stick-s"></span></span></button>';
      document.body.appendChild(stick); stickBtn = $('.pr-stick-btn', stick); stickT = $('.pr-stick-t', stick); stickP = $('.pr-stick-p', stick); stickS = $('.pr-stick-s', stick);
      /* the pill takes you back up to the packs (owner 2026-10-23 "choose your bundle should shoot you back to bundle options at top of page"); the pack sheet stays as code, unused */
      stickBtn.addEventListener('click', function(){
        if (!hasRows){ btn.click(); return; }
        var rws = $('.pr-rows:not(.pr-rows-hidden)', box), blk = rws ? (rws.closest('.pr-blk') || rws) : box;
        var top = blk.getBoundingClientRect().top + window.scrollY - 14;
        try { window.scrollTo({top: top, behavior: reduce ? 'auto' : 'smooth'}); } catch (e){ window.scrollTo(0, top); }
        if (rws){ rws.classList.remove('pr-rows-flash'); void rws.offsetWidth; rws.classList.add('pr-rows-flash'); setTimeout(function(){ rws.classList.remove('pr-rows-flash'); }, 1600); }
      });
      /* Shopify's preview bar (draft links only) covers the bottom edge: ride above it */
      var lift = function(){ var pb = document.getElementById('PBarNextFrameWrapper'), t = pb ? pb.getBoundingClientRect().top : 0, up = !!(pb && t > 0 && t < innerHeight); stick.style.bottom = up ? (innerHeight - t) + 'px' : ''; stick.classList.toggle('pr-lifted', up); };
      window.addEventListener('load', function(){ setTimeout(function(){ if (document.getElementById('PBarNextFrameWrapper')){ lift(); setInterval(lift, 800); } }, 1200); });
      /* only once the page's own packs / Add to bag have scrolled away above (owner: "shouldn't be at top of page, only once you scroll past it") */
      var cta = $('.pr-cta', box) || btn, rowsEl = $('.pr-rows:not(.pr-rows-hidden)', box);
      var dockOn = function(){ var anchor = (cta.hidden || !cta.offsetHeight) && rowsEl ? rowsEl : cta; var on = anchor.getBoundingClientRect().bottom < 0; if (on !== stick.classList.contains('on')){ stick.classList.toggle('on', on); document.body.classList.toggle('pr-stick-on', on); if (on) lift(); } };
      var dockTk = false; window.addEventListener('scroll', function(){ if (dockTk) return; dockTk = true; setTimeout(function(){ dockTk = false; dockOn(); }, 80); }, {passive: true}); window.addEventListener('resize', dockOn); dockOn();
    }
    /* the single pack (first row on every product) always opens selected (owner 2026-10-25 "the single should always be pre selected on everything"); the template's default flag no longer picks */
    var first = rows.filter(function(r){ return !r.closest('.pr-rows-hidden'); })[0] || rows[0];
    if (first) pick(first);
    if (btn) btn.addEventListener('click', function(){
      var cur = rows.filter(function(r){ return r.getAttribute('aria-checked') === 'true'; })[0]; if (!cur) return;
      var r = rowPrice(cur); if (!r || !r.v.av) return;
      var gap = firstEmpty(0); if (gap >= 0){ openPick(gap); return; }
      var items = [];
      if (mixOn() && state.mix.length === r.qty){
        var cnt = {}, order = [];
        for (var k = 0; k < state.mix.length; k++){ var mv = variantFor(unitSize(k, state.bundle), state.mix[k]); if (!mv || !mv.av){ if (note) note.textContent = state.mix[k] + ' is sold out in this pack.'; return; } if (!cnt[mv.id]){ cnt[mv.id] = 0; order.push(mv.id); } cnt[mv.id]++; }
        order.forEach(function(id){ items.push({id: id, quantity: cnt[id]}); });
      } else items.push({id: r.v.id, quantity: r.qty});
      if (cur.getAttribute('data-kit') === '1' && data.kit) items.push({id: data.kit, quantity: r.qty});
      adds.forEach(function(a){ if (a.getAttribute('aria-checked') === 'true') items.push({id: parseInt(a.getAttribute('data-variant'), 10), quantity: 1}); });
      btn.disabled = true; var was = btn.textContent; btn.textContent = 'Adding...'; if (stickT) stickT.textContent = 'Adding...';
      fetch('/cart/add.js', {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'same-origin', body: JSON.stringify({items: items})})
        .then(function(res){ if (!res.ok) throw new Error('add'); return res.json(); })
        .then(function(){ btn.textContent = was; btn.disabled = false; if (stickT) stickT.textContent = was; document.dispatchEvent(new CustomEvent('cart:updated')); if (window.pgOpenCart) window.pgOpenCart(); else location.href = '/cart'; })
        .catch(function(){ btn.textContent = was; btn.disabled = false; if (stickT) stickT.textContent = was; if (note) note.textContent = 'Could not add that, try again.'; });
    });
  }

  /* ---------- reviews wall: Judge.me's public widget feed, rendered as simple cards ---------- */
  function reviews(){
    var wall = $('#pr-rv-wall'); if (!wall) return;
    var list = $('.pr-rv-list', wall), more = $('.pr-rv-btn', wall);
    var shop = wall.getAttribute('data-shop'), pid = wall.getAttribute('data-pid'), v = wall.getAttribute('data-v') || '', title = (wall.getAttribute('data-title') || '').trim().toLowerCase();
    if (!shop || !pid) return;
    var API = 'https://judge.me/reviews/reviews_for_widget?url=' + encodeURIComponent(shop) + '&shop_domain=' + encodeURIComponent(shop) + '&platform=shopify&product_id=' + encodeURIComponent(pid) + '&per_page=12&sort_by=rating&sort_dir=desc' + (v ? '&v=' + encodeURIComponent(v) : ''); /* highest ratings first (owner: no 1-star at the top); low ones stay, at the end */
    var page = 1, pages = null, busy = false, seen = {};
    function plain(h){ var d = document.createElement('div'); d.innerHTML = String(h || '').replace(/<\/p>|<br\s*\/?>/gi, ' '); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
    function stars(n){ var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }
    function fmtDate(x){ if (!x) return ''; var d = new Date(String(x).replace(' UTC', 'Z').replace(' ', 'T')); if (isNaN(d.getTime())) return ''; try { return d.toLocaleDateString('en-US', {month: 'short', year: 'numeric', timeZone: 'UTC'}); } catch (e){ return ''; } }
    function card(r){
      var text = plain(r.body_html) || plain(r.body); if (text.toLowerCase() === title) text = '';
      var name = plain(r.reviewer_name) || '', rating = Math.max(0, Math.min(5, Math.round(parseFloat(r.rating) || 0)));
      var pics = [], fulls = []; (r.pictures_urls || []).forEach(function(p){ var u = p && (p.compact || p.small || p.original || p.huge), f = p && (p.huge || p.original || u); if (u && /^https:\/\//.test(u)){ pics.push(u); fulls.push(f && /^https:\/\//.test(f) ? f : u); } });
      var c = document.createElement('article'); c.className = 'pr-rvw';
      var h = '<div class="pr-rvw-top"><span class="pr-rvw-stars" aria-label="' + rating + ' out of 5">' + stars(rating) + '</span><span class="pr-rvw-meta">' + name + (r.verified_buyer ? ' <i>Verified</i>' : '') + (fmtDate(r.created_at) ? ' · ' + fmtDate(r.created_at) : '') + '</span></div>';
      if (text) h += '<p>' + text.replace(/</g, '&lt;') + '</p>';
      if (pics.length){ h += '<div class="pr-rvw-pics">'; pics.slice(0, 4).forEach(function(u, k){ h += '<img src="' + u.replace(/"/g, '') + '" data-full="' + String(fulls[k] || u).replace(/"/g, '') + '" alt="Photo from ' + name.replace(/"/g, '') + '" loading="lazy" width="96" height="96" role="button" tabindex="0">'; }); h += '</div>'; }
      c.innerHTML = h; return c;
    }
    function load(){
      if (busy || (pages !== null && page > pages)) return; busy = true; if (more) more.disabled = true;
      fetch(API + '&page=' + page, {credentials: 'omit'}).then(function(r){ if (!r.ok) throw new Error('reviews'); return r.json(); }).then(function(j){
        pages = (j.pagination && j.pagination.total_pages) || page; page++;
        (j.reviews || []).forEach(function(r){ var k = (r.reviewer_name || '') + '|' + (r.body || '').slice(0, 40); if (seen[k]) return; seen[k] = 1; list.appendChild(card(r)); });
        busy = false; if (more){ more.hidden = page > pages; more.disabled = false; }
        if (!list.children.length){ list.innerHTML = '<p class="pr-rvw-empty">No reviews yet.</p>'; } else if (list.querySelector('.pr-rvw:not(.pr-rvw-seed)')){ $$('.pr-rvw-seed', list).forEach(function(e){ e.remove(); }); }
      }).catch(function(){ busy = false; if (more) more.hidden = true; if (!list.children.length) list.innerHTML = '<p class="pr-rvw-empty">No reviews yet.</p>'; });
    }
    if (more) more.addEventListener('click', load);
    if ('IntersectionObserver' in window){ var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ io.disconnect(); load(); } }); }, {rootMargin: '400px 0px'}); io.observe(wall); } else load();
  }

  /* ---------- reviews strip drift (home) ---------- */
  /* review strip (homepage): owner 2026-10-24 "needs to be faster and smoother". The cards ride a compositor animation (Web Animations, transform only),
     so it glides at full frame rate instead of stepping the scroll position a whole pixel at a time. A sideways drag moves it by hand (vertical swipes still
     scroll the page), it pauses under a mouse and while off screen, and picks up again from wherever it was left */
  function drift(){
    $$('.pr-rv[data-drift]').forEach(function(rail){
      if (reduce || !rail.animate) return;
      var cards = $$(':scope > *', rail); if (cards.length < 3) return;
      var track = document.createElement('div'); track.className = 'pr-rv-track';
      cards.forEach(function(c){ track.appendChild(c); });
      cards.forEach(function(c){ var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
      rail.appendChild(track); rail.classList.add('pr-rv-js');
      var speed = matchMedia('(max-width: 899px)').matches ? 72 : 88, set = 0, dur = 0, anim = null, seen = false, hovering = false, drag = null, dragged = false, hold = 0, holdT = 0, w0 = 0, fling = 0;
      function now(){ return performance.now(); }
      function offset(){ return anim && dur && set ? ((anim.currentTime || 0) % dur) / dur * set : 0; }
      function seek(x){ if (!anim || !set) return; x = ((x % set) + set) % set; anim.currentTime = x / set * dur; }
      function sync(){ if (!anim) return; var run = seen && !document.hidden && !drag && !fling && !hovering && now() >= hold; if (run && anim.playState !== 'running') anim.play(); else if (!run && anim.playState === 'running') anim.pause(); }
      function build(){
        var x = offset(), gap = parseFloat(getComputedStyle(track).columnGap) || 12;
        set = cards[cards.length - 1].getBoundingClientRect().right - cards[0].getBoundingClientRect().left + gap; if (set < 50) return;
        if (anim) anim.cancel();
        dur = set / speed * 1000;
        anim = track.animate([{transform: 'translate3d(0,0,0)'}, {transform: 'translate3d(' + (-set).toFixed(2) + 'px,0,0)'}], {duration: dur, iterations: Infinity});
        anim.pause(); seek(x); sync(); w0 = innerWidth;
      }
      function rest(ms){ hold = now() + ms; clearTimeout(holdT); holdT = setTimeout(sync, ms + 30); sync(); }
      rail.addEventListener('pointerdown', function(e){ if (e.pointerType === 'mouse' && e.button !== 0) return; if (fling){ cancelAnimationFrame(fling); fling = 0; } drag = {x: e.clientX, y: e.clientY, o: offset(), on: false, h: []}; dragged = false; sync(); });
      rail.addEventListener('pointermove', function(e){
        if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.on){ if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; if (Math.abs(dy) > Math.abs(dx)){ drag = null; sync(); return; } drag.on = true; dragged = true; try { rail.setPointerCapture(e.pointerId); } catch (er){} }
        seek(drag.o - dx); drag.h.push([now(), e.clientX]); if (drag.h.length > 6) drag.h.shift();
      });
      /* a swipe carries on and slows down (owner 2026-10-25 "won't glide when I scroll", then "swiping is slow and stuttering"): the glide drives the strip
         itself with the drift folded in, so the paused animation is never fighting a running one, and it hands back to the drift once it is down to drift speed */
      function glideOut(v){
        var t0 = 0, drift = speed / 1000;
        if (anim) anim.pause();
        fling = requestAnimationFrame(function step(t){
          var dt = t0 ? Math.min(40, t - t0) : 16; t0 = t; v *= Math.pow(0.965, dt / 16); seek(offset() - v * dt + drift * dt);
          if (Math.abs(v) > drift * 0.6){ fling = requestAnimationFrame(step); } else { fling = 0; sync(); }
        });
      }
      ['pointerup', 'pointercancel'].forEach(function(ev){ rail.addEventListener(ev, function(e){
        if (!drag) return; var was = drag.on, h = drag.h, v = 0; drag = null;
        if (was && e.type === 'pointerup' && h.length > 1){ var a = h[0], b = h[h.length - 1]; if (b[0] - a[0] > 0 && now() - b[0] < 90) v = (b[1] - a[1]) / (b[0] - a[0]); }
        if (Math.abs(v) > 0.15) glideOut(Math.max(-5, Math.min(5, v))); else rest(was ? 1400 : 0);
      }); });
      /* a drag must not open the photo viewer (its click listener sits on document, so stop it at window) */
      window.addEventListener('click', function(e){ if (dragged && rail.contains(e.target)){ dragged = false; e.preventDefault(); e.stopPropagation(); } }, true);
      rail.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse'){ hovering = true; sync(); } });
      rail.addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse'){ hovering = false; rest(400); } });
      rail.addEventListener('wheel', function(e){ if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); seek(offset() + e.deltaX); rest(1600); }, {passive: false});
      if (window.IntersectionObserver){ new IntersectionObserver(function(es){ es.forEach(function(e){ seen = e.isIntersecting; sync(); }); }, {threshold: 0}).observe(rail); }
      /* plus a plain position check on scroll, so it never sits paused when an observer callback is late */
      var vt = 0; function vis(){ vt = 0; var r = rail.getBoundingClientRect(); seen = r.bottom > 0 && r.top < innerHeight; sync(); }
      window.addEventListener('scroll', function(){ if (!vt) vt = setTimeout(vis, 120); }, {passive: true});
      document.addEventListener('visibilitychange', sync);
      var rt = 0; window.addEventListener('resize', function(){ if (innerWidth === w0) return; clearTimeout(rt); rt = setTimeout(build, 200); });
      build(); vis();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ build(); });
    });
  }

  /* ---------- hero film + gallery clips: play when allowed, pause when hidden, still frame on reduced motion ---------- */
  function films(){
    /* homepage film: the vertical cut on phones, the wide film on desktop; the poster <picture> is the first paint, the film fades in once it plays and only starts downloading after the page has loaded */
    $$('.pr-hero video[data-ph]').forEach(function(v){
      if (reduce) return;
      var src = matchMedia('(min-width: 901px)').matches ? v.getAttribute('data-desk') : v.getAttribute('data-ph'); if (!src) return;
      function start(){ if (v.getAttribute('src')) return; v.src = src; v.addEventListener('playing', function(){ v.classList.add('on'); }, {once: true}); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      if (document.readyState === 'complete') setTimeout(start, 150); else window.addEventListener('load', function(){ setTimeout(start, 150); }, {once: true});
      document.addEventListener('visibilitychange', function(){ if (!v.getAttribute('src')) return; if (document.hidden) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function(){}); } });
    });
    $$('.pr-gal video').forEach(function(v){
      if (reduce){ v.removeAttribute('autoplay'); try { v.pause(); } catch (e){} return; }
      function play(){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      play();
      document.addEventListener('visibilitychange', function(){ if (document.hidden) v.pause(); else play(); });
      if (window.IntersectionObserver){ new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) play(); else v.pause(); }); }, {threshold: 0.1}).observe(v); }
    });
  }

  /* ---------- interactive modules: photo tabs (2 = a switch, more = pills), screen sizes, Do the math, hem by height.
     Each one flips through its options by itself (back and forth) while it is on screen, so it reads as interactive;
     the first tap or key press on a module stops its autoplay for good. ---------- */
  function autoplay(m, step, ms, reset, early){
    var t = null, stopped = false, playing = false, tk = false;
    /* first switch a moment after the module is properly on screen, then every ms */
    function start(){ if (stopped || t) return; $$('img[loading="lazy"]', m).forEach(function(im){ im.loading = 'eager'; }); t = setTimeout(function tick(){ step(); t = setTimeout(tick, ms); }, early ? 350 : Math.min(900, ms)); }
    function stop(){ if (t){ clearTimeout(t); t = null; } }
    function quit(){ stopped = true; stop(); }
    /* only a real tap or key stops it: a finger that starts a scroll on the module must not */
    m.addEventListener('click', function(e){ if (e.isTrusted) quit(); }); m.addEventListener('keydown', quit);
    /* "in sight": most of the module on screen (one taller than the screen counts once it fills 80% of it; owner: the second module went too early).
       As a stacked card (phones, stackMods) a later card counts only once it has slid all the way up and pinned, the first one once it is fully on screen or pinned
       (owner 2026-10-23 "do the math should start at the beginning right after that scroll"). Every arrival restarts it from its first step; leaving pauses it */
    function stacked(){ return document.documentElement.classList.contains('pr-stack-on') && !!m.closest('.pr-mods-grid'); }
    function geo(){ var r = m.getBoundingClientRect(), vh = window.innerHeight, h = Math.max(1, r.height), vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)); return {r: r, vh: vh, ratio: vis / h, need: Math.min(.6, (vh * .8) / h)}; }
    function inSight(){
      var g = geo();
      if (stacked()){ var st = parseFloat(m.style.top); if (isNaN(st)) st = 12; var pinned = g.r.top <= st + 2 && g.r.bottom > g.vh * .3; if (early && m.closest('.pr-mod-wrap')) return g.r.top <= g.vh * .6 && g.r.bottom > g.vh * .3; return m.closest('.pr-mod-wrap') ? pinned : (pinned || (g.r.top >= 0 && g.r.bottom <= g.vh + 1)); }
      return g.ratio >= g.need;
    }
    function away(){
      var g = geo();
      if (stacked()){ var st = parseFloat(m.style.top); if (isNaN(st)) st = 12; if (early && m.closest('.pr-mod-wrap')) return g.r.top > g.vh * .75 || g.r.bottom < g.vh * .25; return m.closest('.pr-mod-wrap') ? (g.r.top > st + 60 || g.r.bottom < g.vh * .25) : (g.r.top > g.vh * .55 || g.r.bottom < g.vh * .25); }
      return g.ratio < g.need * .5;
    }
    function check(){ tk = false; if (stopped) return; if (!playing && inSight()){ playing = true; stop(); if (step.reset) step.reset(); if (reset) reset(); start(); } else if (playing && away()){ playing = false; stop(); } }
    function ask(){ if (!tk){ tk = true; requestAnimationFrame(check); } }
    window.addEventListener('scroll', ask, {passive: true}); window.addEventListener('resize', ask); window.addEventListener('load', ask);
    check();
  }
  function pingpong(n, cur, go){ var dir = 1, f = function(){ var i = cur(), j = i + dir; if (j >= n || j < 0){ dir = -dir; j = i + dir; } if (j >= 0 && j < n) go(j); }; f.reset = function(){ dir = 1; }; return f; }
  function pulse(b){ if (!b) return; b.classList.remove('pr-tap'); void b.offsetWidth; b.classList.add('pr-tap'); }
  function selIdx(bs){ for (var i = 0; i < bs.length; i++){ if (bs[i].getAttribute('aria-selected') === 'true') return i; } return 0; }
  function mods(){
    $$('[data-pr-tabmod]').forEach(function(m){
      var imgs = $$('.pr-tm-img', m), bs = $$('[role="tab"]', m);
      function go(k){ var b = bs[k]; if (!b) return; var i = b.getAttribute('data-i'); bs.forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); imgs.forEach(function(im){ im.classList.toggle('on', im.getAttribute('data-i') === i); }); }
      bs.forEach(function(b, k){ b.addEventListener('click', function(){ go(k); pulse(b); }); });
      var t0 = selIdx(bs);
      /* owner 2026-10-25 "the dynamic modules for these need to go quicker": plushie and ball cushion modules step every 1 s
         owner 2026-10-24: the character picker should run through every orb quicker (1.2 s a step from 5 tabs up), and a 2-way switch (Lights on / off) flips
         as soon as its card is half way up the screen instead of waiting until it has pinned ("too delayed for light off") */
      if (bs.length > 1) autoplay(m, pingpong(bs.length, function(){ return selIdx(bs); }, function(k){ go(k); pulse(bs[k]); }), /plush|ball-cushion/.test(location.pathname) && bs.length > 2 ? 1000 : bs.length > 4 ? 1200 : bs.length > 2 ? 2200 : 2800, function(){ go(t0); }, bs.length === 2);
    });
    $$('[data-pr-size]').forEach(function(m){
      var box = $('.pr-size-box', m), tag = $('.pr-size-tag', m), tabs = $$('.pr-tabs button', m), max = parseFloat(m.getAttribute('data-max')) || 1;
      function go(b){ if (typeof b === 'number') b = tabs[b]; if (!b) return; var inches = parseFloat(b.getAttribute('data-in')) || max; if (box) box.style.setProperty('--r', String(Math.max(.2, Math.min(1, inches / max)))); if (tag) tag.textContent = b.getAttribute('data-tag') || ''; tabs.forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); }
      tabs.forEach(function(b){ b.addEventListener('click', function(){ go(b); pulse(b); }); });
      var on = tabs.filter(function(b){ return b.getAttribute('aria-selected') === 'true'; })[0] || tabs[tabs.length - 1];
      /* owner 2026-10-23: "it should be the one before it then upgrade to whatever that product's screen size is": find this product's own tab (longest label found
         in the product title, so "R36S Ultra" never beats "Ultra Max"), start on the size below it, then loop: upgrade, hold, step back, upgrade again */
      var ttl = ((($('.pr-buy .pr-title') || {}).textContent) || document.title || '').toLowerCase();
      var lab = function(b){ var t = b.textContent || '', bb = b.querySelector('b'); return (bb ? t.replace(bb.textContent, '') : t).replace(/\s+/g, ' ').trim().toLowerCase(); };
      /* a label the title ENDS with wins ("r36s ultra max" ends with "ultra max", not "r36s ultra"), then the longest one inside it */
      var tt = ttl.replace(/\s+/g, ' ').trim(), pi = -1, best = -1; tabs.forEach(function(b, k){ var l = lab(b); if (!l || tt.indexOf(l) < 0) return; var sc = (tt.slice(-l.length) === l ? 1000 : 0) + l.length; if (sc > best){ best = sc; pi = k; } });
      if (pi < 0) pi = Math.max(0, tabs.indexOf(on));
      var pv = Math.max(0, pi - 1);
      go(tabs[pi > 0 ? pv : pi]);
      if (tabs.length > 1 && pi > 0){
        var seq = 0, up = function(){ var ph = seq++ % 4; if (ph === 0){ go(pi); pulse(tabs[pi]); } else if (ph === 3){ go(pv); pulse(tabs[pv]); } };
        up.reset = function(){ seq = 0; };
        autoplay(m, up, 1600, function(){ go(tabs[pv]); });
      } else if (tabs.length > 1) autoplay(m, pingpong(tabs.length, function(){ return selIdx(tabs); }, function(k){ go(k); pulse(tabs[k]); }), 2400, function(){ if (on) go(on); });
    });
    $$('[data-pr-math]').forEach(function(m){
      var sys = $$('.pr-math-sys', m), tot = $('[data-math-total]', m), them = $('[data-math-them]', m), us = $('[data-math-us]', m), price = (parseInt(m.getAttribute('data-price'), 10) || 0) / 100;
      var full = 0; sys.forEach(function(b){ full += parseFloat(b.getAttribute('data-v')) || 0; });
      function tap(b){ b.classList.remove('pr-tap'); void b.offsetWidth; b.classList.add('pr-tap'); }
      function paint(){
        var sum = 0; sys.forEach(function(b){ if (b.getAttribute('aria-pressed') === 'true') sum += parseFloat(b.getAttribute('data-v')) || 0; });
        if (tot) tot.textContent = '$' + Math.round(sum);
        var mx = Math.max(full, price) || 1; if (them) them.style.width = (sum / mx * 100).toFixed(1) + '%'; if (us) us.style.width = (price / mx * 100).toFixed(1) + '%';
      }
      sys.forEach(function(b){ b.addEventListener('click', function(){ b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); tap(b); paint(); }); });
      /* autoplay: the systems switch on one by one and the used total climbs past the price, holds, then starts again.
         owner 2026-10-24 "do the math isn't starting quick enough": it starts like the lights switch (card 60% up the screen, first tick 350 ms) and ticks every 550 ms (was pinned + 700 ms, 700 ms) */
      var c = sys.length, hold = 0;
      autoplay(m, function(){
        if (c >= sys.length){ if (hold++ < 3) return; hold = 0; c = 0; sys.forEach(function(b){ b.setAttribute('aria-pressed', 'false'); }); paint(); return; }
        sys[c].setAttribute('aria-pressed', 'true'); tap(sys[c]); c++; paint();
      }, 550, function(){ c = 0; hold = 0; sys.forEach(function(b){ b.setAttribute('aria-pressed', 'false'); }); paint(); }, true);
      /* it waits at the start (nothing ticked, $0) until it is in place, so sliding in never shows the end state first */
      sys.forEach(function(b){ b.setAttribute('aria-pressed', 'false'); }); paint();
    });
    $$('[data-pr-hem]').forEach(function(m){
      var svg = $('svg', m), tag = $('.pr-hem-tag', m), tabs = $$('[role="tab"]', m), L = parseFloat(m.getAttribute('data-len')) || 125;
      function draw(H){
        var G = 238, k = 1.06, cx = 158;
        function y(cm){ return +(G - cm * k).toFixed(1); }
        var top = y(H), hr = H / 15 * k, sh = y(H * 0.818), hip = y(H * 0.47), hemCm = Math.max(0, H * 0.818 - L), hy = y(hemCm), wS = 21 * k, wH = 37 * k;
        var s = '<g class="pr-hem-rule"><path d="M30 ' + y(200) + 'V' + G + '"/>';
        for (var c = 0; c <= 200; c += 10) s += '<path d="M30 ' + y(c) + 'h' + (c % 50 ? 4 : 9) + '"/>';
        s += '</g><text class="pr-hem-num" x="24" y="' + (y(200) + 4) + '" text-anchor="end">200</text><text class="pr-hem-num" x="24" y="' + (y(100) + 4) + '" text-anchor="end">100</text>';
        s += '<path class="pr-hem-mark" d="M30 ' + top + 'H' + (cx - hr - 10) + '"/><text class="pr-hem-h" x="44" y="' + (top - 6) + '">' + H + ' cm</text>';
        s += '<path class="pr-hem-leg" d="M' + (cx - 7) + ' ' + hip + 'V' + (G - 4) + 'M' + (cx + 7) + ' ' + hip + 'V' + (G - 4) + '"/>';
        s += '<path class="pr-hem-shoe" d="M' + (cx - 16) + ' ' + G + 'h13v-5h-9zM' + (cx + 3) + ' ' + G + 'h13l-4-5h-9z"/>';
        s += '<path class="pr-hem-cloak" d="M' + (cx - wS) + ' ' + sh + 'C' + (cx - wS - 8) + ' ' + (sh + 14) + ' ' + (cx - wH) + ' ' + (hy - 30) + ' ' + (cx - wH) + ' ' + hy + 'Q' + cx + ' ' + (hy + 7) + ' ' + (cx + wH) + ' ' + hy + 'C' + (cx + wH) + ' ' + (hy - 30) + ' ' + (cx + wS + 8) + ' ' + (sh + 14) + ' ' + (cx + wS) + ' ' + sh + 'Q' + cx + ' ' + (sh - 7) + ' ' + (cx - wS) + ' ' + sh + 'Z"/>';
        s += '<path class="pr-hem-fold" d="M' + (cx - 9) + ' ' + (sh + 18) + 'L' + (cx - 15) + ' ' + (hy - 4) + 'M' + (cx + 9) + ' ' + (sh + 18) + 'L' + (cx + 15) + ' ' + (hy - 4) + '"/>';
        s += '<path class="pr-hem-cloak" d="M' + (cx - hr - 5) + ' ' + (sh + 3) + 'Q' + (cx - hr - 7) + ' ' + (top - 5) + ' ' + cx + ' ' + (top - 6) + 'Q' + (cx + hr + 7) + ' ' + (top - 5) + ' ' + (cx + hr + 5) + ' ' + (sh + 3) + 'Z"/>';
        s += '<circle class="pr-hem-head" cx="' + cx + '" cy="' + (top + hr + 1) + '" r="' + hr.toFixed(1) + '"/>';
        s += '<path class="pr-hem-line" d="M' + (cx - wH - 8) + ' ' + hy + 'H252"/><text class="pr-hem-lbl" x="252" y="' + (hy - 6) + '" text-anchor="end">Hem</text>';
        svg.innerHTML = s;
      }
      function go(k){ var b = typeof k === 'number' ? tabs[k] : k; if (!b) return; draw(parseFloat(b.getAttribute('data-h')) || 171); if (tag) tag.textContent = b.getAttribute('data-tag') || ''; tabs.forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); }
      tabs.forEach(function(b){ b.addEventListener('click', function(){ go(b); pulse(b); }); });
      var h0 = selIdx(tabs); go(tabs[h0]);
      if (tabs.length > 1) autoplay(m, pingpong(tabs.length, function(){ return selIdx(tabs); }, function(k){ go(k); pulse(tabs[k]); }), 2600, function(){ go(tabs[h0]); });
    });
  }

  /* ---------- "/ You may also like": Recommended (server) and Recently viewed (this browser's last products) ---------- */
  function also(){
    var sec = $('[data-pr-also]'); if (!sec) return;
    var KEY = 'pr-recent', list = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e){ list = []; }
    var esc = function(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, function(c){ return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
    var me = {u: sec.getAttribute('data-me-url'), t: sec.getAttribute('data-me-title'), i: sec.getAttribute('data-me-img'), p: sec.getAttribute('data-me-price'), c: sec.getAttribute('data-me-cap') || '', v: sec.getAttribute('data-me-save') || '', s: sec.getAttribute('data-me-sub'), f: sec.getAttribute('data-me-float') === '1'};
    var others = list.filter(function(x){ return x && x.u && x.u !== me.u; });
    var pane = $('[data-also-pane="recent"]', sec), tab = $('[data-also="recent"]', sec);
    if (others.length && pane && tab){
      pane.innerHTML = others.slice(0, 8).map(function(x){ return '<a class="pr-acard" href="' + esc(x.u) + '"><div class="pr-acard-ph' + (x.f ? ' pr-float' : '') + '"><img src="' + esc(x.i) + '" alt="' + esc(x.t) + '" loading="lazy" width="700" height="700"></div><h3>' + esc(x.t) + '</h3>' + (x.s ? '<p class="pr-acard-sub">' + esc(x.s) + '</p>' : '') + '<p class="pr-acard-price">' + (x.c ? '<s>' + esc(x.c) + '</s>' : '') + '<span>' + esc(x.p) + '</span>' + (x.v ? '<i class="pr-acard-save">' + esc(x.v) + '</i>' : '') + '</p><span class="pr-acard-btn">Shop now</span></a>'; }).join('');
      tab.hidden = false;
    }
    $$('[data-also]', sec).forEach(function(b){ b.addEventListener('click', function(){ var k = b.getAttribute('data-also'); $$('[data-also]', sec).forEach(function(x){ x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); $$('[data-also-pane]', sec).forEach(function(pn){ pn.hidden = pn.getAttribute('data-also-pane') !== k; }); }); });
    if (me.u){ try { localStorage.setItem(KEY, JSON.stringify([me].concat(others).slice(0, 10))); } catch (e){} }
    /* the cards bob only while the row is on screen (same iPhone layer budget as the gallery) */
    if (window.IntersectionObserver){ new IntersectionObserver(function(es){ es.forEach(function(e){ sec.classList.toggle('pr-also-in', e.isIntersecting); }); }, {rootMargin: '200px 0px'}).observe(sec); } else sec.classList.add('pr-also-in');
  }

  /* ---------- footer (NOT CALLED since 2026-10-23 16:50Z: stripping pg- classes made pgx-pg-theme-css put() re-insert .pg-payrow every 1.5 s; the old scripts are now switched off by window.pgFooter in the layout and .pg-payrow is hidden in pr.css): a pg-* script restyles any newsletter form as its dark .pg-news module and drags the payment icons under it; undo that, idempotently ---------- */
  function footer(){
    var f = $('#pr-foot'); if (!f) return;
    function fix(){
      $$('.pg-news', f).forEach(function(e){ e.classList.remove('pg-news'); });
      var pay = $('.pr-pay', f) || $('[data-pg-moved]', f), bottom = $('.pr-foot-bottom', f);
      if (pay){
        if (bottom && pay.parentNode !== bottom) bottom.appendChild(pay);
        if (pay.hasAttribute('data-pg-moved')) pay.removeAttribute('data-pg-moved');
        if (pay.className !== 'pr-pay') pay.className = 'pr-pay';
        if (pay.hasAttribute('style')) pay.removeAttribute('style');
        $$('[style]', pay).forEach(function(x){ x.removeAttribute('style'); });
      }
      $$('form, input, button', f).forEach(function(x){ if (x.hasAttribute('style') && x.id !== 'pr-news') x.removeAttribute('style'); });
      $$('.pr-foot-cols [class*="pg-"]', f).forEach(function(x){ [].slice.call(x.classList).forEach(function(c){ if (c.indexOf('pg-') === 0) x.classList.remove(c); }); });
    }
    fix(); setTimeout(fix, 600); setTimeout(fix, 1800); setTimeout(fix, 4000);
    if (window.MutationObserver){ var busy = false; new MutationObserver(function(){ if (busy) return; busy = true; fix(); busy = false; }).observe(f, {subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style']}); }
  }

  /* ---------- homepage hero depth (phones): the clip is pinned (CSS sticky) while the copy card slides up over it; --pr-hp (0..1) = how far the card has covered it, used for a slight zoom + dim (owner 2026-10-23 "make the text scroll up into the video, more of a dynamic element") ---------- */
  function heroDepth(){
    /* off since 2026-10-24 (owner: "when I scroll down on mobile the white at top starts bugging and glitching"): a per-frame zoom on a pinned video makes iPhone Safari drop the sticky layer, so the pin stays (pure CSS) and nothing changes per frame */
    return;
    var h = $('.pr-page-home .pr-hero'); if (!h || reduce) return;
    var m = $('.pr-hero-media', h), mq = matchMedia('(max-width: 899px)'), tk = false;
    function upd(){ tk = false; if (!mq.matches){ h.style.removeProperty('--pr-hp'); return; } var p = Math.max(0, Math.min(1, -h.getBoundingClientRect().top / Math.max(1, m.offsetHeight))); h.style.setProperty('--pr-hp', p.toFixed(3)); }
    window.addEventListener('scroll', function(){ if (!tk){ tk = true; requestAnimationFrame(upd); } }, {passive: true});
    window.addEventListener('resize', upd); upd();
  }

  /* ---------- product modules as stacking cards (phones; owner 2026-10-23 "do what you did on the homepage for the modules on the product page, and when you scroll back up it snaps back into place"):
     each module card pins (CSS sticky) and the next card slides up over it; a card taller than the screen pins only once its bottom is in view (top = screen - height).
     --pr-cov (0..1) = how much of a card the next one covers, for a slight shrink + dim. Everything is recomputed from positions on every frame, so scrolling back up restores it exactly ---------- */
  function stackMods(){
    var grid = $('.pr-mods .pr-mods-grid'); if (!grid) return;
    var mods = $$(':scope > .pr-mod', grid); if (mods.length < 2) return;
    /* v2 (owner 2026-10-23 "it stutters when scrolling to the second module"): the wait is pure CSS sticky now, nothing is moved by script during scroll.
       One-time nesting grid > card1, wrap > [card2, wrap > [card3 ...]]: each later card sits in its own wrapper (padding-top = the wait) and is sticky
       with top (its pinned spot) AND bottom (parks it just under the pinned card); the wrapper keeps it from riding up over a card that is not pinned yet.
       Desktop flattens the wrappers (display: contents). The script only paints the covered card's dim + shrink, and measures on load / resize */
    var host = grid, dims = [];
    /* the wait is a spacer INSIDE the wrapper (a sticky box may move over its container's content, never into its padding) */
    for (var i = 1; i < mods.length; i++){ var w = document.createElement('div'); w.className = 'pr-mod-wrap'; if (i === 1) grid.insertBefore(w, mods[1]); else host.appendChild(w); var gp = document.createElement('i'); gp.className = 'pr-mod-gap'; gp.setAttribute('aria-hidden', 'true'); w.appendChild(gp); w.appendChild(mods[i]); host = w; }
    mods.forEach(function(m){ var d = document.createElement('i'); d.className = 'pr-mod-dim'; d.setAttribute('aria-hidden', 'true'); m.appendChild(d); dims.push(d); });
    /* desktop stacks too (owner 2026-10-24 "the modules need to function the same with the dynamic elements on desktop that we have on mobile"): there each card is
       a wide two-column card: the heading (.pr-mod-copy) and the buttons / note (.pr-mod-ctl) beside the photo / chart. Both are display: contents on phones,
       so the phone order (heading, photo, buttons) is unchanged */
    mods.forEach(function(m){
      var stage = $(':scope > .pr-tm-stage, :scope > .pr-size-stage, :scope > .pr-hem-stage, :scope > .pr-math-cmp', m); if (!stage) return;
      var cp = document.createElement('div'), ct = document.createElement('div'), after = false; cp.className = 'pr-mod-copy'; ct.className = 'pr-mod-ctl';
      $$(':scope > *', m).forEach(function(c){ if (c === stage){ after = true; return; } if (c.classList.contains('pr-mod-dim')) return; (after ? ct : cp).appendChild(c); });
      m.insertBefore(cp, stage); m.insertBefore(ct, stage.nextSibling);
    });
    var mq = {matches: true}, desk = matchMedia('(min-width: 900px)'), tk = false, lk = false, on = false, last = [], hs = [];
    function layout(){
      lk = false;
      if (!mq.matches){ if (on){ on = false; document.documentElement.classList.remove('pr-stack-on'); mods.forEach(function(m, i){ m.style.removeProperty('top'); m.style.removeProperty('bottom'); m.style.removeProperty('transform'); dims[i].style.opacity = '0'; }); last = []; } return; }
      if (!on){ on = true; document.documentElement.classList.add('pr-stack-on'); }
      var vh = window.innerHeight, prevBottom = 0;
      mods.forEach(function(m, i){
        var h = m.offsetHeight, top = Math.min(desk.matches ? 28 : 12, vh - h - 12); hs[i] = h;
        m.style.top = top + 'px';
        if (i){ var park = Math.min(prevBottom + 16, vh - 60); m.style.bottom = (vh - park - h) + 'px'; } else m.style.removeProperty('bottom');
        prevBottom = top + h;
      });
      paint();
    }
    function paint(){
      tk = false; if (!on) return;
      var tops = mods.map(function(m){ return m.getBoundingClientRect().top; });
      mods.forEach(function(m, i){
        var p = 0; if (i + 1 < mods.length && !reduce){ var h = hs[i] || m.offsetHeight; p = Math.max(0, Math.min(1, (tops[i] + h - tops[i + 1]) / Math.max(1, h))); }
        var k = Math.round(p * 500); if (last[i] === k) return; last[i] = k;
        dims[i].style.opacity = (p * .22).toFixed(3);
        m.style.setProperty('transform', k ? 'scale(' + (1 - p * .05).toFixed(4) + ')' : 'none', 'important');
      });
    }
    function askPaint(){ if (!tk){ tk = true; requestAnimationFrame(paint); } }
    function askLayout(){ if (!lk){ lk = true; requestAnimationFrame(layout); } }
    window.addEventListener('scroll', askPaint, {passive: true}); window.addEventListener('resize', askLayout); window.addEventListener('load', askLayout);
    if (window.ResizeObserver){ var ro = new ResizeObserver(askLayout); mods.forEach(function(m){ ro.observe(m); }); }
    layout();
  }

  /* ---------- one purple in the cart (owner 2026-10-23 "all these purples need to match"): old cart scripts stamp inline !important colours
     (pg-cart-total: TOTAL #3B1553; pg-cart-variants: the line dropdown #4A1C66 / #7A2FA2). CSS cannot beat inline !important, so re-tint them
     whenever the drawer re-renders; nothing is written when a value already matches, so it cannot loop ---------- */
  function cartTint(){
    var cart = document.getElementById('cart'); if (!cart || !window.MutationObserver) return;
    var INK = '#111111', P = '#6d3bff';
    function set(el, prop, val){ if (el.style.getPropertyValue(prop) !== val || el.style.getPropertyPriority(prop) !== 'important') el.style.setProperty(prop, val, 'important'); }
    function fix(){
      $$('li.pg-tt, li.pg-tt *', cart).forEach(function(li){ if (li.style.color) set(li, 'color', 'rgb(17, 17, 17)'); });
      $$('select.pg-vsel', cart).forEach(function(sel){
        if (sel.style.color) set(sel, 'color', 'rgb(17, 17, 17)');
        if (sel.style.borderColor || sel.style.border) set(sel, 'border-color', 'rgb(214, 207, 230)');
        var bi = sel.style.backgroundImage; if (bi && /7A2FA2/i.test(bi)) set(sel, 'background-image', bi.replace(/%237A2FA2/ig, '%236D3BFF'));
        if (sel.style.boxShadow && /74, 28, 102/.test(sel.style.boxShadow)) set(sel, 'box-shadow', 'none');
      });
    }
    var busy = false; new MutationObserver(function(){ if (busy) return; busy = true; try { fix(); } finally { busy = false; } }).observe(cart, {subtree: true, childList: true, attributes: true, attributeFilter: ['style']});
    fix();
  }

  /* ---------- review photo viewer (owner 2026-10-23 "they should be able to click pics in the reviews"): a tap on a review photo opens it full screen;
     arrows / swipe step through that review's photos, the X, the dark backdrop or Escape close it ---------- */
  function lightbox(){
    var box = null, list = [], idx = 0, x0 = null;
    function big(im){ var f = im.getAttribute('data-full'); if (f) return f; var u = im.currentSrc || im.src || ''; return /[?&]width=\d+/.test(u) ? u.replace(/([?&]width=)\d+/, '$11600') : u; }
    function paint(){ var im = list[idx]; if (!im) return; var pic = $('.pr-lb-img', box); pic.onload = fit; pic.src = big(im); pic.alt = im.alt || 'Review photo'; $('.pr-lb-n', box).textContent = list.length > 1 ? (idx + 1) + ' \\ ' + list.length : ''; fit(); box.classList.toggle('pr-lb-one', list.length < 2); }
    /* the bar is as wide as the photo, like the gallery's */
    function fit(){ var pic = $('.pr-lb-img', box), w = pic && pic.getBoundingClientRect().width; if (w > 40) $('.pr-lb-bar', box).style.width = Math.round(w) + 'px'; }
    function step(d){ if (list.length < 2) return; idx = (idx + d + list.length) % list.length; paint(); }
    function close(){ if (!box || box.hidden) return; box.classList.remove('in'); document.documentElement.classList.remove('pr-lb-open'); setTimeout(function(){ if (!box.classList.contains('in')) box.hidden = true; }, 220); }
    function build(){
      box = document.createElement('div'); box.className = 'pr-lb'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Review photo');
      /* no round buttons (owner 2026-10-25 "change arrows and x look ... I don't like the circles, make all that in line w theme"): a thin X, and under the photo
         the gallery's own bar, count on the left and the long arrows on the right */
      box.innerHTML = '<button type="button" class="pr-lb-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button><img class="pr-lb-img" alt=""><div class="pr-lb-bar"><p class="pr-lb-n"></p><span class="pr-lb-arr"><button type="button" class="pr-lb-prev" aria-label="Previous photo"><svg viewBox="0 0 26 14" aria-hidden="true"><path d="M25 7H2M7 1 1 7l6 6"/></svg></button><button type="button" class="pr-lb-next" aria-label="Next photo"><svg viewBox="0 0 26 14" aria-hidden="true"><path d="M1 7h23M19 1l6 6-6 6"/></svg></button></span></div>';
      document.body.appendChild(box);
      box.addEventListener('click', function(e){ if (e.target.closest('.pr-lb-prev')) step(-1); else if (e.target.closest('.pr-lb-next')) step(1); else if (!e.target.closest('.pr-lb-img, .pr-lb-bar')) close(); });
      box.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive: true});
      box.addEventListener('touchend', function(e){ if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1); }, {passive: true});
      document.addEventListener('keydown', function(e){ if (!box || box.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1); });
    }
    function open(im){
      var grp = im.closest('.pr-rvw-pics'); list = grp ? $$('img', grp) : [im]; idx = Math.max(0, list.indexOf(im));
      if (!box) build(); paint(); box.hidden = false; document.documentElement.classList.add('pr-lb-open'); void box.offsetHeight; setTimeout(function(){ box.classList.add('in'); }, 20);
    }
    var SEL = '.pr-rvw-pics img, .pr-rv-card img, .pr-rvw > img, .pr-rvw-pic img';
    document.addEventListener('click', function(e){ var im = e.target.closest && e.target.closest(SEL); if (!im || (box && box.contains(im))) return; e.preventDefault(); e.stopPropagation(); open(im); }, true);
    document.addEventListener('keydown', function(e){ if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches(SEL)){ e.preventDefault(); open(e.target); } });
  }

  /* "protection kit" in a Max pack row opens a sheet with the kit's photo and what is in it (owner 2026-10-26); tapping it does not change the pack */
  function kitInfo(){
    var sh = $('.pr-kit'); if (!sh) return;
    document.body.appendChild(sh); /* out of the buy box, so no transformed parent pins it */
    var last = null;
    /* the kit photo is loading="lazy" inside a hidden sheet; ask for it the moment the "?" is touched so it is there when the sheet slides up (10-26i) */
    function warm(){ var im = $('.pr-kit-img', sh); if (im && im.loading === 'lazy') im.loading = 'eager'; }
    function open(b){ warm(); last = b; sh.hidden = false; document.documentElement.classList.add('pr-kit-open'); void sh.offsetHeight; sh.classList.add('in'); var x = $('.pr-kit-x', sh); if (x) x.focus({preventScroll: true}); }
    function close(){ if (sh.hidden) return; sh.classList.remove('in'); document.documentElement.classList.remove('pr-kit-open'); setTimeout(function(){ if (!sh.classList.contains('in')) sh.hidden = true; }, 220); if (last) last.focus({preventScroll: true}); }
    $$('[data-kit-q]').forEach(function(b){
      b.addEventListener('pointerdown', warm, {passive: true});
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); open(b); });
      b.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); open(b); } });
    });
    sh.addEventListener('click', function(e){ if (e.target.closest('.pr-kit-x') || !e.target.closest('.pr-kit-card')) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }

  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  canvas();
  /* benefit labels line up: when one label in the row wraps to two lines, the one-line labels break at their most even word gap so every label has the same two lines (owner "36 characters not lined up w others") */
  function benBalance(){
    var rows = [].slice.call(document.querySelectorAll('.pr-bens'));
    if (!rows.length) return;
    function lines(b){ var lh = parseFloat(getComputedStyle(b).lineHeight) || 13; return Math.round(b.getBoundingClientRect().height / lh); }
    function esc(t){ return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function run(){
      rows.forEach(function(row){
        var bs = [].slice.call(row.querySelectorAll('b'));
        bs.forEach(function(b){ if (b.hasAttribute('data-t')) b.textContent = b.getAttribute('data-t'); else b.setAttribute('data-t', b.textContent.trim()); });
        var n = bs.map(lines), max = Math.max.apply(null, n);
        if (max !== 2) return;
        bs.forEach(function(b, i){
          if (n[i] !== 1) return;
          var w = b.getAttribute('data-t').split(/\s+/); if (w.length < 2) return;
          var best = 1, gap = 1e9;
          for (var k = 1; k < w.length; k++){ var d = Math.abs(w.slice(0, k).join(' ').length - w.slice(k).join(' ').length); if (d < gap){ gap = d; best = k; } }
          b.innerHTML = esc(w.slice(0, best).join(' ')) + '<br>' + esc(w.slice(best).join(' '));
          if (lines(b) > 2) b.textContent = b.getAttribute('data-t');
        });
      });
    }
    run();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(run, 150); });
  }
  ready(function(){ canvas(); header(); marquee(); gallery(); buy(); reviews(); drift(); films(); mods(); also(); heroDepth(); stackMods(); cartTint(); lightbox(); benBalance(); kitInfo(); });
})();
