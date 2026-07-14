// DishArt — generative warm "recipe journal" dish illustration.
// Not a photo, not an icon: a soft color-field with an abstract vessel
// silhouette + organic food shapes. Seeded by dish name so each dish
// has a stable, hand-varied look. Exports window.DishArt.
// Imported from claude.ai/design project "となりごはん UI設計" (2026-07-15).
// @ds-adherence-ignore -- decorative illustration generator (raw svg/hex by design)

function hashStr(s) {
  let h = 2166136261 >>> 0;
  s = String(s || '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function smoothClosed(p) {
  const n = p.length;
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + 'Z';
}
function blobPath(rng, cx, cy, r, n, wob, squash) {
  const pts = [];
  const rot = rng() * Math.PI;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const rr = r * (1 - wob + rng() * wob * 2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (squash || 1)]);
  }
  return smoothClosed(pts);
}

// warm, muted, food-evoking palettes
const PALETTES = [
  { bg: ['#F7E2CB', '#F1CDA6'], vessel: '#E7B98C', rim: '#D9A470', foods: ['#D25A2B', '#E8912F', '#B7492F'] }, // 0 fried / terracotta
  { bg: ['#EBEBD2', '#DADEB4'], vessel: '#C6CD9C', rim: '#B4BC84', foods: ['#7E8C43', '#AEAE3C', '#C9863A'] }, // 1 veg / sage
  { bg: ['#F4DCBE', '#EBC298'], vessel: '#E3B583', rim: '#D19E66', foods: ['#C9702F', '#E4A93C', '#8C4A2B'] }, // 2 curry
  { bg: ['#F2DACD', '#E7BBA6'], vessel: '#DDA98F', rim: '#CB937A', foods: ['#C15640', '#E08A5B', '#9C4636'] }, // 3 meat / tomato
  { bg: ['#EFE6D0', '#E0D0AE'], vessel: '#CFC094', rim: '#BCAB7E', foods: ['#C79A3E', '#E4C255', '#8A6B32'] }, // 4 egg
  { bg: ['#E7EBDF', '#CFDAC4'], vessel: '#B7C6A6', rim: '#A2B48F', foods: ['#6E8858', '#9AAE6B', '#C08A45'] }, // 5 soup / miso
  { bg: ['#F6DCC6', '#EFBF98', ], vessel: '#E4B487', rim: '#D29B67', foods: ['#D96A2E', '#EFA63A', '#7E9A3E'] }, // 6 gapao (green herb)
  { bg: ['#EEE0CB', '#DFC7A2'], vessel: '#D3BB90', rim: '#C0A778', foods: ['#B06A3A', '#D99E4B', '#6E5233'] }, // 7 grilled fish
];

function DishArt({ dish, motif, palette, radius = 18, seed, style = {} }) {
  const h = hashStr((seed != null ? String(seed) : '') + (dish || 'dish'));
  const rng = mulberry32(h || 1);
  const pIdx = (palette != null) ? palette : (h % PALETTES.length);
  const pal = PALETTES[pIdx] || PALETTES[0];
  const motifs = ['bowl', 'plate', 'soup', 'pan', 'bowl', 'plate'];
  const m = motif || motifs[h % motifs.length];

  // food cluster
  const foods = [];
  const nFood = 4 + Math.floor(rng() * 2);
  for (let i = 0; i < nFood; i++) {
    const ang = rng() * Math.PI * 2;
    const dist = rng() * 22;
    const cx = 100 + Math.cos(ang) * dist;
    const cy = (m === 'plate' ? 94 : 90) + Math.sin(ang) * dist * 0.5;
    const r = 16 + rng() * 13;
    foods.push({
      d: blobPath(rng, cx, cy, r, 6 + Math.floor(rng() * 3), 0.22, 0.85),
      fill: pal.foods[i % pal.foods.length],
      hi: rng() > 0.4,
    });
  }
  // garnish specks
  const specks = [];
  for (let i = 0; i < 5; i++) {
    specks.push({
      cx: 74 + rng() * 52, cy: 74 + rng() * 26,
      r: 1.6 + rng() * 2.2, fill: pal.foods[(i + 1) % pal.foods.length],
    });
  }

  const gid = 'dg' + (h % 100000);
  const vessel = (() => {
    if (m === 'plate') {
      return (
        <g>
          <ellipse cx="100" cy="102" rx="72" ry="22" fill={pal.rim} />
          <ellipse cx="100" cy="99" rx="66" ry="19" fill={pal.vessel} />
          <ellipse cx="100" cy="97" rx="46" ry="12.5" fill={`url(#${gid}i)`} />
        </g>
      );
    }
    if (m === 'pan') {
      return (
        <g>
          <rect x="150" y="90" width="54" height="9" rx="4.5" fill={pal.rim} />
          <ellipse cx="100" cy="98" rx="58" ry="21" fill={pal.rim} />
          <ellipse cx="100" cy="95" rx="52" ry="18" fill={pal.vessel} />
          <ellipse cx="100" cy="93" rx="44" ry="14" fill={`url(#${gid}i)`} />
        </g>
      );
    }
    // bowl / soup
    return (
      <g>
        <path d={`M42 96 A58 58 0 0 0 158 96 Z`} fill={pal.vessel} />
        <path d={`M42 96 A58 58 0 0 0 158 96`} fill="none" stroke={pal.rim} strokeOpacity="0.5" strokeWidth="1" />
        <ellipse cx="100" cy="96" rx="58" ry="17" fill={pal.rim} />
        <ellipse cx="100" cy="94.5" rx="52" ry="14" fill={`url(#${gid}i)`} />
      </g>
    );
  })();

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: radius, overflow: 'hidden',
      background: `linear-gradient(150deg, ${pal.bg[0]}, ${pal.bg[1]})`,
      ...style,
    }}>
      <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id={gid + 'i'} cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor={pal.bg[0]} stopOpacity="0.55" />
            <stop offset="100%" stopColor={pal.rim} stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id={gid + 'l'} cx="34%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* soft light */}
        <rect x="0" y="0" width="200" height="160" fill={`url(#${gid}l)`} />
        {vessel}
        {/* food */}
        {foods.map((f, i) => (
          <g key={i}>
            <path d={f.d} fill={f.fill} />
            {f.hi && <path d={f.d} fill="#FFFFFF" fillOpacity="0.14" transform="translate(-2,-3) scale(0.86)" transformOrigin="100px 88px" />}
          </g>
        ))}
        {specks.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} fillOpacity="0.9" />
        ))}
        {/* steam for soup */}
        {m === 'soup' && (
          <g stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M84 66 q-6 -10 0 -20 q6 -10 0 -20" />
            <path d="M108 62 q-6 -10 0 -20 q6 -10 0 -20" />
          </g>
        )}
      </svg>
    </div>
  );
}

window.DishArt = DishArt;
