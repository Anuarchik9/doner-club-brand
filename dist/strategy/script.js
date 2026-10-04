const progress=document.getElementById('progressBar');
const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const glossaryBtn=document.getElementById('glossaryBtn');
const drawerClose=document.getElementById('drawerClose');
const tooltip=document.getElementById('tooltip');

const presentationBtn=document.getElementById('presentationBtn');
const presentationControls=document.getElementById('presentationControls');
const presentationPrev=document.getElementById('presentationPrev');
const presentationNext=document.getElementById('presentationNext');
const presentationExit=document.getElementById('presentationExit');
const presentationCounter=document.getElementById('presentationCounter');
const slides=[...document.querySelectorAll('main > .section')];
let presentationIndex=0;
let scrollBeforePresentation=0;
let fitTimer=null;

function updateProgress(){
  if(document.body.classList.contains('presentation-mode')) return;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  progress.style.width=Math.max(0,Math.min(100,pct))+'%';
}
window.addEventListener('scroll',updateProgress,{passive:true});
updateProgress();

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

function nearestSlideIndex(){
  const y=window.scrollY+window.innerHeight*.35;
  let idx=0;
  slides.forEach((slide,i)=>{if(slide.offsetTop<=y) idx=i;});
  return idx;
}

function resetSlideFit(slide){
  if(!slide) return;
  slide.classList.remove('slide-fit');
  slide.style.zoom='';
  slide.style.width='';
  slide.style.height='';
}

function fitActiveSlide(){
  if(!document.body.classList.contains('presentation-mode')) return;
  const slide=slides[presentationIndex];
  if(!slide) return;
  resetSlideFit(slide);

  const header=document.querySelector('.topbar');
  const headerHeight=header ? header.getBoundingClientRect().height : 64;
  const availableHeight=Math.max(420,window.innerHeight-headerHeight);
  const availableWidth=window.innerWidth;

  // Presentation CSS first makes the layout compact. Only if a slide is still
  // taller than the viewport do we scale that slide as one 16:9-style canvas.
  slide.style.height='auto';
  slide.style.width='100%';
  slide.style.zoom='1';

  let scale=1;
  for(let pass=0;pass<4;pass++){
    slide.style.width=(100/scale)+'%';
    slide.style.height='auto';
    const naturalHeight=slide.scrollHeight;
    const naturalWidth=slide.scrollWidth;
    const byHeight=availableHeight/Math.max(naturalHeight,1);
    const byWidth=availableWidth/Math.max(naturalWidth*scale,1);
    const next=Math.min(1,scale*byHeight,scale*byWidth);
    if(Math.abs(next-scale)<0.005){scale=next;break;}
    scale=Math.max(.62,next);
  }

  scale=Math.min(1,Math.max(.62,scale));
  slide.style.zoom=String(scale);
  slide.style.width=(100/scale)+'%';
  slide.style.height=(availableHeight/scale)+'px';
  slide.classList.add('slide-fit');
  slide.scrollTop=0;
}

function scheduleFit(){
  clearTimeout(fitTimer);
  fitTimer=setTimeout(fitActiveSlide,30);
}

function showSlide(index){
  resetSlideFit(slides[presentationIndex]);
  presentationIndex=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>{
    slide.classList.toggle('presentation-active',i===presentationIndex);
    if(i===presentationIndex) slide.scrollTop=0;
  });
  presentationCounter.textContent=(presentationIndex+1)+' / '+slides.length;
  presentationPrev.disabled=presentationIndex===0;
  presentationNext.disabled=presentationIndex===slides.length-1;
  requestAnimationFrame(()=>requestAnimationFrame(fitActiveSlide));
}

function enterPresentation(){
  scrollBeforePresentation=window.scrollY;
  presentationIndex=nearestSlideIndex();
  document.body.classList.add('presentation-mode');
  presentationControls.setAttribute('aria-hidden','false');
  presentationBtn.textContent='Режим презентации включён';
  window.scrollTo(0,0);
  showSlide(presentationIndex);
}

function exitPresentation(){
  document.body.classList.remove('presentation-mode');
  slides.forEach(s=>{
    s.classList.remove('presentation-active');
    resetSlideFit(s);
  });
  presentationControls.setAttribute('aria-hidden','true');
  presentationBtn.textContent='Войти в режим презентации';
  requestAnimationFrame(()=>window.scrollTo(0,scrollBeforePresentation));
  updateProgress();
}

presentationBtn.addEventListener('click',()=>{
  if(document.body.classList.contains('presentation-mode')) exitPresentation();
  else enterPresentation();
});
presentationPrev.addEventListener('click',()=>showSlide(presentationIndex-1));
presentationNext.addEventListener('click',()=>showSlide(presentationIndex+1));
presentationExit.addEventListener('click',exitPresentation);

window.addEventListener('resize',()=>{
  updateProgress();
  if(document.body.classList.contains('presentation-mode')) scheduleFit();
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(drawer.classList.contains('open')) closeDrawer();
    else if(document.body.classList.contains('presentation-mode')) exitPresentation();
    return;
  }
  if(!document.body.classList.contains('presentation-mode')) return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();showSlide(presentationIndex+1);}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showSlide(presentationIndex-1);}
});

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

window.addEventListener('load',()=>{
  if(document.body.classList.contains('presentation-mode')) scheduleFit();
});