(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById('themeToggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  themeToggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Scroll: nav state, progress, active link ---------- */
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('progress');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkMap = {};
  navLinks.querySelectorAll('a').forEach(function (a) { linkMap[a.getAttribute('href').slice(1)] = a; });

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 8);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s.id;
    });
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle('is-active', id === current && id !== 'contact');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Typed role ---------- */
  var typed = document.getElementById('typed');
  var roles = ['Delivery Manager', 'Scrum Master', 'AI & Cloud Programs', 'Agile Coach', 'Team Builder'];
  if (!reduceMotion) {
    var ri = 0, ci = roles[0].length, deleting = true;
    var tick = function () {
      if (deleting) {
        ci--;
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      } else {
        ci++;
      }
      typed.textContent = roles[ri].slice(0, ci);
      var delay = deleting ? 45 : 85;
      if (!deleting && ci === roles[ri].length) { deleting = true; delay = 2000; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2000);
  }

  /* ---------- Avatar: eyes follow the cursor ---------- */
  var avatar = document.getElementById('avatar');
  var pupils = avatar.querySelector('.av-pupils');
  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      var r = avatar.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height * 0.46);
      var dist = Math.hypot(dx, dy) || 1;
      var k = Math.min(dist / 300, 1);
      pupils.style.transform = 'translate(' + (dx / dist) * 2 * k + 'px,' + (dy / dist) * 1.4 * k + 'px)';
    }, { passive: true });
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    var target = +el.getAttribute('data-count');
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Experience accordion ---------- */
  var jobs = document.querySelectorAll('.job');
  jobs.forEach(function (job) {
    var body = job.querySelector('.job__body');
    // Wrap body content so the grid-rows collapse animation works
    var inner = document.createElement('div');
    inner.className = 'job__inner';
    var pad = document.createElement('div');
    while (body.firstChild) pad.appendChild(body.firstChild);
    inner.appendChild(pad);
    body.appendChild(inner);

    var head = job.querySelector('.job__head');
    if (head.getAttribute('aria-expanded') === 'true') job.classList.add('is-open');
    head.addEventListener('click', function () {
      var open = !job.classList.contains('is-open');
      job.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Experience filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var emptyMsg = document.getElementById('emptyMsg');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var f = btn.getAttribute('data-filter');
      var shown = 0;
      jobs.forEach(function (job) {
        var match = f === 'all' || job.getAttribute('data-tags').split(' ').indexOf(f) > -1;
        job.classList.toggle('is-hidden', !match);
        if (match) { shown++; job.classList.add('is-visible'); }
      });
      emptyMsg.hidden = shown > 0;
    });
  });

  /* ---------- Approach stepper ---------- */
  var phases = [
    {
      title: 'Discover',
      text: 'Get crisp on the why before the how. I work with clients and product owners to pin down goals, scope, constraints and what "done" really means.',
      items: ['Stakeholder mapping', 'Requirements & BRDs', 'Scope and success criteria', 'Early risk register']
    },
    {
      title: 'Plan',
      text: 'Turn scope into a plan the team believes in: milestones, a prioritized backlog, and capacity that reflects real availability, not wishful thinking.',
      items: ['Milestone roadmap', 'Backlog prioritization', 'Estimation with the team', 'Capacity & resource plan']
    },
    {
      title: 'Execute',
      text: 'Run a steady Agile cadence. I clear blockers, manage dependencies across engineering, QA, design, data and DevOps, and protect the team’s focus.',
      items: ['Sprint planning & reviews', 'Daily stand-ups', 'Dependency management', 'Deployments with DevOps']
    },
    {
      title: 'Report',
      text: 'No surprises. Dashboards and weekly reports give clients and leadership a clear view of progress, risks and what is coming next.',
      items: ['Live delivery dashboards', 'Weekly status reports', 'Client demos', 'RAID tracking']
    },
    {
      title: 'Improve',
      text: 'Every sprint is a chance to get better. Retrospectives, standardized templates and mentoring help the whole team, and the next PMs, level up.',
      items: ['Retrospectives', 'Process standardization', 'Mentoring junior PMs', 'Workflow automation']
    }
  ];
  var steps = document.querySelectorAll('.step');
  var panelContent = document.querySelector('.panel__content');
  var panelNum = document.getElementById('panelNum');
  var panelTitle = document.getElementById('panelTitle');
  var panelText = document.getElementById('panelText');
  var panelList = document.getElementById('panelList');
  var stepBar = document.getElementById('stepBar');
  var activeStep = 0;
  var autoTimer = null;

  function showStep(i) {
    activeStep = i;
    var p = phases[i];
    steps.forEach(function (s, idx) {
      s.classList.toggle('is-active', idx === i);
      s.setAttribute('aria-selected', String(idx === i));
    });
    panelNum.textContent = String(i + 1).padStart(2, '0');
    panelTitle.textContent = p.title;
    panelText.textContent = p.text;
    panelList.innerHTML = '';
    p.items.forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      panelList.appendChild(li);
    });
    stepBar.style.width = ((i + 1) / phases.length) * 100 + '%';
    panelContent.classList.remove('swap');
    void panelContent.offsetWidth;
    panelContent.classList.add('swap');
  }
  steps.forEach(function (s, idx) {
    s.addEventListener('click', function () { stopAuto(); showStep(idx); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stopAuto();
        var n = (activeStep + (e.key === 'ArrowRight' ? 1 : -1) + phases.length) % phases.length;
        showStep(n);
        steps[n].focus();
      }
    });
  });
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  showStep(0);

  // Auto-advance while the stepper is on screen, until the visitor interacts
  var stepper = document.querySelector('.stepper');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var interacted = false;
    stepper.addEventListener('pointerdown', function () { interacted = true; stopAuto(); });
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !interacted && !autoTimer) {
          autoTimer = setInterval(function () { showStep((activeStep + 1) % phases.length); }, 4500);
        } else if (!e.isIntersecting) {
          stopAuto();
        }
      });
    }, { threshold: 0.5 }).observe(stepper);
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  var toast = document.getElementById('toast');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');
    function done(msg) {
      toast.textContent = msg;
      setTimeout(function () { toast.textContent = ''; }, 2500);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(function () { done('Email copied to clipboard ✓'); }, function () { window.location.href = 'mailto:' + email; });
    } else {
      window.location.href = 'mailto:' + email;
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
