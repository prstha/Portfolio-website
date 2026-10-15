(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  document.getElementById('themeToggle').addEventListener('click', function () {
    var dark = root.getAttribute('data-theme')
      ? root.getAttribute('data-theme') === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Avatar: eyes follow the cursor */
  var avatar = document.getElementById('avatar');
  var pupils = avatar.querySelector('.av-pupils');
  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      var r = avatar.querySelector('svg').getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height * 0.42);
      var dist = Math.hypot(dx, dy) || 1;
      var k = Math.min(dist / 300, 1);
      pupils.style.transform = 'translate(' + (dx / dist) * 2 * k + 'px,' + (dy / dist) * 1.4 * k + 'px)';
    }, { passive: true });
  }

  /* Journey accordion */
  document.querySelectorAll('.role').forEach(function (role) {
    var head = role.querySelector('.role__head');
    head.addEventListener('click', function () {
      var open = !role.classList.contains('is-open');
      role.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* A sprint with me */
  var days = [
    ['Sprint planning.', 'We agree on what goes in, who owns it and what "done" means. Then I make sure Jira agrees too: tickets entered, prioritized, with clear acceptance criteria.'],
    ['Stand-up, then unblock.', 'Fifteen minutes, not forty. Blockers get an owner and a date, not just sympathy. The rest of the day goes to clearing the path for Engineering, QA and Design.'],
    ['Risk check.', 'Anything that could slip goes to management early, with options attached. Surprises are great for birthdays, not for delivery.'],
    ['Backlog and stakeholders.', 'Re-prioritize when the world changes (it will). Gather requirements for what is next so the following sprint starts with a clear plan.'],
    ['Report and retro.', 'One page of progress, KPIs, risks and upcoming milestones for stakeholders. Then a retro: what to keep, what to drop, what to try next.']
  ];
  var dayBtns = document.querySelectorAll('.day');
  var panel = document.querySelector('.week__panel');
  var what = document.getElementById('dayWhat');
  var how = document.getElementById('dayHow');
  var current = 0;
  function showDay(i) {
    current = i;
    dayBtns.forEach(function (b, idx) {
      b.classList.toggle('is-on', idx === i);
      b.setAttribute('aria-selected', String(idx === i));
    });
    what.textContent = days[i][0];
    how.textContent = days[i][1];
    panel.classList.remove('fade'); void panel.offsetWidth; panel.classList.add('fade');
  }
  dayBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { showDay(i); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var n = (current + (e.key === 'ArrowRight' ? 1 : -1) + days.length) % days.length;
      showDay(n); dayBtns[n].focus();
    });
  });
  showDay(0);

  /* Ticket: check all acceptance criteria */
  var boxes = document.querySelectorAll('.ticket__ac input');
  var done = document.getElementById('ticketDone');
  var btn = document.getElementById('ticketBtn');
  boxes.forEach(function (box) {
    box.addEventListener('change', function () {
      var all = Array.prototype.every.call(boxes, function (b) { return b.checked; });
      done.textContent = all ? 'All criteria met. Ticket ready to move. Your move.' : '';
      btn.textContent = all ? 'Send it →' : 'Move to In progress →';
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
