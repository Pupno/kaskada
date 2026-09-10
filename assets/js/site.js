// Shared: number formatting (sk-SK), theme toggle, current-page nav mark.
(function () {
  window.fmt = {
    n: function (v, d) { return new Intl.NumberFormat('sk-SK', { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d }).format(v); },
    meur: function (v, d) { return window.fmt.n(v, d == null ? 1 : d) + ' mil. €'; },
    pct: function (v, d) { return window.fmt.n(v * 100, d == null ? 0 : d) + ' %'; }
  };

  var here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var target = new URL(a.getAttribute('href'), location.href).pathname.replace(/index\.html$/, '');
    if (target === here) a.setAttribute('aria-current', 'page');
  });

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    var saved = null;
    try { saved = localStorage.getItem('kaskada-theme'); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    toggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('kaskada-theme', next); } catch (e) {}
    });
  }
})();
