const progress=document.getElementById('progressBar');
const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const glossaryBtn=document.getElementById('glossaryBtn');
const drawerClose=document.getElementById('drawerClose');
const tooltip=document.getElementById('tooltip');
const presentationControls=document.getElementById('presentationControls');
const presentationPrev=document.getElementById('presentationPrev');
const presentationNext=document.getElementById('presentationNext');
const presentationCounter=document.getElementById('presentationCounter');
const presentationHome=document.getElementById('presentationHome');

const slides=[...document.querySelectorAll('main > .section')];
let presentationIndex=0;
let fitTimer=null;

// Convert the page into a real slide deck: every section gets one centered canvas.
slides.forEach(slide=>{
  const first=slide.firstElementChild;
  if(first && first.classList && first.classList.contains('slide-content')) return;
  const wrapper=document.createElement('div');
  wrapper.className='slide-content';
  while(slide.firstChild) wrapper.appendChild(slide.firstChild);
  slide.appendChild(wrapper);
});

function slideIndexFromHash(){
  const id=(location.hash||'').replace('#','');
  if(!id || id==='top') return 0;
  const index=slides.findIndex(slide=>slide.id===id);
  return index>=0?index:0;
}

function resetFit(slide){
  if(!slide) return;
  const content=slide.querySelector('.slide-content');
  if(!content) return;
  content.style.zoom='';
  content.style.width='';
}

function isMobileDeck(){
  return window.matchMedia('(max-width: 950px)').matches || (navigator.maxTouchPoints||0)>0;
}
function isLandscapeMobile(){
  return isMobileDeck() && window.matchMedia('(orientation: landscape)').matches;
}
function fitSlide(){
  const slide=slides[presentationIndex];
  if(!slide) return;
  const content=slide.querySelector('.slide-content');
  if(!content) return;
  resetFit(slide);
  content.style.transform='';
  content.style.width='';
  content.style.height='';

  if(isLandscapeMobile()){
    const vv=window.visualViewport;
    const vw=vv?vv.width:window.innerWidth;
    const vh=vv?vv.height:window.innerHeight;
    const scale=Math.min((vw-8)/1280,(vh-8)/720,1);
    document.documentElement.style.setProperty('--phone-slide-scale',String(Math.max(.35,scale)));
    content.style.width='1280px';
    content.style.height='720px';
    content.style.transform='scale('+Math.max(.35,scale)+')';
  }
}

function scheduleFit(){
  clearTimeout(fitTimer);
  fitTimer=setTimeout(()=>requestAnimationFrame(fitSlide),30);
}

function showSlide(index,updateHash=true){
  const previous=slides[presentationIndex];
  if(previous) previous.classList.remove('presentation-active');
  presentationIndex=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>slide.classList.remove('presentation-active'));
  const activeSlide=slides[presentationIndex];
  void activeSlide.offsetWidth;
  activeSlide.classList.add('presentation-active');
  presentationCounter.textContent=(presentationIndex+1)+' / '+slides.length;
  presentationPrev.disabled=presentationIndex===0;
  presentationNext.disabled=presentationIndex===slides.length-1;

  const active=slides[presentationIndex];
  if(updateHash){
    const hash=active.id?'#'+active.id:(presentationIndex===0?'#top':'#slide-'+(presentationIndex+1));
    history.replaceState(null,'',hash);
  }
  requestAnimationFrame(()=>requestAnimationFrame(fitSlide));
}

function openDrawer(){
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
}
function closeDrawer(){
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
}
glossaryBtn.addEventListener('click',openDrawer);
drawerClose.addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);

presentationHome.addEventListener('click',()=>showSlide(0));
presentationPrev.addEventListener('click',()=>showSlide(presentationIndex-1));
presentationNext.addEventListener('click',()=>showSlide(presentationIndex+1));

document.querySelectorAll('.topbar a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const hash=link.getAttribute('href');
    if(!hash) return;
    const id=hash.replace('#','');
    const targetIndex=id==='top'?0:slides.findIndex(slide=>slide.id===id);
    if(targetIndex>=0){
      e.preventDefault();
      showSlide(targetIndex);
    }
  });
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && drawer.classList.contains('open')){
    closeDrawer();
    return;
  }
  if(drawer.classList.contains('open')) return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();showSlide(presentationIndex+1);}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showSlide(presentationIndex-1);}
  if(e.key==='Home'){e.preventDefault();showSlide(0);}
  if(e.key==='End'){e.preventDefault();showSlide(slides.length-1);}
});

window.addEventListener('resize',scheduleFit);
window.addEventListener('orientationchange',()=>{setTimeout(()=>{scheduleFit();showSlide(presentationIndex,false);},220);});
if(window.visualViewport){window.visualViewport.addEventListener('resize',scheduleFit);}

function showTip(el){
  const text=el.dataset.tip;
  if(!text) return;
  tooltip.textContent=text;
  tooltip.classList.add('show');
  const r=el.getBoundingClientRect();
  requestAnimationFrame(()=>{
    const t=tooltip.getBoundingClientRect();
    const left=Math.min(window.innerWidth-t.width-12,Math.max(12,r.left+r.width/2-t.width/2));
    let top=r.bottom+9;
    if(top+t.height>window.innerHeight-12) top=r.top-t.height-9;
    tooltip.style.left=left+'px';
    tooltip.style.top=Math.max(12,top)+'px';
  });
}
function hideTip(){tooltip.classList.remove('show');}
document.querySelectorAll('.term').forEach(el=>{
  el.addEventListener('mouseenter',()=>showTip(el));
  el.addEventListener('mouseleave',hideTip);
  el.addEventListener('focus',()=>showTip(el));
  el.addEventListener('blur',hideTip);
  el.addEventListener('click',()=>tooltip.classList.contains('show')?hideTip():showTip(el));
});

document.body.classList.add('presentation-mode','deck-only');
progress.style.display='none';
showSlide(slideIndexFromHash(),false);
window.addEventListener('load',scheduleFit);
