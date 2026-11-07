(() => {
  const hosts = [...document.querySelectorAll('.card-back[data-title="Art picks"]')];
  if (!hosts.length) return;

  const root = new URL('assets/img/art-picks/', document.baseURI);
  const names = ['board', 'collection', 'architecture', 'live-music', 'controls'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  async function prepare() {
    const images = await Promise.all(names.map(async name => {
      const image = new Image();
      image.src = new URL(name + '.png', root);
      await image.decode();
      return image;
    }));
    const pictures = images.slice(1, 4);
    for (const host of hosts) {
      const deck = document.createElement('div');
      deck.className = 'art-deck';
      deck.style.backgroundImage = 'url("' + images[0].src + '")';
      const panels = pictures.map((image, index) => {
        const panel = document.createElement('div');
        panel.className = 'art-panel';
        panel.style.backgroundImage = 'url("' + image.src + '")';
        panel.hidden = index !== 0;
        deck.append(panel);
        return panel;
      });
      const controls = document.createElement('div');
      controls.className = 'art-controls';
      controls.style.backgroundImage = 'url("' + images[4].src + '")';
      const buttons = [-1, 1].map(direction => {
        const button = document.createElement('button');
        button.type = 'button';
        button.ariaLabel = direction === 1 ? 'Следующая коллекция' : 'Предыдущая коллекция';
        button.addEventListener('click', () => step(direction));
        controls.append(button);
        return button;
      });
      deck.append(controls);
      host.append(deck);

      let index = 0, visible = false, timer = 0, moving = false;
      function schedule() {
        clearTimeout(timer);
        if (visible && !document.hidden && !reduced.matches) timer = setTimeout(() => step(1), 2100);
      }
      async function step(direction) {
        if (moving) return;
        clearTimeout(timer);
        const outgoing = panels[index];
        index = (index + direction + panels.length) % panels.length;
        const incoming = panels[index];
        incoming.hidden = false;
        moving = true;
        outgoing.style.zIndex = '2';
        const timing = {duration: 510, easing: 'cubic-bezier(.22,.68,.2,1)', fill: 'both'};
        const anims = [
          outgoing.animate([{transform: 'none', opacity: 1}, {transform: 'translate(' + (-direction * 16) + '%, 4%) rotate(' + (-direction * 5) + 'deg)', opacity: 0}], timing),
          incoming.animate([{transform: 'translateY(-11%) scale(.89)', opacity: .55}, {transform: 'none', opacity: 1}], timing)
        ];
        await Promise.allSettled(anims.map(a => a.finished));
        outgoing.hidden = true;
        outgoing.style.zIndex = '';
        anims.forEach(a => a.cancel());
        moving = false;
        schedule();
      }
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        buttons.forEach(button => button.tabIndex = visible && !host.closest('[aria-hidden=true]') ? 0 : -1);
        schedule();
      }, {threshold: .15}).observe(host);
      reduced.addEventListener('change', schedule);
      document.addEventListener('visibilitychange', schedule);
    }
  }
  prepare().catch(() => {}); // The original Figma preview remains available if an asset cannot load.
})();
