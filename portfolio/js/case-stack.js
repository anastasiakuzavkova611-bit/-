(() => {
  const rows = [...document.querySelectorAll('.case-stack .work-row')];
  let frame = 0;
  function update() {
    frame = 0;
    rows.forEach((row, index) => {
      const copy = row.querySelector('.work-copy');
      const next = rows[index + 1];
      let opacity = 1;
      if (next && getComputedStyle(row).position === 'sticky') {
        const bottom = copy.getBoundingClientRect().bottom;
        const nextTop = next.querySelector('.work-copy').getBoundingClientRect().top;
        opacity = Math.max(0, Math.min(1, (nextTop - bottom - 24) / 120));
      }
      copy.style.setProperty('--copy-opacity', opacity);
      copy.inert = opacity === 0;
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  (document.querySelector('.cases-scroll') || window).addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
