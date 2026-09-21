/* Robots on the About page. Only loaded on index.html.
   - One stands in the hero, fumbles its first wave, then says hi — and again
     whenever you scroll back to the top.
   - On smaller screens (below 1200×900) more robots peek up from behind the
     first card of each section and celebrate as it comes into view.
   - One waves goodbye from the footer.
   Every robot: eyes follow the cursor, pokeable, naps after 10s idle, and
   reacts to the dark-mode toggle. */

(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bigScreen = matchMedia('(min-width:1200px) and (min-height:900px)');
  const INK = '#211d19', METAL = '#b9b3a8', MUSTARD = '#e8bd2a', RUST = '#d9480f', CREAM = '#fffdf8';

  let uid = 0;
  function robotSVG(width){
    const n = ++uid, h = Math.round(width * 76 / 44);
    return `<svg class="figure" viewBox="0 -10 44 76" width="${width}" height="${h}" aria-hidden="true" focusable="false">
  <defs><linearGradient id="lamp${n}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="-70" y2="0">
    <stop offset="0" stop-color="#ffe27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/>
  </linearGradient></defs>
  <g class="leg-l"><rect x="15.5" y="44" width="5" height="15" rx="1" fill="${METAL}" stroke="${INK}" stroke-width="2.5"/><rect x="12" y="58" width="10" height="4" rx="1" fill="${INK}"/></g>
  <g class="leg-r"><rect x="23.5" y="44" width="5" height="15" rx="1" fill="${METAL}" stroke="${INK}" stroke-width="2.5"/><rect x="22" y="58" width="10" height="4" rx="1" fill="${INK}"/></g>
  <rect x="11" y="22" width="22" height="23" rx="4" fill="${MUSTARD}" stroke="${INK}" stroke-width="3"/>
  <rect x="17" y="28" width="10" height="9" rx="1.5" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="22" cy="32.5" r="2" fill="${RUST}"/>
  <circle cx="14" cy="25" r="1" fill="${INK}"/><circle cx="30" cy="25" r="1" fill="${INK}"/>
  <circle cx="14" cy="42" r="1" fill="${INK}"/><circle cx="30" cy="42" r="1" fill="${INK}"/>
  <g class="arm-l" style="transform-origin:11px 26px">
    <rect x="3" y="24" width="9" height="4.5" rx="1" fill="${METAL}" stroke="${INK}" stroke-width="2.2" transform="rotate(-50 11 26)"/>
    <path d="M5.5 32.5 l-2.5 2.5 M5.5 32.5 l0.5 3.5" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>
  </g>
  <g class="arm-r" style="transform-origin:33px 26px">
    <rect x="32" y="24" width="9" height="4.5" rx="1" fill="${METAL}" stroke="${INK}" stroke-width="2.2" transform="rotate(50 33 26)"/>
    <path d="M38.5 32.5 l2.5 2.5 M38.5 32.5 l-0.5 3.5" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>
  </g>
  <circle cx="11" cy="26" r="2.4" fill="${INK}"/><circle cx="33" cy="26" r="2.4" fill="${INK}"/>
  <rect x="19" y="18" width="6" height="5" fill="${INK}"/>
  <g class="head" style="transform-origin:22px 21px">
    <polygon class="lamp" points="11,5 11,12 -70,36 -70,-19" fill="url(#lamp${n})"/>
    <line x1="22" y1="0" x2="22" y2="-6" stroke="${INK}" stroke-width="2.2"/>
    <circle class="antenna" cx="22" cy="-7" r="2.6" fill="${RUST}" stroke="${INK}" stroke-width="1.6"/>
    <rect x="10" y="0" width="24" height="19" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <rect x="7.5" y="6" width="3" height="7" rx="1" fill="${INK}"/><rect x="33.5" y="6" width="3" height="7" rx="1" fill="${INK}"/>
    <rect x="13" y="4" width="18" height="9" rx="2" fill="${INK}"/>
    <g class="eyes">
      <rect class="eye" x="15.5" y="6.5" width="4.5" height="4" rx="1" fill="${MUSTARD}"/>
      <rect class="eye" x="24" y="6.5" width="4.5" height="4" rx="1" fill="${MUSTARD}"/>
    </g>
    <path d="M17 16 h10" stroke="${INK}" stroke-width="1.5" stroke-dasharray="1.5 1.5"/>
  </g>
  <g class="sparks" opacity="0">
    <path class="spark" d="M22 -2 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4z" fill="${RUST}"/>
  </g>
</svg>`;
  }

  const pickFrom = (list, last) => {
    let i; do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === last);
    return i;
  };

  class Robot {
    constructor(mount, width){
      this.el = document.createElement('button');
      this.el.type = 'button';
      this.el.className = 'robot';
      this.el.setAttribute('aria-label', 'Poke the robot');
      this.el.innerHTML = `<span class="bubble" aria-hidden="true"></span><span class="zzz" aria-hidden="true">z z z</span><span class="bob">${robotSVG(width)}</span>`;
      mount.appendChild(this.el);
      this.svg = this.el.querySelector('svg');
      this.bubble = this.el.querySelector('.bubble');
      this.armL = this.svg.querySelector('.arm-l');
      this.armR = this.svg.querySelector('.arm-r');
      this.eyes = this.svg.querySelector('.eyes');
      this.queue = []; this.busy = false; this.asleep = false; this.lastPoke = -1;
      this.el.addEventListener('click', () => this.poke());
    }

    // --- action queue: one animation at a time; fn returns its length in ms ---
    run(fn){
      if (this.busy){ if (this.queue.length < 3) this.queue.push(fn); return; }
      this.busy = true;
      const ms = fn();
      setTimeout(() => { this.busy = false; const next = this.queue.shift(); if (next) this.run(next); }, ms);
    }

    // --- building blocks ---
    say(text, ms = 1600){
      this.bubble.textContent = text;
      const frames = reduceMotion
        ? [{opacity:0},{opacity:1, offset:.12},{opacity:1, offset:.85},{opacity:0}]
        : [{opacity:0, transform:'translateY(6px) scale(.9)'},
           {opacity:1, transform:'translateY(0) scale(1)', offset:.12},
           {opacity:1, transform:'translateY(0) scale(1)', offset:.85},
           {opacity:0, transform:'translateY(-4px) scale(.95)'}];
      this.bubble.animate(frames, {duration:ms, easing:'ease-out'});
    }
    move(el, frames, opts){ if (!reduceMotion) el.animate(frames, opts); }
    bounce(){
      this.move(this.svg, [{transform:'translateY(0) scale(1)'},{transform:'translateY(-12px) scale(1.06)', offset:.35},
        {transform:'translateY(0) scale(1)', offset:.6},{transform:'translateY(-5px) scale(1.02)', offset:.8},{transform:'translateY(0) scale(1)'}],
        {duration:750, easing:'ease-out'});
    }
    bothArms(){
      const kf = to => [{transform:'rotate(0deg)'},{transform:`rotate(${to}deg)`, offset:.4},{transform:`rotate(${to*.85}deg)`, offset:.7},{transform:'rotate(0deg)'}];
      this.move(this.armL, kf(115), {duration:750, easing:'ease-out'});
      this.move(this.armR, kf(-115), {duration:750, easing:'ease-out'});
    }
    waveArm(){
      this.move(this.armL, [0,135,110,140,110,140,115,0].map(d => ({transform:`rotate(${d}deg)`})), {duration:1500, easing:'ease-in-out'});
    }
    flash(){
      this.svg.querySelectorAll('.eye').forEach(e => e.animate(
        [{fill:MUSTARD},{fill:'#fff6b0', offset:.2},{fill:RUST, offset:.5},{fill:'#fff6b0', offset:.8},{fill:MUSTARD}], {duration:900}));
      this.svg.querySelector('.antenna').animate([{fill:RUST},{fill:'#ffe600'},{fill:RUST},{fill:'#ffe600'},{fill:RUST}], {duration:900});
    }
    sparks(){
      if (reduceMotion) return;
      const box = this.svg.querySelector('.sparks'), base = box.querySelector('.spark'), made = [];
      box.setAttribute('opacity', '1');
      [-70,-25,20,65,110,160].forEach((deg, i) => {
        const el = i === 0 ? base : base.cloneNode(true);
        if (i > 0) box.appendChild(el);
        made.push(el);
        const r = deg * Math.PI / 180, dx = Math.cos(r) * 22, dy = Math.sin(r) * 22 - 10;
        el.animate([{transform:'translate(0,0) scale(.3)', opacity:0},
                    {transform:`translate(${dx*.6}px,${dy*.6}px) scale(1)`, opacity:1, offset:.45},
                    {transform:`translate(${dx}px,${dy}px) scale(.5)`, opacity:0}], {duration:800, easing:'ease-out'});
      });
      setTimeout(() => { made.slice(1).forEach(e => e.remove()); box.setAttribute('opacity', '0'); }, 850);
    }
    squint(){ this.el.classList.add('squint'); setTimeout(() => this.el.classList.remove('squint'), 1100); }
    glance(dir){ this.eyes.setAttribute('transform', `translate(${dir * 2} 0)`); }
    lookAt(x, y){
      if (this.asleep) return;
      const r = this.svg.getBoundingClientRect();
      if (!r.width) return;
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * .22), d = Math.hypot(dx, dy) || 1;
      this.eyes.setAttribute('transform', `translate(${(dx / d * 2).toFixed(2)} ${(dy / d * 1.4).toFixed(2)})`);
    }

    // --- behaviours ---
    cheer(text){ this.run(() => { this.say(text, 1500); this.bounce(); this.bothArms(); this.flash(); this.sparks(); return 1300; }); }
    wave(text = 'hi there! 👋'){ this.run(() => { this.say(text, 1800); this.waveArm(); this.flash(); return 1600; }); }

    // "learning to wave": two clumsy attempts, then a proper wave
    fumbleWave(){
      this.run(() => {
        this.move(this.armL, [0,55,40,60,0].map(d => ({transform:`rotate(${d}deg)`})), {duration:750, easing:'steps(5)'});
        setTimeout(() => this.say('?', 900), 750);
        setTimeout(() => {
          this.move(this.armL, [0,210,165,190,170,0].map(d => ({transform:`rotate(${d}deg)`})), {duration:1000, easing:'ease-out'});
          this.move(this.svg, [0,-7,6,-3,0].map(d => ({transform:`rotate(${d}deg)`})), {duration:1000});
          setTimeout(() => this.say('whoops!', 900), 550);
        }, 1700);
        setTimeout(() => { this.say('hi there! 👋', 2000); this.waveArm(); this.flash(); this.sparks(); }, 3300);
        return 5000;
      });
    }

    poke(){
      if (this.asleep){ this.wake(); return; }
      const reactions = [
        () => { this.say('wheee!', 1200); this.move(this.svg, [{transform:'rotate(0)'},{transform:'rotate(360deg)'}], {duration:650, easing:'ease-in-out'}); return 900; },
        () => { this.say('beep boop 🤖', 1400); this.flash(); return 1100; },
        () => { this.say('ouch!', 1200); this.squint(); this.bounce(); return 1000; },
        () => { this.say('that tickles!', 1400); this.move(this.svg, [0,-8,8,-8,8,0].map(d => ({transform:`rotate(${d}deg)`})), {duration:600}); return 1100; },
        () => { this.say('"robot" comes from the Czech robota: forced labour', 3200); return 2800; },
        () => { this.say('Unimate, the first industrial robot, started work in 1961', 3200); return 2800; },
        () => { this.say("still learning to use my body, like a baby", 2800); this.waveArm(); return 2400; },
      ];
      this.lastPoke = pickFrom(reactions, this.lastPoke);
      this.run(reactions[this.lastPoke]);
    }

    sleep(){ if (this.asleep) return; this.asleep = true; this.eyes.removeAttribute('transform'); this.el.classList.add('asleep'); }
    wake(){
      if (!this.asleep) return;
      this.asleep = false;
      this.el.classList.remove('asleep');
      this.run(() => { this.say('!', 900); this.move(this.svg, [{transform:'translateY(0)'},{transform:'translateY(-10px)'},{transform:'translateY(0)'}], {duration:350}); return 700; });
    }
  }

  // A robot that hides behind the top edge of an element and pops up over it.
  class Peeker {
    constructor(anchor, text, style){
      anchor.classList.add('has-peek');
      this.win = document.createElement('div');
      this.win.className = 'peek-window ' + style;
      anchor.appendChild(this.win);
      this.robot = new Robot(this.win, 56);
      this.text = text; this.style = style; this.playing = false; this.doneAt = 0;
    }
    play(){
      if (this.playing || Date.now() - this.doneAt < 4000) return;
      this.playing = true;
      const w = this.win, r = this.robot;
      w.dataset.state = 'eyes';                          // head rises over the edge
      setTimeout(() => r.glance(-1), 500);               // looks around...
      setTimeout(() => r.glance(1), 850);
      setTimeout(() => r.glance(0), 1150);
      setTimeout(() => {                                 // ...then pops up
        w.dataset.state = 'up';
        if (this.style === 'footer-peek') r.wave(this.text); else r.cheer(this.text);
      }, 1300);
      setTimeout(() => { w.dataset.state = 'down'; }, 4200);
      setTimeout(() => { this.playing = false; this.doneAt = Date.now(); }, 4700);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const home = document.querySelector('.robot-home');
    if (!home) return;

    const setMode = () => {
      document.body.classList.toggle('robots-big', bigScreen.matches);
      document.body.classList.toggle('robots-small', !bigScreen.matches);
    };
    setMode();
    bigScreen.addEventListener('change', setMode);

    const hero = new Robot(home, 70);
    const robots = [hero];

    // hello on load: the full "learning to wave" once per visit, a plain wave after that
    let seenIntro = false;
    try { seenIntro = sessionStorage.getItem('robotIntro') === '1'; sessionStorage.setItem('robotIntro', '1'); } catch (e) {}
    setTimeout(() => seenIntro ? hero.wave() : hero.fumbleWave(), 600);

    // hi again whenever you come back to the top
    let heroAway = false;
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) heroAway = true;
      else if (heroAway){ heroAway = false; hero.wave('hi there! 👋'); }
    }, {threshold:.5}).observe(document.querySelector('.hero'));

    // section peekers (smaller screens only) + footer goodbye (always)
    const peekers = new Map();
    document.querySelectorAll('section[data-cheer]:not(.hero)').forEach(section => {
      // first card of the section (the projects grid rather than the card itself,
      // since a card is a link and can't contain the robot's button)
      const anchor = section.querySelector('.pub, .cards, li');
      if (anchor) peekers.set(anchor, new Peeker(anchor, section.dataset.cheer, 'section-peek'));
    });
    const footer = document.querySelector('footer.site-footer');
    if (footer) peekers.set(footer, new Peeker(footer, footer.dataset.cheer || 'thanks for visiting! 👋', 'footer-peek'));
    peekers.forEach(p => robots.push(p.robot));

    // sections: once their first card is mostly in view (not hugging the bottom edge);
    // footer: separately, since it sits at the very bottom and can't clear that margin
    const playPeek = entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const p = peekers.get(e.target);
      if (p.style === 'section-peek' && bigScreen.matches) return;
      p.play();
    });
    const sectionIO = new IntersectionObserver(playPeek, {threshold:.6, rootMargin:'0px 0px -10% 0px'});
    const footerIO = new IntersectionObserver(playPeek, {threshold:.5});
    peekers.forEach((p, anchor) => (p.style === 'footer-peek' ? footerIO : sectionIO).observe(anchor));

    // eyes follow the cursor (mouse/trackpad only)
    if (matchMedia('(pointer: fine)').matches){
      let pending = null;
      addEventListener('mousemove', e => {
        if (!pending) requestAnimationFrame(() => { robots.forEach(r => r.lookAt(pending.x, pending.y)); pending = null; });
        pending = {x:e.clientX, y:e.clientY};
      }, {passive:true});
    }

    // nap after 10s with no activity; any activity wakes them
    let idleTimer;
    const nap = () => robots.forEach(r => r.sleep());
    const activity = () => { robots.forEach(r => r.wake()); clearTimeout(idleTimer); idleTimer = setTimeout(nap, 10000); };
    ['scroll','mousemove','keydown','touchstart','pointerdown'].forEach(ev => addEventListener(ev, activity, {passive:true}));
    idleTimer = setTimeout(nap, 10000);

    // react to the light/dark toggle (fired by main.js)
    document.addEventListener('themechange', e => {
      if (e.detail.dark) hero.run(() => { hero.say('lights out! 🔦', 1600); hero.flash(); return 1300; });
      else hero.run(() => { hero.squint(); hero.say('too bright!', 1600); return 1300; });
    });
  });
})();
