// Kaskáda calculator: IT load -> electricity -> recovered heat -> heat pump lift -> DH heat -> CO2, households, economics.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var f = window.fmt;

  var inputs = {
    mw: $('i-mw'), util: $('i-util'), erf: $('i-erf'), cop: $('i-cop'), avail: $('i-avail'),
    efdh: $('i-efdh'), efel: $('i-efel'),
    colo: $('i-colo'), occ: $('i-occ'), heatp: $('i-heatp'), elp: $('i-elp'),
    capex: $('i-capex'), grant: $('i-grant'), sites: $('i-sites')
  };

  function val(k) { return parseFloat(inputs[k].value); }

  function model() {
    var mw = val('mw'), util = val('util') / 100, erf = val('erf'), cop = val('cop'), avail = val('avail') / 100;
    var efdh = val('efdh'), efel = val('efel');
    var colo = val('colo'), occ = val('occ') / 100, heatp = val('heatp'), elp = val('elp');
    var capexPerMw = val('capex'), grant = val('grant') / 100, sites = val('sites');

    var h = 8760;
    var elIt = mw * util * h / 1000;                       // GWh/yr IT electricity
    var elFacility = elIt * 1.15;                          // PUE 1.15 fixed for facility overhead
    var heatIn = elIt * erf;                               // GWh/yr low-temp heat recovered
    var lift = cop / (cop - 1);                            // Q_out / Q_in for a heat pump
    var heatOutGross = heatIn * lift;
    var heatOut = heatOutGross * avail;                    // GWh/yr delivered to DH
    var hpEl = heatOut / cop;                              // GWh/yr electricity for heat pump
    var households = heatOut * 1000 / 10;                  // 10 MWh per household-year

    var co2Heat = heatOut * 1000 * efdh;                   // t/yr avoided at the DH plant
    var co2HpPenalty = hpEl * 1000 * efel;                 // t/yr caused by HP electricity
    var co2Elec = elFacility * 1000 * (0.17 - efel);       // t/yr vs SK grid mix if PPA is greener
    if (co2Elec < 0) co2Elec = 0;
    var co2Net = co2Heat - co2HpPenalty + co2Elec;

    var revColo = mw * 1000 * colo * 12 * occ / 1e6;       // M€
    var revHeat = heatOut * 1000 * heatp / 1e6;            // M€
    var rev = revColo + revHeat + 0.06 * mw;               // + other services ~0.06 M€/MW
    var costEl = (elFacility + hpEl) * 1000 * elp / 1e6;   // M€
    var costFixed = 0.65 * mw;                             // personnel + maintenance + admin ~0.65 M€/MW
    var ebitda = rev - costEl - costFixed;
    var capex = mw * capexPerMw;
    var grantEur = capex * grant;
    var privateCap = capex - grantEur;
    var payback = ebitda > 0 ? privateCap / ebitda : Infinity;

    return {
      elIt: elIt, elFacility: elFacility, heatIn: heatIn, heatOut: heatOut, hpEl: hpEl, households: households,
      co2Heat: co2Heat, co2Elec: co2Elec, co2HpPenalty: co2HpPenalty, co2Net: co2Net,
      revColo: revColo, revHeat: revHeat, rev: rev, costEl: costEl, costFixed: costFixed, ebitda: ebitda,
      capex: capex, grantEur: grantEur, privateCap: privateCap, payback: payback, sites: sites, mw: mw, cop: cop, erf: erf
    };
  }

  function set(id, txt) { var el = $(id); if (el) el.textContent = txt; }

  function render() {
    var m = model();
    // outputs on sliders
    set('o-mw', f.n(m.mw, 1) + ' MW'); set('o-util', f.n(val('util')) + ' %'); set('o-erf', f.n(m.erf, 2));
    var hcEl = val('elp') / (m.cop - 1), hc = hcEl + 14;
    set('r-hc-el', f.n(hcEl, 1)); set('r-hc', f.n(hc, 1)); set('r-hc-margin', f.n(val('heatp') - hc, 1));
    set('o-cop', f.n(m.cop, 1)); set('o-avail', f.n(val('avail')) + ' %');
    set('o-efdh', f.n(val('efdh'), 3) + ' t/MWh'); set('o-efel', f.n(val('efel'), 2) + ' t/MWh');
    set('o-colo', f.n(val('colo')) + ' €/kW/m'); set('o-occ', f.n(val('occ')) + ' %');
    set('o-heatp', f.n(val('heatp')) + ' €/MWh'); set('o-elp', f.n(val('elp')) + ' €/MWh');
    set('o-capex', f.n(val('capex'), 1) + ' mil. €/MW'); set('o-grant', f.n(val('grant')) + ' %'); set('o-sites', f.n(m.sites) + ' ×');

    // KPIs single site
    set('r-el', f.n(m.elFacility, 1)); set('r-heatin', f.n(m.heatIn, 1)); set('r-heatout', f.n(m.heatOut, 1));
    set('r-hh', f.n(Math.round(m.households / 100) * 100));
    set('r-co2', f.n(Math.round(m.co2Net / 100) * 100)); set('r-co2-25', f.n(Math.round(m.co2Net * 25 / 1000)));
    set('r-rev', f.n(m.rev, 1)); set('r-revheat', f.n(m.revHeat, 1)); set('r-ebitda', f.n(m.ebitda, 1));
    set('r-margin', m.rev > 0 ? f.n(m.ebitda / m.rev * 100) + ' %' : 'n/a');
    set('r-capex', f.n(m.capex, 0)); set('r-grant', f.n(m.grantEur, 1)); set('r-private', f.n(m.privateCap, 1));
    set('r-payback', isFinite(m.payback) ? f.n(m.payback, 1) + ' r.' : 'n/a');

    // National scale
    set('n-sites', f.n(m.sites)); set('n-mw', f.n(m.sites * m.mw));
    set('n-heat', f.n(m.sites * m.heatOut, 0)); set('n-hh', f.n(Math.round(m.sites * m.households / 1000) * 1000));
    set('n-co2', f.n(Math.round(m.sites * m.co2Net / 1000)));
    set('n-capex', f.n(m.sites * m.capex, 0)); set('n-grant', f.n(m.sites * m.grantEur, 0));
    set('n-jobs', f.n(Math.round(m.sites * m.mw * 4.5)));
    var hm = $('r-hc-margin'); if (hm) hm.parentNode.style.color = (val('heatp') - hc) < 0 ? 'var(--accent)' : '';

    // Taxonomy badge: ERF >= 0.5 and PUE 1.15 -> ok
    var b = $('r-tax');
    if (b) { var ok = m.erf >= 0.5; b.textContent = ok ? 'Taxonómia 8.1 + 4.15: spĺňa' : 'Taxonómia 4.15: ERF pod 0,5'; b.className = 'badge ' + (ok ? 'ok' : 'warn'); }

    drawFlow(m);
  }

  // Energy flow bar: electricity in -> (IT heat recovered | lost) ; heat pump adds work -> DH heat.
  function drawFlow(m) {
    var svg = $('flow-svg'); if (!svg) return;
    var W = 900, H = 170, pad = 20, barH = 34;
    var maxV = Math.max(m.elFacility + m.hpEl, m.heatOut, 1);
    var sx = (W - 2 * pad) / maxV;
    var ink = 'var(--ink)', mute = 'var(--ink-mute)', prim = 'var(--primary)', acc = 'var(--accent)', rule = 'var(--rule-strong)', panel2 = 'var(--panel-2)';
    var y1 = 34, y2 = 110;
    var lost = m.elFacility - m.heatIn; if (lost < 0) lost = 0;
    var s = '';
    s += '<text x="' + pad + '" y="' + (y1 - 10) + '" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.2" fill="' + mute + '">VSTUP ELEKTRINY, GWh/ROK</text>';
    s += '<rect x="' + pad + '" y="' + y1 + '" width="' + (m.heatIn * sx) + '" height="' + barH + '" fill="' + prim + '"/>';
    s += '<rect x="' + (pad + m.heatIn * sx) + '" y="' + y1 + '" width="' + (lost * sx) + '" height="' + barH + '" fill="' + panel2 + '" stroke="' + rule + '" stroke-width="1"/>';
    s += '<rect x="' + (pad + m.elFacility * sx) + '" y="' + y1 + '" width="' + (m.hpEl * sx) + '" height="' + barH + '" fill="' + acc + '"/>';
    s += label(pad + 6, y1 + 22, 'IT teplo ' + f.n(m.heatIn, 1), 'var(--ground)');
    if (lost * sx > 70) s += label(pad + m.heatIn * sx + 6, y1 + 22, 'straty ' + f.n(lost, 1), ink);
    if (m.hpEl * sx > 60) s += label(pad + m.elFacility * sx + 6, y1 + 22, 'TČ ' + f.n(m.hpEl, 1), 'var(--ground)');
    s += '<text x="' + pad + '" y="' + (y2 - 10) + '" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.2" fill="' + mute + '">VÝSTUP TEPLA DO CZT, GWh/ROK</text>';
    s += '<rect x="' + pad + '" y="' + y2 + '" width="' + (m.heatOut * sx) + '" height="' + barH + '" fill="' + acc + '"/>';
    s += label(pad + 6, y2 + 22, 'dodané teplo ' + f.n(m.heatOut, 1) + ' GWh pri 90 °C', 'var(--ground)');
    // scale ticks
    var step = niceStep(maxV);
    for (var v = 0; v <= maxV; v += step) {
      var x = pad + v * sx;
      s += '<line x1="' + x + '" y1="' + (y1 + barH) + '" x2="' + x + '" y2="' + (y1 + barH + 5) + '" stroke="' + rule + '"/>';
      s += '<text x="' + x + '" y="' + (y1 + barH + 16) + '" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="' + mute + '" text-anchor="middle">' + f.n(v) + '</text>';
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = s;
  }
  function label(x, y, t, c) { return '<text x="' + x + '" y="' + y + '" font-family="IBM Plex Sans, sans-serif" font-size="12" font-weight="600" fill="' + c + '">' + t + '</text>'; }
  function niceStep(max) { var raw = max / 6, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p; return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p; }

  Object.keys(inputs).forEach(function (k) { if (inputs[k]) inputs[k].addEventListener('input', render); });
  document.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = JSON.parse(b.getAttribute('data-preset'));
      Object.keys(p).forEach(function (k) { if (inputs[k]) inputs[k].value = p[k]; });
      render();
    });
  });
  render();
})();
