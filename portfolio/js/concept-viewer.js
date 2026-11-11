(() => {
  const stage = document.querySelector('.card-stage, .ab-intro-gallery');
  if (!stage) return;
  const ribbon = stage.classList.contains('ab-intro-gallery');
  const selector = ribbon ? '.screen-original' : '.card-back';
  const originals = [...stage.querySelectorAll(ribbon
    ? '.ab-ribbon-group:first-child .screen-original'
    : '.scroll-card:not([data-copy]) .card-back')];
  const key = card => ribbon ? card.querySelector('img').src : card.dataset.image;
  const title = card => ribbon ? card.querySelector('img').alt : card.dataset.title;
  const dialog = document.createElement('dialog');
  dialog.className = 'concept-viewer';
  dialog.setAttribute('aria-label', 'Просмотр концептов');
  dialog.innerHTML = '<button class="close" aria-label="Закрыть">×</button><button class="prev" aria-label="Предыдущий концепт"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><div class="viewer-stage"></div><button class="next" aria-label="Следующий концепт"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>';
  document.body.append(dialog);
  const viewport = dialog.querySelector('.viewer-stage');
  let index = 0, active, marker, opener, ratio = 1;

  function transfer(parent, node, before = null) {
    if (parent.moveBefore) parent.moveBefore(node, before);
    else parent.insertBefore(node, before);
  }
  function restore() {
    if (!active) return;
    if (ribbon) active.remove();
    else {
      transfer(marker.parentNode, active, marker);
      marker.remove();
    }
    active = null;
  }
  function fit() {
    if (!active) return;
    const widget = ['charge', 'prices'].includes(active.dataset.motion);
    const height = Math.min(viewport.clientHeight, viewport.clientWidth / ratio, widget ? 360 / ratio : Infinity);
    active.style.setProperty('--viewer-width', height * ratio + 'px');
    active.style.setProperty('--viewer-height', height + 'px');
  }
  new ResizeObserver(fit).observe(viewport);
  function show(i, selected) {
    restore();
    index = (i + originals.length) % originals.length;
    const card = selected || originals[index];
    if (ribbon) {
      // Keep the track width constant while displaying the same layered artwork.
      active = card.cloneNode(true);
      active.querySelector('.concept-open')?.remove();
      const image = active.querySelector('img');
      ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
      viewport.append(active);
    } else {
      active = card;
      const frame = active.closest('.scroll-card');
      ratio = Number(frame.dataset.conceptWidth) / Number(frame.dataset.conceptHeight);
      marker = document.createComment('concept in viewer');
      active.before(marker);
      transfer(viewport, active);
    }
    dialog.style.setProperty('--art-ratio', ratio);
    dialog.style.setProperty('--art-limit', ['charge', 'prices'].includes(active.dataset.motion) ? '360px' : '1240px');
    dialog.setAttribute('aria-label', title(card));
    fit();
  }
  dialog.addEventListener('close', () => {
    restore();
    delete dialog.dataset.viewing;
    opener?.focus({preventScroll:true});
  });
  for (const card of stage.querySelectorAll(selector)) {
    const open = document.createElement('button');
    open.className = 'concept-open';
    open.type = 'button';
    open.setAttribute('aria-label','Открыть «'+title(card)+'»');
    if (card.closest('[data-copy], [aria-hidden=true]')) open.tabIndex = -1;
    card.prepend(open);
    open.addEventListener('click', () => {
      opener = open;
      dialog.dataset.viewing = "";
      dialog.showModal();
      show(originals.findIndex(item => key(item) === key(card)), card);
    });
  }
  dialog.querySelector('.close').onclick = () => dialog.close();
  dialog.querySelector('.prev').onclick = () => show(index-1);
  dialog.querySelector('.next').onclick = () => show(index+1);
  dialog.addEventListener('click', e => { if(e.target===dialog || e.target===viewport) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + (e.key === 'ArrowLeft' ? -1 : 1));
    }
  });
})();
