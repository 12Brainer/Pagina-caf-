document.addEventListener("DOMContentLoaded", () => {
    const navPlaceholder = document.createElement('div');
    navPlaceholder.id = 'main-nav';
    document.body.prepend(navPlaceholder);

    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-nav').innerHTML = data;
            initMobileNav();
            handleScroll();
        });
});

function initMobileNav() {
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
}

function handleScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

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
}

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
