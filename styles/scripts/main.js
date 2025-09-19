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
