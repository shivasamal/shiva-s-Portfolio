const navButton = document.querySelector('.menu');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu() {
  mobileNav.hidden = true;
  navButton.setAttribute('aria-expanded', 'false');
  navButton.setAttribute('aria-label', 'Open navigation');
}
navButton.addEventListener('click', () => {
  if (!mobileNav.hidden) return closeMenu();
  mobileNav.hidden = false;
  navButton.setAttribute('aria-expanded', 'true');
  navButton.setAttribute('aria-label', 'Close navigation');
});
mobileNav.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    navButton.focus();
  }
});
matchMedia('(min-width:651px)').addEventListener('change', closeMenu);

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('#motion-toggle');
const byte = document.querySelector('#byte');
const activeMotion = new Set();
let releaseScrollScenes;
let preference;
try { preference = localStorage.getItem('portfolio-motion'); } catch {}
let paused = reduced.matches || preference === 'paused';
const canAnimate = () => !paused && Boolean(window.Motion);

function play(element, frames, options) {
  if (!element || !canAnimate()) return;
  const control = window.Motion.animate(element, frames, options);
  activeMotion.add(control);
  control.then(() => activeMotion.delete(control));
  return control;
}
function applyMotion() {
  releaseScrollScenes?.();
  releaseScrollScenes = undefined;
  if (canAnimate() && byte && typeof window.Motion.scroll === 'function') {
    releaseScrollScenes = connectScrollScenes();
  }
  document.documentElement.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  if (paused) {
    activeMotion.forEach(control => control.complete());
    activeMotion.clear();
  }
}
applyMotion();
motionToggle.hidden = false;
motionToggle.addEventListener('click', () => {
  paused = !paused;
  preference = paused ? 'paused' : 'enabled';
  try { localStorage.setItem('portfolio-motion', preference); } catch {}
  applyMotion();
});

// Observe normal-flow markers: the sticky artwork itself moves with the viewport.
function connectScrollScenes() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const progressBar = document.querySelector('.read-progress');
  const disconnect = [];
  const scenes = [...document.querySelectorAll('.scene')];
  root.classList.add('scroll-scenes');

  disconnect.push(Motion.scroll(progress => {
    progressBar.style.setProperty('--read', progress);
  }));
  disconnect.push(Motion.scroll(progress => {
    hero.style.setProperty('--byte-drift', (progress * 84) + 'px');
    hero.style.setProperty('--byte-turn', (progress * -10) + 'deg');
    hero.style.setProperty('--star-rise', (progress * -65) + 'px');
    hero.style.setProperty('--star-turn', (progress * 100) + 'deg');
  }, { target: hero, offset: ['start start', 'end start'] }));

  scenes.forEach((scene, index) => {
    const direction = index % 2 === 0 ? -1 : 1;
    disconnect.push(Motion.scroll(progress => {
      const remaining = (1 - progress) ** 2;
      scene.style.setProperty('--arrive-x', (direction * remaining * 96) + '%');
      scene.style.setProperty('--arrive-y', (remaining * 11) + '%');
      scene.style.setProperty('--arrive-turn', (direction * remaining * 14) + 'deg');
      scene.style.setProperty('--arrive-scale', 1 + remaining * .16);
      scene.style.setProperty('--disc-shift', (-direction * remaining * 27) + '%');
      if (index > 0) scenes[index - 1].style.setProperty('--stack-scale', 1 - progress * .045);
    }, { target: scene.previousElementSibling, offset: ['start end', 'start 0.32'] }));
  });
  document.querySelectorAll('.shot').forEach(shot => {
    disconnect.push(Motion.scroll(progress => {
      shot.style.setProperty('--window-shift', (10 - 15 * progress) + '%');
    }, { target: shot, offset: ['start end', 'end start'] }));
  });
  return () => {
    disconnect.forEach(stop => stop());
    root.classList.remove('scroll-scenes');
  };
}
reduced.addEventListener('change', event => {
  paused = event.matches || preference === 'paused';
  applyMotion();
});
document.querySelectorAll('.hero-copy > *, .contact-layout > section, #inquiry').forEach((el, index) => {
  play(el, { opacity: [0, 1], y: [14, 0] }, { duration: .5, delay: index * .055 });
});
if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      play(entry.target, { opacity: [.5, 1], y: [18, 0] }, { duration: .48 });
      reveals.unobserve(entry.target);
    });
  }, { threshold: .08 });
  document.querySelectorAll('.project, .bio, .jobs, .section-title').forEach(el => reveals.observe(el));
}
if (byte) {
  const stage = byte.closest('.byte-stage');
  const output = stage.querySelector('output');
  const greetings = ['Hello, human!', 'Nice to meet you!', 'Happy building!'];
  let greeting = 0;
  let dismiss;
  let frame;
  stage.addEventListener('pointermove', event => {
    if (!canAnimate() || event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    const fraction = (event.clientX - bounds.left) / bounds.width - .5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      byte.style.transform = 'rotate(' + (4 + fraction * 7) + 'deg) translateX(' + fraction * 12 + 'px)';
    });
  });
  stage.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    byte.style.transform = '';
  });
  byte.addEventListener('click', () => {
    output.textContent = greetings[greeting++ % greetings.length];
    clearTimeout(dismiss);
    play(byte.querySelector('img'), { y: [0, -13, 0], rotate: [0, -3, 0] }, { duration: .45 });
    dismiss = setTimeout(() => { output.textContent = ''; }, 3000);
  });
}

const inquiry = document.querySelector('#inquiry');

// Animate the wrapper so playing a gesture never interrupts scroll positioning.
for (const button of document.querySelectorAll('.play-pose')) {
  const scene = button.closest('.scene');
  const pose = scene.querySelector('.pose');
  const effect = scene.querySelector('.bonus, .sparkle, .glass-sketch');
  let busy = false;
  button.hidden = false;
  async function performGesture() {
    if (busy) return;
    busy = true;
    try {
      if (!canAnimate()) {
        effect.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 1100));
        effect.style.opacity = '';
        return;
      }
      const timing = { duration: .85, ease: 'easeInOut' };
      let gesture;
      let flourish;
      if (scene.classList.contains('scene-games')) {
        gesture = { y: [0, 4, -24, 0, -3, 0], rotate: [0, -2, 3, 0] };
        flourish = { opacity: [0, 1, 1, 0], y: [12, -23] };
      } else if (scene.classList.contains('scene-ai')) {
        gesture = { rotate: [0, 3, -1, 0] };
        flourish = { opacity: [0, 1, 1, 0], rotate: [0, 175], x: [0, 15, 0], y: [8, -15, 0] };
      } else {
        gesture = { rotate: [0, -2, 1, 0] };
        flourish = { opacity: [0, 1, 1, 0] };
        play(effect.querySelector('path'), { strokeDasharray: ['0 1','1 1'] }, { duration: .6 });
      }
      await Promise.all([play(pose, gesture, timing), play(effect, flourish, timing)]);
    } finally {
      busy = false;
    }
  }
  button.addEventListener('click', performGesture);
  if ('IntersectionObserver' in window) {
    const entrance = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      entrance.disconnect();
      if (canAnimate()) performGesture();
    }, { threshold: .85 });
    entrance.observe(pose);
  }
}
if (inquiry) {
  let draft = '';
  const feedback = inquiry.querySelector('.draft-feedback');
  const copy = document.querySelector('#copy');
  inquiry.addEventListener('input', () => { feedback.hidden = true; });
  inquiry.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(inquiry);
    const name = fields.get('name').trim();
    const kind = fields.get('type');
    draft = 'Hi Shiva,\n\nI’m interested in a ' + kind.toLowerCase() + '.\n\n' +
      fields.get('details').trim() + '\n\n' + name + '\n' + fields.get('email').trim();
    feedback.hidden = false;
    copy.textContent = 'Copy inquiry';
    window.location.href = 'mailto:Shivasamala03@gmail.com?subject=' +
      encodeURIComponent(kind + ' inquiry from ' + name) + '&body=' + encodeURIComponent(draft);
  });
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft);
      copy.textContent = 'Inquiry copied';
    } catch {
      const field = document.createElement('textarea');
      field.readOnly = true;
      field.setAttribute('aria-label', 'Select and copy your inquiry');
      field.value = draft;
      feedback.querySelector('textarea')?.remove();
      feedback.append(field);
      field.focus();
      field.select();
    }
  });
}
