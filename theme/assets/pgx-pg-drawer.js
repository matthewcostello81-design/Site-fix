/* pg-drawer */
if (!window.pgSeatAbove) { window.pgSeatAbove = function(el, pane){
  /* 2026-09-24, later the same day (owner: "the 5% shipping protection etc should all be frozen pane
     w total"): the countdown chip (#pg-rush), the Shipping Protection toggle (.pg-sp) and the
     Subtotal / Extra 5% box (.pg-tot) are seated INSIDE .sticky-in-panel again, in that order,
     directly above the theme's own totals list (.l4tt), so the Total, Secure Checkout and the pay
     marks sit right under them and the whole summary stays pinned while the items scroll.

     An earlier pass today had parked all three in the scroll flow above the pane's flex spacer to
     keep the pane short. That put them on the wrong side of the spacer: on a short cart they floated
     above a gap with the Total pinned far below, and on a long cart they scrolled away with the items
     while the Total stayed, which is what read as the cart being broken.

     Every seating script (pg-cart-timer, pg-cart-total, pgPane below) calls this instead of
     pane.insertBefore, so the order is the same whichever one runs first, and a row that is already
     in place is left alone (no churn under the observers that watch the drawer). */
  if (!el || !pane) return;
  var cart = document.getElementById('cart') || pane.parentNode;
  var order = ['#pg-rush', '.pg-sp', '.pg-tot'], items = [];
  for (var i = 0; i < order.length; i++){ var n = cart.querySelector(order[i]); if (n) items.push(n); }
  if (items.indexOf(el) < 0) items.push(el);
  /* the rows go directly above the totals list; a pane with no list yet takes them at the end */
  var anchor = pane.querySelector('.l4tt') || pane.querySelector('form.f8vl');
  while (anchor && anchor.parentNode !== pane) anchor = anchor.parentNode;
  var ok = true, node = anchor ? anchor.previousElementSibling : pane.lastElementChild;
  for (var j = items.length - 1; j >= 0; j--){ if (node !== items[j]){ ok = false; break; } node = node.previousElementSibling; }
  if (ok) return;
  for (var k = 0; k < items.length; k++) pane.insertBefore(items[k], anchor);
}; }
(function(){
  if (window.pgDeals) return; window.pgDeals = 1;
  var VMAP = null, PRODVARS = null, VSEL_BUSY = false;
  fetch('/products.json?limit=50').then(function(r){return r.json();}).then(function(j){
    VMAP = {};
    PRODVARS = {};
    (j.products||[]).forEach(function(p){
      PRODVARS[p.handle] = [];
      (p.variants||[]).forEach(function(v){
        VMAP[v.id]=[parseFloat(v.price||0),parseFloat(v.compare_at_price||0)];
        PRODVARS[p.handle].push({id: v.id, t: v.title});
      });
    });
  }).catch(function(){});
  function money(n){ return '$' + n.toFixed(2); }
  /* ONE CART READING PER TICK, SHARED.
     pass() and savRows() run off the same 800ms interval and each used to fetch
     /cart.js for itself -- two requests every 800ms, for the same answer, for as
     long as the page was open. /cart.js is already the busiest endpoint in this
     theme (pg-chips documents Shopify throttling it, and a throttled reply is
     what let pg-giftguard add duplicate cases), so the two now share one
     in-flight read. 600ms is under the tick, so a genuine change is never
     served from the previous tick's answer. */
  var CARTQ = null, CARTQ_T = 0;
  function cartOnce(){
    var now = Date.now();
    if (CARTQ && (now - CARTQ_T) < 600) return CARTQ;
    CARTQ_T = now;
    CARTQ = fetch('/cart.js').then(function(r){ return r.json(); });
    CARTQ['catch'](function(){ CARTQ = null; });
    return CARTQ;
  }
  /* The drawer is closed most of the time, and everything below writes INTO it.
     Polling for a panel nobody is looking at cost two requests a second and the
     main-thread work behind them, on every page of the site. */
  function cartOnScreen(){
    var c = document.getElementById('cart');
    if (c && /(^|\s)toggle(\s|$)/.test(c.className)) return true;
    return !!document.querySelector('body.template-cart');
  }
  function pass(){
    if (!VMAP) return;
    if (!document.querySelector('#cart .l4ca > li')) return;
    cartOnce().then(function(c){
      var items = c.items || [];
      var used = {};
      document.querySelectorAll('#cart .l4ca > li').forEach(function(li){
        var a = li.querySelector('a[href*="/products/"]'); if (!a) return;
        var href = a.getAttribute('href') || '';
        if (href.indexOf('free-gift') > -1) return;
        var it = null, m = href.match(/[?&]variant=([0-9]+)/);
        if (m){ var vid = parseInt(m[1],10); it = items.filter(function(x){return x.variant_id===vid;})[0]; }
        if (!it){
          var h = (href.match(/\/products\/([^\/?#]+)/)||[])[1];
          for (var i=0;i<items.length;i++){ if(!used[i] && items[i].handle===h){ it=items[i]; used[i]=1; break; } }
        }
        if (!it) return;
        if (href.indexOf('handheld-game-console') > -1) vsel(li, it);
        var pc = VMAP[it.variant_id];
        if (!pc || !(pc[1] > pc[0])) return;
        var key = it.variant_id + ':' + it.quantity;
        if (li.getAttribute('data-pg-deal') === key) return;
        var pct = Math.round((pc[1]-pc[0]) / pc[1] * 100);
        var h2 = li.querySelector('h2') || a;
        var chip = li.querySelector('.pg-save-chip');
        if (!chip){ chip = document.createElement('span'); chip.className = 'pg-save-chip'; (h2.parentNode||li).insertBefore(chip, h2.nextSibling); }
        /* '-55%', matching pg-chips' setText on the same element. Two writers
           with different strings on a 300ms and an 800ms clock would flicker
           between them; they now agree. See the note in pg-chips for why the
           string is the badge's only remaining width lever. */
        chip.textContent = '-' + pct + '%';
        /* GEOMETRY MATCHED TO pg-chips' STAMP. This list writes inline !important, and
           so does pg-chips' stamp() -- they were writing DIFFERENT values for the
           same two properties (12px of side padding and .05em of tracking here
           against 7px and normal there), so the pill went wide every time this
           ran and was snapped narrow again on pg-chips' next 300ms tick. The
           shopper saw it resize under them after every cart change. Fixing it
           here removes the disagreement rather than winning the race. */
        ['width:fit-content','max-width:100%','justify-self:start','font-size:12px','line-height:1','padding:6px 7px','letter-spacing:normal','word-spacing:normal','border-radius:999px','min-width:0','flex:none'].forEach(function(kv){
          var p = kv.split(':'); chip.style.setProperty(p[0], p[1], 'important');
        });
        var pr = li.querySelector('p.price') || li.querySelector('[class*="price"]');
        if (pr){
          var st = pr.querySelector('s.pg-lwas');
          if (!st){ st = document.createElement('s'); st.className = 'pg-lwas'; pr.insertBefore(st, pr.firstChild); }
          st.textContent = money(pc[1] * it.quantity);
        }
        li.setAttribute('data-pg-deal', key);
      });
      try {
        pgBar(c); pgTotals(c);
        var ctn = document.querySelector('#cart .pg-ct-n');
        if (ctn){
          var n = 0;
          (c.items || []).forEach(function(it){ if (it.handle !== 'shipping-protection') n += it.quantity; });
          var t2 = '(' + n + (n === 1 ? ' item)' : ' items)');
          if (ctn.textContent !== t2) ctn.textContent = t2;
        }
      } catch(e){}
    }).catch(function(){});
  }
  function vsel(li, it){
    var vars = (PRODVARS && PRODVARS['handheld-game-console']) || [];
    if (vars.length < 2) return;
    var sel = li.querySelector('.pg-vsel');
    if (!sel){
      var host = li.querySelector('section > p:not(.pg-varp)');
      if (!host) return;
      host.classList.add('pg-varp');
      host.textContent = '';
      sel = document.createElement('select');
      sel.className = 'pg-vsel';
      sel.setAttribute('aria-label', 'Choose version');
      'height:26px;padding:1px 6px;font-size:12px;line-height:1.2;width:auto;max-width:96px;min-width:0;min-height:0;border-radius:8px;background-color:#fff;color:#555;border:1px solid #ddd;box-shadow:none;margin:0'.split(';').forEach(function(kv){
        var p = kv.split(':'); sel.style.setProperty(p[0], p[1], 'important');
      });
      vars.forEach(function(v){ var o = document.createElement('option'); o.value = v.id; var t = v.t.indexOf('/') > -1 ? v.t.split('/').pop() : v.t; o.textContent = t.replace(/^\s+|\s+$/g, ''); sel.appendChild(o); });
      /* BEST VALUE, FROM THE PRICES, like the product page's Size picker: the
         size whose cut against its compare-at is the deepest (whole percents)
         is marked; a tie marks nothing (by report, 2026-09-11: the cart's
         picker showed no Best Value while the product page's did). */
      (function(){
        var bestId = null, bp = 0, tie = false;
        vars.forEach(function(v){
          var pc = VMAP && VMAP[v.id];
          var p = (pc && pc[1] > pc[0]) ? Math.floor((pc[1] - pc[0]) / pc[1] * 100) : 0;
          if (p > bp){ bestId = v.id; bp = p; tie = false; }
          else if (p === bp && bp > 0 && v.id !== bestId) tie = true;
        });
        if (bestId !== null && !tie){
          var bo = sel.querySelector('option[value="' + bestId + '"]');
          if (bo && bo.textContent.indexOf('(Best Value)') === -1) bo.textContent += ' (Best Value)';
        }
      })();
      host.appendChild(sel);
      /* SWAP THE LINE, NOT THE VARIANT.

         This used to post /cart/update.js {updates:{<oldVariantId>: 0}}, which
         is keyed by VARIANT and therefore empties EVERY line holding it, then
         add one line back at this line's quantity.

         With one console in the cart that is invisible. With a Duo Pack it is
         the "whole cart glitches" bug: "R36S - 2nd Console 25% Off" is a BXGY,
         so Shopify puts the two consoles on two separate lines, and changing
         the size on one of them deleted BOTH and re-added a single console.
         The pack silently collapsed to one unit and the count normalisers then
         fought over the wreckage.

         The line's own key is already in hand -- vsel() is called with the
         cart item -- so it is stamped on the element each render and the swap
         addresses exactly one line. The key is re-read at change time rather
         than captured in this closure, because the drawer re-renders on every
         cart change and a captured key goes stale the moment anything else
         writes. Properties ride along so a marked line cannot lose its
         marker. */
      sel.addEventListener('change', function(){
        if (VSEL_BUSY) return; VSEL_BUSY = true;
        var oldId = parseInt(sel.getAttribute('data-cur'), 10);
        var newId = parseInt(sel.value, 10);
        var q = parseInt(sel.getAttribute('data-q'), 10) || 1;
        var key = sel.getAttribute('data-key');
        var props = sel.getAttribute('data-props');
        if (!oldId || !newId || oldId === newId){ VSEL_BUSY = false; return; }
        /* without a key there is no way to know WHICH line this is; doing
           nothing beats emptying every line of the variant */
        if (!key){ VSEL_BUSY = false; return; }
        sel.disabled = true;
        var line = {id: newId, quantity: q};
        if (props){ try { var pj = JSON.parse(props); if (pj && Object.keys(pj).length) line.properties = pj; } catch (e){} }
        fetch('/cart/change.js', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:0})})
          .then(function(r){ if (!r || !r.ok) throw new Error('change ' + (r && r.status)); return fetch('/cart/add.js', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[line]})}); })
          .then(function(r){ if (!r || !r.ok) throw new Error('add ' + (r && r.status)); return window.pgDrawerRefresh ? window.pgDrawerRefresh() : null; })
          .then(function(){ VSEL_BUSY = false; if (window.pgGiftSync) window.pgGiftSync(); })
          .catch(function(){ VSEL_BUSY = false; if (window.pgDrawerRefresh) window.pgDrawerRefresh(); });
      });
    }
    sel.setAttribute('data-cur', it.variant_id);
    sel.setAttribute('data-q', it.quantity);
    /* THE KEY COMES OFF THE ROW, NOT OFF THE ITEM.

       A Duo Pack is two rows of the SAME variant with the SAME quantity, and
       the caller matches rows to cart items by variant, so it hands the first
       item to both rows -- measured: both selects came back stamped with one
       key. Swapping either one would then have moved the same line twice and
       left the other console untouched.

       Each row prints its own remove link, /cart/change?id=<variant>:<key>,
       which is the only per-row identifier in the drawer that stays correct
       when two rows are otherwise identical. Read it fresh on every render;
       the keys rotate whenever a discount re-splits a line. `it.key` stays as
       the fallback for a row that has no remove link yet.

       Properties are only carried when the row and the item genuinely agree,
       since a mismatched item's properties belong to a different line. */
    var rowKey = '';
    var rm = li.querySelector('a[href*="/cart/change"]');
    if (rm){
      var mk = (rm.getAttribute('href') || '').match(/[?&]id=([^&]+)/);
      if (mk) rowKey = decodeURIComponent(mk[1]);
    }
    sel.setAttribute('data-key', rowKey || it.key || '');
    if (rowKey && it.key && rowKey !== it.key){
      sel.removeAttribute('data-props');
    } else if (it.properties && Object.keys(it.properties).length){
      try { sel.setAttribute('data-props', JSON.stringify(it.properties)); } catch (e){}
    } else {
      sel.removeAttribute('data-props');
    }
    if (String(sel.value) !== String(it.variant_id)) sel.value = String(it.variant_id);
  }
  function pgBar(c){
    var ul = document.querySelector('#cart .l4ca:not(.in-panel)');
    if (!ul) return;
    var bar = document.querySelector('#cart .pg-bar');
    if (!bar){
      bar = document.createElement('div');
      bar.className = 'pg-bar';
      bar.innerHTML = '<div class="pg-bar-t"></div><div class="pg-bar-track"><i class="pg-bar-fill"></i><b class="pg-bar-dot d1">&#127873;</b><b class="pg-bar-dot d2">&#127991;&#65039;</b></div><div class="pg-bar-lbl"><span class="s1">Free Case</span><span class="s2">5% Off Order</span></div>';
      ul.parentNode.insertBefore(bar, ul);
    }
    var tot = ((c.items_subtotal_price != null ? c.items_subtotal_price : c.total_price) || 0) / 100, T = 120;
    var hasDev = (c.items || []).some(function(it){ return it.handle === 'handheld-game-console' || it.handle === 'r36s-duo-pack' || it.handle === 'r36s-trio-pack'; });
    var msg, w;
    if (tot <= 0){ msg = 'Add a <b>PocketBoy R36</b> to unlock your <b>FREE case</b> &#127873;'; w = 0; }
    else if (tot < T){
      msg = hasDev
        ? '&#127873; FREE case unlocked! Spend <b>$' + (T - tot).toFixed(2) + '</b> more to get <b>5% OFF</b> your whole order'
        : '&#127873; Add a <b>PocketBoy R36</b> for a FREE case &mdash; spend <b>$' + (T - tot).toFixed(2) + '</b> more for <b>5% OFF</b>';
      w = 8 + (tot / T) * 92;
    }
    else { msg = '&#127881; <b>5% OFF</b> unlocked &mdash; applied automatically at checkout!'; w = 100; }
    var t = bar.querySelector('.pg-bar-t');
    if (t.getAttribute('data-m') !== msg){ t.innerHTML = msg; t.setAttribute('data-m', msg); }
    bar.querySelector('.pg-bar-fill').style.width = w + '%';
    var d1 = bar.querySelector('.d1'), d2 = bar.querySelector('.d2');
    d1.style.left = '8%'; d2.style.left = '100%';
    d1.className = 'pg-bar-dot d1' + (hasDev ? ' on' : '');
    d2.className = 'pg-bar-dot d2' + (tot >= T ? ' on' : '');
    bar.querySelector('.s1').className = 's1' + (hasDev ? ' on' : '');
    bar.querySelector('.s2').className = 's2' + (tot >= T ? ' on' : '');
  }
  function pgTotals(c){
    var tl = document.querySelector('#cart .sticky-in-panel .l4tt');
    if (!tl) return;
    var sp = tl.querySelectorAll('li > span');
    for (var i = 0; i < sp.length; i++){ if (/\(\d+\)/.test(sp[i].textContent)) sp[i].textContent = 'Subtotal'; }
    var lis = Array.prototype.slice.call(tl.children);
    lis.forEach(function(li2){
      if (li2.className.indexOf('pg-trow') > -1) return;
      if (/Total/i.test(li2.textContent) && !/Subtotal/i.test(li2.textContent) && li2.className.indexOf('pg-tt') === -1) li2.className += ' pg-tt';
    });
    var row = tl.querySelector('.pg-trow');
    if (row) row.remove();
    lis.forEach(function(li3){
      if (li3.className.indexOf('pg-tt') > -1 || li3.className.indexOf('pg-drow') > -1) return;
      if (/(-\$|\(-|% Off)/i.test(li3.textContent)) li3.className += ' pg-drow';
    });
  }
  function pgStepper(){
    document.querySelectorAll('#cart .l4ca .input-amount').forEach(function(p){
      if (p.dataset.pgStep) return;
      var inp = p.querySelector('input');
      if (!inp) return;
      p.dataset.pgStep = '1';
      function mk(txt, delta){
        var b = document.createElement('span');
        b.className = 'pg-qbtn';
        b.textContent = txt;
        b.setAttribute('role', 'button');
        b.tabIndex = 0;
        b.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          var v = (parseInt(inp.value, 10) || 1) + delta;
          if (v < 0) v = 0;
          inp.value = v;
          inp.dispatchEvent(new Event('change', {bubbles: true}));
        });
        return b;
      }
      p.insertBefore(mk('−', -1), inp);
      p.appendChild(mk('+', 1));
      p.style.setProperty('display', 'inline-flex', 'important');
      p.style.setProperty('align-items', 'center', 'important');
      p.style.setProperty('gap', '5px', 'important');
    });
  }
  /* Savings breakdown above the drawer total. Same three figures the cart page
     shows: compare-at savings across the paid lines, the discounts Shopify has
     actually applied, and the sum. A row is only drawn when its figure is real,
     so the drawer never advertises a saving the shopper is not getting. The
     gift and shipping-protection lines are excluded, matching pg-cart-main. */
  function savRows(){
    if (!VMAP) return;
    if (!document.querySelector('#cart .l4ca > li')) return;
    var pane = document.querySelector('#cart .sticky-in-panel');
    if (!pane) return;
    cartOnce().then(function(c){
      var sale = 0;
      (c.items || []).forEach(function(it){
        if ((it.handle || '').indexOf('shipping-protection') > -1) return;
        if (it.properties && it.properties._free_gift) return;
        var v = VMAP[it.variant_id];
        if (!v) return;
        if (v[1] > v[0]) sale += (v[1] - v[0]) * it.quantity;
      });
      /* the order-level automatic discount (the extra 5%) gets its OWN row,
         by request - it was lumped invisibly into "Bundle Discount". Read from
         the cart's own allocations so the figure is Shopify's, to the cent,
         and the row disappears by itself if the discount is ever retired. */
      var extra = 0;
      (c.cart_level_discount_applications || []).forEach(function(d){
        extra += (d.total_allocated_amount || 0);
      });
      extra = extra / 100;
      var disc = (c.total_discount || 0) / 100 - extra;
      if (disc < 0) disc = 0;
      var tot = sale + disc + extra;
      var box = pane.querySelector('[data-pg-sav]');
      if (tot <= 0){ if (box) box.parentNode.removeChild(box); return; }
      var key = sale.toFixed(2) + '|' + disc.toFixed(2) + '|' + extra.toFixed(2);
      if (box && box.getAttribute('data-pg-sav') === key) return;
      if (!box){
        box = document.createElement('div');
        box.className = 'pg-sav';
        pane.insertBefore(box, pane.querySelector('.l4tt') || pane.firstChild);
      }
      box.setAttribute('data-pg-sav', key);
      var h = '';
      if (sale > 0) h += '<div class="pg-sav-r"><span>Sale Savings</span><span>-' + money(sale) + '</span></div>';
      if (disc > 0) h += '<div class="pg-sav-r"><span>Bundle Discount</span><span>-' + money(disc) + '</span></div>';
      if (extra > 0) h += '<div class="pg-sav-r"><span>Extra 5% Off</span><span>-' + money(extra) + '</span></div>';
      h += '<div class="pg-sav-r pg-sav-t"><span>Total Savings</span><span>-' + money(tot) + '</span></div>';
      box.innerHTML = h;
    }).catch(function(){});
  }
  var ORB = null, ORB_BUSY = false;
  function orbData(){
    if (ORB !== null || !PRODVARS) return;
    var h = null;
    for (var k in PRODVARS){ if (k.indexOf('pokemon-crystal') > -1) h = k; }
    if (!h){ ORB = false; return; }
    ORB = false;
    fetch('/products/' + h + '.js').then(function(r){ return r.json(); }).then(function(p){
      ORB = (p.variants || []).map(function(v){ return {id: v.id, t: v.title, img: (v.featured_image && v.featured_image.src) || (p.images && p.images[0]) || ''}; });
    }).catch(function(){});
  }
  function orbRec(){
    orbData();
    if (!ORB || !ORB.length) return;
    var c = document.getElementById('cart');
    if (!c) return;
    c.querySelectorAll('.nc-rec, .nc-recs-panel .nc-rec').forEach(function(rec){
      if (!rec.querySelector('a[href*="crystal"], a[href*="pokemon-crystal"]')) return;
      if (rec.querySelector('.pg-orbsel')) return;
      var addBtn = rec.querySelector('.nc-rec-add');
      if (!addBtn || !addBtn.parentElement) return;
      if (!window.pgDrop) return;
      var w = document.createElement('div');
      w.className = 'pg-orbsel';
      w.appendChild(window.pgDrop(ORB, ORB[0].id, null));
      addBtn.parentElement.insertBefore(w, addBtn);
      rec.dataset.pgOrb = '1';
    });
  }
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.nc-rec-add');
    if (!btn || ORB_BUSY) return;
    var rec = btn.closest('.nc-rec');
    var sel = rec ? rec.querySelector('.pg-orbsel .pg-drop') : null;
    if (!sel) return;
    e.preventDefault();
    e.stopPropagation();
    ORB_BUSY = true;
    fetch('/cart/add.js', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({items: [{id: parseInt(sel.pgValue(), 10), quantity: 1}]})})
      .then(function(){ ORB_BUSY = false; if (window.pgDrawerRefresh) return window.pgDrawerRefresh(); })
      .catch(function(){ ORB_BUSY = false; });
  }, true);
  function pgPane(){
    var c2 = document.getElementById('cart');
    if (!c2) return;
    if (!c2.querySelector('.pg-cart-top')){
      var tp = document.createElement('div');
      tp.className = 'pg-cart-top';
      tp.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span>Your Cart</span><span class="pg-ct-n"></span>';
      c2.insertBefore(tp, c2.firstChild);
    }
    var pane = c2.querySelector('.sticky-in-panel');
    if (!pane) return;
    var sp2 = c2.querySelector('[data-pg-sp]');
    if (sp2) window.pgSeatAbove(sp2, pane);
    var pm = c2.querySelector('.l4pm');
    if (pm && pm.parentElement !== pane) pane.appendChild(pm);
    var scEl = null;
    var cands = c2.querySelectorAll('*');
    for (var si = 0; si < cands.length; si++){
      var cs2 = getComputedStyle(cands[si]);
      if ((cs2.overflowY === 'auto' || cs2.overflowY === 'scroll') && cands[si].scrollHeight > cands[si].clientHeight + 10){ scEl = cands[si]; break; }
    }
    if (!scEl && c2.scrollHeight > c2.clientHeight + 10) scEl = c2;
    /* 34px here put 40px of bare white under CHECKOUT on a phone: the sticky
       pane sticks to the bottom of this element's CONTENT box, so the gutter
       sat BELOW the pane rather than inside it. Measured at 375x812: button
       bottom 772 against an 812 viewport. 6px instead, with the real
       safe-area-inset moved INTO .sticky-in-panel's own padding (see
       pg-case-mobile), so a notched phone still clears its home indicator and
       every other phone gets those pixels back for the line list.
       Do not fight this value from another script - it is re-asserted every
       800ms, and pg-cart-mobile's floorOf() reads it to decide whether the
       checkout button is reachable. Change it HERE. */
    if (scEl && scEl.style.paddingBottom !== '6px') scEl.style.setProperty('padding-bottom', '6px', 'important');
    /* AND THE 45px OF BARE WHITE ABOVE "YOUR CART" ON A PHONE. The theme pads
       the drawer 45px at the top to make room for its close cross, which only
       exists on desktop: on a phone the drawer is full-width (see the 600px
       rule at the top of this file), nothing is drawn up there, and the
       shopper saw 45px of nothing above the sticky heading (by report,
       2026-09-11 evening: "blank white space between the your cart words and
       the top of the page, move everything up"). Stamped inline on the same
       beat as the bottom gutter, for the same reason: the theme's own value
       is layered and outranks any later stylesheet. 8px on phones; desktop
       keeps the theme's value so the cross keeps its room. */
    var phoneTop = window.innerWidth <= 600 ? '8px' : '';
    if (phoneTop){ if (c2.style.paddingTop !== phoneTop) c2.style.setProperty('padding-top', phoneTop, 'important'); }
    else if (c2.style.paddingTop) c2.style.removeProperty('padding-top');
  }
  /* The DOM passes stay on the clock unconditionally -- they are cheap, they
     touch no network, and they are what keeps the drawer's own furniture in
     place. Only the two that READ THE CART are held back while the drawer is
     shut, and they are run immediately when it opens (and whenever the drawer
     is re-rendered) so nothing is ever a tick late on screen. */
  setInterval(function(){
    pgPane(); pgStepper(); orbRec();
    if (window.pgGiftTag) window.pgGiftTag(document);
    if (document.hidden || !cartOnScreen()) return;
    pass(); savRows();
  }, 800);
  function cartWork(){ if (!document.hidden) { pass(); savRows(); } }
  document.addEventListener('pg:cart-updated', cartWork);
  (function(){
    var c = document.getElementById('cart');
    if (!c || !window.MutationObserver) return;
    var was = /(^|\s)toggle(\s|$)/.test(c.className);
    new MutationObserver(function(){
      var now = /(^|\s)toggle(\s|$)/.test(c.className);
      if (now && !was) cartWork();       /* opened: repaint in this frame */
      was = now;
    }).observe(c, {attributes: true, attributeFilter: ['class']});
  })();
})();
;
/* pg-drawer (pgSeatAbove is defined once, at the top of this file) */
(function(){
  /* TRASH REMOVES THE WHOLE ITEM. Shopify's BXGY splits one product into a
     paid line and a free line; the theme's remove link zeroes only the line
     it sits on, so an item with multiple quantities came back re-split with
     the rest still in the cart. Intercept the trash click, zero EVERY cart
     line carrying that variant, then refresh the drawer once. */
  if (window.pgTrashAll) return; window.pgTrashAll = 1;
  var busy = false;
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('#cart a.remove, body.template-cart a.remove');
    if (!a || busy) return;
    var href = a.getAttribute('href') || '';
    var m = href.match(/id=(\d+):/);
    if (!m) return;                       /* unexpected shape: let the theme have it */
    var vid = m[1];
    e.preventDefault();
    e.stopPropagation();
    busy = true;
    fetch('/cart.js').then(function(r){ return r.json(); }).then(function(c){
      var keys = (c.items || []).filter(function(it){ return String(it.variant_id) === vid; }).map(function(it){ return it.key; });
      var chain = Promise.resolve();
      keys.forEach(function(k){
        chain = chain.then(function(){
          return fetch('/cart/change.js', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id: k, quantity: 0})});
        });
      });
      return chain;
    }).then(function(){
      busy = false;
      if (window.pgDrawerRefresh){ try { window.pgDrawerRefresh(); return; } catch(err){} }
      if (window.pgOpenCart) window.pgOpenCart();
    }).catch(function(){ busy = false; });
  }, true);
})();
