/* pg-retrobox-shots */
(function(){
  if (window.pgRetroboxShots) return; window.pgRetroboxShots = 1;

  /* the strip follows the bundles: after the Add to cart button and its error
     line where they are still in the column (a desktop), after the last tile
     otherwise. On a phone its flex order does the placing. Every move is
     skipped when the strip is already in its seat, so this is safe to run on
     a timer and under an observer. */
  function seat(){
    var buy = document.querySelector('#pgx .pgx-buy');
    if (!buy) return;
    var src = document.getElementById('pg-rbp-shots-src');
    var shots = (src && src.querySelector('[data-rbp="shots"]')) || buy.querySelector(':scope > [data-rbp="shots"]');
    if (!shots) return;
    var after = buy.querySelector(':scope > #pgx-err') || buy.querySelector(':scope > #pgx-atc');
    if (!after){
      var ts = buy.querySelectorAll(':scope > .pgx-tile');
      after = ts.length ? ts[ts.length - 1] : null;
    }
    if (after){ if (after.nextElementSibling !== shots) buy.insertBefore(shots, after.nextSibling); }
    else if (shots.parentNode !== buy) buy.appendChild(shots);
    loved();
    loopRail();
  }

  /* THE ENDLESS PHOTO LOOP (the Pro page's, 2026-09-22). The rail holds the
     photo set five times and rests on the MIDDLE copy, so there are two full
     sets to swipe into in either direction. It does not move on its own. When
     a swipe settles outside the middle copy, the rail steps by exactly one set
     width, which shows the same picture, so the loop is seamless. The step
     waits for the scroll to settle: moving scrollLeft mid-fling stops iOS
     momentum dead. Moving the strip to its seat resets it to the start, so
     seat() calls this again and it re-centres. */
  function loopRail(){
    var rail = document.querySelector('[data-rbp-loop]');
    if (!rail) return;
    var sets = rail.querySelectorAll('.pg-rbp-set');
    if (sets.length < 3) return;
    var mid = Math.floor(sets.length / 2);
    function centre(){
      var period = sets[1].offsetLeft - sets[0].offsetLeft;
      if (period <= 0) return;
      var lo = mid * period, x = rail.scrollLeft;
      if (x >= lo && x < lo + period) return;
      var off = (x - lo) % period;
      if (off < 0) off += period;
      rail.scrollLeft = lo + off;
    }
    centre();
    if (rail.pgLoop) return;
    rail.pgLoop = 1;
    var t = 0;
    rail.addEventListener('scroll', function(){ clearTimeout(t); t = setTimeout(centre, 90); }, {passive: true});
    /* a first swipe can come before any scroll event (still at the start) */
    rail.addEventListener('touchstart', centre, {passive: true});
    window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(centre, 160); }, {passive: true});
  }

  /* the loved-by pill reads the page's own rating line, so it follows Judge.me
     (pg-rev-link turns the count into the "n verified reviews" link it reads) */
  function loved(){
    var pill = document.querySelector('#pgx [data-rbp-loved="pill"]');
    var r = document.querySelector('#pgx .pgx-rating strong');
    var l = document.querySelector('#pgx .pgx-rating .pgx-revlink');
    if (!pill || !r || !l) return;
    var n = parseInt((l.textContent || '').replace(/[^\d]/g, ''), 10);
    var txt = 'Rated ' + (r.textContent || '').trim() + '/5' + (n ? ' · ' + n + ' reviews' : '');
    if (pill.textContent !== txt) pill.textContent = txt;
  }

  function boot(){
    seat();
    [500, 1600, 3200].forEach(function(t){ setTimeout(seat, t); });
    /* the buy column is rebuilt and re-ordered by other sections on their own
       beats; a debounced observer puts the strip back the moment that lands,
       and a slow interval is the backstop */
    var root = document.getElementById('pgx');
    if (root && window.MutationObserver){
      var q = false;
      new MutationObserver(function(){
        if (q) return;
        q = true;
        setTimeout(function(){ q = false; try { seat(); } catch (e){} }, 120);
      }).observe(root, {childList: true, subtree: true});
    }
    setInterval(seat, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
