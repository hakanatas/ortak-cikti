/* SAHNE 1 — İKİ OLAY (0–10 s)  Bir zar, iki olay.
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  /** die outcomes; A and B are sets of numbers */
  function tokens(ctx, env, A, B, t, t0, a, seed) {
    if (a <= 0) return; const T = KD.L(env).TK, n = 6, gap = Math.min(T.gap, T.W / n), r = Math.min(T.r, gap * 0.42);
    for (let i = 0; i < n; i++) {
      const v = i + 1, k = seg(t, t0 + i * 0.06, t0 + i * 0.06 + 0.3); if (k <= 0) continue;
      const x = T.x + (i - (n - 1) / 2) * gap, y = T.y - (1 - k) * 30, inA = A.includes(v), inB = B.includes(v), al = a * k;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = `rgba(${LI.PAPER_RGB},${al})`; ctx.fill();
      if (inA && inB) { ctx.beginPath(); ctx.arc(x, y, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = amber(al * 0.75); ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fillStyle = `rgba(${LI.INK_RGB},${al * 0.35})`; ctx.fill(); }
      else if (inA) { ctx.fillStyle = amber(al * 0.75); ctx.fill(); } else if (inB) { ctx.fillStyle = `rgba(${LI.INK_RGB},${al * 0.35})`; ctx.fill(); }
      const P = []; for (let j = 0; j <= 24; j++) P.push([x + r * Math.cos(j / 24 * 6.2832), y + r * Math.sin(j / 24 * 6.2832)]);
      Ink.path(ctx, P, { w: inA && inB ? 4.5 : 2.5, alpha: al * 0.9, seed: seed + i, taper: [0, 0], color: inA && inB ? LI.AMBER_RGB : undefined });
      F().T(ctx, String(v), x, y + 1, { size: r * 0.95, alpha: al });
      const tag = inA && inB ? 'A ve B' : inA ? 'A' : inB ? 'B' : ''; if (tag) F().T(ctx, tag, x, y - r - 18, { size: r * 0.55, alpha: al, halo: true, color: inA ? A.amber : undefined });
    }
  }
  function under(ctx, env, text, a, hot, dy = 0) { if (a <= 0) return; const T = KD.L(env).TK, s = KD.L(env).G.s; F().T(ctx, text, T.x, T.y + T.r + s * 1.2 + dy, { size: s * 0.8, alpha: a, halo: true, color: hot ? A.amber : undefined }); }
  const PAIRS = [['6 gelmesi', '5 gelmesi', [6], [5]], ['asal', 'çift', [2, 3, 5], [2, 4, 6]], ['1 gelmesi', 'tek', [1], [1, 3, 5]], ['5’ten büyük', '3’ten küçük', [6], [1, 2]]];
  const common = (A, B) => A.filter((v) => B.includes(v));
  function circle(ctx, C, r, a, fill, seed) { const P = []; for (let j = 0; j <= 48; j++) P.push([C[0] + r * Math.cos(j / 48 * 6.2832), C[1] + r * Math.sin(j / 48 * 6.2832)]); ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7); ctx.fillStyle = fill; ctx.fill(); Ink.path(ctx, P, { w: 3, alpha: a, seed, taper: [0, 0] }); }
  function venn(ctx, env, t, a) {
    if (a <= 0) return; const V = KD.L(env).VN, s = KD.L(env).G.s, r = V.r, o = { size: s * 0.8, alpha: a, halo: false };
    const k1 = a * seg(t, 65.4, 66.0), k2 = a * seg(t, 68.4, 69.0);
    if (k1 > 0) {
      const L = [V.x[0] - r * 1.1, V.y], R = [V.x[0] + r * 1.1, V.y];
      circle(ctx, L, r, k1, amber(k1 * 0.3), 99700); circle(ctx, R, r, k1, `rgba(${LI.INK_RGB},${k1 * 0.12})`, 99710);
      F().T(ctx, '1 3 5', L[0], L[1], Object.assign({}, o, { alpha: k1 })); F().T(ctx, '2 4 6', R[0], R[1], Object.assign({}, o, { alpha: k1 }));
      F().T(ctx, 'tek · çift: ayrık', V.x[0], V.y - r - s * 0.8, { size: s * 0.72, alpha: k1, halo: true });
    }
    if (k2 > 0) {
      const L = [V.x[1] - r * 0.6, V.y], R = [V.x[1] + r * 0.6, V.y];
      circle(ctx, L, r, k2, amber(k2 * 0.3), 99720); circle(ctx, R, r, k2, `rgba(${LI.INK_RGB},${k2 * 0.12})`, 99730);
      F().T(ctx, '2', L[0] - r * 0.55, V.y, Object.assign({}, o, { alpha: k2 })); F().T(ctx, '4 6', V.x[1], V.y, { size: s * 0.9, alpha: k2, halo: true }); F().T(ctx, '5', R[0] + r * 0.55, V.y, Object.assign({}, o, { alpha: k2 }));
      F().T(ctx, 'çift · 3’ten büyük: ayrık değil', V.x[1], V.y - r - s * 0.8, { size: s * 0.72, alpha: k2, halo: true, color: A.amber });
    }
  }

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Bir zar, iki olay'],
      [10.6, 27.8, 'Ölçüt: ortak çıktı var mı?'],
      [28.4, 45.8, 'Olay çiftlerini inceleyelim'],
      [46.4, 63.8, 'Ayıralım ve etiketleyelim'],
      [64.4, 79.8, 'Kümelerle gösterelim'],
    ]);
  }

  function figure(ctx, env, t) {
    const a = END(t), s = KD.L(env).G.s;
    tokens(ctx, env, [2, 4, 6], t > 6.4 ? [4, 5, 6] : [], t, 5.0, a * win(t, 4.6, 10.2), 99800);
    const a2 = a * win(t, 10.8, 27.8), swap = t > 19.0;
    tokens(ctx, env, swap ? [2, 4, 6] : [1, 3, 5], swap ? [4, 5, 6] : [2, 4, 6], t, 11.2, a2, 99850);
    under(ctx, env, swap ? 'çift · 3’ten büyük: ortak 4 ve 6' : 'tek · çift: ortak çıktı yok', a2 * seg(t, 13.0, 13.4), swap);
    PAIRS.forEach(([na, nb, A_, B_], j) => {
      const t0 = 29.2 + j * 4.2, q = a * win(t, t0, t0 + 4.2 - (j === 3 ? -0.4 : 0)); if (q <= 0) return;
      tokens(ctx, env, A_, B_, t, t0 + 0.1, q, 99900 + j * 20);
      under(ctx, env, `A: ${na} · B: ${nb}`, q * seg(t, t0 + 0.6, t0 + 1.0), false);
      const c = common(A_, B_); under(ctx, env, c.length ? `ortak: ${c.join(', ')} → ayrık değil` : 'ortak çıktı yok → ayrık', q * seg(t, t0 + 1.8, t0 + 2.2), c.length > 0, s * 1.1);
    });
    // S4: two columns
    const a4 = a * win(t, 46.8, 63.8), C = KD.L(env).COL;
    if (a4 > 0) {
      const h = a4 * seg(t, 47.2, 47.6);
      F().T(ctx, 'Ayrık', C.x[0], C.y0, { size: C.s * 1.15, alpha: h, halo: true }); F().T(ctx, 'Ayrık değil', C.x[1], C.y0, { size: C.s * 1.15, alpha: h, halo: true, color: A.amber });
      const cnt = [0, 0];
      PAIRS.forEach(([na, nb, A_, B_], j) => {
        const side = common(A_, B_).length ? 1 : 0, row = ++cnt[side], k = a4 * seg(t, 48.6 + j * 1.3, 49.2 + j * 1.3);
        if (k > 0) F().T(ctx, `${na} · ${nb}`, C.x[side], C.y0 + row * C.dy, { size: C.s * 0.8, alpha: k, halo: true, color: side ? A.amber : undefined });
      });
      [['tek · çift', 0], ['çift · 3’ten büyük', 1]].forEach(([q, side], j) => { const k = a4 * seg(t, 54.2 + j * 1.3, 54.8 + j * 1.3); if (k > 0) F().T(ctx, q, C.x[side], C.y0 + (3 + 0) * C.dy + 0, { size: C.s * 0.8, alpha: k, halo: true, color: side ? A.amber : undefined }); });
    }
    venn(ctx, env, t, a * win(t, 64.8, 79.8));
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.6, 10.2, 'A: çift sayı gelmesi · B: 3’ten büyük gelmesi'],
      [11.4, 27.8, 'Ölçüt: iki olayın ortak çıktısı var mı?'],
      [29.4, 45.8, 'Her çiftte ortak çıktıları arayalım'],
      [47.4, 63.8, 'Ortak çıktısı olmayanlar sola, olanlar sağa'],
      [65.4, 79.8, 'Ayrık olaylar kesişmeyen kümeler gibi']]);
    exprs(ctx, t, at(W, 1), [[7.6, 10.2, '4 ve 6 iki olayda da var'],
      [15.0, 18.8, 'Tek ve çift: ortak çıktı yok'], [19.2, 27.8, 'Çift ve 3’ten büyük: ortak 4 ve 6'],
      [58.0, 63.8, 'Her çift bir etiket aldı: ayrık ya da ayrık değil'],
      [70.0, 79.8, 'Ayrık olmayanlarda ortak bölge dolu']]);
    exprs(ctx, t, at(W, 2), [[8.8, 10.2, 'Bu olayların ortak çıktısı var', true],
      [17.0, 18.8, 'Ortak çıktı yoksa: ayrık olaylar', true], [23.0, 27.8, 'Ortak çıktı varsa: ayrık olmayan olaylar', true],
      [42.0, 45.8, 'Ölçüt hep aynı: ortak çıktı', true],
      [60.4, 63.8, 'Sınıflandırdık ve etiketledik', true],
      [75.0, 79.8, 'Ayrık: aynı anda gerçekleşemezler', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Ölçüt: ortak çıktı var mı?', 80.6], ['Yoksa: ayrık olaylar', 81.6], ['Varsa: ayrık olmayan olaylar', 82.6], ['Ayrık olaylar aynı anda olamaz!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'Two events', nameTr: 'İki olay', concept: 'A shared outcome?', conceptTr: 'Ortak çıktı?', render });
})(window.LI = window.LI || {});
