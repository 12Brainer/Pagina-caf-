// -------------------------
// MODAL PRODUCTO
// -------------------------
const modal = document.getElementById("modalProducto");
const closeBtn = document.querySelector(".close");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");

// Gestión de foco y cierre accesible del modal
let lastActiveElement = null;
function openProductModal() {
  if (!modal) return;
  lastActiveElement = document.activeElement;
  modal.style.display = "block";
  // Foco al botón de cerrar para accesibilidad
  const focusTarget = closeBtn || modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusTarget && typeof focusTarget.focus === 'function') {
    focusTarget.focus();
  }
}
function closeProductModal() {
  if (!modal) return;
  modal.style.display = "none";
  // Devolver el foco al botón disparador si existe
  if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
    lastActiveElement.focus();
  }
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");

// Crear carrito flotante en el lado derecho
function goToCartPage(){
  const path = window.location.pathname;
  let target = 'styles/Pedidos.html';
  if (path.includes('/styles/')) target = 'Pedidos.html';
  window.location.href = target;
}

function createFloatingCart() {
  if (document.querySelector('.floating-cart')) return; // evitar duplicados
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'floating-cart';
  btn.setAttribute('aria-label', 'Abrir carrito');
  btn.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-badge" style="display:none;">0</span>';
  btn.addEventListener('click', goToCartPage);
  document.body.appendChild(btn);
}

// Delegación global para soportar botón estático o inyectado
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.floating-cart');
  if (btn) goToCartPage();
});

// Abrir modal al hacer clic en el botón "Ver más / Comprar"
if(document.querySelectorAll(".btn-buy")){
    document.querySelectorAll(".btn-buy").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!modal) return;
        modalImg.src = btn.dataset.img;
        modalTitle.textContent = btn.dataset.title;
        modalPrice.textContent = "Desde ₡3,900";
        const qtyEl = document.getElementById("modalQty");
        if (qtyEl) qtyEl.value = 1;
        openProductModal();
      });
    });
}


// Cerrar modal
if(closeBtn){
    closeBtn.onclick = () => closeProductModal();
}
window.onclick = e => { if (e.target === modal) closeProductModal(); }

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.style.display === 'block') {
    closeProductModal();
  }
});

// -------------------------
// COMPRAR AHORA → IR A CHECKOUT (datos obligatorios)
// -------------------------
if(document.getElementById("btnBuyNow")){
    document.getElementById("btnBuyNow").addEventListener("click", () => {
      // Tomar selección actual del modal
      const size = document.getElementById("modalSize").value;
      const grind = document.getElementById("modalGrind").value;
      const qty = parseInt(document.getElementById("modalQty").value);
      const price = parseInt(document.getElementById("modalSize").selectedOptions[0].dataset.price);
      const product = modalTitle.textContent;
      const img = modalImg.src;

      // Agregar al carrito (igual que el botón Agregar al carrito)
      const existingItem = cart.find(item => item.product === product && item.size === size && item.grind === grind);
      if (existingItem) {
        existingItem.qty += qty;
        existingItem.subtotal = existingItem.qty * existingItem.price;
      } else {
        cart.push({ product, size, grind, qty, price, subtotal: price * qty, img });
      }

      // Persistir y actualizar badges
      renderCart();

      // Cerrar modal y redirigir a la página de Checkout para completar datos obligatorios
      if (modal) modal.style.display = "none";
      goToCartPage();
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

// -------------------------
// FORMATEO Y CÁLCULO DE TOTALES
// -------------------------
const CRC = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' });
const TAX_RATE = 0; // Sin impuestos
// Endpoint de Google Apps Script para registrar compras (solo invitados)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw7JLfVoAC1hCgQ_ZYJ3sbqQLASI-zSypbOmayZataMBES0mjWOix8mqaBn1U0i0KE5/exec';

function isEnvioSelected() {
  const r = document.getElementById('envio');
  return !!(r && r.checked);
}

function getShippingCost(subtotal){
  return isEnvioSelected() && subtotal > 0 ? 3000 : 0;
}

function getTax(subtotal){
  return 0;
}

function renderCart() {
  // Persistir carrito
  localStorage.setItem('cart', JSON.stringify(cart));

  // Actualizar badges
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

  // Si no estamos en la página de Pedidos, no intentamos renderizar la UI del checkout
  if (!cartList) return;

  // Subtotal
  const subtotal = cart.reduce((sum, it) => sum + it.subtotal, 0);

  // Renderizado de lista de ítems
  cartList.innerHTML = "";
  if (cart.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Tu carrito está vacío.";
    cartList.appendChild(li);

    // Reset de totales en UI
    const subEl = document.getElementById('checkoutSubtotal');
    const shipEl = document.getElementById('checkoutShipping');
    const taxEl = document.getElementById('checkoutTax');
    if (subEl) subEl.textContent = CRC.format(0);
    if (shipEl) shipEl.textContent = CRC.format(0);
    if (taxEl) taxEl.textContent = CRC.format(0);
    if (cartTotal) cartTotal.textContent = CRC.format(0);
    return;
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add('cart-item'); // Add a class for styling
    li.innerHTML = `
      <img src="${item.img}" alt="${item.product}" class="cart-item-img">
      <span>${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ${CRC.format(item.subtotal)}</span>
      <button class="remove-item" data-index="${index}">&times;</button>
    `;
    cartList.appendChild(li);
  });
  
  // Cálculo de envío, impuestos y total
  const shipping = getShippingCost(subtotal);
  const tax = 0;
  const total = subtotal + shipping;

  // Actualizar UI de totales
  const subEl = document.getElementById('checkoutSubtotal');
  const shipEl = document.getElementById('checkoutShipping');
  const taxEl = document.getElementById('checkoutTax');
  if (subEl) subEl.textContent = CRC.format(subtotal);
  if (shipEl) shipEl.textContent = CRC.format(shipping);
  if (taxEl) taxEl.textContent = CRC.format(0);
  if (cartTotal) cartTotal.textContent = CRC.format(total);

  // Remover ítems
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
  const shippingSection = document.getElementById('shippingSection');
  const pickupSection = document.getElementById('pickupSection');

  // Campos de envío (nueva estructura)
  const pais = document.getElementById('pais');
  const direccion = document.getElementById('direccion');
  const linea2 = document.getElementById('linea2');
  const provinciaEstado = document.getElementById('provinciaEstado');
  const ciudad = document.getElementById('ciudad');
  const codigoPostal = document.getElementById('codigoPostal');

  // Pago
  const pagoSinpe = document.getElementById('pago_sinpe');
  const pagoEfectivo = document.getElementById('pago_efectivo');
  const paymentHint = document.getElementById('paymentHint');

  function toggleDelivery(isEnvio) {
    if (shippingSection) shippingSection.style.display = isEnvio ? 'block' : 'none';
    if (pickupSection) pickupSection.style.display = isEnvio ? 'none' : 'block';

    // Requeridos cuando es envío
    const required = !!isEnvio;
    if (pais) pais.required = required;
    if (direccion) direccion.required = required;
    if (provinciaEstado) provinciaEstado.required = required;
    if (ciudad) ciudad.required = required;
    // Opcionales
    if (linea2) linea2.required = false;
    if (codigoPostal) codigoPostal.required = false;
  }

  if (envioRadio && recogerRadio) {
    envioRadio.addEventListener('change', () => { toggleDelivery(true); renderCart(); });
    recogerRadio.addEventListener('change', () => { toggleDelivery(false); renderCart(); });

    // Estado inicial según selección por defecto
    toggleDelivery(envioRadio.checked);
    // Recalcular totales iniciales
    renderCart();
  }

  // Método de pago: actualizar hint dinámico
  if (pagoSinpe && pagoEfectivo && paymentHint) {
    function updatePaymentHint() {
      if (pagoSinpe.checked) {
        paymentHint.textContent = 'Por favor, envíe el comprobante de pago al mismo número desde el que se le envió el mensaje de confirmación.';
      } else {
        paymentHint.textContent = 'Podrá pagar en efectivo al momento de retirar o recibir su pedido.';
      }
    }
    pagoSinpe.addEventListener('change', updatePaymentHint);
    pagoEfectivo.addEventListener('change', updatePaymentHint);
    updatePaymentHint();
  }
});

if(document.getElementById("btnCheckout")){
    document.getElementById("btnCheckout").addEventListener("click", async () => {
      // Validar que el carrito no esté vacío
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      // Obtener y validar los datos del formulario
      const nombre = document.getElementById('nombre')?.value.trim();
      const apellidos = document.getElementById('apellidos')?.value.trim();
      const telefono = document.getElementById('telefono')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const entrega = document.querySelector('input[name="entrega"]:checked')?.value;
      const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value;

      // Validación de datos obligatorios
      if (!nombre || !apellidos || !telefono) {
        alert("Por favor, completa tu nombre, apellidos y teléfono para continuar.");
        return;
      }

      // Subtotal / Envío / Impuestos / Total
      const subtotal = cart.reduce((sum, it) => sum + it.subtotal, 0);
      const shipping = getShippingCost(subtotal);
      const tax = 0;
      const total = subtotal + shipping;

      // Si es envío, validar campos de dirección
      let direccionMsg = '';
      let direccionPlano = '';
      if (isEnvioSelected()) {
        const pais = document.getElementById('pais')?.value.trim();
        const direccion = document.getElementById('direccion')?.value.trim();
        const linea2 = document.getElementById('linea2')?.value.trim();
        const provinciaEstado = document.getElementById('provinciaEstado')?.value.trim();
        const ciudad = document.getElementById('ciudad')?.value.trim();
        const codigoPostal = document.getElementById('codigoPostal')?.value.trim();

        if (!pais || !provinciaEstado || !ciudad || !direccion) {
          alert('Por favor, completa País, Provincia/Estado, Ciudad y Dirección para el envío.');
          return;
        }
        const direccionLinea = linea2 ? `${direccion}, ${linea2}` : direccion;
        direccionMsg = `\n*Dirección de entrega:*\nPaís/Región: ${pais}\nProvincia/Estado: ${provinciaEstado}\nCiudad: ${ciudad}\nDirección: ${direccionLinea}\nCódigo postal: ${codigoPostal || 'N/A'}\n`;
        direccionPlano = `${pais} | ${provinciaEstado} | ${ciudad} | ${direccionLinea} | CP: ${codigoPostal || 'N/A'}`;
      }

      // Compra como invitado (sin sesión)

      // Guardado en Google Sheets para invitados / registrados
      const productosTexto = cart.map(it => `${it.qty}x ${it.product} ${it.size}g (${it.grind}) = ${CRC.format(it.subtotal)}`).join(' | ');

      const endpoint = GAS_ENDPOINT;
      if (!endpoint || String(endpoint).startsWith('REEMPLAZA_')){
        console.warn('Configura GAS_ENDPOINT en products.js para registrar compras.');
      } else {
        try{
          const payload = {
            action: 'guestPurchase',
            tipoCliente: 'Cliente',
            nombre,
            apellido: apellidos,
            correo: email || '',
            telefono,
            direccion: direccionPlano,
            productos: productosTexto,
            total,
            fecha: new Date().toISOString()
          };
          await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        } catch(err){ console.warn('No se pudo guardar la compra en Sheets:', err); }
      }

      // Eliminado bloque duplicado: el guardado ya se realiza de forma unificada arriba

      // Construir el mensaje para WhatsApp
      let msg = "🛒 *Nuevo pedido SAN BERNARDO SPECIALTY COFFEE ESTATE*\n\n";
      msg += `Hola, soy ${nombre} ${apellidos} y quiero confirmar mi pedido.\n\n`;
      msg += "*Datos del Cliente:*\n";
      msg += `*Nombre:* ${nombre} ${apellidos}\n`;
      msg += `*Teléfono:* ${telefono}\n`
      if (email) msg += `*Email:* ${email}\n`;
            msg += `*Método de entrega:* ${entrega}\n`;
      if (metodoPago) msg += `*Método de pago:* ${metodoPago}\n`;
      if (direccionMsg) msg += direccionMsg;
      msg += "\n*Resumen del Pedido:*\n";

      cart.forEach(item => {
        msg += `• ${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ${CRC.format(item.subtotal)}\n`;
      });

      msg += `\n*Subtotal:* ${CRC.format(subtotal)}\n`;
      msg += `*Envío:* ${CRC.format(shipping)}\n`;
      msg += `\n*Total:* ${CRC.format(total)}\n\n`;
            msg += "Por favor, ayúdame a confirmar la disponibilidad y el proceso de pago.";

      // Enviar a WhatsApp con fallback si el popup es bloqueado
      const waUrl = `https://wa.me/50683910511?text=${encodeURIComponent(msg)}`;
      const w = window.open(waUrl, "_blank");
      if (!w || w.closed || typeof w.closed === 'undefined') {
        // Fallback: redirigir en la misma pestaña
        window.location.href = waUrl;
      }

      // Vaciar carrito y mostrar confirmación
      try {
        cart = [];
        renderCart();
        // Banner de confirmación no bloqueante
        const confirmationMsg = document.getElementById('checkoutConfirmation') || document.createElement('div');
        confirmationMsg.id = 'checkoutConfirmation';
        confirmationMsg.className = 'notice notice-success';
        confirmationMsg.textContent = 'Tu pedido ha sido enviado. El carrito está vacío.';
        const checkoutBox = document.querySelector('.checkout');
        if (checkoutBox) {
          const btn = document.getElementById('btnCheckout');
          if (btn && btn.parentElement === checkoutBox) {
            checkoutBox.insertBefore(confirmationMsg, btn);
          } else {
            checkoutBox.appendChild(confirmationMsg);
          }
        } else {
          alert('Tu pedido ha sido enviado. El carrito está vacío.');
        }
      } catch (err) {
        console.warn('No se pudo vaciar el carrito automáticamente:', err);
      }
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

// Crear flotante de inmediato si el DOM ya está listo (por defer)
if (document.readyState !== 'loading') {
  createFloatingCart();
}

// Renderizar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    createFloatingCart();
    renderCart();

    });

