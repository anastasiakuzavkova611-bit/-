(() => {
 const previews = [...document.querySelectorAll('.cases-feed .work-preview')];
 if (!previews.length) return;
 const sync = () => {
  const mobile = matchMedia('(max-width:700px)').matches;
  const width = previews[0].getBoundingClientRect().width;
  const height = Math.round(width / (mobile ? 1.3 : 1.5));
  previews.forEach(p => p.style.setProperty('--case-preview-height', height + 'px'));
 };
 new ResizeObserver(sync).observe(previews[0]);
 window.addEventListener('resize',sync);
 sync();
})();
