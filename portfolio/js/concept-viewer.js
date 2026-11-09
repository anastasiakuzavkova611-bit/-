(() => {
  const stage = document.querySelector('.card-stage');
  const originals = [...stage.querySelectorAll('.scroll-card:not([data-copy]) .card-back')];
  const dialog = document.createElement('dialog');
  dialog.className = 'concept-viewer';
  dialog.setAttribute('aria-label', 'Просмотр концептов');
  dialog.innerHTML = '<button class="close" aria-label="Закрыть">×</button><button class="prev" aria-label="Предыдущий концепт">←</button><figure><img><figcaption aria-live="polite"></figcaption></figure><button class="next" aria-label="Следующий концепт">→</button>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  let index = 0;
  function show(i) {
    index = (i + originals.length) % originals.length;
    const {image:src, title} = originals[index].dataset;
    image.src = src;
    image.alt = title;
    dialog.querySelector('figcaption').textContent = title;
  }
  for (const card of stage.querySelectorAll('.card-back')) {
    const open = document.createElement('button');
    open.className = 'concept-open';
    open.type = 'button';
    open.setAttribute('aria-label','Открыть концепт «'+card.dataset.title+'»');
    if (card.closest('[data-copy]')) open.tabIndex = -1;
    card.prepend(open);
    open.addEventListener('click', () => {
      show(originals.findIndex(item => item.dataset.image === card.dataset.image));
      dialog.showModal();
    });
  }
  dialog.querySelector('.close').onclick = () => dialog.close();
  dialog.querySelector('.prev').onclick = () => show(index-1);
  dialog.querySelector('.next').onclick = () => show(index+1);
  dialog.addEventListener('click', e => { if(e.target===dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      show(index + (e.key === 'ArrowLeft' ? -1 : 1));
    }
  });
})();
