(() => {
 const root = document.querySelector('.install-video-comparison');
 if (!root) return;
 const panels = [...root.querySelectorAll('.install-video-panel')];
 const button = root.querySelector('.install-video-next');
 const label = root.querySelector('.install-video-label');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let visible = false, active = 0;
 const current = () => panels[active].querySelector('video');
 const restart = () => { current().currentTime = 0; play(); };
 const play = () => { if (visible && !document.hidden && !document.documentElement.classList.contains('media-viewer-open') && !reduced.matches) current().play().catch(() => {}); };
 button.addEventListener('click', () => {
  current().pause();
  active = (active + 1) % panels.length;
  panels.forEach((p,i) => { p.hidden = i !== active; });
  label.textContent = active ? 'Стало' : 'Было';
  button.dataset.last=String(active===panels.length-1);
  button.setAttribute('aria-label', active ? 'Показать Было' : 'Показать Стало');
  restart();
 });
 new IntersectionObserver(entries => {
  const wasVisible = visible;
  visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
  if (visible && !wasVisible) restart();
  else if (!visible) current().pause();
 }, {threshold:.25}).observe(root);
 document.addEventListener('visibilitychange', () => { if(document.hidden) current().pause(); else restart(); });
})();
