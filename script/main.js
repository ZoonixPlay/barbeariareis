/* ============================================
   BARBEARIA REIS — main.js (Global)
   Efeito de tesouras/navalhas caindo
   ============================================ */

(function () {
  'use strict';

  // ── PARTICLES / FALLING EFFECT ──
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const SYMBOLS = ['✂', '✦', '🪒', '|', '—'];
    const GOLD = 'rgba(201,168,76,';

    const particles = [];
    const COUNT = 28;

    for (let i = 0; i < COUNT; i++) {
      particles.push(createParticle(true));
    }

    function createParticle(randomY) {
      return {
        x:       Math.random() * window.innerWidth,
        y:       randomY ? Math.random() * window.innerHeight : -40,
        size:    10 + Math.random() * 14,
        speed:   0.4 + Math.random() * 0.7,
        opacity: 0.04 + Math.random() * 0.09,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        symbol:  SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        drift:   (Math.random() - 0.5) * 0.3,
      };
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = GOLD + '1)';
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();

        p.y        += p.speed;
        p.x        += p.drift;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height + 50) {
          particles[i] = createParticle(false);
        }
      });

      requestAnimationFrame(tick);
    }

    tick();
  }

  // ── INTERSECTION OBSERVER (scroll animations) ──
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 120);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat, .service-card, .product-card').forEach(el => observer.observe(el));
  }

  // ── INIT ──
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
  });

})();
