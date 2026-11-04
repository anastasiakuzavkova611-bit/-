(() => {
  const panels = [...document.querySelectorAll('dialog[data-route]')];
  const imageDialog = document.querySelector('.ui-dialog');
  let imageOpener, routeOpener, routing = false;
  const syncScroll = () => document.body.classList.toggle('ui-modal-open', !!document.querySelector('dialog[open]'));
  function route() {
    routing = true;
    const name = location.hash.slice(1);
    const aliases={cases:'cases',experience:'resume',visuals:'concepts'};if(aliases[name]){location.replace('#deck-'+aliases[name]);routing=false;return;}
    const next = panels.find(panel => panel.dataset.route === name);
    if (imageDialog.open) imageDialog.close();
    panels.forEach(panel => {if(panel !== next && panel.open) panel.close();});
    if(next && !next.open) { next.showModal(); next.focus({preventScroll:true}); }
    syncScroll();
    routing = false;
  }
  function closeRoute() {
    if (history.state?.portfolioPanel) history.back();
    else {history.replaceState(null, '', location.pathname + location.search); route();}
  }
  document.querySelectorAll('[data-panel]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); routeOpener = link;
    if (location.hash !== link.hash) history.pushState({portfolioPanel:true}, '', link.hash);
    route();
  }));
  panels.forEach(panel => {
    panel.querySelector('.panel-close,.visuals-close').addEventListener('click', closeRoute);
    panel.addEventListener('cancel', event => {event.preventDefault();closeRoute();});
    panel.addEventListener('click', event => {
      if(event.target !== panel) return;
      const r = panel.getBoundingClientRect();
      if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeRoute();
    });
    panel.addEventListener('close', () => {syncScroll();if(!routing && !document.querySelector('dialog[open]'))routeOpener?.focus({preventScroll:true});});
  });
  document.querySelectorAll('.visual-tile').forEach(button => button.addEventListener('click', () => {
    imageOpener = button;
    imageDialog.querySelector('h2').textContent = button.dataset.title;
    const image = imageDialog.querySelector('img');image.src = button.dataset.image;image.alt = button.dataset.title;
    imageDialog.showModal();syncScroll();
  }));
  imageDialog.querySelector('.ui-close').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('click', event => {
    if(event.target !== imageDialog) return;
    const r = imageDialog.getBoundingClientRect();
    if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)imageDialog.close();
  });
  imageDialog.addEventListener('close', () => {syncScroll();if(location.hash === '#visuals')imageOpener?.focus({preventScroll:true});});
  window.addEventListener('popstate',route);
  window.addEventListener('hashchange',route);
  route();
})();
