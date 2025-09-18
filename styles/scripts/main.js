const header = document.querySelector('.site-header');
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
