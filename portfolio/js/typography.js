(() => {
  'use strict';

  // Keep short Russian function words with the word they belong to.
  // Deliberately leave punctuation, numbers, URLs and code unchanged.
  const forward = 'а|и|в|во|к|ко|с|со|у|о|об|обо|от|ото|до|за|из|изо|из-за|из-под|на|над|надо|под|подо|по|при|про|для|без|безо|перед|передо|через|между|не|ни|но|да|или|либо|что|как|чем|чтоб|чтобы|если|то|так|это|эти|этот|эта|эту|этой|том|тем|тех|тот|та|ту|те|я|мы|вы|он|она|они|оно|его|её|ее|их|им|мне|нам|вам|нас|вас|кто|где|уже|ещё|еще|всё|все';
  const nextWord = new RegExp(`(?<![\\p{L}\\p{N}_-])(${forward})([ \\t\\u00a0]+)(?=[«„“\"(]*[\\p{L}\\p{N}])`, 'giu');
  const previousWord = /([\p{L}\p{N}»”")])([ \t\u00a0]+)(?=(?:бы|б|ли|ль|же|ж)(?![\p{L}\p{N}_]))/giu;
  const skip = 'script,style,code,pre,kbd,samp,textarea,input,select,svg,math,[contenteditable]:not([contenteditable="false"]),[data-no-typography]';
  const block = 'p,li,h1,h2,h3,h4,h5,h6,td,th,figcaption,dt,dd,button,label,legend,div,section,article,header,footer,main,nav,body';
  const normalize = value => value
    .replace(nextWord, (_, word, spaces) => word + '\u00a0'.repeat(spaces.length))
    .replace(previousWord, (_, word, spaces) => word + '\u00a0'.repeat(spaces.length));

  function apply() {
    const groups = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement && !node.parentElement.closest(skip)
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const owner = node.parentElement.closest(block);
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner).push(node);
    }
    for (const nodes of groups.values()) {
      const before = nodes.map(item => item.data).join('');
      if (!/[А-Яа-яЁё]/.test(before)) continue;
      const after = normalize(before);
      if (after === before) continue;
      let offset = 0;
      for (const item of nodes) {
        const value = after.slice(offset, offset + item.length);
        offset += item.length;
        if (item.data !== value) item.data = value;
      }
    }
  }

  function start() {
    apply();
    let queued = false;
    new MutationObserver(records => {
      if (queued || !records.some(record => record.type === 'characterData' || record.addedNodes.length)) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; apply(); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
