
// ===== Barre de progression =====
const prog=document.getElementById('progress');
addEventListener('scroll',()=>{
  const h=document.documentElement;
  prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
},{passive:true});

// ===== Halo doré qui suit le curseur + poussière d'or =====
const hero=document.getElementById('hero'),halo=document.getElementById('halo');
if(matchMedia('(prefers-reduced-motion: no-preference)').matches){
  // Halo
  const souris={x:innerWidth*.62,y:innerHeight*.4};
  const doux={x:souris.x,y:souris.y};
  let dernierMouv=0;
  hero.addEventListener('pointermove',e=>{souris.x=e.clientX;souris.y=e.clientY;dernierMouv=performance.now()});
  hero.addEventListener('touchmove',e=>{const t=e.touches[0];souris.x=t.clientX;souris.y=t.clientY;dernierMouv=performance.now()},{passive:true});
  (function boucle(t){
    if(t-dernierMouv>2600){
      souris.x=innerWidth*(0.6+0.28*Math.sin(t*0.00023));
      souris.y=innerHeight*(0.4+0.2*Math.sin(t*0.00031+1.7));
    }
    doux.x+=(souris.x-doux.x)*0.1;
    doux.y+=(souris.y-doux.y)*0.1;
    const r=hero.getBoundingClientRect();
    halo.style.transform=`translate3d(${doux.x-r.left}px,${doux.y-r.top}px,0) translate(-50%,-50%)`;
    halo.style.opacity=(t>1500)?0.9:0; // apparaît après le balayage
    requestAnimationFrame(boucle);
  })(0);

  // Poussière d'or : particules qui flottent autour du crâne
  const cv=document.getElementById('poussiere'),ctx=cv.getContext('2d');
  function taille(){cv.width=hero.clientWidth;cv.height=hero.clientHeight}
  taille();addEventListener('resize',taille);
  const N=matchMedia('(pointer: coarse)').matches?26:46;
  const P=Array.from({length:N},()=>({
    x:Math.random(),y:Math.random(),
    r:0.6+Math.random()*1.8,
    vy:0.06+Math.random()*0.16,          // montée lente
    vx:(Math.random()-0.5)*0.08,
    ph:Math.random()*Math.PI*2,          // scintillement
    vph:0.008+Math.random()*0.02
  }));
  (function pluie(){
    ctx.clearRect(0,0,cv.width,cv.height);
    // concentrées côté tête (droite de l'écran sur desktop)
    const cx=cv.width*(innerWidth>719?0.72:0.6);
    for(const p of P){
      p.y-=p.vy/100;p.x+=p.vx/100;p.ph+=p.vph;
      if(p.y<-0.05){p.y=1.05;p.x=Math.random()}
      const px=cx+(p.x-0.5)*cv.width*0.62;
      const py=p.y*cv.height;
      const a=(0.25+0.55*Math.abs(Math.sin(p.ph)));
      const g=ctx.createRadialGradient(px,py,0,px,py,p.r*4);
      g.addColorStop(0,`rgba(240,222,180,${a})`);
      g.addColorStop(1,'rgba(240,222,180,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(px,py,p.r*4,0,7);ctx.fill();
    }
    requestAnimationFrame(pluie);
  })();
}

// ===== Slider avant/après =====
const ba=document.getElementById('ba');
function setCut(x){
  const r=ba.getBoundingClientRect();
  let p=((x-r.left)/r.width)*100;
  p=Math.max(4,Math.min(96,p));
  ba.style.setProperty('--cut',(100-p)+'%');
}
ba.addEventListener('pointerdown',e=>{setCut(e.clientX);
  const mv=ev=>setCut(ev.clientX);
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);
});

// ===== Défilement cinématique piloté par le scroll =====
const dSec=document.querySelector('.defile-section'),piste=document.getElementById('piste'),avancee=document.getElementById('avancee');
if(dSec&&matchMedia('(prefers-reduced-motion: no-preference)').matches){
  const diapos=[...piste.querySelectorAll('.diapo')];
  let px=0;
  (function rail(){
    const r=dSec.getBoundingClientRect();
    const total=r.height-innerHeight;
    const prog=Math.max(0,Math.min(1,-r.top/total));
    const maxX=piste.scrollWidth-innerWidth;
    px+=((prog*maxX)-px)*0.12; // inertie douce
    piste.style.transform=`translate3d(${-px}px,0,0)`;
    avancee.style.width=(prog*100)+'%';
    // diapo la plus proche du centre = active
    let best=null,bd=1e9;
    diapos.forEach(d=>{
      const c=d.getBoundingClientRect();
      const dist=Math.abs(c.left+c.width/2-innerWidth/2);
      if(dist<bd){bd=dist;best=d}
    });
    diapos.forEach(d=>d.classList.toggle('active',d===best));
    requestAnimationFrame(rail);
  })();
}

// ===== Reveal + stagger =====
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vu');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal,.stagger').forEach(el=>io.observe(el));

// ===== Parallax =====
const pxs=[...document.querySelectorAll('.parallax img')];
if(matchMedia('(prefers-reduced-motion: no-preference)').matches){
  addEventListener('scroll',()=>{
    pxs.forEach(img=>{
      const r=img.parentElement.getBoundingClientRect();
      const c=(r.top+r.height/2-innerHeight/2)/innerHeight;
      img.style.setProperty('--py',(c*-6)+'%');
    });
  },{passive:true});
}

// ===== Aurore or (zone offre + CTA) =====
const zone=document.getElementById('auroraZone'),fond=document.getElementById('auroraFond'),glow=document.getElementById('auroraGlow');
if(zone&&matchMedia('(prefers-reduced-motion: no-preference)').matches){
  const INT=matchMedia('(pointer: coarse)').matches?0.55:1;
  const NAPPES=[
    {c:'201,169,110',s:56,x:24,y:30,d:.25,p:0},    // or
    {c:'233,217,180',s:46,x:70,y:22,d:.5,p:1.3},   // or clair
    {c:'216,146,60', s:50,x:56,y:70,d:.7,p:2.2},   // ambre
    {c:'150,102,52', s:60,x:12,y:72,d:.35,p:3.5},  // bronze
    {c:'244,226,182',s:40,x:86,y:58,d:.85,p:4.3},  // champagne
  ];
  const els=NAPPES.map(b=>{
    const el=document.createElement('div');
    el.className='aurora-blob';
    el.style.width=el.style.height=b.s+'vmax';
    el.style.background=`radial-gradient(circle,rgba(${b.c},.6) 0%,rgba(${b.c},.22) 38%,rgba(${b.c},0) 70%)`;
    fond.appendChild(el);return el;
  });
  const cible={x:innerWidth*.5,y:200},pos={x:cible.x,y:cible.y},vit={x:0,y:0};
  let energie=0,dernier=0,lx=cible.x,ly=cible.y;
  zone.addEventListener('pointermove',e=>{
    const r=zone.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    energie=Math.min(1,energie+Math.hypot(x-lx,y-ly)*0.012);
    lx=x;ly=y;cible.x=x;cible.y=y;dernier=performance.now();
  },{passive:true});
  (function anime(t){
    const r=zone.getBoundingClientRect();
    const visible=r.bottom>0&&r.top<innerHeight;
    if(visible){
      const W=r.width,H=r.height,M=Math.max(W,H);
      if(t-dernier>3200){
        cible.x=W*(0.5+0.3*Math.sin(t*0.00019));
        cible.y=H*(0.45+0.22*Math.sin(t*0.00027+1.6));
      }
      vit.x=(vit.x+(cible.x-pos.x)*0.045)*0.86;
      vit.y=(vit.y+(cible.y-pos.y)*0.045)*0.86;
      pos.x+=vit.x;pos.y+=vit.y;
      energie*=0.965;
      NAPPES.forEach((b,i)=>{
        const sp=0.00006+b.d*0.00013;
        const bx=(b.x+Math.sin(t*sp+b.p)*(5+b.d*6))/100*W;
        const by=(b.y+Math.cos(t*sp*1.27+b.p*1.7)*(4+b.d*5))/100*H;
        const prox=Math.max(0,1-Math.hypot(pos.x-bx,pos.y-by)/(M*0.42));
        const pop=prox*prox*(0.5+energie)*INT;
        const taille=b.s/100*M;
        els[i].style.transform=`translate3d(${bx-taille/2+(pos.x-bx)*0.06*pop}px,${by-taille/2+(pos.y-by)*0.06*pop}px,0) scale(${1+pop*0.22})`;
        els[i].style.opacity=0.38*INT+pop*0.38;
      });
      glow.style.transform=`translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%) scale(${0.9+energie*0.6})`;
      glow.style.opacity=(0.22+energie*0.5)*INT;
    }
    requestAnimationFrame(anime);
  })(0);
}

// ===== CTA flottant =====
const flot=document.getElementById('ctaFlottant');
const ioF=new IntersectionObserver(es=>es.forEach(e=>{
  flot.classList.toggle('visible',!e.isIntersecting);
}),{threshold:.1});
ioF.observe(document.querySelector('.hero'));

// ===== Compteurs : délai configurable + format fr =====
document.querySelectorAll('[data-compte]').forEach(el=>{
  const io2=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;io2.unobserve(el);
    setTimeout(()=>{
      const cible=+el.dataset.compte,t0=performance.now(),d=cible>1000?2600:1500;
      (function tick(t){const p=Math.min((t-t0)/d,1);
        el.textContent=Math.round(cible*(1-Math.pow(1-p,3))).toLocaleString('fr-FR');
        if(p<1)requestAnimationFrame(tick);})(t0);
    }, +(el.dataset.delai||0));
  }),{threshold:.3});
  io2.observe(el);
});

// ===== Titres h2 : révélation mot à mot =====
document.querySelectorAll('h2').forEach(t=>{
  if(t.closest('.hero'))return;
  t.innerHTML=t.textContent.trim().split(/\s+/).map(m=>'<span class="mot">'+m+'</span>').join(' ');
  const ioM=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;ioM.unobserve(t);
    t.querySelectorAll('.mot').forEach((m,i)=>m.style.transitionDelay=(i*0.07)+'s');
    t.classList.add('mots-vus');
  }),{threshold:.5});
  ioM.observe(t);
});

// ===== Préloader : retirer du DOM après la séquence =====
const rid=document.getElementById('rideau');
if(rid){setTimeout(()=>rid.remove(),2000)}

// ===== Nav : page active =====
const ici=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav-liens a').forEach(a=>{
  if(a.getAttribute('href')===ici)a.classList.add('actif');
});

// ===== Menu burger plein écran =====
const burger=document.getElementById('burger'),menuPlein=document.getElementById('menuPlein');
if(burger){
  burger.addEventListener('click',()=>{
    const ouvert=document.body.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded',ouvert);
    menuPlein.setAttribute('aria-hidden',!ouvert);
  });
  menuPlein.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    document.body.classList.remove('menu-ouvert');
  }));
}

// ===== Éventail vidéos piloté par le scroll =====
const sceneV=document.querySelector('.scene-videos');
if(sceneV&&matchMedia('(prefers-reduced-motion: no-preference)').matches){
  const tels=[...sceneV.querySelectorAll('.tel')];
  const lueur=sceneV.querySelector('.scene-lueur');
  const mobile=()=>innerWidth<720;
  (function anim(){
    const r=sceneV.getBoundingClientRect();
    const total=r.height-innerHeight;
    const p=Math.max(0,Math.min(1,-r.top/total));
    const e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2; // easing
    const ecart=mobile()?26:31; // vw ou % d'écart
    const unite=mobile()?innerWidth*0.26:Math.min(innerWidth*0.24,340);
    tels.forEach(t=>{
      const i=+t.dataset.i-1; // -1,0,1
      const x=i*unite*e;
      const rot=i*10*(mobile()?0.55:1)*(1-e*0.6)*(e>0?1:0)+i*10*(e===0?0:0);
      const rotFinal=i*(mobile()?5:7)*(1-e)+i*(mobile()?3:2)*e;
      const y=Math.abs(i)*14*e;
      const sc=(i===0?0.94+0.12*e:0.94+0.02*e);
      t.style.transform=`translateX(${x}px) translateY(${y}px) rotate(${rotFinal}deg) scale(${sc})`;
      if(i!==0)t.style.filter=`brightness(${0.75+0.25*e*0.6})`;
    });
    lueur.style.setProperty('--lz',(e*1).toFixed(3));
    requestAnimationFrame(anim);
  })();
}
