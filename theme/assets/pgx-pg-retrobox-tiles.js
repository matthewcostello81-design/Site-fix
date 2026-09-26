/* pg-retrobox-tiles */
(function(){
  if (window.pgRetroboxTiles) return; window.pgRetroboxTiles = 1;
  /* claimed before the footer group runs, as on the Pro 2: no generic ladder
     and no pgDuo decoration on this product */
  window.pgLadder = 1;
  window.pgDuo = 1;

  var dataEl = document.getElementById('pg-rb-data');
  if (!dataEl) return;
  var DATA; try { DATA = JSON.parse(dataEl.textContent); } catch (e){ return; }
  var VARS = DATA.variants || [];
  if (!VARS.length) return;

  function money(c){ return '$' + (c / 100).toFixed(2); }
  function pct(p, cap){ return cap > p ? Math.floor((cap - p) / cap * 100) : 0; }
  function setText(el, txt){ if (el && el.textContent !== txt) el.textContent = txt; }

  /* THE TILE IS THE VARIANT: one tile per Edition value, matched by name */
  function variantOf(tile){
    var ed = tile.getAttribute('data-rb-ed'), hit = null;
    VARS.forEach(function(v){ if (!hit && v.e === ed) hit = v; });
    return hit;
  }

  function paint(tile){
    var v = variantOf(tile); if (!v) return;
    setText(tile.querySelector('[data-rb-now]'), money(v.p));
    setText(tile.querySelector('[data-rb-was]'), v.cap > v.p ? money(v.cap) : '');
    /* the pill: the tile's own label (e.g. 2 PLAYERS), plus SAVE n% only if a
       compare-at price is ever set in the admin */
    var lab = tile.getAttribute('data-rb-label') || '', pc = pct(v.p, v.cap);
    var bt = pc > 0 ? ((lab ? lab + ' · ' : '') + 'SAVE ' + pc + '%') : lab;
    var badge = tile.querySelector('[data-rb-badge]');
    if (badge){
      if (badge.textContent !== bt) badge.textContent = bt;
      badge.style.display = bt ? '' : 'none';
    }
  }

  function tiles(){ return Array.prototype.slice.call(document.querySelectorAll('#pgx .pgx-buy > .pgx-tile.pg-rb')); }
  function selected(){ return document.querySelector('#pgx .pgx-buy > .pgx-tile.pg-rb.pgx-sel'); }

  function select(tile){
    document.querySelectorAll('#pgx .pgx-tile.pgx-sel').forEach(function(x){ x.classList.remove('pgx-sel'); x.setAttribute('aria-checked', 'false'); });
    tile.classList.add('pgx-sel');
    tile.setAttribute('aria-checked', 'true');
  }
  /* the story's buttons pick an edition through this */
  window.pgRbSelect = function(kind){
    var t = document.querySelector('#pgx .pgx-buy > .pgx-tile.pg-rb[data-rb="' + kind + '"]');
    if (t){ select(t); showEdition(t.getAttribute('data-rb-ed')); }
  };

  /* seat the tiles in pg-landing's buy column, after its (hidden) native
     single tile, so pg-r36s-mobile (in-tile Add to cart, phone ordering) and
     pg-sellout-last find them where they expect tiles */
  function seat(){
    var src = document.getElementById('pg-rb-src');
    var buy = document.querySelector('#pgx .pgx-buy');
    if (!src || !buy) return false;
    var pgx = document.getElementById('pgx');
    if (pgx && !pgx.hasAttribute('data-pg-tiernotes')) pgx.setAttribute('data-pg-tiernotes', '1');
    var native = buy.querySelector(':scope > .pgx-tile[data-pgx-tile="single"]');
    var anchor = native ? native.nextSibling : (buy.querySelector('#pgx-atc') || null);
    var moved = false;
    Array.prototype.slice.call(src.querySelectorAll('.pg-rb')).forEach(function(t){
      if (!variantOf(t)) return;   /* an edition the product does not carry: never shown */
      buy.insertBefore(t, anchor);
      moved = true;
      /* a pick shows the edition's photo; the in-tile Add to cart
         (pg-r36s-mobile's .pg-r36-atc) only selects, so adding never moves
         the photo the shopper is looking at */
      t.addEventListener('click', function(e){ select(t); if (!fromAtc(e)) showEdition(t.getAttribute('data-rb-ed')); });
      t.addEventListener('keydown', function(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); select(t); if (!fromAtc(e)) showEdition(t.getAttribute('data-rb-ed')); } });
      paint(t);
    });
    if (native) { native.classList.remove('pgx-sel'); native.setAttribute('aria-checked', 'false'); }
    /* exactly one tile selected, even if the first edition was left out */
    if (moved && !selected()){ var f = buy.querySelector(':scope > .pgx-tile.pg-rb'); if (f) select(f); }
    /* the heading over the tiles (pg-mobile hides pg-landing's own divider on
       every page); there is no bundle here, so it names the choice */
    var firstTile = buy.querySelector(':scope > .pgx-tile.pg-rb');
    if (moved && firstTile && !buy.querySelector('.pgx-bs')){
      var bs = document.createElement('div');
      bs.className = 'pgx-bs';
      bs.innerHTML = '<span>Choose Your Edition</span>';
      buy.insertBefore(bs, firstTile);
    }
    return moved;
  }

  /* ONE OWNER FOR ADD TO CART. Window, capture phase: first node in the
     propagation path, so it runs before pg-landing's handler on #pgx-atc and
     before every document-level listener in the footer group. Posts the
     selected edition's variant, quantity 1. */
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
    var v = variantOf(tile);
    var err = document.getElementById('pgx-err');
    if (!v) return;
    if (!v.av){
      if (err){ err.textContent = 'That edition is sold out right now. Try the other edition.'; err.style.display = 'block'; }
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
      body: JSON.stringify({items: [{id: v.id, quantity: 1}]})
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

  /* the pill on the photo: the name of the edition whose photo is showing,
     or the product's name (DATA.name, "Pocket Era RetroBox") on any other
     product photo, which today is the hero of both consoles together */
  var SHOTS = DATA.shots || [];
  var NAME = DATA.name || '';
  function fileOf(u){ u = String(u || '').split('?')[0]; u = u.substring(u.lastIndexOf('/') + 1); return u.replace(/_(\d+x\d*|x\d+)(@\dx)?(?=\.[a-z]+$)/i, '').toLowerCase(); }
  function labelOf(src){
    var file = fileOf(src);
    if (!file) return '';
    for (var i = 0; i < SHOTS.length; i++){ if (SHOTS[i].src && fileOf(SHOTS[i].src) === file) return SHOTS[i].e || NAME; }
    return '';
  }
  function capOn(box, img){
    var cap = box.querySelector(':scope > .pg-rb-hcap');
    if (!cap){ cap = document.createElement('span'); cap.className = 'pg-rb-hcap'; cap.setAttribute('aria-hidden', 'true'); box.appendChild(cap); }
    var name = labelOf(img.currentSrc || img.getAttribute('src'));
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
  /* PICKING AN EDITION SHOWS ITS PHOTO (owner 2026-09-26: "when someone
     chooses the 8-bit option ... the image above should switch to that
     product"): the edition's first photo in product order, found by file
     through SHOTS, never by position. On a phone (pg-r36s-mobile's carousel,
     html.pg-r36-gal) the strip is scrolled to that slide; the jump is
     instant, as on the orb page's picker, because this page's interval DOM
     writes cancel smooth scrolls. Otherwise the big photo takes it, the same
     write pg-landing's thumbnail click makes. */
  function fromAtc(e){ return !!(e && e.target && e.target.closest && e.target.closest('.pg-r36-atc, .pgx-atc')); }
  function showEdition(ed){
    var want = '';
    for (var i = 0; i < SHOTS.length && !want; i++){ if (ed && SHOTS[i].e === ed && SHOTS[i].src) want = fileOf(SHOTS[i].src); }
    if (!want) return;
    if (document.documentElement.classList.contains('pg-r36-gal')){
      var strip = document.querySelector('#pgx .pgx-thumbwrap .pgx-thumbs');
      if (!strip) return;
      var slides = strip.querySelectorAll(':scope > button');
      for (var k = 0; k < slides.length; k++){
        var im = slides[k].querySelector('img');
        if (!im || fileOf(im.getAttribute('src') || im.currentSrc) !== want) continue;
        strip.style.scrollBehavior = 'auto';
        strip.scrollLeft = Math.max(0, slides[k].offsetLeft + slides[k].offsetWidth / 2 - strip.clientWidth / 2);
        setTimeout(function(){ strip.style.scrollBehavior = ''; }, 50);
        return;
      }
      return;
    }
    var hero = document.getElementById('pgx-hero-img');
    if (!hero) return;
    var thumbs = document.querySelectorAll('#pgx [data-pgx-thumb]');
    for (var j = 0; j < thumbs.length; j++){
      var u = thumbs[j].getAttribute('data-pgx-thumb');
      if (fileOf(u) !== want) continue;
      if (hero.getAttribute('src') !== u) hero.src = u;
      heroCap();
      return;
    }
  }

  function boot(){
    var seated = seat();
    setInterval(function(){ try { heroCap(); } catch (e){} }, 300);
    var n = 0;
    var t = setInterval(function(){
      if (!seated) seated = seat();
      if (seated){ tiles().forEach(paint); }
      if (seated || ++n > 40) clearInterval(t);
    }, 200);
    /* prices settle on a slow beat too, in case another script rebuilds a
       tile's text */
    setInterval(function(){ tiles().forEach(paint); }, 2500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
