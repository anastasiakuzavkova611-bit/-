(() => {
  const stage = document.querySelector('.card-stage');
  const originals = [...stage.querySelectorAll('.scroll-card:not([data-copy]) .card-back')];
  const dialog = document.createElement('dialog');
  dialog.className = 'concept-viewer';
  dialog.setAttribute('aria-label', 'Просмотр концептов');
  dialog.innerHTML = '<button class="close" aria-label="Закрыть">×</button><button class="prev" aria-label="Предыдущий концепт">←</button><div class="viewer-stage"></div><button class="next" aria-label="Следующий концепт">→</button>';
  document.body.append(dialog);
  const viewport = dialog.querySelector('.viewer-stage');
  let index = 0, active, marker, opener, ratio = 1;

  function transfer(parent, node, before = null) {
    if (parent.moveBefore) parent.moveBefore(node, before);
    else parent.insertBefore(node, before);
  }
  function restore() {
    if (!active) return;
    transfer(marker.parentNode, active, marker);
    marker.remove();
    active = null;
  }
  function fit() {
    if (!active) return;
    const height = Math.min(viewport.clientHeight, viewport.clientWidth / ratio);
    active.style.setProperty('--viewer-width', height * ratio + 'px');
    active.style.setProperty('--viewer-height', height + 'px');
  }
  new ResizeObserver(fit).observe(viewport);
  function show(i, selected) {
    restore();
    index = (i + originals.length) % originals.length;
    active = selected || originals[index];
    const frame = active.closest('.scroll-card');
    ratio = Number(frame.dataset.conceptWidth) / Number(frame.dataset.conceptHeight);
    marker = document.createComment('concept in viewer');
    active.before(marker);
    transfer(viewport, active);
    dialog.setAttribute('aria-label', active.dataset.title);
    fit();
  }
  dialog.addEventListener('close', () => {
    restore();
    delete dialog.dataset.viewing;
    opener?.focus({preventScroll:true});
  });
  for (const card of stage.querySelectorAll('.card-back')) {
    const open = document.createElement('button');
    open.className = 'concept-open';
    open.type = 'button';
    open.setAttribute('aria-label','Открыть концепт «'+card.dataset.title+'»');
    if (card.closest('[data-copy]')) open.tabIndex = -1;
    card.prepend(open);
    open.addEventListener('click', () => {
      opener = open;
      dialog.dataset.viewing = "";
      dialog.showModal();
      show(originals.findIndex(item => item.dataset.image === card.dataset.image), card);
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
