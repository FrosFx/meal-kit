// QA contrast probe for Chrome DevTools MCP evaluate_script (format: function).
// For every visible element with its own text, it composites the text colour over the first
// solid ancestor background. Gradient/image backgrounds are listed as "unknown" for manual review.
() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const bgOf = (el) => {
    const layers = [];
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.backgroundImage !== 'none' && !s.backgroundImage.startsWith('url("data:image/svg')) return { unknown: s.backgroundImage.slice(0, 50) };
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    return bg;
  };
  const fails = [], unknown = [];
  let checked = 0;
  document.querySelectorAll('body *').forEach((el) => {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own) return;
    const s = getComputedStyle(el);
    if (!el.getClientRects().length || s.visibility === 'hidden' || el.closest('[aria-hidden=true],[inert],.sr-only,nextjs-portal')) return;
    if (parseFloat(s.opacity) === 0) return;
    const fg = parse(s.color); const bg = bgOf(el);
    checked++;
    const where = el.tagName + '.' + String(el.className).split(' ').slice(0, 3).join('.') + ' "' + own.slice(0, 30) + '"';
    if (bg.unknown) { unknown.push(where + ' on ' + bg.unknown); return; }
    const r = ratio(blend(fg, bg), bg);
    const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (r < need) fails.push({ where, ratio: Math.round(r * 100) / 100, need, size, color: s.color });
  });
  return { scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', checked, fails, unknownCount: unknown.length, unknown: unknown.slice(0, 15) };
}
