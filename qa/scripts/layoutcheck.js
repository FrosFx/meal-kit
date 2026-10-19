// QA layout probe for Chrome DevTools MCP evaluate_script (format: function).
// Reports horizontal overflow, clipped text, overlapping text and small targets.
async () => {
  const vw = document.documentElement.clientWidth;
  const out = { vw, iw: innerWidth, sw: document.documentElement.scrollWidth, overflowX: document.documentElement.scrollWidth > innerWidth };
  const label = (e) => (e.tagName + '.' + String(e.className).split(' ').slice(0, 3).join('.')).slice(0, 60) + ' "' + (e.innerText || '').trim().slice(0, 25).replace(/\n/g, ' ') + '"';

  // Text clipped by its own box (ellipsis/overflow hidden).
  out.clippedText = [...document.querySelectorAll('h1,h2,h3,p,a,button,span,li,label')]
    .filter((e) => e.offsetParent && e.innerText?.trim() && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2) && ['hidden', 'clip'].includes(getComputedStyle(e).overflow))
    .map(label).slice(0, 15);

  // Visible text elements that extend past the viewport (not clipped by an ancestor).
  out.offscreenText = [...document.querySelectorAll('h1,h2,h3,p,a,button,li')]
    .filter((e) => { const r = e.getBoundingClientRect(); return e.offsetParent && r.width && (r.right > vw + 1 || r.left < -1) && getComputedStyle(e).position !== 'fixed'; })
    .filter((e) => { let p = e.parentElement; while (p && p !== document.body) { const s = getComputedStyle(p); if (['hidden', 'clip', 'auto', 'scroll'].includes(s.overflowX)) return false; p = p.parentElement; } return true; })
    .map(label).slice(0, 15);

  // Overlapping leaf text blocks.
  const leaves = [...document.querySelectorAll('h1,h2,h3,p,a,button')].filter((e) => e.offsetParent && e.innerText?.trim() && !e.querySelector('h1,h2,h3,p,a,button') && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[aria-hidden=true]'));
  const rects = leaves.map((e) => [e, e.getBoundingClientRect()]);
  const overlaps = [];
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [a, ra] = rects[i], [b, rb] = rects[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ix > 4 && iy > 4) overlaps.push(label(a) + ' X ' + label(b));
  }
  out.overlaps = overlaps.slice(0, 10);

  // Touch targets under 24x24 (WCAG 2.5.8) and under 44 px high (guideline).
  const targets = [...document.querySelectorAll('a,button,[role=radio],input,select,summary')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
  out.under24 = targets.filter((e) => { const r = e.getBoundingClientRect(); return r.width < 24 || r.height < 24; }).map(label);
  out.under44h = targets.filter((e) => e.getBoundingClientRect().height < 44).length;
  return out;
}
