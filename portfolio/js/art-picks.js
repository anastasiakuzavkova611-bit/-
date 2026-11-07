(() => {
  const hosts = [...document.querySelectorAll('.card-back[data-title="Art picks"]')];
  if (!hosts.length) return;

  const root = new URL('assets/img/art-picks/', document.baseURI);
  const names = ['board', 'collection', 'architecture', 'live-music', 'controls'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const poses = [
    'translate(0, 0) rotate(0deg) scale(1)',
    'translate(0, -8.8%) rotate(0deg) scale(.905)',
    'translate(0, -16%) rotate(0deg) scale(.757)'
  ];
  const washes = [0, .91, .96];
  const flight = [
    {offset: 0, transform: poses[0], zIndex: 4},
    {offset: .12, transform: 'translate(2%, -1%) rotate(1.6deg) scale(1.012)', zIndex: 4},
    {offset: .49, transform: 'translate(-88%, 4%) rotate(-10deg) scale(.94)', zIndex: 4},
    {offset: .50, transform: 'translate(-88%, 4%) rotate(-10deg) scale(.94)', zIndex: 1},
    {offset: .87, transform: 'translate(1%, -16.5%) rotate(.7deg) scale(.757)', zIndex: 1},
    {offset: 1, transform: poses[2], zIndex: 1}
  ];
  const advance = [
    {offset: 0, transform: poses[1]},
    {offset: .17, transform: poses[1]},
    {offset: .74, transform: 'translate(0, 1.4%) rotate(1deg) scale(1.009)'},
    {offset: 1, transform: poses[0]}
  ];
  const rise = [{transform: poses[2]}, {transform: poses[1]}];

  async function prepare() {
    const images = await Promise.all(names.map(async name => {
      const image = new Image();
      image.src = new URL(name + '.png' + (['architecture', 'live-music'].includes(name) ? '?v=upright' : ''), root);
      await image.decode();
      return image;
    }));
    for (const host of hosts) mount(host, images);
  }

  function mount(host, images) {
    const deck = document.createElement('div');
    deck.className = 'art-deck';
    deck.style.backgroundImage = 'url("' + images[0].src + '")';
    const panels = images.slice(1, 4).map(image => {
      const panel = document.createElement('div');
      panel.className = 'art-panel';
      panel.style.backgroundImage = 'url("' + image.src + '")';
      const wash = document.createElement('span');
      wash.className = 'art-paper-wash';
      panel.append(wash);
      deck.append(panel);
      return panel;
    });

    let index = 0, visible = false, moving = false, timer = 0;
    const depth = (i, front) => (i - front + panels.length) % panels.length;
    function place(front) {
      panels.forEach((panel, i) => {
        const slot = depth(i, front);
        panel.dataset.depth = slot;
        panel.style.transform = poses[slot];
        panel.style.zIndex = 3 - slot;
        panel.firstElementChild.style.opacity = washes[slot];
      });
    }
    function schedule() {
      clearTimeout(timer);
      if (visible && !document.hidden && !reduced.matches && !moving)
        timer = setTimeout(() => step(1), 2300);
    }
    async function step(direction) {
      if (moving || reduced.matches) return;
      clearTimeout(timer);
      moving = true;
      const next = (index + direction + panels.length) % panels.length;
      // The previous button traverses the same three trajectories in reverse.
      const startFront = direction > 0 ? index : next;
      const timing = {duration: 820, direction: direction > 0 ? 'normal' : 'reverse',
        easing: 'cubic-bezier(.38,.06,.24,1)', fill: 'both'};
      place(next);
      const animations = panels.flatMap((panel, i) => {
        const slot = depth(i, startFront);
        const endSlot = (slot + 2) % 3;
        const wash = slot === 0 ? [
          {offset: 0, opacity: 0}, {offset: .46, opacity: 0},
          {offset: .69, opacity: washes[2]}, {offset: 1, opacity: washes[2]}
        ] : [{opacity: washes[slot]}, {opacity: washes[endSlot]}];
        return [panel.animate([flight, advance, rise][slot], timing),
          panel.firstElementChild.animate(wash, timing)];
      });
      index = next;
      await Promise.allSettled(animations.map(a => a.finished));
      animations.forEach(a => a.cancel());
      moving = false;
      schedule();
    }

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
    place(0);
    deck.append(controls);
    host.append(deck);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      buttons.forEach(button => button.tabIndex = visible && !host.closest('[aria-hidden=true]') ? 0 : -1);
      schedule();
    }, {threshold: .15}).observe(host);
    reduced.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
  }

  prepare().catch(() => {}); // Leave the static artboard visible if a picture fails to load.
})();
