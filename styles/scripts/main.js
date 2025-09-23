const header = document.querySelector('.site-header');

// Insertar banner superior de envíos gratis en todas las páginas
if (header && !header.querySelector('.top-banner')) {
    const banner = document.createElement('div');
    banner.className = 'top-banner';
    banner.textContent = 'ENVIOS GRATIS EN PEDIDOS MAYORES A ₡30,000 COLONES';
    header.prepend(banner);
}

let lastScrollY = window.scrollY;

// ====== Header: Hamburguesa + Menú móvil ======
(function initMobileNav() {
    const burger = document.querySelector('.hamburger');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const drawer = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-close');

    if (!burger || !backdrop || !drawer || !closeBtn) {
        return;
    }

    function openNav() {
        drawer.classList.add('open');
        backdrop.classList.add('show');
        document.body.classList.add('nav-open');
        burger.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
        drawer.classList.remove('open');
        backdrop.classList.remove('show');
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', () => {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            closeNav();
        } else {
            openNav();
        }
    });

    backdrop.addEventListener('click', closeNav);
    closeBtn.addEventListener('click', closeNav);

    drawer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeNav();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNav();
        }
    });
})();

// ====== Faja de beneficios (features strip) ======
(function injectUSPStrip() {
    if (document.querySelector('.features-strip')) return; // evitar duplicados
    const footer = document.querySelector('.site-footer') || document.querySelector('footer');
    if (!footer) return;

    // Inyectar estilos si no existen aún
    (function ensureFeaturesStyles() {
        if (document.getElementById('features-strip-styles')) return;
        const style = document.createElement('style');
        style.id = 'features-strip-styles';
        style.textContent = `
      .features-strip{ background:linear-gradient(180deg,#217C65 0%, #1f705c 100%); color:#fff; padding:1.15rem .75rem; border-top:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(0,0,0,.08); }
      .features-strip .features-grid{ max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem 1.5rem; align-items:start; text-align:center; }
      .features-strip .feature-item{ padding:.25rem .5rem; }
      .features-strip .feature-item i{ font-size:1.45rem; margin:0 0 .35rem; display:inline-block; color:#ffffff; opacity:.98; }
      .features-strip .feature-item h3{ margin:.15rem 0; font-weight:700; color:#fff; font-size:clamp(.95rem, .9rem + .35vw, 1.1rem); letter-spacing:.2px; }
      .features-strip .feature-item p{ margin:0; color:#fff; opacity:.92; font-size:clamp(.85rem, .8rem + .2vw, .95rem); }
      @media (min-width: 921px){ .features-strip .feature-item:not(:first-child){ border-left:1px solid rgba(255,255,255,.14);} }
      @media (max-width: 920px){ .features-strip .features-grid{ grid-template-columns:repeat(2,1fr);} }
      @media (max-width: 520px){ .features-strip .features-grid{ grid-template-columns:1fr; } }
    `;
        document.head.appendChild(style);
    })();

    const section = document.createElement('section');
    section.className = 'features-strip';
    section.setAttribute('aria-label', 'Beneficios NeoPrado');
    section.innerHTML = `
    <div class="features-grid">
      <div class="feature-item">
        <i class="fa-solid fa-truck" aria-hidden="true"></i>
        <h3>Envío Express</h3>
        <p>24-48 horas en Costa Rica</p>
      </div>
      <div class="feature-item">
        <i class="fa-solid fa-credit-card" aria-hidden="true"></i>
        <h3>Pago 100% seguro</h3>
        <p>Métodos de pago</p>
      </div>
      <div class="feature-item">
        <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i>
        <h3>Envíos a Todo Costa Rica</h3>
        <p>No importa donde estés, nosotros llegamos.</p>
      </div>
      <div class="feature-item">
        <i class="fa-regular fa-star" aria-hidden="true"></i>
        <h3>5.0 Reseñas</h3>
        <p>Producto y Servicio de Calidad</p>
      </div>
    </div>
  `;

    footer.parentNode.insertBefore(section, footer);
})();

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 50) {
        header.classList.remove('hidden');
        header.classList.remove('scrolled');
    } else {
        header.classList.add('scrolled');

        if (currentScrollY > lastScrollY) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
    }

    lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
});

// ========== Botón flotante de WhatsApp ==========
(function injectFloatingWhatsApp() {
    if (document.querySelector('.floating-whatsapp')) return; // evitar duplicados

    const number = '50683910511';
    const defaultMsg = '¡Hola! Quiero hacer un pedido de café, ¿me pueden dar detalles?';
    const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(defaultMsg)}`;

    const a = document.createElement('a');
    a.href = waUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'floating-whatsapp';
    a.setAttribute('aria-label', 'Abrir chat de WhatsApp');
    a.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i>';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(a));
    } else {
        document.body.appendChild(a);
    }
})();