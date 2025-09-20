const header = document.querySelector('.site-header');
// Insertar banner superior de envíos gratis en todas las páginas
if (header && !header.querySelector('.top-banner')) {
  const banner = document.createElement('div');
  banner.className = 'top-banner';
  banner.textContent = 'ENVIOS GRATIS EN PEDIDOS MAYORES A ₡30,000 COLONES';
  header.prepend(banner);
}
let lastScrollY = window.scrollY;

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
