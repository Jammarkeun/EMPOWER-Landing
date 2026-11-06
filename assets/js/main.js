/* EMPOWER landing page behaviour. No dependencies, and the page still reads in
   full without this file: tabs, filters, and the lightbox only enhance it. */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  /* ---------- Navigation ---------- */
  var nav = $('#nav');
  var toggle = $('#nav-toggle');
  var links = $('#nav-links');

  function setMenu(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && links.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', function (event) {
    if (links.classList.contains('open') && !nav.contains(event.target)) setMenu(false);
  });

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Highlights the section in view, the way the app's sidebar marks its page. */
  if ('IntersectionObserver' in window) {
    var navLinks = $$('a', links);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    /* The hero has no nav link, so reaching it clears the highlight. */
    $$('main section[id], #top').forEach(function (section) { spy.observe(section); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    $$('.reveal').forEach(function (element) { reveal.observe(element); });
  } else {
    $$('.reveal').forEach(function (element) { element.classList.add('in'); });
  }

  /* ---------- Feature filter ---------- */
  var filter = $('#feature-filter');
  var featureCount = $('#feature-count');
  var features = $$('#feature-grid .feature');

  function applyFilter(role) {
    var shown = 0;
    features.forEach(function (card) {
      var match = role === 'all' || card.dataset.roles.split(' ').indexOf(role) !== -1;
      card.hidden = !match;
      if (match) shown += 1;
    });
    $$('button', filter).forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.role === role));
    });
    featureCount.textContent = shown + (shown === 1 ? ' feature' : ' features') + (role === 'all' ? ' in all' : ' for this role');
  }
  filter.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (button) applyFilter(button.dataset.role);
  });
  applyFilter('all');

  /* ---------- Screenshot tabs ---------- */
  var tabs = $$('#shot-tabs [role="tab"]');

  function selectTab(tab, focus) {
    tabs.forEach(function (other) {
      var selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      if (selected) other.removeAttribute('tabindex'); else other.setAttribute('tabindex', '-1');
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); selectTab(next, true); }
    });
  });
  selectTab(tabs[0]);

  /* ---------- Lightbox ---------- */
  var box = $('#lightbox');
  if (box && typeof box.showModal === 'function') {
    var lbImage = $('#lb-img');
    var lbCaption = $('#lb-caption');
    var lbCount = $('#lb-count');
    var lbOpen = $('#lb-open');
    var lbPrev = $('#lb-prev');
    var lbNext = $('#lb-next');
    var lbZoom = $('#lb-zoom');
    var lbScroll = $('#lb-scroll');
    var group = [];
    var current = 0;

    function setZoom(on) {
      box.classList.toggle('is-zoomed', on);
      lbZoom.setAttribute('aria-pressed', String(on));
      lbZoom.setAttribute('aria-label', on ? 'Zoom out' : 'Zoom in');
      $('use', lbZoom).setAttribute('href', on ? '#i-zoom-out' : '#i-zoom-in');
      lbScroll.scrollTo(0, 0);
    }
    function show(index) {
      current = (index + group.length) % group.length;
      var link = group[current];
      var thumb = $('img', link);
      var caption = link.closest('figure').querySelector('figcaption');
      var href = link.getAttribute('href');
      setZoom(false);
      box.classList.toggle('is-svg', /\.svg$/i.test(href));
      lbImage.src = href;
      lbImage.alt = thumb ? thumb.alt : '';
      lbCaption.textContent = caption ? caption.textContent : '';
      lbCount.textContent = group.length > 1 ? (current + 1) + ' / ' + group.length : '';
      lbOpen.href = href;
      lbPrev.hidden = lbNext.hidden = group.length < 2;
    }
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[data-gallery]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      group = $$('a[data-gallery="' + link.dataset.gallery + '"]');
      show(group.indexOf(link));
      box.showModal();
    });
    lbPrev.addEventListener('click', function () { show(current - 1); });
    lbNext.addEventListener('click', function () { show(current + 1); });
    lbZoom.addEventListener('click', function () { setZoom(!box.classList.contains('is-zoomed')); });
    $('#lb-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (event) {
      if (event.target === box || event.target === $('#lb-stage') || event.target === lbScroll) box.close();
    });
    box.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' && group.length > 1) show(current - 1);
      if (event.key === 'ArrowRight' && group.length > 1) show(current + 1);
    });
    box.addEventListener('close', function () { lbImage.removeAttribute('src'); });
  }

  /* ---------- Worked matching example ----------
     Mirrors App\Services\Matching in the EMPOWER repository: points earned over
     points available, scaled by the share of gates met. Failing any gate means
     "Not recommended", whatever the score. The data below is invented. */
  var BANDS = { highly: 85, recommended: 70, reserve: 50 };
  var EDUCATION = { 'High School Graduate': 2, 'Senior High School Graduate': 3, 'College Graduate': 6 };
  var SKILLS = ['Teamwork', 'Machine operation', 'Food safety', 'Packing'];
  var AGE = { min: 18, max: 35 };
  var MIN_HEIGHT = 150;

  var APPLICANTS = [
    { name: 'Applicant A', age: 27, height: 165, education: 'High School Graduate', months: 36, skills: SKILLS, days: 0, km: 2 },
    { name: 'Applicant B', age: 24, height: 160, education: 'College Graduate', months: 18, skills: ['Teamwork', 'Machine operation', 'Packing'], days: 3, km: 5 },
    { name: 'Applicant C', age: 30, height: 145, education: 'Senior High School Graduate', months: 24, skills: SKILLS, days: 6, km: 4 }
  ];

  function round(value) { return Math.round(value * 100) / 100; }
  function clamp(value) { return Math.max(0, Math.min(1, value)); }

  function rangeLine(value, low, high, unit, lowerIsBetter) {
    var ratio = clamp((value - low) / (high - low));
    var multiplier = lowerIsBetter ? 1 - ratio : ratio;
    return {
      multiplier: multiplier,
      why: value + unit + ' against a range of ' + low + ' to ' + high + unit + ', scoring ' + Math.round(multiplier * 100) + '%.'
    };
  }

  function score(applicant) {
    var gates = [
      {
        name: 'Age range',
        passed: applicant.age >= AGE.min && applicant.age <= AGE.max,
        why: applicant.age + ' years against a range of ' + AGE.min + ' to ' + AGE.max + ' years.'
      },
      {
        name: 'Height requirement',
        passed: applicant.height >= MIN_HEIGHT,
        why: applicant.height + ' cm against a required minimum of ' + MIN_HEIGHT + ' cm.'
      }
    ];

    var educationMet = EDUCATION[applicant.education] >= EDUCATION['High School Graduate'];
    var held = SKILLS.filter(function (skill) { return applicant.skills.indexOf(skill) !== -1; });
    var missing = SKILLS.filter(function (skill) { return applicant.skills.indexOf(skill) === -1; });
    var experience = rangeLine(applicant.months, 0, 36, ' months', false);
    var availability = rangeLine(applicant.days, 0, 30, ' days', true);
    var distance = rangeLine(applicant.km, 0, 20, ' km', true);

    var scored = [
      {
        name: 'Educational attainment', weight: 25, multiplier: educationMet ? 1 : 0,
        why: applicant.education + ' recorded against a required High School Graduate. Higher attainment also satisfies it.'
      },
      { name: 'Relevant work experience', weight: 25, multiplier: experience.multiplier, why: experience.why },
      {
        name: 'Skills match', weight: 20, multiplier: held.length / SKILLS.length,
        why: 'Holds ' + held.length + ' of ' + SKILLS.length + ' skills' + (missing.length ? '. Missing: ' + missing.join(', ') + '.' : '.')
      },
      { name: 'Availability to start', weight: 15, multiplier: availability.multiplier, why: availability.why },
      { name: 'Distance from worksite', weight: 15, multiplier: distance.multiplier, why: distance.why }
    ];

    var earned = 0;
    var available = 0;
    scored.forEach(function (line) {
      line.points = line.weight * line.multiplier;
      earned += line.points;
      available += line.weight;
    });

    var met = gates.filter(function (gate) { return gate.passed; }).length;
    var competency = earned / available;
    var overall = round(competency * (met / gates.length) * 100);

    var band = { key: 'not', label: 'Not recommended' };
    if (met === gates.length) {
      if (overall >= BANDS.highly) band = { key: 'highly', label: 'Highly recommended' };
      else if (overall >= BANDS.recommended) band = { key: 'recommended', label: 'Recommended' };
      else if (overall >= BANDS.reserve) band = { key: 'reserve', label: 'Reserve pool' };
    }

    return {
      applicant: applicant, gates: gates, scored: scored, met: met, earned: round(earned), available: available,
      competency: round(competency * 100), overall: overall, band: band
    };
  }

  var list = $('#match-list');
  var trace = $('#match-trace');

  function pill(band) {
    return '<span class="pill pill-' + band.key + '">' + band.label + '</span>';
  }

  function renderTrace(result) {
    var html = '<p class="trace-group">Gates: pass or fail, no points</p>';
    result.gates.forEach(function (gate) {
      html += '<div class="trace-row"><div><strong>' + gate.name + '</strong><span class="why">' + gate.why + '</span></div>' +
        '<span class="pill ' + (gate.passed ? 'pill-highly' : 'pill-not') + '">' + (gate.passed ? 'Passed' : 'Failed') + '</span></div>';
    });
    html += '<p class="trace-group">Scored criteria: weights set by HR</p>';
    result.scored.forEach(function (line) {
      html += '<div class="trace-row"><div><strong>' + line.name + '</strong><span class="why">' + line.why + '</span></div>' +
        '<span class="trace-points">' + round(line.points) + ' <small>/ ' + line.weight + '</small></span></div>';
    });
    var allMet = result.met === result.gates.length;
    html += '<div class="trace-sum"><p>' + (allMet
      ? '<b>' + result.earned + ' of ' + result.available + '</b> points, all gates met: <b>' + result.overall + '%</b>'
      : 'Competency <b>' + result.competency + '%</b>, with <b>' + result.met + ' of ' + result.gates.length + '</b> gates met, counts as <b>' + result.overall + '%</b>') +
      '</p>' + pill(result.band) + '</div>';
    trace.innerHTML = html;
  }

  function buildMatchDemo() {
    var results = APPLICANTS.map(score).sort(function (a, b) { return b.overall - a.overall; });
    results.forEach(function (result) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'match-item';
      button.innerHTML = '<span class="match-name">' + result.applicant.name + ' ' + pill(result.band) + '</span>' +
        '<span class="match-score">' + result.overall + '%</span>' +
        '<span class="match-bar" aria-hidden="true"><span style="width:' + result.overall + '%"></span></span>';
      button.addEventListener('click', function () { select(result, button); });
      list.appendChild(button);
    });
    function select(result, button) {
      $$('.match-item', list).forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      renderTrace(result);
    }
    /* Opens on Applicant B: partial credit and "higher attainment counts" both show. */
    select(results[1], $$('.match-item', list)[1]);
  }
  if (list && trace) buildMatchDemo();
})();
