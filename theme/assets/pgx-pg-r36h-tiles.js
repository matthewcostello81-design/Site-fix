/* pg-r36h-tiles */
(function(){
  if (window.pgR36hTiles) return; window.pgR36hTiles = 1;
  /* claimed before the footer group runs: see the note at the top */
  window.pgLadder = 1;
  window.pgDuo = 1;

  var dataEl = document.getElementById('pg-rh-data');
  if (!dataEl) return;
  var DATA; try { DATA = JSON.parse(dataEl.textContent); } catch (e){ return; }
  var VARS = DATA.variants || [];
  if (!VARS.length) return;
  /* cents off EACH console of a Duo Pack of singles: mirrors the admin's
     automatic discount "R36H Pro - Duo Pack Savings" (see the note at the top) */
  var DUO_OFF = Math.max(0, parseInt(DATA.duoOff, 10) || 0);
  /* cents off EACH Max Bundle console of a Duo Max (2026-09-21): mirrors the
     admin's automatic discount "R36H Pro - Duo Max Savings" ($30.00 off
     each, two or more), the same way DUO_OFF mirrors the Duo Pack's */
  var DUOMAX_OFF = Math.max(0, parseInt(DATA.duoMaxOff, 10) || 0);
  /* the Protection Kit, one variant: posted beside every Max console, free at the till ("R36H Pro - Max Kit Free") */
  var KIT = DATA.kit || {};
  /* the discount is a fixed amount in the shop's currency and the till
     converts it. Seen in CAD on 2026-09-17: the tile took a flat $10.00 off
     $214.00 where checkout takes about $14.20. The variant prices here are
     already in the shopper's currency, so the amount is scaled by the same
     rate. Shopify rounds converted amounts its own way, so outside the shop
     currency this can still differ from the till by a few cents. */
  (function(){
    var r = window.Shopify && Shopify.currency && parseFloat(Shopify.currency.rate);
    if (r && r > 0 && r !== 1){ DUO_OFF = Math.round(DUO_OFF * r); DUOMAX_OFF = Math.round(DUOMAX_OFF * r); }
  })();
  var COLORS = (DATA.colors && DATA.colors.length) ? DATA.colors : [VARS[0].c];
  var DEFAULT_COLOR = COLORS[0];

  var BUNDLE = {single: 'Single Device (64GB)', max: 'Max Bundle (128GB)', duo: 'Duo Max Bundle (2x 128GB)'};
  var LABEL = {single: '', max: 'MOST POPULAR', duo: 'BEST DEAL'};

  function money(c){ return '$' + (c / 100).toFixed(2); }
  /* whole percents, ROUNDED to the nearest, as the cart rounds its "Save n%"
     (nc-cro, nc-linesave, pg-cart-total), so a tile and its cart line always
     agree (2026-09-27, owner: "make them match": rounded down, the R36S Pro
     Single read SAVE 29% here and Save 30% in the cart) */
  function pct(v){ return v && v.cap > v.p ? Math.round((v.cap - v.p) / v.cap * 100) : 0; }

  /* one photo per colour: the first variant of that colour with its own image */
  var IMG = {}, BIG = {};
  VARS.forEach(function(v){ if (v.img && !IMG[v.c]) IMG[v.c] = v.img; if (v.big && !BIG[v.c]) BIG[v.c] = v.big; });
  var OPTS = COLORS.map(function(c){ return {id: c, t: c, img: IMG[c] || DATA.img0 || ''}; });

  /* ---------------- the pickers ---------------- */

  /* the picker in a row: pgDrop's widget (pgValue()) or the fallback select */
  function pickerOf(row){ return row.querySelector('.pg-drop, select.pg-rh-fallback'); }
  function valueOf(el){
    if (!el) return DEFAULT_COLOR;
    if (typeof el.pgValue === 'function') return String(el.pgValue());
    return el.value || DEFAULT_COLOR;
  }
  var fallbackAt = Date.now() + 4000;   /* pgDrop has this long to show up */
  function buildPickers(){
    var pending = false;
    tiles().forEach(function(tile){
      tile.querySelectorAll('[data-rh-row]').forEach(function(row){
        if (pickerOf(row)) return;
        if (typeof window.pgDrop === 'function'){
          row.appendChild(window.pgDrop(OPTS, DEFAULT_COLOR, function(){ paint(tile); }));
        } else if (Date.now() > fallbackAt){
          var s = document.createElement('select');
          s.className = 'pg-rh-fallback';
          s.setAttribute('aria-label', 'Color');
          OPTS.forEach(function(o){ var op = document.createElement('option'); op.value = o.id; op.textContent = o.t; s.appendChild(op); });
          s.addEventListener('click', function(e){ e.stopPropagation(); });
          s.addEventListener('change', function(){ paint(tile); });
          row.appendChild(s);
        } else {
          pending = true;
        }
      });
    });
    return !pending;
  }

  function pick(tile){
    var rows = tile.querySelectorAll('[data-rh-row]');
    var c1 = rows[0] ? valueOf(pickerOf(rows[0])) : DEFAULT_COLOR;
    var c2 = rows[1] ? valueOf(pickerOf(rows[1])) : 'None';
    return {c1: c1, c2: c2};
  }
  function find(b, c1, c2){
    var hit = null;
    VARS.forEach(function(v){ if (!hit && v.b === b && v.c === c1 && v.c2 === c2) hit = v; });
    return hit;
  }
  function firstOf(b){
    var hit = null;
    VARS.forEach(function(v){ if (!hit && v.b === b) hit = v; });   /* the first of the tier, never nothing */
    return hit;
  }
  /* the Single Device tile switched to Duo Pack */
  function isPair(tile){ return tile.getAttribute('data-rh') === 'single' && tile.getAttribute('data-rh-qty') === '2'; }
  /* WHAT THE TILE SELLS RIGHT NOW: one variant, or, for a Duo Pack of singles,
     the two Single Device variants that were picked. A single's variants all
     carry "None" as their second colour, so its Console 2 picker names a
     second SINGLE, never a c2. */
  function linesFor(tile){
    var kind = tile.getAttribute('data-rh'), k = pick(tile), b = BUNDLE[kind];
    if (kind === 'single'){
      var one = find(b, k.c1, 'None') || firstOf(b);
      if (!one) return [];
      if (!isPair(tile)) return [one];
      return [one, find(b, k.c2, 'None') || one];
    }
    /* THE DUO MAX IS TWO MAX BUNDLE LINES (2026-09-21, AutoDS fulfils one
       supplier SKU per cart line, so the one-variant Duo Max is gone): the
       Max Bundle variant of each picked colour, one line of two when they
       match. The admin's "R36H Pro - Duo Max Savings" takes DUOMAX_OFF off
       each from two up; the kit rides as a free line of its own (Add to cart). */
    if (kind === 'duo'){
      var m1 = find(BUNDLE.max, k.c1, 'None') || firstOf(BUNDLE.max);
      if (!m1) return [];
      return [m1, find(BUNDLE.max, k.c2, 'None') || m1];
    }
    var v = find(b, k.c1, 'None') || firstOf(b);
    return v ? [v] : [];
  }

  /* the words on the Single Device tile, for one console and for two */
  var COPY = {
    one: {name: 'Single Device', chip: '64GB · 15,000+ Games', sub: 'Landscape grip, dual sticks, plays on your TV', tag: 'Color',
      note: '<b>One R36H Pro (64GB)</b> with 15,000+ games preloaded, plus an extra <b>5% off</b> at checkout.'},
    two: {name: 'Duo Pack', chip: '2X 64GB · 15,000+ Games', sub: 'One for you, one to gift', tag: 'Console 1',
      note: '<b>Two R36H Pro (64GB)</b> with 15,000+ games each, plus an extra <b>5% off</b> at checkout.'}
  };
  var ADDONS = DATA.addons || {};
  /* the words on the add-on rows, for one console and for two (the Duo Pack
     offers two of each, as on the Flip SP) */
  var ADD_COPY = {
    hardshell: {one: 'Add Hard Shell Travel Case', two: 'Add 2 Hard Shell Travel Cases'},
    protector: {one: 'Add Screen Protector', two: 'Add 2 Screen Protectors'}
  };
  function addRows(tile){ return Array.prototype.slice.call(tile.querySelectorAll('[data-rh-add]')); }
  /* the add-on rows: worded and priced for the number of consoles in the tile */
  function dressAddons(tile, n){
    addRows(tile).forEach(function(row){
      var key = row.getAttribute('data-rh-add'), a = ADDONS[key], w = ADD_COPY[key];
      if (!a || !w) return;
      setText(row.querySelector('.pg-tadd-t'), n > 1 ? w.two : w.one);
      setText(row.querySelector('.pg-tadd-p s'), money((a.cap > a.p ? a.cap : a.p) * n));
      setText(row.querySelector('.pg-tadd-p b'), money(a.p * n));
    });
  }
  /* THE ROWS SIT UNDER THE ADD TO CART BUTTON, ALWAYS. pg-r36s-mobile appends
     its in-tile .pg-r36-atc button to the tile on phones; the rows are
     re-seated right after it on every paint, idempotently, in their own
     order. On desktop there is no button and they stay at the end of the
     tile, after the tier note. */
  function seatAddons(tile){
    var atcB = tile.querySelector('.pg-r36-atc');
    if (!atcB || atcB.parentNode !== tile) return;
    var after = atcB;
    addRows(tile).forEach(function(row){
      if (row.parentNode === tile && (after.compareDocumentPosition(row) & 2)) tile.insertBefore(row, after.nextSibling);
      after = row;
    });
  }
  /* what the lines cost together: a Duo Pack of singles has the discount off each */
  function priceOf(tile, lines){
    var p = 0;
    lines.forEach(function(v){ p += v.p; });
    if (isPair(tile)) p -= Math.min(p, DUO_OFF * lines.length);
    if (tile.getAttribute('data-rh') === 'duo') p -= Math.min(p, DUOMAX_OFF * lines.length);
    return p;
  }
  function setText(el, txt){ if (el && el.textContent !== txt) el.textContent = txt; }
  function dress(tile, lines){
    var c = isPair(tile) ? COPY.two : COPY.one;
    setText(tile.querySelector('[data-rh-name]'), c.name);
    setText(tile.querySelector('[data-rh-chip]'), c.chip);
    setText(tile.querySelector('[data-rh-sub]'), c.sub);
    setText(tile.querySelector('[data-rh-tag1]'), c.tag);
    var a = lines[0], z = lines[1] || lines[0];
    var two = Math.max(0, a.p + z.p - DUO_OFF * 2);
    var note = tile.querySelector('[data-rh-note]');
    if (note && note.pgCopy !== c.note){ note.pgCopy = c.note; note.innerHTML = c.note; }
    /* the switch prices itself from the colours picked */
    setText(tile.querySelector('[data-rh-q1]'), money(a.p));
    setText(tile.querySelector('[data-rh-q2]'), '2 for ' + money(two));
    dressAddons(tile, lines.length);
    seatAddons(tile);
  }
  function setQty(tile, q){
    tile.setAttribute('data-rh-qty', q === 2 ? '2' : '1');
    tile.querySelectorAll('[data-rh-qb]').forEach(function(b){
      var on = b.getAttribute('data-rh-qb') === String(q);
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    paint(tile);
  }

  function paint(tile){
    var lines = linesFor(tile); if (!lines.length) return;
    var kind = tile.getAttribute('data-rh');
    /* a Duo Pack of singles is priced, struck and badged on the sum of its
       two, less the Duo discount the till takes off each */
    var p = priceOf(tile, lines), cap = 0;
    lines.forEach(function(v){ cap += (v.cap > v.p ? v.cap : v.p); });
    var now = tile.querySelector('[data-rh-now]'), was = tile.querySelector('[data-rh-was]'), badge = tile.querySelector('[data-rh-badge]');
    setText(now, money(p));
    setText(was, cap > p ? money(cap) : '');
    var pc = pct({p: p, cap: cap});
    var bt = pc > 0 ? ((LABEL[kind] ? LABEL[kind] + ' · ' : '') + 'SAVE ' + pc + '%') : '';
    if (badge){
      if (badge.textContent !== bt) badge.textContent = bt;
      badge.style.display = bt ? '' : 'none';
    }
    var each = tile.querySelector('[data-rh-each]');
    if (each) setText(each, money(Math.ceil(p / 2)) + ' each');
    var sav = tile.querySelector('[data-rh-savings]');
    if (sav && cap > p) setText(sav, money(cap - p));
    if (kind === 'single') dress(tile, lines);
  }

  function tiles(){ return Array.prototype.slice.call(document.querySelectorAll('#pgx .pgx-buy > .pgx-tile.pg-rh')); }
  function selected(){ return document.querySelector('#pgx .pgx-buy > .pgx-tile.pg-rh.pgx-sel'); }

  function select(tile){
    document.querySelectorAll('#pgx .pgx-tile.pgx-sel').forEach(function(x){ x.classList.remove('pgx-sel'); x.setAttribute('aria-checked', 'false'); });
    tile.classList.add('pgx-sel');
    tile.setAttribute('aria-checked', 'true');
  }

  /* seat the tiles in pg-landing's buy column, after its (hidden) native
     single tile, so pg-r36s-mobile (in-tile Add to cart, phone ordering),
     pg-sellout-last and pg-offer-copy find them where they expect tiles */
  function seat(){
    var src = document.getElementById('pg-rh-src');
    var buy = document.querySelector('#pgx .pgx-buy');
    if (!src || !buy) return false;
    var pgx = document.getElementById('pgx');
    if (pgx && !pgx.hasAttribute('data-pg-tiernotes')) pgx.setAttribute('data-pg-tiernotes', '1');
    var native = buy.querySelector(':scope > .pgx-tile[data-pgx-tile="single"]');
    var anchor = native ? native.nextSibling : (buy.querySelector('#pgx-atc') || null);
    var moved = false;
    Array.prototype.slice.call(src.querySelectorAll('.pg-rh')).forEach(function(t){
      buy.insertBefore(t, anchor);
      moved = true;
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); select(t); } });
      t.querySelectorAll('[data-rh-qb]').forEach(function(b){
        var q = b.getAttribute('data-rh-qb') === '2' ? 2 : 1;
        b.addEventListener('click', function(){ setQty(t, q); });
        b.addEventListener('keydown', function(e){
          if (e.key !== ' ' && e.key !== 'Enter') return;
          e.preventDefault(); e.stopPropagation();
          select(t); setQty(t, q);
        });
      });
      paint(t);
    });
    if (native) { native.classList.remove('pgx-sel'); native.setAttribute('aria-checked', 'false'); }
    /* the "Bundle & Save" heading pgDuo draws over the R36S tiles (pg-mobile
       hides pg-landing's own divider on every page) */
    var firstTile = buy.querySelector(':scope > .pgx-tile.pg-rh');
    if (moved && firstTile && !buy.querySelector('.pgx-bs')){
      var bs = document.createElement('div');
      bs.className = 'pgx-bs';
      bs.innerHTML = '<span>Bundle &amp; Save</span>';
      buy.insertBefore(bs, firstTile);
    }
    return moved;
  }

  /* ONE OWNER FOR ADD TO CART. Window, capture phase: first node in the
     propagation path, so it runs before pg-landing's handler on #pgx-atc and
     before every document-level listener in the footer group. */
  /* THE ADD-ON ROWS TOGGLE. Capture phase and stopPropagation: a click on a
     row must not fall through to the tile's own click handler chain twice,
     and must never reach the pickers. Toggling still SELECTS the tile first
     if it was not. Enter and Space do what a click does. */
  document.addEventListener('click', function(e){
    var row = e.target && e.target.closest && e.target.closest('#pgx .pg-rh .pg-tadd');
    if (!row) return;
    e.stopPropagation();
    var tile = row.closest('.pg-rh');
    if (tile && !tile.classList.contains('pgx-sel')) select(tile);
    var on = !row.classList.contains('on');
    row.classList.toggle('on', on);
    row.setAttribute('aria-checked', on ? 'true' : 'false');
  }, true);
  document.addEventListener('keydown', function(e){
    if (e.key !== ' ' && e.key !== 'Enter') return;
    var row = e.target && e.target.closest && e.target.closest('#pgx .pg-rh .pg-tadd');
    if (!row) return;
    e.preventDefault();
    e.stopPropagation();
    row.click();
  }, true);

  var busy = false;
  window.addEventListener('click', function(e){
    if (!e.target || !e.target.closest) return;
    var atc = e.target.closest('.pgx-atc');
    if (!atc) return;
    var tile = selected();
    if (!tile) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (busy) return;
    var lines = linesFor(tile);
    var err = document.getElementById('pgx-err');
    if (!lines.length) return;
    /* one line of two when both consoles are the same colour */
    var items = [];
    lines.forEach(function(v){
      var hit = null;
      items.forEach(function(it){ if (it.id === v.id) hit = it; });
      if (hit) hit.quantity += 1; else items.push({id: v.id, quantity: 1});
    });
    /* each add-on that was ticked, one per console */
    addRows(tile).forEach(function(row){
      if (!row.classList.contains('on')) return;
      var id = parseInt(row.getAttribute('data-rh-add-id'), 10);
      if (id > 0) items.push({id: id, quantity: lines.length});
    });
    /* THE KIT IS A LINE OF ITS OWN (2026-09-21, AutoDS: one supplier SKU per
       cart line, and the supplier ships the three accessories as one item).
       The Max and the Duo Max post the Protection Kit at quantity = the
       number of consoles; the admin's "R36H Pro - Max Kit Free" makes it free
       beside a Max console, so the console line carries the whole price and
       the kit row reads FREE. */
    var kindNow = tile.getAttribute('data-rh');
    if ((kindNow === 'max' || kindNow === 'duo') && KIT.id > 0) items.push({id: KIT.id, quantity: lines.length});
    if (lines.some(function(v){ return !v.av; })){
      if (err){ err.textContent = 'That configuration is sold out right now. Try another color.'; err.style.display = 'block'; }
      return;
    }
    busy = true;
    var lbl = atc.querySelector('span'), old = lbl ? lbl.textContent : '';
    if (lbl) lbl.textContent = 'Adding...';
    if (err) err.style.display = 'none';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'same-origin',
      body: JSON.stringify({items: items})
    }).then(function(r){
      busy = false;
      if (lbl) lbl.textContent = old || 'Add to cart';
      if (!r.ok) throw new Error('add failed');
      if (window.pgOpenCart) { window.pgOpenCart(); } else { window.location.href = '/cart'; }
    }).catch(function(){
      busy = false;
      if (lbl) lbl.textContent = old || 'Add to cart';
      if (err){ err.textContent = 'Could not add to cart. Please try again.'; err.style.display = 'block'; }
    });
  }, true);

  /* the name of the colour whose render the big photo is showing, as a pill
     on the photo; hidden on any photo that is not a colour render */
  function fileOf(u){ u = String(u || '').split('?')[0]; u = u.substring(u.lastIndexOf('/') + 1); return u.replace(/_(\d+x\d*|x\d+)(@\dx)?(?=\.[a-z]+$)/i, '').toLowerCase(); }
  function colourOf(src){
    var file = fileOf(src);
    if (!file) return '';
    for (var c in BIG){ if (BIG[c] && fileOf(BIG[c]) === file) return c; }
    return '';
  }
  function capOn(box, img){
    var cap = box.querySelector(':scope > .pg-rh-hcap');
    if (!cap){ cap = document.createElement('span'); cap.className = 'pg-rh-hcap'; cap.setAttribute('aria-hidden', 'true'); box.appendChild(cap); }
    var name = colourOf(img.currentSrc || img.getAttribute('src'));
    if (cap.textContent !== name) cap.textContent = name;
    cap.classList.toggle('on', !!name);
  }
  function heroCap(){
    var img = document.getElementById('pgx-hero-img');
    if (img && img.parentNode) capOn(img.parentNode, img);
    /* the phone carousel: one pill per slide */
    document.querySelectorAll('#pgx .pgx-thumbs > button').forEach(function(b){
      var im = b.querySelector('img');
      if (im) capOn(b, im);
    });
  }
  function boot(){
    var seated = seat();
    setInterval(function(){ try { heroCap(); } catch (e){} }, 300);
    var n = 0;
    var t = setInterval(function(){
      if (!seated) seated = seat();
      var done = seated && buildPickers();
      if (done && seated){ tiles().forEach(paint); }
      if ((done && seated) || ++n > 40) clearInterval(t);
    }, 200);
    if (seated) buildPickers();
    /* prices settle on a slow beat too, in case another script rebuilds a
       tile's text; a picker lost to a rebuild is put back the same way */
    setInterval(function(){ buildPickers(); tiles().forEach(paint); }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
