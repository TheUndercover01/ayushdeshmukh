/* The robot companion that walks beside the text on the About page and
   cheers when a section reaches it. Only loaded on index.html. */

document.addEventListener('DOMContentLoaded', () => {
  const walker = document.getElementById('walker');
  const track = document.querySelector('.track');
  if (!walker || !track) return;

  const figureSvg = document.getElementById('figureSvg');
  const bubble = document.getElementById('bubble');
  const armL = figureSvg.querySelector('.arm-l');
  const armR = figureSvg.querySelector('.arm-r');
  let ticking = false, walkTimeout = null;
  const lane = {};

  // Horizontal sway as a function of scroll distance (px). One smooth wave
  // whose bend length and width drift slowly, so no two bends match.
  function swayX(scroll){
    const k = scroll / 260;
    const phase = k + 0.9 * Math.sin(k * 0.29 + 1.1);
    const swing = 0.72 + 0.28 * Math.sin(k * 0.21 + 2.3);
    return lane.cx + lane.amp * swing * Math.sin(phase);
  }

  function measure(){
    lane.w = track.clientWidth;
    lane.cx = lane.w / 2; lane.amp = lane.w * 0.38;
    lane.navH = document.querySelector('header.nav').offsetHeight;
  }

  // The robot stays at roughly the same height on screen and the page scrolls
  // past it, so it moves at exactly your scroll speed. It drifts gently from
  // ~35% to ~55% of the screen height over the whole page.
  function robotFeetY(t){
    return Math.max(lane.navH + 160, innerHeight * (0.35 + 0.2 * t));
  }

  const sections = [...document.querySelectorAll('[data-cheer]')];
  let lastTops = sections.map(el => el.getBoundingClientRect().top);
  let cheeredBottom = false;

  function positionWalker(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - innerHeight;
    const y = scrollY;
    const t = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    const feet = robotFeetY(t);
    const x = swayX(y);
    const slope = (swayX(y + 12) - swayX(y - 12)) / 24;
    walker.style.left = x + 'px';
    walker.style.top = (feet - 138) + 'px';
    walker.style.transform = `translateX(-50%) rotate(${Math.max(-12, Math.min(12, slope * 30)).toFixed(2)}deg)`;

    // cheer when a section's top scrolls up past the robot's middle
    const line = feet - 70;
    sections.forEach((el, i) => {
      const top = el.getBoundingClientRect().top;
      if (lastTops[i] > line && top <= line) cheer(el.dataset.cheer);
      lastTops[i] = top;
    });
    // sections near the end may never reach the robot, so cheer at the bottom too
    const atBottom = max > 0 && y >= max - 4;
    if (atBottom && !cheeredBottom) cheer(sections[sections.length - 1].dataset.cheer);
    cheeredBottom = atBottom;
  }

  function onScroll(){
    if (!ticking){ requestAnimationFrame(() => { positionWalker(); ticking = false; }); ticking = true; }
    figureSvg.classList.add('walking');
    clearTimeout(walkTimeout);
    walkTimeout = setTimeout(() => figureSvg.classList.remove('walking'), 300);
  }

  // one cheer at a time; any that arrive mid-cheer wait their turn
  const queue = []; let busy = false, lastText = '', lastAt = 0;
  function cheer(text){
    if (text === lastText && Date.now() - lastAt < 3000) return;
    if (busy){ if (queue[queue.length - 1] !== text) queue.push(text); return; }
    busy = true; lastText = text; lastAt = Date.now();
    doCheer(text);
    setTimeout(() => { busy = false; if (queue.length) cheer(queue.shift()); }, 1300);
  }

  function doCheer(text){
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
      const dx = Math.cos(rad) * 24, dy = Math.sin(rad) * 24 - 12;
      el.animate(
        [{transform:'translate(0px,0px) scale(.3)', opacity:0},
         {transform:`translate(${dx*0.6}px,${dy*0.6}px) scale(1)`, opacity:1, offset:.45},
         {transform:`translate(${dx}px,${dy}px) scale(.5)`, opacity:0}],
        {duration:800, easing:'ease-out'}
      );
    });
    setTimeout(() => { made.slice(1).forEach(e => e.remove()); sparksContainer.setAttribute('opacity','0'); }, 850);
  }

  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', () => {
    measure();
    lastTops = sections.map(el => el.getBoundingClientRect().top);
    positionWalker();
  });
  measure(); positionWalker();
  setTimeout(() => cheer(sections[0].dataset.cheer), 700);
});
