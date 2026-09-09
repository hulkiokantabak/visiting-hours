/* Local reading controls. No requests, tracking, synthesis or prose changes. */
(() => {
  'use strict';
  const key = 'visiting-hours-playback-speed';
  const rates = [0.25, 0.5, 0.75, 1, 1.15, 1.25, 1.5, 1.75, 2];
  let rate = 1.15;
  try {
    const saved = Number(localStorage.getItem(key));
    if (rates.includes(saved)) rate = saved;
  } catch (_) { /* Controls still work when browser storage is unavailable. */ }
  const players = [...document.querySelectorAll('.voice audio')];
  const selectors = [...document.querySelectorAll('[data-playback-speed]')];
  const applyRate = () => {
    for (const audio of players) {
      audio.preservesPitch = true;
      if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = true;
      if ('mozPreservesPitch' in audio) audio.mozPreservesPitch = true;
      audio.defaultPlaybackRate = rate;
      audio.playbackRate = rate;
    }
    for (const select of selectors) select.value = String(rate);
  };
  const saveRate = chosen => {
    if (!rates.includes(chosen)) return;
    rate = chosen;
    applyRate();
    try { localStorage.setItem(key, String(rate)); } catch (_) { /* Optional persistence. */ }
  };
  applyRate();
  for (const audio of players) {
    audio.addEventListener('loadedmetadata', applyRate);
    // Keep the visible choice accurate if the browser's native media menu is used.
    audio.addEventListener('ratechange', () => {
      if (audio.playbackRate !== rate) saveRate(audio.playbackRate);
    });
  }
  for (const select of selectors) {
    select.closest('.playback-speed').hidden = false;
    select.addEventListener('change', () => {
      saveRate(Number(select.value));
    });
  }

  const menu = document.querySelector('.guide-navigation');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const close = menu.querySelector('.guide-menu-close');
  const list = menu.querySelector('.guide-menu-links');
  const desktop = matchMedia('(min-width: 1000px)');
  const closeMenu = (returnFocus) => {
    if (desktop.matches) return;
    menu.open = false;
    if (returnFocus) summary.focus();
  };
  const showCurrent = () => {
    const current = list.querySelector('[aria-current="page"]');
    if (current) list.scrollTop = current.offsetTop - list.clientHeight / 3;
  };
  const changeLayout = () => {
    // A native open disclosure remains usable without JavaScript. Desktop keeps
    // it visible; small screens start closed and expose the same links on demand.
    const focusInside = menu.contains(document.activeElement);
    menu.open = desktop.matches;
    close.hidden = desktop.matches;
    if (desktop.matches) showCurrent();
    else if (focusInside) summary.focus();
  };
  close.addEventListener('click', () => closeMenu(true));
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktop.matches && menu.open) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  menu.addEventListener('toggle', () => {
    if (desktop.matches && !menu.open) menu.open = true;
    if (menu.open) showCurrent();
  });
  // This is a non-modal drawer: tabbing to the page closes it, without a trap.
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target)) closeMenu(false);
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) closeMenu(false);
  });
  desktop.addEventListener('change', changeLayout);
  changeLayout();
})();
