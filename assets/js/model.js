// Kaskáda: otvorený 25-ročný cash-flow model. Nominálne hodnoty v mil. €, výstavba 2 roky, prevádzka 25 rokov.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var f = window.fmt;
  var IDS = ['mw', 'capex', 'grant', 'debt', 'rate', 'tenor', 'grace', 'occ1', 'occ2', 'occmax', 'util', 'colo', 'heatp', 'heatgwh', 'elp', 'cop', 'fix', 'escrev', 'escop', 'tax', 'disc'];
  var inputs = {}; IDS.forEach(function (k) { inputs[k] = $('i-' + k); });
  var UNITS = { mw: ' MW', capex: ' mil. €/MW', grant: ' %', debt: ' %', rate: ' %', tenor: ' r.', grace: ' r.', occ1: ' %', occ2: ' %', occmax: ' %', util: ' %', colo: ' €/kW/m', heatp: ' €/MWh', heatgwh: ' GWh', elp: ' €/MWh', cop: '', fix: ' mil. €/MW', escrev: ' %', escop: ' %', tax: ' %', disc: ' %' };
  var DEC = { capex: 1, cop: 1, fix: 2, escrev: 1, escop: 1, rate: 1, disc: 1 };
  var YEAR0 = 2028, CONSTR = 2, OPS = 25, DEP_YEARS = 20;

  function p() { var o = {}; IDS.forEach(function (k) { o[k] = parseFloat(inputs[k].value); }); return o; }

  function run(q) {
    var capex = q.mw * q.capex, grant = capex * q.grant / 100, priv = capex - grant;
    var debt = priv * q.debt / 100, equity = priv - debt, split = [0.4, 0.6];
    var rows = [], bal = 0, lossU = 0, lossL = 0, annuity = null, r = q.rate / 100;
    for (var i = 0; i < CONSTR + OPS; i++) {
      var y = { year: YEAR0 + i };
      if (i < CONSTR) {
        y.phase = 'výstavba'; y.occ = 0;
        y.capex = -capex * split[i]; y.grant = grant * split[i]; y.draw = debt * split[i];
        y.interest = -bal * r; bal += y.draw;
        y.revColo = y.revHeat = y.revOther = y.rev = y.costEl = y.costFix = y.ebitda = y.dep = y.taxU = y.taxL = y.principal = 0;
        y.heatGwh = 0; y.elGwh = 0;
        y.cfProj = y.capex + y.grant;
        y.cfEq = y.capex + y.grant + y.draw + y.interest;
        y.cfads = 0; y.ds = 0; y.dscr = null;
      } else {
        var t = i - CONSTR;
        var occ = (t === 0 ? q.occ1 : t === 1 ? q.occ2 : q.occmax) / 100;
        var esc = Math.pow(1 + q.escrev / 100, t), escc = Math.pow(1 + q.escop / 100, t);
        y.phase = 'prevádzka'; y.occ = occ; y.capex = 0; y.grant = 0; y.draw = 0;
        y.revColo = q.mw * 1000 * occ * q.colo * 12 / 1e6 * esc;
        y.heatGwh = q.heatgwh * (q.mw / 10) * (occ / 0.9);
        y.revHeat = y.heatGwh * 1000 * q.heatp / 1e6 * esc;
        y.revOther = 0.06 * q.mw * (occ / 0.9) * esc;
        y.rev = y.revColo + y.revHeat + y.revOther;
        var elDc = q.mw * occ * (q.util / 100) * 8.76 * 1.15, elHp = y.heatGwh / q.cop;
        y.elGwh = elDc + elHp;
        y.costEl = -y.elGwh * 1000 * q.elp / 1e6 * esc;
        y.costFix = -q.fix * q.mw * escc;
        y.ebitda = y.rev + y.costEl + y.costFix;
        y.dep = t < DEP_YEARS ? -priv / DEP_YEARS : 0;
        // debt service: grace = interest only, then annuity over the remaining tenor
        y.interest = -bal * r;
        if (t < q.grace) { y.principal = 0; }
        else {
          if (annuity === null) { var n = Math.max(1, q.tenor - q.grace); annuity = r > 0 ? bal * r / (1 - Math.pow(1 + r, -n)) : bal / n; }
          y.principal = -Math.min(bal, Math.max(0, annuity + y.interest));
        }
        bal += y.principal;
        // taxes with loss carry-forward, unlevered (project) and levered (equity)
        var ebtU = y.ebitda + y.dep, ebtL = y.ebitda + y.dep + y.interest;
        var tU = ebtU - lossU; if (tU < 0) { lossU = -tU; y.taxU = 0; } else { lossU = 0; y.taxU = -tU * q.tax / 100; }
        var tL = ebtL - lossL; if (tL < 0) { lossL = -tL; y.taxL = 0; } else { lossL = 0; y.taxL = -tL * q.tax / 100; }
        y.cfProj = y.ebitda + y.taxU;
        y.cfads = y.ebitda + y.taxL;
        y.ds = -(y.interest + y.principal);
        y.dscr = y.ds > 0.01 ? y.cfads / y.ds : null;
        y.cfEq = y.cfads + y.interest + y.principal;
      }
      y.balance = bal;
      rows.push(y);
    }
    var cum = 0, cumEq = 0, payback = null, paybackEq = null;
    rows.forEach(function (y, i) {
      var prev = cum; cum += y.cfProj; y.cum = cum;
      if (payback === null && cum >= 0 && i >= CONSTR) payback = (i - CONSTR) + (y.cfProj > 0 ? (-prev / y.cfProj) : 0);
      var prevE = cumEq; cumEq += y.cfEq; y.cumEq = cumEq;
      if (paybackEq === null && cumEq >= 0 && i >= CONSTR) paybackEq = (i - CONSTR) + (y.cfEq > 0 ? (-prevE / y.cfEq) : 0);
    });
    var cfP = rows.map(function (y) { return y.cfProj; }), cfE = rows.map(function (y) { return y.cfEq; });
    var ds = rows.filter(function (y) { return y.dscr !== null; }).map(function (y) { return y.dscr; });
    return {
      rows: rows, capex: capex, grant: grant, priv: priv, debt: debt, equity: equity,
      irrProj: irr(cfP), irrEq: irr(cfE), npv: npv(cfP, q.disc / 100), payback: payback, paybackEq: paybackEq,
      dscrMin: ds.length ? Math.min.apply(null, ds) : null, dscrAvg: ds.length ? ds.reduce(function (a, b) { return a + b; }, 0) / ds.length : null,
      ebitda3: rows[CONSTR + 2].ebitda, rev3: rows[CONSTR + 2].rev
    };
  }
  function npv(cf, r) { return cf.reduce(function (s, c, i) { return s + c / Math.pow(1 + r, i); }, 0); }
  function irr(cf) {
    var lo = -0.9, hi = 1.0, fl = npv(cf, lo), fh = npv(cf, hi);
    if (isNaN(fl) || isNaN(fh) || fl * fh > 0) return null;
    for (var k = 0; k < 80; k++) { var mid = (lo + hi) / 2, fm = npv(cf, mid); if (fm * fl > 0) { lo = mid; fl = fm; } else { hi = mid; } }
    return (lo + hi) / 2;
  }

  // ---------- rendering ----------
  function set(id, t) { var e = $(id); if (e) e.textContent = t; }
  var last = null;

  function render() {
    var q = p(), m = run(q); last = m;
    IDS.forEach(function (k) { set('o-' + k, f.n(q[k], DEC[k] || 0) + UNITS[k]); });
    set('k-irr', m.irrProj === null ? 'n/a' : f.n(m.irrProj * 100, 1) + ' %');
    set('k-irreq', m.irrEq === null ? 'n/a' : f.n(m.irrEq * 100, 1) + ' %');
    set('k-npv', f.n(m.npv, 1));
    set('k-payback', m.payback === null ? 'nad 25' : f.n(m.payback, 1));
    set('k-dscr', m.dscrMin === null ? 'n/a' : f.n(m.dscrMin, 2));
    set('k-dscravg', m.dscrAvg === null ? 'n/a' : f.n(m.dscrAvg, 2));
    set('k-ebitda3', f.n(m.ebitda3, 1));
    set('k-margin3', m.rev3 > 0 ? f.n(m.ebitda3 / m.rev3 * 100) + ' %' : 'n/a');
    set('k-capex', f.n(m.capex, 0)); set('k-grant', f.n(m.grant, 1)); set('k-debt', f.n(m.debt, 1)); set('k-equity', f.n(m.equity, 1));
    var b = $('k-dscr-badge'); if (b) { var ok = m.dscrMin !== null && m.dscrMin >= 1.2; b.textContent = ok ? 'DSCR nad 1,20 v každom roku' : 'DSCR pod 1,20 v niektorom roku'; b.className = 'badge ' + (ok ? 'ok' : 'warn'); }
    drawCharts(m);
    drawTable(m);
  }

  // ---------- charts: three small multiples, one shared crosshair ----------
  var W = 900, PAD = { l: 56, r: 16, t: 14, b: 26 }, PH = 150;
  function scaleX(i, n) { return PAD.l + (i + 0.5) * (W - PAD.l - PAD.r) / n; }
  function niceTicks(lo, hi, count) {
    var span = hi - lo, raw = span / count, pow = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / pow;
    var step = (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
    var ticks = [], v = Math.ceil(lo / step) * step; for (; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { ticks: ticks, lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step };
  }
  function txt(x, y, s, opts) { opts = opts || {}; return '<text x="' + x + '" y="' + y + '" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="' + (opts.size || 11) + '" fill="' + (opts.fill || 'var(--ink-mute)') + '" text-anchor="' + (opts.anchor || 'start') + '"' + (opts.weight ? ' font-weight="' + opts.weight + '"' : '') + ' style="font-variant-numeric: tabular-nums">' + s + '</text>'; }

  function frame(vals, n, opts) {
    var lo = Math.min.apply(null, vals.concat([0])), hi = Math.max.apply(null, vals.concat([0]));
    if (opts && opts.floorMin !== undefined) lo = Math.min(lo, opts.floorMin);
    if (opts && opts.ceilMin !== undefined) hi = Math.max(hi, opts.ceilMin);
    var nt = niceTicks(lo, hi, 4), h = PH - PAD.t - PAD.b;
    var sy = function (v) { return PAD.t + (nt.hi - v) * h / (nt.hi - nt.lo); };
    var s = '';
    nt.ticks.forEach(function (tv) { var yy = sy(tv); s += '<line x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--rule)" stroke-width="1"/>' + txt(PAD.l - 8, yy + 4, f.n(tv, opts && opts.dec || 0), { anchor: 'end' }); });
    if (nt.lo < 0 && nt.hi > 0) s += '<line x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + sy(0) + '" y2="' + sy(0) + '" stroke="var(--rule-strong)" stroke-width="1"/>';
    for (var i = 0; i < n; i++) if ((YEAR0 + i) % 5 === 0) s += txt(scaleX(i, n), PH - 8, String(YEAR0 + i), { anchor: 'middle' });
    return { s: s, sy: sy };
  }

  function drawCharts(m) {
    var rows = m.rows, n = rows.length;
    // 1: annual project cash flow, diverging by sign
    var v1 = rows.map(function (y) { return y.cfProj; }), fr1 = frame(v1, n), s1 = fr1.s, bw = Math.min(24, (W - PAD.l - PAD.r) / n - 2);
    v1.forEach(function (v, i) {
      var x = scaleX(i, n) - bw / 2, y0 = fr1.sy(0), y1 = fr1.sy(v), top = Math.min(y0, y1), hgt = Math.abs(y1 - y0);
      var col = v >= 0 ? 'var(--primary-2)' : 'var(--accent)', rx = 4;
      s1 += '<path d="' + (v >= 0 ? 'M' + x + ',' + y0 + ' V' + (top + rx) + ' a' + rx + ',' + rx + ' 0 0 1 ' + rx + ',-' + rx + ' h' + (bw - 2 * rx) + ' a' + rx + ',' + rx + ' 0 0 1 ' + rx + ',' + rx + ' V' + y0 + ' Z'
        : 'M' + x + ',' + y0 + ' V' + (top + hgt - rx) + ' a' + rx + ',' + rx + ' 0 0 0 ' + rx + ',' + rx + ' h' + (bw - 2 * rx) + ' a' + rx + ',' + rx + ' 0 0 0 ' + rx + ',-' + rx + ' V' + y0 + ' Z') + '" fill="' + col + '"/>';
    });
    // label the extreme (last operating year) only
    var iMax = v1.indexOf(Math.max.apply(null, v1)); s1 += txt(scaleX(iMax, n), fr1.sy(v1[iMax]) - 6, f.n(v1[iMax], 1), { anchor: 'middle', fill: 'var(--ink-2)', weight: 600 });
    s1 += '<line class="xh" x1="-10" x2="-10" y1="' + PAD.t + '" y2="' + (PH - PAD.b) + '" stroke="var(--ink-mute)" stroke-width="1" opacity="0"/>';
    $('c1').setAttribute('viewBox', '0 0 ' + W + ' ' + PH); $('c1').innerHTML = s1;
    // 2: cumulative cash flow (line) with payback marker
    var v2 = rows.map(function (y) { return y.cum; }), fr2 = frame(v2, n), s2 = fr2.s, d = '';
    v2.forEach(function (v, i) { d += (i ? ' L' : 'M') + scaleX(i, n) + ',' + fr2.sy(v); });
    s2 += '<path d="' + d + '" fill="none" stroke="var(--primary-2)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    if (m.payback !== null) {
      var pi = CONSTR + Math.ceil(m.payback) - (Number.isInteger(m.payback) ? 0 : 1); if (pi >= n) pi = n - 1; if (pi < 0) pi = 0;
      var px = scaleX(pi, n), py = fr2.sy(v2[pi]);
      s2 += '<circle cx="' + px + '" cy="' + py + '" r="6" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>' + txt(px + 10, py - 8, 'návratnosť po ' + f.n(m.payback, 1) + ' rokoch prevádzky', { fill: 'var(--ink-2)', weight: 600 });
    }
    var li = n - 1; s2 += '<circle cx="' + scaleX(li, n) + '" cy="' + fr2.sy(v2[li]) + '" r="4" fill="var(--primary-2)" stroke="var(--panel)" stroke-width="2"/>' + txt(scaleX(li, n) - 8, fr2.sy(v2[li]) - 10, f.n(v2[li], 0), { anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
    s2 += '<line class="xh" x1="-10" x2="-10" y1="' + PAD.t + '" y2="' + (PH - PAD.b) + '" stroke="var(--ink-mute)" stroke-width="1" opacity="0"/>';
    $('c2').setAttribute('viewBox', '0 0 ' + W + ' ' + PH); $('c2').innerHTML = s2;
    // 3: DSCR line with 1.2 threshold
    var v3 = rows.map(function (y) { return y.dscr; }), present = v3.filter(function (v) { return v !== null; });
    var fr3 = frame(present.length ? present : [0], n, { ceilMin: 2, dec: 1 }), s3 = fr3.s, d3 = '', started = false;
    s3 += '<line x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + fr3.sy(1.2) + '" y2="' + fr3.sy(1.2) + '" stroke="var(--accent)" stroke-width="1"/>' + txt(W - PAD.r, fr3.sy(1.2) - 5, 'minimum bánk 1,20', { anchor: 'end', fill: 'var(--accent)', size: 10.5 });
    v3.forEach(function (v, i) { if (v === null) return; d3 += (started ? ' L' : 'M') + scaleX(i, n) + ',' + fr3.sy(v); started = true; });
    s3 += '<path d="' + d3 + '" fill="none" stroke="var(--primary-2)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    var iMin = v3.indexOf(m.dscrMin); if (iMin >= 0) s3 += '<circle cx="' + scaleX(iMin, n) + '" cy="' + fr3.sy(v3[iMin]) + '" r="5" fill="var(--primary-2)" stroke="var(--panel)" stroke-width="2"/>' + txt(scaleX(iMin, n) + 9, fr3.sy(v3[iMin]) + 4, 'min ' + f.n(m.dscrMin, 2), { fill: 'var(--ink-2)', weight: 600 });
    s3 += '<line class="xh" x1="-10" x2="-10" y1="' + PAD.t + '" y2="' + (PH - PAD.b) + '" stroke="var(--ink-mute)" stroke-width="1" opacity="0"/>';
    $('c3').setAttribute('viewBox', '0 0 ' + W + ' ' + PH); $('c3').innerHTML = s3;
  }

  // shared crosshair + tooltip
  var wrap = $('charts'), tip = $('tip'), hoverIdx = -1;
  function showAt(i) {
    if (!last) return; var rows = last.rows, n = rows.length; if (i < 0 || i >= n) return; hoverIdx = i;
    var x = scaleX(i, n);
    ['c1', 'c2', 'c3'].forEach(function (id) { var l = $(id).querySelector('.xh'); if (l) { l.setAttribute('x1', x); l.setAttribute('x2', x); l.setAttribute('opacity', '1'); } });
    var y = rows[i];
    tip.innerHTML = '';
    var h = document.createElement('div'); h.className = 'tip-h'; h.textContent = y.year + ' · ' + y.phase + (y.phase === 'prevádzka' ? ' · obsadenosť ' + f.n(y.occ * 100) + ' %' : ''); tip.appendChild(h);
    [['Cash flow projektu po zdanení', y.cfProj, 1], ['Kumulovaný cash flow', y.cum, 1], ['EBITDA', y.ebitda, 1], ['Dlhová služba', -y.ds, 1], ['DSCR', y.dscr, 2]].forEach(function (row) {
      var d = document.createElement('div'); d.className = 'tip-r';
      var v = document.createElement('b'); v.textContent = row[1] === null || row[1] === undefined ? 'n/a' : f.n(row[1], row[2]) + (row[0] === 'DSCR' ? '' : ' mil. €');
      var l = document.createElement('span'); l.textContent = row[0];
      d.appendChild(v); d.appendChild(l); tip.appendChild(d);
    });
    var rect = wrap.getBoundingClientRect(), c1 = $('c1').getBoundingClientRect();
    var px = c1.left - rect.left + x * c1.width / W;
    tip.style.display = 'block';
    tip.style.left = Math.min(Math.max(8, px + 12), rect.width - tip.offsetWidth - 8) + 'px';
    tip.style.top = (c1.top - rect.top + 8) + 'px';
  }
  function hide() { hoverIdx = -1; tip.style.display = 'none'; ['c1', 'c2', 'c3'].forEach(function (id) { var l = $(id).querySelector('.xh'); if (l) l.setAttribute('opacity', '0'); }); }
  if (wrap) {
    wrap.addEventListener('pointermove', function (e) {
      if (!last) return; var c1 = $('c1').getBoundingClientRect(); var xv = (e.clientX - c1.left) * W / c1.width; var n = last.rows.length;
      var i = Math.round((xv - PAD.l) / ((W - PAD.l - PAD.r) / n) - 0.5); if (i < 0) i = 0; if (i >= n) i = n - 1; showAt(i);
    });
    wrap.addEventListener('pointerleave', hide);
    wrap.addEventListener('keydown', function (e) { if (!last) return; if (e.key === 'ArrowRight') { showAt(hoverIdx < 0 ? 0 : Math.min(last.rows.length - 1, hoverIdx + 1)); e.preventDefault(); } if (e.key === 'ArrowLeft') { showAt(hoverIdx < 0 ? 0 : Math.max(0, hoverIdx - 1)); e.preventDefault(); } if (e.key === 'Escape') hide(); });
    wrap.addEventListener('focus', function () { if (hoverIdx < 0) showAt(CONSTR); });
    wrap.addEventListener('blur', hide);
  }

  // ---------- table ----------
  var COLS = [
    ['year', 'Rok', 0], ['occ', 'Obsad.', 'pct'], ['rev', 'Výnosy', 1], ['ebitda', 'EBITDA', 1], ['capex', 'CAPEX', 1], ['grant', 'Grant', 1],
    ['dep', 'Odpisy', 1], ['taxU', 'Daň (projekt)', 1], ['cfProj', 'CF projektu', 1], ['cum', 'Kumul. CF', 1],
    ['draw', 'Čerpanie dlhu', 1], ['interest', 'Úrok', 1], ['principal', 'Istina', 1], ['dscr', 'DSCR', 2], ['cfEq', 'CF equity', 1]
  ];
  function drawTable(m) {
    var head = $('t-head'), body = $('t-body'); head.innerHTML = ''; body.innerHTML = '';
    var tr = document.createElement('tr'); COLS.forEach(function (c) { var th = document.createElement('th'); th.className = 'num'; th.textContent = c[1]; tr.appendChild(th); }); head.appendChild(tr);
    m.rows.forEach(function (y) {
      var r = document.createElement('tr');
      COLS.forEach(function (c) {
        var td = document.createElement('td'); td.className = 'num'; var v = y[c[0]];
        td.textContent = v === null || v === undefined ? '' : c[2] === 'pct' ? (v ? f.n(v * 100) + ' %' : '') : c[2] === 0 ? String(v) : (Math.abs(v) < 0.005 ? '' : f.n(v, c[2]));
        if (c[0] === 'dscr' && v !== null && v < 1.2) td.className += ' neg';
        r.appendChild(td);
      });
      body.appendChild(r);
    });
  }

  // ---------- export ----------
  function aoa() {
    var q = p(), m = last || run(q);
    var inputs = [['Kaskáda: 25-ročný model, vstupy'], ['Parameter', 'Hodnota', 'Jednotka']];
    var LAB = { mw: 'IT výkon', capex: 'CAPEX na MW IT', grant: 'Grantová zložka', debt: 'Podiel dlhu na súkromnom kapitáli', rate: 'Úrok', tenor: 'Splatnosť dlhu', grace: 'Odklad istiny', occ1: 'Obsadenosť rok 1', occ2: 'Obsadenosť rok 2', occmax: 'Obsadenosť od roku 3', util: 'Vyťaženie predanej kapacity', colo: 'Cena kolokácie', heatp: 'Cena tepla', heatgwh: 'Teplo do CZT pri 10 MW a 90 %', elp: 'Cena elektriny (PPA)', cop: 'COP tepelného čerpadla', fix: 'Fixné prevádzkové náklady', escrev: 'Rast výnosov a cien energie', escop: 'Rast fixných nákladov', tax: 'Daň z príjmu', disc: 'Diskontná sadzba pre NPV' };
    IDS.forEach(function (k) { inputs.push([LAB[k], q[k], UNITS[k].trim()]); });
    inputs.push([]); inputs.push(['Odvodené']); inputs.push(['CAPEX spolu', m.capex, 'mil. €'], ['Grant', m.grant, 'mil. €'], ['Dlh', m.debt, 'mil. €'], ['Vlastný kapitál', m.equity, 'mil. €']);
    inputs.push([]); inputs.push(['Výsledky']); inputs.push(['IRR projektu (po zdanení, s grantom)', m.irrProj, '1 = 100 %'], ['IRR vlastného kapitálu', m.irrEq, '1 = 100 %'], ['NPV pri diskontnej sadzbe', m.npv, 'mil. €'], ['Návratnosť súkromného kapitálu', m.payback, 'rokov prevádzky'], ['DSCR minimum', m.dscrMin, ''], ['DSCR priemer', m.dscrAvg, '']);
    inputs.push([]); inputs.push(['Metodika: odpisy 20 rokov zo základu zníženého o grant; daň s prenosom straty; dlh anuitný po odklade istiny; bez zostatkovej hodnoty, DPH a pracovného kapitálu. CC BY 4.0, https://github.com/Pupno/kaskada']);
    var FULL = [['year', 'Rok'], ['phase', 'Fáza'], ['occ', 'Obsadenosť'], ['revColo', 'Výnosy kolokácia'], ['revHeat', 'Výnosy teplo'], ['revOther', 'Výnosy ostatné'], ['rev', 'Výnosy spolu'], ['heatGwh', 'Teplo GWh'], ['elGwh', 'Elektrina GWh'], ['costEl', 'Náklady elektrina'], ['costFix', 'Náklady fixné'], ['ebitda', 'EBITDA'], ['capex', 'CAPEX'], ['grant', 'Grant'], ['dep', 'Odpisy'], ['taxU', 'Daň projekt'], ['cfProj', 'CF projektu po zdanení'], ['cum', 'Kumulovaný CF projektu'], ['draw', 'Čerpanie dlhu'], ['interest', 'Úrok'], ['principal', 'Istina'], ['balance', 'Zostatok dlhu'], ['taxL', 'Daň equity'], ['cfads', 'CFADS'], ['ds', 'Dlhová služba'], ['dscr', 'DSCR'], ['cfEq', 'CF equity'], ['cumEq', 'Kumulovaný CF equity']];
    var table = [FULL.map(function (c) { return c[1]; })];
    m.rows.forEach(function (y) { table.push(FULL.map(function (c) { var v = y[c[0]]; return v === null || v === undefined ? '' : v; })); });
    return { inputs: inputs, table: table };
  }
  function toCsv(rows) { return rows.map(function (r) { return r.map(function (c) { return typeof c === 'number' ? String(Math.round(c * 1000) / 1000).replace('.', ',') : '"' + String(c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n'); }
  function download(name, mime, data) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + data], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  var bx = $('btn-xlsx'), bc = $('btn-csv');
  if (bx) bx.addEventListener('click', function () {
    var d = aoa();
    if (window.XLSX) {
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(d.inputs), 'Vstupy a vysledky');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(d.table), 'Rocny model');
      XLSX.writeFile(wb, 'kaskada-model.xlsx');
    } else { download('kaskada-model.csv', 'text/csv;charset=utf-8', toCsv(d.inputs.concat([[]], d.table))); set('export-note', 'Knižnica pre .xlsx sa nenačítala, stiahol sa CSV.'); }
  });
  if (bc) bc.addEventListener('click', function () { var d = aoa(); download('kaskada-model.csv', 'text/csv;charset=utf-8', toCsv(d.inputs.concat([[]], d.table))); });

  IDS.forEach(function (k) { if (inputs[k]) inputs[k].addEventListener('input', render); });
  document.querySelectorAll('[data-preset]').forEach(function (b) { b.addEventListener('click', function () { var s = JSON.parse(b.getAttribute('data-preset')); Object.keys(s).forEach(function (k) { if (inputs[k]) inputs[k].value = s[k]; }); render(); }); });
  render();
})();
