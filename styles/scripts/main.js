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
(function initMobileNav(){
  const headerEl = document.querySelector('.site-header .header-container');
  if (!headerEl) return;

  // Botón hamburguesa
  let burger = document.querySelector('.hamburger');
  if (!burger){
    burger = document.createElement('button');
    burger.className = 'hamburger';
    burger.setAttribute('aria-label', 'Abrir menú');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';
    headerEl.prepend(burger);
  }

  // Acciones (carrito visible a la derecha en móvil)
  let actions = document.querySelector('.header-actions');
  if (!actions){
    actions = document.createElement('div');
    actions.className = 'header-actions';
    actions.innerHTML = '<a href="'+(location.pathname.includes('/styles/')? 'Pedidos.html' : 'styles/Pedidos.html')+'" class="header-cart" aria-label="Carrito de compras"><i class="fas fa-shopping-cart"></i><span class="cart-badge" style="display:none;">0</span></a>';
    headerEl.appendChild(actions);
  }

  // Backdrop
  let backdrop = document.querySelector('.mobile-nav-backdrop');
  if (!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  // Drawer móvil
  let drawer = document.querySelector('.mobile-nav');
  if (!drawer){
    drawer = document.createElement('nav');
    drawer.className = 'mobile-nav';
    const root = location.pathname.includes('/styles/')? '..' : '.';
    drawer.innerHTML = `
      <div class="mobile-brand">
        <img src="${root}/assets/logo.jpg" alt="Logo NeoPrado Café" />
        <div>
          <h2>NeoPrado Café</h2>
          <p class="slogan">Café de Especialidad</p>
        </div>
        <button class="mobile-close" aria-label="Cerrar menú">×</button>
      </div>
      <ul>
        <li><a href="${root}/index.html">Comprar Café</a></li>
        <li><a href="${root}/styles/about.html">Sobre nosotros</a></li>
        <li><a href="${root}/styles/products.html">Productos</a></li>
        <li><a href="${root}/styles/contacto.html">Contacto</a></li>
      </ul>
    `;
    document.body.appendChild(drawer);
  }

  function openNav(){
    drawer.classList.add('open');
    backdrop.classList.add('show');
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
  }
  function closeNav(){
    drawer.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeNav(); else openNav();
  });
  backdrop.addEventListener('click', closeNav);
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('.mobile-close')) { e.preventDefault(); closeNav(); }
    if (e.target.tagName === 'A') closeNav();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
})();

// ====== Faja de beneficios (features strip) ======
(function injectUSPStrip(){
  if (document.querySelector('.features-strip')) return; // evitar duplicados
  const footer = document.querySelector('.site-footer') || document.querySelector('footer');
  if (!footer) return;

  // Inyectar estilos si no existen aún
  (function ensureFeaturesStyles(){
    if (document.getElementById('features-strip-styles')) return;
    const style = document.createElement('style');
    style.id = 'features-strip-styles';
    style.textContent = `
      .features-strip{ background:#217C65; color:#fff; padding:1.5rem 1rem; }
      .features-strip .features-grid{ max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:1rem 2rem; align-items:start; text-align:center; }
      .features-strip .feature-item i{ font-size:1.75rem; margin:0 0 .5rem; display:inline-block; }
      .features-strip .feature-item h3{ margin:.2rem 0; font-weight:800; color:#fff; font-size:clamp(1rem, .9rem + .5vw, 1.2rem); }
      .features-strip .feature-item p{ margin:0; color:#fff; opacity:.95; font-size:clamp(.9rem, .85rem + .2vw, 1rem); }
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
(function injectFloatingWhatsApp(){
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
