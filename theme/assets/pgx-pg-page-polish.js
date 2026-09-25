/* pg-page-polish */
(function(){
  if (window.pgPagePolish) return; window.pgPagePolish = 1;

  /* ---------------- 2. features as bullets ---------------- */
  function bullets(){
    document.querySelectorAll('#pgx .pgx-acc details').forEach(function(d){
      var s = d.querySelector('summary');
      var body = d.querySelector('.pgx-acc-body');
      if (!s || !body || body.getAttribute('data-pg-feat')) return;
      if (!/features/i.test(s.textContent || '')) return;
      body.setAttribute('data-pg-feat', '1');
      if (body.querySelector('ul, ol')) return;
      var html = body.innerHTML
        .replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
        .replace(/<\/?p[^>]*>/gi, '');
      var lines = html.split(/<br\s*\/?>/i)
        .map(function(x){ return x.replace(/^\s+|\s+$/g, ''); })
        .filter(function(x){ return x.length > 0; });
      if (lines.length < 2) return;
      body.innerHTML = '<ul class="pg-feat"><li>' + lines.join('</li><li>') + '</li></ul>';
    });
  }

  /* ---------------- 3. photo reviews near the top ---------------- */
  var PER_COL = 2;
  function columnsOf(cards){
    var xs = {};
    cards.forEach(function(c){ xs[Math.round(c.getBoundingClientRect().left)] = 1; });
    var n = Object.keys(xs).length;
    return n < 1 ? 1 : (n > 6 ? 6 : n);
  }
  function seatPhotos(grid){
    var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .pgx-card'));
    var n = cards.length;
    if (n < 4) return;
    var photos = cards.filter(function(c){ return !!c.querySelector('.pgx-card-pics img'); });
    if (!photos.length || photos.length === n) return;
    var cols = columnsOf(cards);
    var seats = [];
    if (grid.classList.contains('pg-mas')){
      /* masonry deals the cards out across the columns, so the head of every
         column is the first row of cards, and the third row is two down */
      for (var m = 0; m < cols; m++){ seats.push(m); seats.push(2 * cols + m); }
    } else {
      for (var c = 0; c < cols; c++){
        var head = Math.floor(c * n / cols);
        for (var k = 0; k < PER_COL; k++) seats.push(head + k * 2);
      }
    }
    seats = seats.filter(function(i, at){ return i < n && seats.indexOf(i) === at; }).sort(function(a, b){ return a - b; });
    /* the cards seated last time keep their seats: choosing "the first photo
       cards in DOM order" again would pick a different set after the move and
       the grid would reshuffle on every pass. A rebuilt grid has no marks, so
       it gets a fresh pick. */
    var featured = photos.filter(function(c){ return c.hasAttribute('data-pg-seat'); });
    if (!featured.length){
      featured = photos.slice(0, seats.length);
      featured.forEach(function(c){ c.setAttribute('data-pg-seat', '1'); });
    }
    featured = featured.slice(0, seats.length);
    var rest = cards.filter(function(c){ return featured.indexOf(c) < 0; });
    var order = rest.slice();
    featured.forEach(function(card, i){ order.splice(Math.min(seats[i], order.length), 0, card); });
    var same = true;
    for (var i = 0; i < n; i++){ if (order[i] !== cards[i]){ same = false; break; } }
    if (same) return;
    var frag = document.createDocumentFragment();
    order.forEach(function(card){ frag.appendChild(card); });
    grid.appendChild(frag);
  }
  /* ---------------- 5. long reviews fold ---------------- */
  var FOLD = 9;
  function fold(grid){
    var todo = [];
    Array.prototype.forEach.call(grid.querySelectorAll('.pgx-card-txt'), function(t){
      if (t.getAttribute('data-pg-fold')) return;
      var full = t.scrollHeight;
      if (!full) return;                                  /* not laid out yet */
      var lh = parseFloat(getComputedStyle(t).lineHeight) || 20;
      todo.push([t, full > lh * (FOLD + 3)]);
    });
    todo.forEach(function(x){
      var t = x[0];
      t.setAttribute('data-pg-fold', x[1] ? '1' : '0');
      if (!x[1]) return;
      t.classList.add('pg-fold');
      var b = document.createElement('span');
      b.className = 'pg-more';
      b.setAttribute('role', 'button');
      b.setAttribute('tabindex', '0');
      b.textContent = 'Read more';
      t.parentNode.insertBefore(b, t.nextSibling);
    });
  }
  function toggleFold(b){
    var t = b.previousElementSibling;
    if (!t || !t.classList.contains('pgx-card-txt')) return;
    var folded = t.classList.toggle('pg-fold');
    b.textContent = folded ? 'Read more' : 'Show less';
    /* re-span at once, in the same frame, so the card never sits over the one
       below it while the ResizeObserver catches up */
    var grid = b.closest('.pgx-cards');
    if (grid) pass(grid, true);
  }
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest && e.target.closest('#pgx .pg-more');
    if (b){ e.preventDefault(); toggleFold(b); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var b = e.target && e.target.closest && e.target.closest('#pgx .pg-more');
    if (b){ e.preventDefault(); toggleFold(b); }
  });

  /* ---------------- 4. masonry ---------------- */
  var UNIT = 2;
  function shown(grid){
    return Array.prototype.slice.call(grid.querySelectorAll(':scope > .pgx-card')).filter(function(c){ return c.offsetParent !== null; });
  }
  function shortest(b){
    var at = 0;
    for (var i = 1; i < b.length; i++){ if (b[i] < b[at]) at = i; }
    return at;
  }
  function spread(b){ return Math.max.apply(null, b) - Math.min.apply(null, b); }
  function permute(list, each){
    var a = list.slice();
    (function go(k){
      if (k === a.length){ each(a); return; }
      for (var i = k; i < a.length; i++){
        var t = a[k]; a[k] = a[i]; a[i] = t;
        go(k + 1);
        t = a[k]; a[k] = a[i]; a[i] = t;
      }
    })(0);
  }
  /* the grid places each card in the first column that is free at the lowest
     row, leftmost on a tie: the same rule as shortest(), in the same units */
  function balanceTail(grid, cards, spans, cols){
    var k = Math.min(5, cards.length - 3 * cols);
    if (k < 2) return false;
    var start = cards.length - k, i;
    for (i = start; i < cards.length; i++){ if (cards[i].hasAttribute('data-pg-seat')) return false; }
    var base = [];
    for (i = 0; i < cols; i++) base.push(0);
    for (i = 0; i < start; i++) base[shortest(base)] += spans[i];
    var tail = [];
    for (i = start; i < cards.length; i++) tail.push(i);
    var now = null, best = null, bestSpread = Infinity;
    permute(tail, function(p){
      var b = base.slice();
      p.forEach(function(ix){ b[shortest(b)] += spans[ix]; });
      var sp = spread(b);
      if (now === null) now = sp;                    /* the first one tried is the order on the page */
      if (sp < bestSpread){ bestSpread = sp; best = p.slice(); }
    });
    if (!best || (now - bestSpread) * UNIT < 24) return false;
    best.forEach(function(ix){ grid.appendChild(cards[ix]); });
    return true;
  }
  function masonry(grid, keepOrder){
    var cards = shown(grid);
    var w = grid.clientWidth;
    if (!w) return;
    if (cards.length < 3){ grid.classList.remove('pg-mas'); return; }
    if (grid.pgMasW !== w || grid.pgMasN !== cards.length){
      /* ask the stylesheet: with the class off this is the theme's own column
         layout again, and its columns are what gets counted */
      grid.classList.remove('pg-mas');
      grid.pgMasCols = columnsOf(cards);
      grid.pgMasGap = parseFloat(getComputedStyle(cards[0]).marginBottom) || parseFloat(getComputedStyle(grid).columnGap) || 12;
      grid.pgMasW = w;
      grid.pgMasN = cards.length;
    }
    if (grid.pgMasCols < 2){ grid.classList.remove('pg-mas'); return; }
    grid.style.setProperty('--pg-mas-cols', grid.pgMasCols);
    grid.classList.add('pg-mas');
    var hs = cards.map(function(c){ return c.getBoundingClientRect().height; });
    var spans = hs.map(function(h){ return Math.max(1, Math.ceil((h + grid.pgMasGap) / UNIT)); });
    cards.forEach(function(c, i){
      if (c.pgMasSpan !== spans[i]){ c.pgMasSpan = spans[i]; c.style.gridRowEnd = 'span ' + spans[i]; }
    });
    /* not while a shopper is unfolding a review: cards should not trade places
       under their thumb */
    if (!keepOrder) balanceTail(grid, cards, spans, grid.pgMasCols);
  }

  var queued = false;
  function pass(grid, keepOrder){
    try { fold(grid); } catch (e){}
    try { masonry(grid, true); } catch (e){}             /* the grid and the spans */
    if (!keepOrder){
      try { seatPhotos(grid); } catch (e){}              /* the top rows */
      try { masonry(grid, false); } catch (e){}          /* the last rows, in the order that leaves */
    }
    if (grid.pgMasRO){
      shown(grid).forEach(function(c){ if (!c.pgMasSeen){ c.pgMasSeen = 1; grid.pgMasRO.observe(c); } });
    }
  }
  function later(grid){
    if (queued) return;
    queued = true;
    setTimeout(function(){ queued = false; pass(grid); }, 80);
  }
  function reviews(){
    var grid = document.querySelector('#pg-reviews .pgx-cards, #pgx .pgx-rev .pgx-cards');
    if (!grid) return;
    if (!grid.pgPolishObs){
      grid.pgPolishObs = 1;
      /* a card changing size (a photo arriving, a review unfolding, the phone
         turning) is what re-runs the layout; the span never changes a card's
         own height, so this cannot feed itself */
      if (window.ResizeObserver){ try { grid.pgMasRO = new ResizeObserver(function(){ later(grid); }); } catch (e){} }
      if (window.MutationObserver) new MutationObserver(function(){ later(grid); }).observe(grid, {childList: true});
      grid.addEventListener('load', function(){ later(grid); }, true);
      window.addEventListener('resize', function(){ later(grid); });
    }
    pass(grid);
  }

  /* ---------------- 8. the review card turns by itself ---------------- */
  var Q_EVERY = 3500;
  /* REAL STARS, AND ONLY FOUR AND UP (2026-09-25). This card printed five
     stars beside every quote whatever the review said, so a 1-star "the
     device arrived damaged" on the R36S Ultra, and the orb page's 2-star
     "base was completely broken", rotated under the buy box as five-star
     quotes. Each quote now carries the rating its own card shows in the
     grid (counted from the card's stars) and prints it as it is. Reviews
     under four stars stay in the grid, the histogram and the count; they are
     only left out of this featured card. A card whose stars cannot be read is
     left out too, rather than guessed at. */
  var MIN_STARS = 4;
  function starsOf(c){
    var s = c.querySelector('.pgx-stars');
    var m = s ? (s.textContent || '').match(/★/g) : null;
    return m ? Math.min(5, m.length) : 0;
  }
  function harvest(){
    var out = [], seen = {};
    Array.prototype.forEach.call(document.querySelectorAll('#pg-reviews .pgx-card, #pgx .pgx-rev .pgx-card'), function(c){
      var n = c.querySelector('.pgx-card-name'), t = c.querySelector('.pgx-card-txt');
      if (!n || !t) return;
      var stars = starsOf(c);
      if (stars < MIN_STARS) return;
      var name = '';
      /* text nodes only: pg-verified hangs a chip inside the name */
      Array.prototype.forEach.call(n.childNodes, function(k){ if (k.nodeType === 3) name += k.textContent; });
      name = name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      var text = (t.textContent || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      if (!name || !text || seen[name + '|' + text]) return;
      seen[name + '|' + text] = 1;
      out.push({name: name, text: text, stars: stars});
    });
    return out;
  }
  function quote(){
    var box = document.querySelector('#pgx .pgx-quote');
    if (!box || box.pgOwn) return;
    var name = box.querySelector('.pgx-quote-name'), txt = box.querySelector('.pgx-quote-txt'), next = box.querySelector('.pgx-quote-next');
    if (!name || !txt || !next) return;
    var list = harvest();
    if (list.length < 2) return;                 /* nothing to turn through: leave it as it is */
    box.pgOwn = 1;

    /* carry on from the review that is showing */
    var at = 0, showing = (name.textContent || '');
    for (var i = 0; i < list.length; i++){ if (showing.indexOf(list[i].name) === 0){ at = i; break; } }

    var cur = {name: name, txt: txt};
    function render(animate){
      var q = list[at];
      var n = document.createElement('div');
      n.className = 'pgx-quote-name';
      n.id = 'pgx-quote-name';
      n.textContent = q.name;
      var st = document.createElement('span');
      st.textContent = '★★★★★'.slice(0, q.stars) + '☆☆☆☆☆'.slice(0, 5 - q.stars);
      st.setAttribute('aria-label', q.stars + ' out of 5 stars');
      n.appendChild(st);
      var t = document.createElement('div');
      t.className = 'pgx-quote-txt' + (animate ? ' pg-q-in' : '');
      t.id = 'pgx-quote-txt';
      t.textContent = '"' + q.text + '"';
      if (animate) n.className += ' pg-q-in';
      if (cur.name.parentNode) cur.name.parentNode.replaceChild(n, cur.name);
      if (cur.txt.parentNode) cur.txt.parentNode.replaceChild(t, cur.txt);
      cur = {name: n, txt: t};
    }
    var timer = null;
    function arm(){
      if (timer) clearInterval(timer);
      timer = setInterval(function(){ if (!document.hidden) step(false); }, Q_EVERY);
    }
    function step(manual){
      at = (at + 1) % list.length;
      render(true);
      if (manual) arm();
    }
    /* a fresh button: the clone leaves pg-landing's listener behind */
    var btn = next.cloneNode(true);
    /* a drawn chevron: the theme's was the text glyph, thin and off-centre */
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
    btn.style.setProperty('padding', '0', 'important');
    next.parentNode.replaceChild(btn, next);
    btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); step(true); });
    render(false);
    arm();
  }

  /* ---------------- 6. accordions stay open ---------------- */
  function accordions(first){
    Array.prototype.forEach.call(document.querySelectorAll('#pgx .pgx-acc details'), function(d){
      if (d.getAttribute('data-pg-closed')) return;
      if (first && d.open) d.removeAttribute('open');
      d.setAttribute('data-pg-closed', '1');
    });
  }

  function boot(){
    accordions(true);
    bullets();
    reviews();
    try { quote(); } catch (e){}
    [600, 2000].forEach(function(t){ setTimeout(function(){ accordions(false); bullets(); reviews(); try { quote(); } catch (e){} }, t); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
