/* The robot companion that walks the wavy track on the About page and
   cheers when a section arrives. Only loaded on index.html. */

document.addEventListener('DOMContentLoaded', () => {
  const walker = document.getElementById('walker');
  const track = document.querySelector('.track');
  if (!walker || !track) return;

  const figureSvg = document.getElementById('figureSvg');
  const bubble = document.getElementById('bubble');
  const pctEl = document.getElementById('pct');
  const armL = figureSvg.querySelector('.arm-l');
  const armR = figureSvg.querySelector('.arm-r');
  const roadPath = document.getElementById('roadPath');

  let ticking = false, walkTimeout = null;
  const road = {};

  // One smooth wave whose bend length and swing width drift slowly, so
  // every curve stays clean but no two bends match.
  function wave(f){
    const k = f * road.waves * 2 * Math.PI;
    const phase = k + 0.9 * Math.sin(k * 0.29 + 1.1);      // stretches / squeezes the bends
    const swing = 0.72 + 0.28 * Math.sin(k * 0.21 + 2.3);  // wide bends and gentle ones
    return road.cx + road.amp * swing * Math.sin(phase);
  }

  function buildRoad(){
    road.w = track.clientWidth; road.h = track.clientHeight;
    const navH = document.querySelector('header.nav').offsetHeight;
    road.top = navH + 90; road.len = road.h - road.top - 24;
    road.cx = road.w / 2; road.amp = road.w * 0.42;
    road.waves = Math.max(3, road.len / 230);
    let d = '';
    for (let y = 0; y <= road.len; y += 6){
      d += (y ? ' L' : 'M') + wave(y / road.len).toFixed(1) + ' ' + (road.top + y).toFixed(1);
    }
    roadPath.setAttribute('d', d);
  }

  function positionWalker(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const t = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const x = wave(t);
    const y = road.top + t * road.len;
    const slope = Math.max(-1, Math.min(1, (wave(Math.min(1, t + 0.004)) - wave(Math.max(0, t - 0.004))) / (road.len * 0.008) * 0.9));
    walker.style.left = x + 'px';
    walker.style.top = (y - 75) + 'px'; // feet sit on the road
    walker.style.transform = `translateX(-50%) rotate(${(slope * 12).toFixed(2)}deg)`;
    pctEl.textContent = Math.round(t * 100) + '%';
  }

  function onScroll(){
    if (!ticking){ requestAnimationFrame(() => { positionWalker(); ticking = false; }); ticking = true; }
    figureSvg.classList.add('walking');
    clearTimeout(walkTimeout);
    walkTimeout = setTimeout(() => figureSvg.classList.remove('walking'), 300);
  }

  function cheer(text){
    bubble.textContent = text;
    bubble.animate(
      [{opacity:0, transform:'translateY(6px) scale(.9)'},
       {opacity:1, transform:'translateY(0) scale(1)', offset:.18},
       {opacity:1, transform:'translateY(0) scale(1)', offset:.75},
       {opacity:0, transform:'translateY(-4px) scale(.95)'}],
      {duration:1500, easing:'ease-out'}
    );
    figureSvg.animate(
      [{transform:'translateY(0) scale(1)'},
       {transform:'translateY(-14px) scale(1.08)', offset:.35},
       {transform:'translateY(0) scale(1)', offset:.6},
       {transform:'translateY(-6px) scale(1.03)', offset:.8},
       {transform:'translateY(0) scale(1)'}],
      {duration:750, easing:'ease-out'}
    );
    const armKf = (from,to) => [{transform:`rotate(${from}deg)`},{transform:`rotate(${to}deg)`,offset:.4},{transform:`rotate(${to*0.85}deg)`,offset:.7},{transform:`rotate(${from}deg)`}];
    armL.animate(armKf(0,115), {duration:750, easing:'ease-out'});
    armR.animate(armKf(0,-115), {duration:750, easing:'ease-out'});

    figureSvg.querySelectorAll('.eye').forEach(e => e.animate(
      [{fill:'#e8bd2a'},{fill:'#fff6b0',offset:.2},{fill:'#d9480f',offset:.5},{fill:'#fff6b0',offset:.8},{fill:'#e8bd2a'}],
      {duration:900}));
    figureSvg.querySelector('.antenna').animate(
      [{fill:'#d9480f'},{fill:'#ffe600'},{fill:'#d9480f'},{fill:'#ffe600'},{fill:'#d9480f'}], {duration:900});

    const sparksContainer = figureSvg.querySelector('#sparks');
    const base = sparksContainer.querySelector('.spark');
    sparksContainer.setAttribute('opacity','1');
    const angles = [-70,-25,20,65,110,160];
    const made = [];
    angles.forEach((deg,i) => {
      const el = i === 0 ? base : base.cloneNode(true);
      if (i > 0) sparksContainer.appendChild(el);
      made.push(el);
      const rad = deg * Math.PI / 180;
      const dx = Math.cos(rad) * 20, dy = Math.sin(rad) * 20 - 10;
      el.animate(
        [{transform:'translate(0px,0px) scale(.3)', opacity:0},
         {transform:`translate(${dx*0.6}px,${dy*0.6}px) scale(1)`, opacity:1, offset:.45},
         {transform:`translate(${dx}px,${dy}px) scale(.5)`, opacity:0}],
        {duration:800, easing:'ease-out'}
      );
    });
    setTimeout(() => { made.slice(1).forEach(e => e.remove()); sparksContainer.setAttribute('opacity','0'); }, 850);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) cheer(e.target.dataset.cheer || 'yay!'); });
  }, {rootMargin:'-46% 0px -46% 0px', threshold:0});
  document.querySelectorAll('[data-cheer]').forEach(el => io.observe(el));

  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', () => { buildRoad(); positionWalker(); });
  buildRoad(); positionWalker();
});
