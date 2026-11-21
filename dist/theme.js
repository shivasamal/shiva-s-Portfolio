(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let chosen;
  try { chosen = localStorage.getItem('portfolio-theme'); } catch {}

  const theme = () => chosen === 'light' || chosen === 'dark'
    ? chosen
    : preference.matches ? 'dark' : 'light';

  function apply() {
    root.dataset.theme = theme();
    document.querySelector('meta[name="theme-color"]')
      .setAttribute('content', theme() === 'dark' ? '#141724' : '#faf8f0');
    const toggle = document.querySelector('#theme-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(theme() === 'dark'));
  }

  apply();
  preference.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('#theme-toggle');
    apply();
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      chosen = theme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('portfolio-theme', chosen); } catch {}
      apply();
    });
  });
})();
