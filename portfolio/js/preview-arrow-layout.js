(() => {
  const galleries = document.querySelectorAll(
    '.install-video-comparison, .solution-carousel, .ab-solution-gallery'
  );

  for (const gallery of galleries) {
    // The frame reserves the same side gutters for every slide. Anchor controls
    // to that frame, independently of the artwork's intrinsic aspect ratio.
    let lastWidth = 0, lastHeight = 0;
    function placeControls() {
      const card = gallery.getBoundingClientRect();
      if (!card.width || (card.width === lastWidth && card.height === lastHeight)) return;
      const slide = gallery.querySelector(':scope > figure:not([hidden]), :scope > .install-video-panel:not([hidden])');
      if (!slide) return;
      const frame = slide.querySelector('.ab-flow-phones, .ab-research-media, .screen-original') || slide;
      const box = frame.getBoundingClientRect();
      if (!box.width || !box.height) return;
      gallery.style.setProperty('--preview-middle', (box.top + box.height / 2 - card.top) + 'px');
      gallery.style.setProperty('--preview-left', (box.left - card.left) + 'px');
      gallery.style.setProperty('--preview-right', (card.right - box.right) + 'px');
      lastWidth = card.width;
      lastHeight = card.height;
    }
    new ResizeObserver(placeControls).observe(gallery);
    document.fonts.ready.then(placeControls);
    placeControls();
  }
})();
