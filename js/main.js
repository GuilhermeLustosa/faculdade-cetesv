// ============================================================
// CETESV — interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // On mobile, tapping the dropdown label expands it inline
    document.querySelectorAll('.has-dropdown > a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (window.innerWidth <= 720) {
          e.preventDefault();
          a.parentElement.classList.toggle('open');
        }
      });
    });
    links.querySelectorAll('a:not(.has-dropdown > a)').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.setProperty('--i', el.dataset.i || (i % 6));
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Reading-ribbon scroll progress ---------- */
  const ribbonFill = document.querySelector('.ribbon-fill');
  if (ribbonFill) {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const pct = height > 0 ? Math.min(scrolled / height, 1) : 0;
      ribbonFill.style.transform = `scaleY(${pct})`;
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.count.includes('.') ? 1 : 0;
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const panel = item.querySelector('.accordion-panel');
      const isOpen = item.getAttribute('aria-expanded') === 'true';

      item.parentElement.querySelectorAll('.accordion-item').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Active nav link by current page ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > a, .nav-links > .has-dropdown > a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Vestibular form: validation + real submission to Formspree ---------- */
  const form = document.getElementById('vestibular-form');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    // phone mask
    const tel = form.querySelector('#telefone');
    if (tel) {
      tel.addEventListener('input', () => {
        let v = tel.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        tel.value = v;
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorBox = document.getElementById('form-error');
      const nome = form.nome.value.trim();
      const sobrenome = form.sobrenome.value.trim();
      const email = form.email.value.trim();
      const telefone = form.telefone.value.trim();
      const areas = form.querySelectorAll('input[name="area"]:checked');
      const consent = form.querySelector('#consent-privacidade');
      const honeypot = form.querySelector('input[name="_gotcha"]');
      let msg = '';

      if (!nome || !sobrenome) msg = 'Preencha seu nome completo.';
      else if (!/^\S+@\S+\.\S+$/.test(email)) msg = 'Informe um e-mail válido.';
      else if (telefone.replace(/\D/g, '').length < 10) msg = 'Informe um telefone válido com DDD.';
      else if (areas.length === 0) msg = 'Selecione ao menos uma área de interesse.';
      else if (consent && !consent.checked) msg = 'É necessário aceitar a Política de Privacidade para continuar.';

      if (msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        return;
      }
      errorBox.style.display = 'none';

      // Silent bot trap: if the hidden honeypot got filled, pretend success and stop.
      if (honeypot && honeypot.value) {
        form.style.display = 'none';
        document.getElementById('form-success').classList.add('show');
        return;
      }

      const action = form.getAttribute('action') || '';
      if (!action || action.includes('SEU_ID_AQUI')) {
        errorBox.textContent = 'Formulário ainda não conectado ao Formspree — configure o endpoint em action= para ativar o envio real.';
        errorBox.style.display = 'block';
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.style.display = 'none';
          document.getElementById('form-success').classList.add('show');
          if (window.fireConfetti) window.fireConfetti();
        } else {
          throw new Error('Formspree respondeu com erro');
        }
      } catch (err) {
        errorBox.textContent = 'Não foi possível enviar sua inscrição agora. Tente novamente em instantes ou fale conosco pelo WhatsApp.';
        errorBox.style.display = 'block';
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Cadastrar'; }
      }
    });
  }

  /* ---------- Newsletter / footer micro form (progressive enhancement) ---------- */
  document.querySelectorAll('form[data-simple-form]').forEach(f => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = f.querySelector('.form-note-status');
      if (note) note.textContent = 'Recebemos seu contato — em breve retornaremos!';
    });
  });

  /* ---------- Header shrink on scroll ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onHeaderScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
    document.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ---------- Ambient cursor glow + drifting orbs in the hero ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const glow = document.createElement('div');
    glow.className = 'hero-glow';
    hero.prepend(glow);
    ['o1', 'o2', 'o3'].forEach(c => {
      const orb = document.createElement('div');
      orb.className = 'hero-orb ' + c;
      hero.appendChild(orb);
    });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
      glow.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
    });
    // give the hero's first content block a staggered entrance
    const firstBlock = hero.querySelector('.hero-grid > div');
    if (firstBlock) firstBlock.classList.add('hero-intro');

    const cue = document.createElement('div');
    cue.className = 'scroll-cue';
    cue.innerHTML = '<span>role a página</span><span class="dot"></span>';
    hero.appendChild(cue);
  }

  /* ---------- 3D tilt on cards ---------- */
  const tiltTargets = document.querySelectorAll('.pillar, .course-card, .person-card');
  tiltTargets.forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- Button ripple on click ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Timeline rail fills as you scroll past it ---------- */
  document.querySelectorAll('.timeline').forEach(tl => {
    const rail = document.createElement('div');
    rail.className = 'timeline-rail';
    tl.prepend(rail);
    const items = tl.querySelectorAll('.tl-item');
    const update = () => {
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height;
      const seen = Math.min(Math.max(vh * 0.75 - r.top, 0), total);
      const pct = total > 0 ? (seen / total) * 100 : 0;
      rail.style.height = pct + '%';
      items.forEach(item => {
        const ir = item.getBoundingClientRect();
        item.classList.toggle('lit', ir.top < vh * 0.8);
      });
    };
    document.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Scrollspy: highlight nav link for the section in view ---------- */
  const spyLinks = Array.from(document.querySelectorAll('.nav-links a[href*="#"]'))
    .filter(a => a.getAttribute('href').split('#')[0] === '' || a.getAttribute('href').startsWith('#') || a.getAttribute('href').split('#')[0] === path);
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const targets = spyLinks.map(a => {
      const id = a.getAttribute('href').split('#')[1];
      return id ? document.getElementById(id) : null;
    }).filter(Boolean);
    if (targets.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            spyLinks.forEach(a => a.removeAttribute('data-active'));
            const match = spyLinks.find(a => a.getAttribute('href').split('#')[1] === entry.target.id);
            if (match) match.setAttribute('data-active', 'true');
          }
        });
      }, { threshold: 0.4, rootMargin: '-90px 0px -50% 0px' });
      targets.forEach(t => spy.observe(t));
    }
  }

  /* ---------- Back-to-top button ---------- */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Voltar ao topo');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  /* ---------- Smooth-scroll anchors with sticky-header offset ---------- */
  document.querySelectorAll('a[href*="#"]').forEach(a => {
    const [pageHref, hash] = a.getAttribute('href').split('#');
    if (!hash) return;
    if (pageHref && pageHref !== '' && pageHref !== path) return;
    a.addEventListener('click', (e) => {
      const target = document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Confetti burst on a successful vestibular submission ---------- */
  window.fireConfetti = function () {
    const colors = ['#F2793A', '#1596D6', '#0A1F44', '#F7F3EA'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[i % colors.length];
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      const duration = 1800 + Math.random() * 1400;
      const rotate = (Math.random() * 720 - 360).toFixed(0);
      const drift = (Math.random() * 120 - 60).toFixed(0);
      document.body.appendChild(piece);
      piece.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, 100vh) rotate(${rotate}deg)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => piece.remove();
    }
  };

  /* ---------- Google Maps: only load the iframe after user action (privacy-friendly) ---------- */
  document.querySelectorAll('.map-consent').forEach(box => {
    const loadMap = () => {
      const src = box.dataset.mapSrc;
      const title = box.dataset.mapTitle || 'Mapa';
      if (!src || box.querySelector('iframe')) return;
      box.innerHTML = `<iframe title="${title}" loading="lazy" src="${src}" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    };
    const btn = box.querySelector('.map-consent-btn');
    if (btn) btn.addEventListener('click', loadMap, { once: true });
    // If the person already accepted analytics cookies previously, skip the extra click next time.
    document.addEventListener('cetesv:consent-updated', (e) => {
      if (e.detail && e.detail.analytics) loadMap();
    });
  });

  /* ---------- LGPD: cookie consent banner + preference center ---------- */
  (function cookieConsent() {
    const STORAGE_KEY = 'cetesv_cookie_consent';

    const getConsent = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
      catch (e) { return null; }
    };
    const setConsent = (prefs) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, date: new Date().toISOString() }));
      } catch (e) { /* localStorage indisponível — segue sem persistir */ }
    };
    const applyConsent = (prefs) => {
      window.cetesvConsent = prefs;
      document.dispatchEvent(new CustomEvent('cetesv:consent-updated', { detail: prefs }));
      if (prefs.analytics) loadGoogleAnalytics();
    };

    // ---- Google Analytics (GA4), only loaded after explicit analytics consent ----
    // Troque GA_MEASUREMENT_ID pelo ID real da sua propriedade (formato G-XXXXXXXXXX)
    // em https://analytics.google.com — Admin > Fluxos de dados > seu site.
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
    let gaLoaded = false;
    function loadGoogleAnalytics() {
      if (gaLoaded || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes('XXXXXXXXXX')) return;
      gaLoaded = true;
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
      document.head.appendChild(s);
    }

    // ---- Banner ----
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p>Usamos cookies essenciais para o funcionamento do site e, mediante sua autorização, cookies analíticos para entender como ele é utilizado. Saiba mais na nossa <a href="privacidade.html">Política de Privacidade</a>.</p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-ghost" data-action="prefs">Personalizar</button>
        <button type="button" class="btn btn-outline" style="border-color:rgba(255,255,255,.5); color:#fff;" data-action="reject">Somente essenciais</button>
        <button type="button" class="btn btn-primary" data-action="accept">Aceitar todos</button>
      </div>`;
    document.body.appendChild(banner);

    // ---- Preference modal ----
    const overlay = document.createElement('div');
    overlay.className = 'cookie-modal-overlay';
    overlay.innerHTML = `
      <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <h3 id="cookie-modal-title">Preferências de cookies</h3>
        <p>Em conformidade com a LGPD (Lei nº 13.709/2018), você decide quais cookies não essenciais o CETESV pode usar neste site.</p>
        <div class="cookie-cat">
          <div>
            <h4>Cookies essenciais</h4>
            <p>Necessários para o site funcionar (navegação, formulário de vestibular, memória desta escolha). Não podem ser desativados.</p>
          </div>
          <label class="cookie-toggle"><input type="checkbox" checked disabled><span class="track"></span><span class="thumb"></span></label>
        </div>
        <div class="cookie-cat">
          <div>
            <h4>Cookies analíticos</h4>
            <p>Nos ajudam a entender como as páginas são usadas, de forma agregada, para melhorar o site.</p>
          </div>
          <label class="cookie-toggle"><input type="checkbox" id="consent-analytics"><span class="track"></span><span class="thumb"></span></label>
        </div>
        <div class="cookie-modal-actions">
          <button type="button" class="btn btn-ghost" data-action="close">Cancelar</button>
          <button type="button" class="btn btn-primary" data-action="save">Salvar preferências</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const openModal = () => overlay.classList.add('show');
    const closeModal = () => overlay.classList.remove('show');

    banner.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'accept') {
        const prefs = { essential: true, analytics: true };
        setConsent(prefs); applyConsent(prefs); banner.classList.remove('show');
      } else if (action === 'reject') {
        const prefs = { essential: true, analytics: false };
        setConsent(prefs); applyConsent(prefs); banner.classList.remove('show');
      } else if (action === 'prefs') {
        openModal();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.action === 'close') { closeModal(); return; }
      if (e.target.dataset.action === 'save') {
        const analytics = overlay.querySelector('#consent-analytics').checked;
        const prefs = { essential: true, analytics };
        setConsent(prefs); applyConsent(prefs);
        closeModal();
        banner.classList.remove('show');
      }
    });

    // Reopen the preference center from any element with data-cookie-prefs (e.g. footer link)
    document.querySelectorAll('[data-cookie-prefs]').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    });

    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      // Small delay so the banner slides in after the page has settled
      setTimeout(() => banner.classList.add('show'), 900);
    }
  })();

});
