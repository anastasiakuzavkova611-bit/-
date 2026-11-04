document.querySelectorAll('[data-detail]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.detail).showModal());
});
document.querySelectorAll('.dl-dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if(event.target === dialog){ const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); }});
});
