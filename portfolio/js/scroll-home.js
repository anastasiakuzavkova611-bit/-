(()=>{
const story=document.querySelector('.concept-story'),cards=[...document.querySelectorAll('.scroll-card')],greeting=document.querySelector('.stack-greeting'),cases=document.querySelector('#cases'),nav=[...document.querySelectorAll('.floating-nav [data-section]')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};let frame=0;
const originalCount=cards.length;
if(!reduced.matches){for(let copy=1;copy<3;copy++)cards.slice(0,originalCount).forEach(card=>{const clone=card.cloneNode(true);clone.dataset.copy="true";clone.setAttribute("aria-hidden","true");card.parentNode.appendChild(clone);cards.push(clone)})}
let ribbonOffset=0,lastTime=0,ribbonReady=false,progress=0,targetProgress=0;
function draw(){frame=0;if(document.querySelector(".concept-viewer[data-viewing]"))return;const rect=story.getBoundingClientRect(),range=Math.max(1,story.offsetHeight-innerHeight),target=(targetProgress=clamp(-rect.top/range)),p=reduced.matches?target:progress,spread=smooth((p-.36)/.42);const width=cards[0].offsetWidth,height=cards[0].offsetHeight,gap=parseFloat(getComputedStyle(story.querySelector(".card-stage")).columnGap),margin=innerWidth<700?24:72;
const widths=cards.slice(0,originalCount).map(card=>{const img=card.querySelector('.card-back img');const w=Number(card.dataset.conceptWidth)||img.naturalWidth,h=Number(card.dataset.conceptHeight)||img.naturalHeight;const factor = /2722-(551|445)/.test(img.src) ? .8 : 1; return w ? height*w/874*factor : width});
const offsets=[];let cycleWidth=0;widths.forEach(w=>{offsets.push(cycleWidth+w/2);cycleWidth+=w+gap});
const first=-innerWidth/2+margin;
ribbonReady=spread>.999&&rect.top<innerHeight&&rect.bottom>0&&!reduced.matches;
if(!reduced.matches){cards.forEach((card,i)=>{const flip=i>=originalCount?1:smooth((p-.09-Math.min(i,4)*.018)/.42),stackX=0,stackY=0,x=stackX*(1-spread)+(first+Math.floor(i/originalCount)*cycleWidth+offsets[i%originalCount]-(ribbonOffset%cycleWidth))*spread,y=stackY*(1-spread)+(story.querySelector('.concept-sticky').clientHeight/2-story.querySelector('.card-stage').offsetTop)*spread;card.style.transform=`translate3d(${x}px,${y}px,0) rotate(0deg) scale(${.32+.28*smooth((p-.06)/.42)+.4*spread})`;card.style.opacity=i>=originalCount?smooth((spread-.9)/.1):i===0?1:smooth((p-.4)/.24);card.querySelector('.flip-card').style.transform=`rotateY(${flip*180}deg)`;const button=card.querySelector('.card-back');button.style.width=widths[i%originalCount]+'px';const faceHeight = widths[i % originalCount] * Number(card.dataset.conceptHeight || 874) / Number(card.dataset.conceptWidth || 402);
button.style.height = faceHeight + 'px';
button.style.top = (height - faceHeight) / 2 + 'px';
button.style.bottom = 'auto';
button.style.left=(width-widths[i%originalCount])/2+'px';button.style.pointerEvents=spread>.9?'auto':'none'});greeting.style.opacity=1-smooth((p-.08)/.32);greeting.style.transform=`translateY(${smooth(p/.42)*110}px)`;greeting.setAttribute('aria-hidden',p>.4?'true':'false')}
nav.forEach(link=>link.setAttribute('aria-current',String(link.dataset.section===(cases.getBoundingClientRect().top<innerHeight*.55?'cases':'concepts'))));}
function schedule(){if(!frame)frame=requestAnimationFrame(draw)}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
function concepts(){const top=reduced.matches?story.offsetTop:story.offsetTop+(story.offsetHeight-innerHeight)*.82;window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'})}
nav.find(a=>a.dataset.section==='concepts').addEventListener('click',e=>{e.preventDefault();history.replaceState(null,'','#concepts');concepts()});
// Respect explicit section links while keeping a plain home visit at the portrait.
history.scrollRestoration='manual';
function restoreSection(){
 const hash=location.hash;
 if(['#cases','#deck-cases','#work'].includes(hash)){
  history.replaceState(null,'','#cases');cases.scrollIntoView({behavior:'instant'});
 }else if(['#concepts','#deck-concepts','#visuals'].includes(hash)){
  history.replaceState(null,'','#concepts');
  progress=targetProgress=.82;
  window.scrollTo({top:reduced.matches?story.offsetTop:story.offsetTop+(story.offsetHeight-innerHeight)*.82,behavior:'instant'});
 }else if(!hash){window.scrollTo({top:0,behavior:'instant'});progress=targetProgress=0}
 draw();
}
restoreSection();
window.addEventListener('pageshow',restoreSection,{once:true});
window.addEventListener('hashchange',restoreSection);
function tick(time){const delta=lastTime?Math.min(time-lastTime,50):0;lastTime=time;let moving=Math.abs(targetProgress-progress)>.0001;if(moving){progress+=(targetProgress-progress)*(1-Math.exp(-delta/140));draw()}if(ribbonReady&&!document.hidden&&!document.querySelector(".concept-viewer[data-viewing]")){ribbonOffset+=delta*.044;draw()}requestAnimationFrame(tick)}
cards.slice(0,originalCount).forEach(card=>card.querySelector('.card-back img').addEventListener('load',schedule));
draw();requestAnimationFrame(tick);
})();
