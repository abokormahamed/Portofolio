(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduceMotion ? 'instant' : 'smooth';
  const home = document.getElementById('home');
  const menu = document.getElementById('menu-overlay');
  const menuButtons = [...document.querySelectorAll('[data-menu-toggle]')];
  let menuOpener;
  const closeMenu = () => {
    menu.hidden = true;
    document.body.style.overflow = '';
    menuButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    menuOpener?.focus({ preventScroll: true });
  };
  menuButtons.forEach(button => button.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu();
    menuOpener = button;
    menu.hidden = false;
    document.body.style.overflow = 'hidden';
    menuButtons.forEach(item => item.setAttribute('aria-expanded', 'true'));
    document.getElementById('close-menu').focus();
  }));
  document.getElementById('close-menu').addEventListener('click', closeMenu);
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
    if (event.key !== 'Tab') return;
    const items = [...menu.querySelectorAll('a, button')];
    if (event.shiftKey && document.activeElement === items[0]) {
      event.preventDefault(); items.at(-1).focus();
    } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
      event.preventDefault(); items[0].focus();
    }
  });
  const scrollTo = id => {
    const target = document.getElementById(id);
    if (!target) return;
    const offset = id === 'home' ? 0 : id === 'projects' ? 0 : 65;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior });
    history.replaceState(null, '', `#${id}`);
    if (!menu.hidden) closeMenu();
  };
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href').slice(1);
      if (!document.getElementById(id)) return;
      event.preventDefault(); scrollTo(id);
      if (link.classList.contains('skip-link')) {
        const target = document.getElementById(id);
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    });
  });
  const activateOnKeyboard = element => element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); element.click();
    }
  });
  document.querySelectorAll('[data-scroll]').forEach(element => {
    element.addEventListener('click', () => scrollTo(element.dataset.scroll));
    if (element.tagName !== 'BUTTON') activateOnKeyboard(element);
  });
  const panels = [...document.querySelectorAll('[data-panel]')];
  const choices = [...document.querySelectorAll('[data-project]')];
  const backdrop = document.getElementById('project-backdrop');
  const mobile = matchMedia('(max-width: 767px)');
  let activeProject = -1;
  function setProject(index) {
    if (index === activeProject) return;
    activeProject = index;
    choices.forEach((choice, i) => {
      if (i === index) choice.setAttribute('aria-current', 'true');
      else choice.removeAttribute('aria-current');
    });
    backdrop.style.backgroundImage = `url("${panels[index].dataset.image}")`;
  }
  choices.forEach((choice, i) => {
    choice.addEventListener('click', () => {
      const offset = mobile.matches ? 225 : 0;
      window.scrollTo({ top: panels[i].getBoundingClientRect().top + scrollY - offset, behavior });
    });
    activateOnKeyboard(choice);
  });
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = navLinks.map(link => document.getElementById(link.dataset.nav));
  let frame;
  function onScroll() {
    frame = null;
    document.body.classList.toggle('has-scrolled', scrollY > home.offsetHeight * .65);
    const middle = innerHeight * .5;
    let index = 0;
    panels.forEach((panel, i) => {
      if (panel.getBoundingClientRect().top <= middle) index = i;
    });
    setProject(index);
    let current = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= innerHeight * .35) current = i;
    });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 5) current = sections.length - 1;
    navLinks.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(onScroll); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  onScroll();
  // Keep previously shared competence links working after the section rename.
  function resolveLegacyHash() {
    if (location.hash !== '#kompetanse') return;
    const target = document.getElementById('skills');
    history.replaceState(null, '', '#skills');
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 75, behavior: 'instant' });
  }
  addEventListener('hashchange', resolveLegacyHash);
  addEventListener('load', resolveLegacyHash, { once: true });
  const word = document.getElementById('specialty');
  const words = ['C#', 'Python', 'ASP.NET Core', 'SQL', 'Systemdesign'];
  let currentWord = 0;
  if (!reduceMotion) setInterval(() => {
    if (document.hidden || scrollY > home.offsetHeight) return;
    word.textContent = words[++currentWord % words.length];
    word.classList.remove('specialty-enter');
    requestAnimationFrame(() => requestAnimationFrame(() => word.classList.add('specialty-enter')));
  }, 3000);
  const video = document.querySelector('.hero-video');
  video.muted = true;
  if (reduceMotion) {
    video.removeAttribute('autoplay'); video.pause();
    video.setAttribute('poster', 'assets/development.jpg');
  } else {
    video.play().catch(() => video.setAttribute('poster', 'assets/development.jpg'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && !document.hidden) video.play().catch(() => {});
      else video.pause();
    }));
    observer.observe(home);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (home.getBoundingClientRect().bottom > 0) video.play().catch(() => {});
    });
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending-reveal');
        observer.unobserve(entry.target);
      }
    }), { threshold: .08 });
    document.querySelectorAll('#skills [data-reveal]').forEach(card => {
      card.classList.add('pending-reveal'); observer.observe(card);
    });
  }
})();
