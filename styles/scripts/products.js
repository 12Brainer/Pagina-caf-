// -------------------------
// MODAL PRODUCTO
// -------------------------
const modal = document.getElementById("modalProducto");
const closeBtn = document.querySelector(".close");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");

// Crear carrito flotante en el lado derecho
function createFloatingCart() {
  if (document.querySelector('.floating-cart')) return; // evitar duplicados
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'floating-cart';
  btn.setAttribute('aria-label', 'Abrir carrito');
  btn.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-badge" style="display:none;">0</span>';

  btn.addEventListener('click', () => {
    const path = window.location.pathname;
    let target = 'styles/Pedidos.html';
    if (path.includes('/styles/')) target = 'Pedidos.html';
    window.location.href = target;
  });

  document.body.appendChild(btn);
}

// Abrir modal al hacer clic en el botón "Ver más / Comprar"
if(document.querySelectorAll(".btn-buy")){
    document.querySelectorAll(".btn-buy").forEach(btn => {
      btn.addEventListener("click", () => {
                modal.style.display = "block";
        modalImg.src = btn.dataset.img;
        modalTitle.textContent = btn.dataset.title;
        modalPrice.textContent = "Desde ₡3,900";
        document.getElementById("modalQty").value = 1;
      });
    });
}


// Cerrar modal
if(closeBtn){
    closeBtn.onclick = () => modal.style.display = "none";
}
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; }

// -------------------------
// COMPRAR AHORA → WhatsApp
// -------------------------
if(document.getElementById("btnBuyNow")){
    document.getElementById("btnBuyNow").addEventListener("click", () => {
      const size = document.getElementById("modalSize").value;
      const grind = document.getElementById("modalGrind").value;
      const qty = document.getElementById("modalQty").value;
      const product = modalTitle.textContent;
    
      const msg = `Hola, quiero comprar: ${qty} x ${product} ${size}g (${grind})`;
      window.open(`https://wa.me/50683910511?text=${encodeURIComponent(msg)}`, "_blank");
    });
}


// -------------------------
// AGREGAR AL CARRITO
// -------------------------
if(document.getElementById("btnAddCart")){
    document.getElementById("btnAddCart").addEventListener("click", () => {
      const size = document.getElementById("modalSize").value;
      const grind = document.getElementById("modalGrind").value;
      const qty = parseInt(document.getElementById("modalQty").value);
      const price = parseInt(document.getElementById("modalSize").selectedOptions[0].dataset.price);
      const product = modalTitle.textContent;
      const img = modalImg.src; // Get the image source from the modal
    
      const existingItem = cart.find(item => item.product === product && item.size === size && item.grind === grind);
    
      if (existingItem) {
        existingItem.qty += qty;
        existingItem.subtotal = existingItem.qty * existingItem.price;
      } else {
        // Add the img to the new cart item
        cart.push({ product, size, grind, qty, price, subtotal: price * qty, img });
      }
    
      renderCart();
      modal.style.display = "none";
    });
}


function renderCart() {
  localStorage.setItem('cart', JSON.stringify(cart));

  const badges = document.querySelectorAll('.cart-badge');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  });

  // Solo ejecutar si estamos en la página de Pedidos
  if (!cartList) return;

  cartList.innerHTML = "";
  if (cart.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Tu carrito está vacío.";
    cartList.appendChild(li);
    if (cartTotal) {
      cartTotal.textContent = "₡0";
    }
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.subtotal;
    const li = document.createElement("li");
    li.classList.add('cart-item'); // Add a class for styling
    li.innerHTML = `
      <img src="${item.img}" alt="${item.product}" class="cart-item-img">
      <span>${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ₡${item.subtotal}</span>
      <button class="remove-item" data-index="${index}">&times;</button>
    `;
    cartList.appendChild(li);
  });
  
  if (cartTotal) {
    cartTotal.textContent = `₡${total}`;
  }

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const indexToRemove = parseInt(e.target.dataset.index);
      cart.splice(indexToRemove, 1);
      renderCart();
    });
  });
}

// -------------------------
// FINALIZAR COMPRA POR WHATSAPP
// -------------------------
// Mostrar/ocultar y validar campos de envío cuando cambia el método
document.addEventListener('DOMContentLoaded', () => {
  const envioRadio = document.getElementById('envio');
  const recogerRadio = document.getElementById('recoger');
  const shippingFields = document.getElementById('shippingFields');
  const provincia = document.getElementById('provincia');
  const canton = document.getElementById('canton');
  const distrito = document.getElementById('distrito');
  const direccion = document.getElementById('direccion');

  function toggleShipping(required) {
    if (!shippingFields) return;
    shippingFields.style.display = required ? 'block' : 'none';

    // Marcar como obligatorios condicionalmente
    if (provincia) provincia.required = required;
    if (canton) canton.required = required;
    if (distrito) distrito.required = required;
    if (direccion) direccion.required = required;
  }

  if (envioRadio && recogerRadio) {
    envioRadio.addEventListener('change', () => toggleShipping(true));
    recogerRadio.addEventListener('change', () => toggleShipping(false));

    // Estado inicial según selección por defecto
    toggleShipping(envioRadio.checked);
  }
});

if(document.getElementById("btnCheckout")){
    document.getElementById("btnCheckout").addEventListener("click", () => {
      // Validar que el carrito no esté vacío
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      // Obtener y validar los datos del formulario
      const nombre = document.getElementById('nombre')?.value.trim();
      const telefono = document.getElementById('telefono')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const entrega = document.querySelector('input[name="entrega"]:checked')?.value;

      if (!nombre || !telefono) {
        alert("Por favor, completa tu nombre y teléfono para continuar.");
        return;
      }

      // Si es envío, validar campos de dirección
      let direccionMsg = '';
      if (entrega === 'Envío por Correos de Costa Rica') {
        const provincia = document.getElementById('provincia')?.value.trim();
        const canton = document.getElementById('canton')?.value.trim();
        const distrito = document.getElementById('distrito')?.value.trim();
        const direccion = document.getElementById('direccion')?.value.trim();

        if (!provincia || !canton || !distrito || !direccion) {
          alert('Por favor, completa Provincia, Cantón, Distrito y Dirección exacta para el envío.');
          return;
        }
        direccionMsg = `\n*Dirección de entrega:*\nProvincia: ${provincia}\nCantón: ${canton}\nDistrito: ${distrito}\nDirección: ${direccion}\n`;
      }

      // Construir el mensaje para WhatsApp
      let msg = "🛒 *Nuevo pedido NeoPrado Café*\n\n";
      msg += "*Datos del Cliente:*\n";
      msg += `*Nombre:* ${nombre}\n`;
      msg += `*Teléfono:* ${telefono}\n`;
      if (email) msg += `*Email:* ${email}\n`;
      msg += `*Método de entrega:* ${entrega}\n`;
      if (direccionMsg) msg += direccionMsg;
      msg += "\n*Resumen del Pedido:*\n";

      let total = 0;
      cart.forEach(item => {
        msg += `• ${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ₡${item.subtotal}\n`;
        total += item.subtotal;
      });

      msg += `\n*Total:* ₡${total}\n\n`;
      msg += "Por favor, ayúdame a confirmar la disponibilidad y el proceso de pago.";

      // Enviar a WhatsApp
      window.open(`https://wa.me/50683910511?text=${encodeURIComponent(msg)}`, "_blank");
    });
}


// -------------------------
// CARRUSEL DE PRODUCTOS (CON DRAG/SWIPE)
// -------------------------
if(document.querySelectorAll('.carousel')){
    document.querySelectorAll('.carousel').forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const images = Array.from(track.children);
      const prevBtn = carousel.querySelector('.prev');
      const nextBtn = carousel.querySelector('.next');
    
      let index = 0;
      let isDragging = false;
      let startPos = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;
      let animationID;
    
      // Función para actualizar la posición del carrusel
      function setPositionByIndex() {
        const slideWidth = images[0].clientWidth;
        currentTranslate = index * -slideWidth;
        prevTranslate = currentTranslate;
        setSliderPosition();
      }
    
      function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
      }
    
      // Mover al slide siguiente/anterior
      function showSlide(n) {
        index = (n + images.length) % images.length;
        setPositionByIndex();
      }
    
      prevBtn.addEventListener('click', () => showSlide(index - 1));
      nextBtn.addEventListener('click', () => showSlide(index + 1));
    
      // Eventos de Drag (Mouse)
      carousel.addEventListener('mousedown', dragStart);
      carousel.addEventListener('mouseup', dragEnd);
      carousel.addEventListener('mouseleave', dragEnd);
      carousel.addEventListener('mousemove', drag);
    
      // Eventos de Swipe (Táctil)
      carousel.addEventListener('touchstart', dragStart);
      carousel.addEventListener('touchend', dragEnd);
      carousel.addEventListener('touchmove', drag);
    
      function dragStart(e) {
        e.preventDefault(); // Prevenir selección de imagen
        isDragging = true;
        startPos = getPositionX(e);
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none'; // Desactivar transición durante el drag
      }
    
      function drag(e) {
        if (isDragging) {
          const currentPosition = getPositionX(e);
          currentTranslate = prevTranslate + currentPosition - startPos;
        }
      }
    
      function dragEnd(e) {
        cancelAnimationFrame(animationID);
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;
    
        // Si se movió más de 100px, cambiar de slide
        if (movedBy < -100 && index < images.length - 1) {
          index += 1;
        }
        if (movedBy > 100 && index > 0) {
          index -= 1;
        }
    
        setPositionByIndex();
        track.style.transition = 'transform 0.4s ease-in-out'; // Reactivar transición
      }
    
      function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      }
    
      function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
      }
    
      // Inicializar
      showSlide(0);
      window.addEventListener('resize', setPositionByIndex);
    });
}

// Renderizar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    createFloatingCart();
    renderCart();
});
