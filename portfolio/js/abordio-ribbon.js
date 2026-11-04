(() => {
 const gallery=document.querySelector('.ab-intro-gallery');
 if(!gallery)return;
 const fit=()=>gallery.style.width=document.documentElement.clientWidth+'px';
 fit();window.addEventListener('resize',fit);
 const group=document.createElement('div');group.className='ab-ribbon-group';
 while(gallery.firstChild)group.append(gallery.firstChild);
 group.querySelectorAll('img').forEach(img=>img.loading='eager');
 const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');
 duplicate.querySelectorAll('a').forEach(a=>a.tabIndex=-1);
 const track=document.createElement('div');track.className='ab-ribbon-track';
 track.append(group,duplicate);gallery.append(track);
})();
