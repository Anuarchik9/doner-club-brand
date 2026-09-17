const container=document.querySelector('#full-gallery');
const count=document.querySelector('#gallery-count');
const filters=document.querySelectorAll('[data-filter]');
const box=document.querySelector('#lightbox');
const boxImage=box.querySelector('img');
const boxText=box.querySelector('p');

function selectItems(filter='all'){
  if(filter==='arai-project')return window.galleryItems.filter(item=>item.group==='arai'&&item.label.includes('дизайн-проект'));
  if(filter==='republic-project')return window.galleryItems.filter(item=>item.group==='republic'&&item.label.includes('дизайн-проект'));
  if(filter==='karaganda-project')return window.galleryItems.filter(item=>item.group==='karaganda'&&item.label.includes('дизайн-проект'));
  return filter==='all'?window.galleryItems:window.galleryItems.filter(item=>item.group===filter);
}
function render(filter='all'){
  const items=selectItems(filter);
  const mod10=items.length%10;
  const mod100=items.length%100;
  const noun=mod10===1&&mod100!==11?'материал':mod10>=2&&mod10<=4&&(mod100<12||mod100>14)?'материала':'материалов';
  count.textContent=`${items.length} ${noun}`;
  container.innerHTML=items.map(item=>`<figure class="gallery-item"><button class="zoom" data-label="${item.label}"><img src="${item.src}" alt="${item.label}" loading="lazy"></button><figcaption>${item.label}</figcaption></figure>`).join('');
}

filters.forEach(button=>button.addEventListener('click',()=>{
  filters.forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  render(button.dataset.filter);
}));

container.addEventListener('click',event=>{
  const button=event.target.closest('.zoom');
  if(!button)return;
  const image=button.querySelector('img');
  boxImage.src=image.src; boxImage.alt=image.alt; boxText.textContent=image.alt; box.showModal();
});
box.querySelector('.close').addEventListener('click',()=>box.close());
box.addEventListener('click',event=>{if(event.target===box)box.close()});
const hashFilter=location.hash.slice(1);
const supported=['uniforms','print','syganak','manas','office','brand','brand-previous','info-materials','project-ideas','halal','karaganda','arai-project','republic-project','karaganda-project'];
const initialFilter=supported.includes(hashFilter)?hashFilter:'all';
const activeButton=initialFilter.endsWith('-project')?initialFilter.replace('-project',''):initialFilter;
filters.forEach(button=>button.classList.toggle('active',button.dataset.filter===activeButton));
render(initialFilter);
