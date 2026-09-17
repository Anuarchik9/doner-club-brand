const box=document.querySelector('#lightbox');
const boxImage=box.querySelector('img');
const boxText=box.querySelector('p');
document.querySelectorAll('.zoom').forEach(button=>button.addEventListener('click',()=>{
  const image=button.querySelector('img');
  boxImage.src=image.src;
  boxImage.alt=image.alt;
  boxText.textContent=image.alt;
  box.showModal();
}));
box.querySelector('.close').addEventListener('click',()=>box.close());
box.addEventListener('click',event=>{if(event.target===box)box.close()});

const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollScenes=[...document.querySelectorAll('[data-scroll-scene]')];
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const ease=value=>value*value*(3-2*value);
let sceneFrame=0;

function updateScrollScenes(){
  sceneFrame=0;
  if(motionQuery.matches)return;
  scrollScenes.forEach(scene=>{
    const pin=scene.querySelector('.scene-pin');
    const rect=scene.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight*1.4)return;
    const range=Math.max(1,rect.height-pin.offsetHeight);
    const progress=clamp(-rect.top/range);
    scene.style.setProperty('--p',progress.toFixed(4));

    if(scene.dataset.scrollScene==='reveal'){
      const opening=ease(clamp((progress-.04)/.78));
      scene.style.setProperty('--left-x',`${(-opening*92).toFixed(2)}%`);
      scene.style.setProperty('--right-x',`${(opening*92).toFixed(2)}%`);
      scene.style.setProperty('--left-tilt',`${(-opening*7).toFixed(2)}deg`);
      scene.style.setProperty('--right-tilt',`${(opening*7).toFixed(2)}deg`);
      scene.style.setProperty('--photo-scale',(1.12-opening*.1).toFixed(3));
      scene.style.setProperty('--collage-up',`${(-opening*14).toFixed(1)}px`);
      scene.style.setProperty('--collage-down',`${(opening*14).toFixed(1)}px`);
      scene.style.setProperty('--copy-opacity',clamp((progress-.2)*4).toFixed(3));
      scene.style.setProperty('--copy-y',`${(18-clamp((progress-.2)*4)*18).toFixed(1)}px`);
      scene.style.setProperty('--aside-opacity',clamp((progress-.5)*4).toFixed(3));
    }

    if(scene.dataset.scrollScene==='exploded'){
      const active=clamp((progress-.04)/.82);
      const spread=Math.sin(active*Math.PI);
      scene.style.setProperty('--stack-scale',(0.68+spread*.32).toFixed(3));
      scene.style.setProperty('--stack-y',`${(20-spread*20).toFixed(1)}px`);
      scene.querySelectorAll('.ingredient-list li').forEach((item,index)=>{
        const enter=clamp((progress-(.16+index*.055))*6);
        const visible=Math.min(enter,clamp((1-progress)*10));
        item.style.setProperty('--show',visible.toFixed(3));
        item.style.setProperty('--label-x',`${(22-visible*22).toFixed(1)}px`);
      });
      const kit=Math.min(clamp((progress-.58)*5),clamp((1-progress)*10));
      scene.style.setProperty('--kit-opacity',kit.toFixed(3));
      scene.style.setProperty('--kit-y',`${(18-kit*18).toFixed(1)}px`);
    }

    if(scene.dataset.scrollScene==='tunnel'){
      const travel=ease(clamp(progress/.86));
      scene.style.setProperty('--hole',`${(18+travel*47).toFixed(2)}%`);
      scene.style.setProperty('--lavash-scale',(1.12+travel*.2).toFixed(3));
      scene.style.setProperty('--tunnel-scale',(1.12-travel*.08).toFixed(3));
    }
  });
}

function requestSceneUpdate(){
  if(!sceneFrame)sceneFrame=requestAnimationFrame(updateScrollScenes);
}

if(scrollScenes.length){
  updateScrollScenes();
  addEventListener('scroll',requestSceneUpdate,{passive:true});
  addEventListener('resize',requestSceneUpdate,{passive:true});
  motionQuery.addEventListener?.('change',requestSceneUpdate);
}
