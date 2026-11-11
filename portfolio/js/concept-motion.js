(()=>{
 const type=src=>src?.includes('2722-797')?'music':src?.includes('2722-551')?'charge':src?.includes('2722-354')?'fitness':src?.includes('2722-445')?'prices':null;
 const targets=[...document.querySelectorAll('.card-back[data-image]')].filter(el=>{const motion=type(el.dataset.image);if(motion)el.dataset.motion=motion;return motion});
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('motion-visible',entry.isIntersecting)),{threshold:.15});targets.forEach(el=>observer.observe(el));
 let serial=0;
 function chargeLayer(host,small=false){
  const id='charge-live-'+serial++,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',small?'0 0 252 252':'0 0 539 252');svg.setAttribute('aria-hidden','true');svg.classList.add('charge-live');if(small)svg.classList.add('charge-live-small');
  fetch(`/-/portfolio/assets/img/charge-live-${small?'small':'wide'}.svg`).then(r=>r.text()).then(source=>{
   const doc=new DOMParser().parseFromString(source,'image/svg+xml');
   const root=doc.documentElement;
   root.querySelector('rect[fill^="url(#pattern0"]')?.classList.add('charge-car-art');
   root.querySelector('[id="85%"]')?.classList.add('charge-live-value');
   root.querySelector('[id="2h left"] tspan').classList.add('charge-time-left');
   if (!small) {
    const heading = root.querySelector('[id="Xiomi SU7"]');
    const status = root.querySelector('[id="is charging"]');
    const span = status.querySelector('tspan');
    span.removeAttribute('x');
    span.removeAttribute('y');
    span.setAttribute('dx', '8');
    for (const attr of ['fill', 'font-size', 'font-weight']) span.setAttribute(attr, status.getAttribute(attr));
    heading.append(span);
    status.remove();
   }
   const fill=root.querySelector('[id="Frame 7"] rect');
   if(fill){fill.classList.add('charge-live-fill');fill.parentElement.removeAttribute('clip-path');const effect=root.querySelector('[id="filter8_dd_2722_551"]');if(effect)effect.setAttribute('width','534.216')}
   // Recolor only the original light layers; the car and neutral surfaces stay intact.
   root.querySelectorAll('[fill],[stop-color]').forEach(el=>{
    for(const attr of ['fill','stop-color']){
     const color=(el.getAttribute(attr)||'').toUpperCase();
     if(['#55EA81','#30D158','#74E48F','#78EC95'].includes(color))el.setAttribute(attr,'var(--charge-color, #FF6257)');
     if(color==='#0F4D1F')el.setAttribute(attr,'var(--charge-dark, #802720)');
    }
   });
   root.querySelectorAll('feColorMatrix').forEach(el=>{const v=el.getAttribute('values').split(/\s+/).map(Number);if(v[9]>v[4]&&v[9]>v[14]){el.classList.add('charge-glow-matrix');el.dataset.alpha=v[18]}});
   // Keep a single soft contact shadow instead of stacked dark shadow passes.
   root.querySelectorAll('filter').forEach(filter=>{
    const layers=[...filter.querySelectorAll('feColorMatrix')].filter(el=>{
     const m=el.getAttribute('values')?.trim().split(/\s+/).map(Number);
     return m?.length===20 && m[4]===0 && m[9]===0 && m[14]===0 && m[18]>0 && m[18]<=1;
    });
    layers.forEach((el,i)=>{
     const m=el.getAttribute('values').trim().split(/\s+/).map(Number);
     m[18]=i===0?Math.min(m[18],.12):0;
     el.setAttribute('values',m.join(' '));
    });
   });
   const ids=new Map([...root.querySelectorAll('[id]')].map(el=>[el.id,`${id}-${el.id}`]));
   root.querySelectorAll('*').forEach(el=>{for(const attr of [...el.attributes]){if(attr.name==='id')el.setAttribute('id',ids.get(attr.value));else if(attr.value.startsWith('#')&&ids.has(attr.value.slice(1))){el.setAttribute(attr.name,'#'+ids.get(attr.value.slice(1)))}else if(attr.value.startsWith('url(#')){const key=attr.value.slice(5,-1);if(ids.has(key))el.setAttribute(attr.name,`url(#${ids.get(key)})`)}}});
   svg.innerHTML=root.innerHTML;svg.classList.add("charge-ready");
  });
  host.append(svg);return svg;
 }
 targets.filter(el=>el.dataset.motion==='charge').forEach(el=>{chargeLayer(el);const pair=el.querySelector('.concept-charge-pair');if(pair)chargeLayer(pair,true)});
 function fitnessLayer(host){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('fitness-live');svg.setAttribute('viewBox','0 0 402 874');svg.setAttribute('aria-hidden','true');host.append(svg);
  Promise.all(['squats','run','plank'].map(async(name,i)=>{const source=await(await fetch(`/-/portfolio/assets/img/fitness-${name}.svg`)).text();const root=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;const base=document.createElementNS(svg.namespaceURI,'rect');['width','height','rx','fill'].forEach((k,j)=>base.setAttribute(k,['370','112','24','#131313'][j]));root.prepend(base);
   const fill=root.querySelector(['rect[width="266"]','rect[width="348"]','rect[width="128"]'][i]);fill.classList.add('fitness-fill');
   root.querySelector(['[id="72"] tspan','[id="94"] tspan','[id="35"] tspan'][i]).classList.add('fitness-value');
   const digits=root.querySelector('.fitness-value');
   const amount=digits.parentElement;
   const percent=root.querySelector('[id="%"]');
   const unit=percent.querySelector('tspan');
   unit.removeAttribute('x');
   unit.removeAttribute('y');
   unit.setAttribute('dx','4');
   unit.setAttribute('font-size','16');
   amount.append(unit);
   percent.remove();
   root.querySelector('text').classList.add('fitness-label');
   const icon=root.querySelector(['[id="Frame 2087325984"]','[id="fa7-solid:running"]','[id="Frame 2087325983"]'][i]);icon?.remove();
   root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
   const g=document.createElementNS(svg.namespaceURI,'g');g.dataset.exercise=name;g.setAttribute('transform',`translate(16 ${486+i*124})`);g.innerHTML=root.innerHTML;return g;
  })).then(groups=>{
   groups.forEach(g=>svg.append(g));
   const shade=document.createElementNS(svg.namespaceURI,'image');shade.setAttribute('href','/-/portfolio/assets/img/fitness-shade.svg');shade.setAttribute('width','402');shade.setAttribute('height','874');shade.setAttribute('y','0');shade.style.clipPath='inset(734px 0 0 0)';svg.append(shade);
   const nav=document.createElementNS(svg.namespaceURI,'image');nav.setAttribute('href','/-/portfolio/assets/img/fitness-nav.svg');nav.setAttribute('width','402');nav.setAttribute('height','118');nav.setAttribute('y','756');svg.append(nav);
  });return svg;
 }
 targets.filter(el=>el.dataset.motion==='fitness').forEach(fitnessLayer);
 function timeLeft(percent) {
  const minutes = Math.round(120 * (100 - percent) / 100);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return minutes + 'm left';
  return hours + 'h' + (remainder ? ' ' + remainder + 'm' : '') + ' left';
 }
 let elapsed=0,last=0;
 function animate(time){const delta=last?Math.min(time-last,60):0;last=time;if(!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches){elapsed+=delta;
 const cycle=elapsed%15000;
 const progress=cycle<9000 ? cycle/9000 : Math.min(1,(15000-cycle)/2400);
 const eased=progress*progress*(3-2*progress);
 document.querySelectorAll('.fitness-live').forEach(svg=>{if(!svg.closest('.motion-visible'))return;svg.querySelectorAll('[data-exercise]').forEach(g=>{const target={squats:72,run:94,plank:35}[g.dataset.exercise];
 const progressPercent=25+(target-25)*eased;
 const value=Math.round(progressPercent);
 g.querySelector('.fitness-fill').setAttribute('width',370*progressPercent/100);
 g.querySelector('.fitness-value').textContent=value;})});
 const phase=(elapsed%18000)/14000;const value=Math.round(100*Math.min(1,phase));document.querySelectorAll('.charge-live').forEach(svg=>{if(!svg.closest('.motion-visible'))return;const label=svg.querySelector('.charge-live-value');if(!label)return;const [color,dark]=value<33?["#FF6257","#802720"]:value<66?["#FFC43D","#78520D"]:["#37DF72","#116B32"];svg.style.setProperty("--charge-color",color);svg.style.setProperty("--charge-dark",dark);const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);svg.querySelectorAll(".charge-glow-matrix").forEach(el=>el.setAttribute("values",`0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} 0 0 0 ${el.dataset.alpha} 0`));const timeLabel = svg.querySelector('.charge-time-left');
 const remaining = timeLeft(value);
 if (timeLabel.textContent !== remaining) timeLabel.textContent = remaining;
 label.querySelector('tspan').textContent=value+'%';label.setAttribute('fill',color);label.setAttribute('font-size',value===100?'44':'51.0296');const bar=svg.querySelector('.charge-live-fill');if(bar){bar.setAttribute('width',489.565*value/100);bar.setAttribute('fill',color)}})}requestAnimationFrame(animate)}requestAnimationFrame(animate);
 document.addEventListener('visibilitychange', () => {
  targets.forEach(el => el.classList.toggle('motion-paused', document.hidden));
 });
})();
