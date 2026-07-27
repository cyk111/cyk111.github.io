(function() {
  const THEME_KEY = 'warm-theme';
  const saved = localStorage.getItem(THEME_KEY);

  if (saved === 'sunrise' || saved === 'coffee' || saved === 'amber') {
    document.documentElement.className = 'theme-' + saved;
    return;
  }

  // Auto: time-based
  const hour = new Date().getHours();
  let theme;
  if (hour >= 6 && hour < 12) {
    theme = 'sunrise';
  } else if (hour >= 12 && hour < 18) {
    theme = 'coffee';
  } else {
    theme = 'amber';
  }
  document.documentElement.className = 'theme-' + theme;
})();
