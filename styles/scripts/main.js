document.addEventListener("DOMContentLoaded", () => {
    let navPlaceholder = document.getElementById('main-nav');
    if (!navPlaceholder) {
        navPlaceholder = document.createElement('div');
        navPlaceholder.id = 'main-nav';
        document.body.prepend(navPlaceholder);
    }

    const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/Pagina-caf-/');
    const navPath = isIndexPage ? 'styles/nav.html' : 'nav.html';

    fetch(navPath)
        .then(response => response.text())
        .then(data => {
            navPlaceholder.innerHTML = data;
            // Ajustar rutas según la página (raíz vs internas)
            fixNavLinks(isIndexPage, navPlaceholder);
            // Inicializar navegación y comportamiento de header
            initMobileNav();
            handleScroll();
            // Resaltar el enlace activo
            setActiveLink(navPlaceholder);
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

// Ajusta href/src del nav cuando se carga en index.html (raíz)
function fixNavLinks(isIndexPage, root) {
    if (!isIndexPage) return; // Solo ajustar en la raíz

    // Ajustar enlaces <a>
    root.querySelectorAll('a[href]')?.forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

        let newHref = href;
        if (newHref.startsWith('../')) {
            // ../index.html -> index.html
            newHref = newHref.replace(/^\.\.\//, '');
        } else if (!newHref.startsWith('styles/')) {
            // about.html -> styles/about.html ; Pedidos.html -> styles/Pedidos.html
            newHref = 'styles/' + newHref;
        }
        a.setAttribute('href', newHref);
    });

    // Ajustar imágenes del nav (logo)
    root.querySelectorAll('img[src]')?.forEach(img => {
        const src = img.getAttribute('src');
        if (!src) return;
        if (src.startsWith('../')) {
            // ../assets/logo.jpg -> assets/logo.jpg
            img.setAttribute('src', src.replace(/^\.\.\//, ''));
        }
    });
}

// Marca el enlace activo y añade aria-current="page"
function setActiveLink(root) {
    const path = window.location.pathname || '';
    let page = 'index';
    if (path.includes('about.html')) page = 'about';
    else if (path.includes('products.html')) page = 'products';
    else if (path.includes('contacto.html')) page = 'contacto';
    else if (path.includes('Pedidos.html')) page = 'pedidos';
    else page = 'index';

    const links = root.querySelectorAll('.header-nav a, .mobile-nav a');
    links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });

    const selectorsByPage = {
        index: ['a[href$="index.html"]', 'a[href="../index.html"]', 'a[href$="/index.html"]'],
        about: ['a[href*="about.html"]'],
        products: ['a[href*="products.html"]'],
        contacto: ['a[href*="contacto.html"]'],
        pedidos: ['a[href*="Pedidos.html"]']
    };

    (selectorsByPage[page] || []).forEach(sel => {
        root.querySelectorAll(sel).forEach(a => {
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
        });
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
