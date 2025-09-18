// -------------------------
// MODAL PRODUCTO
// -------------------------
const modal = document.getElementById("modalProducto");
const closeBtn = document.querySelector(".close");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");

const cart = [];
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");

// Abrir modal al hacer clic en el botón "Ver más / Comprar"
document.querySelectorAll(".btn-buy").forEach(btn => {
  btn.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = btn.dataset.img;
    modalTitle.textContent = btn.dataset.title;
    modalPrice.textContent = "Desde ₡3,900";
    document.getElementById("modalQty").value = 1;
  });
});

// Cerrar modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; }

// -------------------------
// COMPRAR AHORA → WhatsApp
// -------------------------
document.getElementById("btnBuyNow").addEventListener("click", () => {
  const size = document.getElementById("modalSize").value;
  const grind = document.getElementById("modalGrind").value;
  const qty = document.getElementById("modalQty").value;
  const product = modalTitle.textContent;

  const msg = `Hola, quiero comprar: ${qty} x ${product} ${size}g (${grind})`;
  window.open(`https://wa.me/50683910511?text=${encodeURIComponent(msg)}`, "_blank");
});

// -------------------------
// AGREGAR AL CARRITO
// -------------------------
document.getElementById("btnAddCart").addEventListener("click", () => {
  const size = document.getElementById("modalSize").value;
  const grind = document.getElementById("modalGrind").value;
  const qty = parseInt(document.getElementById("modalQty").value);
  const price = parseInt(document.getElementById("modalSize").selectedOptions[0].dataset.price);
  const product = modalTitle.textContent;

  const subtotal = price * qty;
  cart.push({ product, size, grind, qty, subtotal });
  renderCart();
  modal.style.display = "none";
});

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.subtotal;
    const li = document.createElement("li");
    li.textContent = `${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ₡${item.subtotal}`;
    cartList.appendChild(li);
  });
  cartTotal.textContent = `₡${total}`;
}

// -------------------------
// FINALIZAR COMPRA POR WHATSAPP
// -------------------------
document.getElementById("btnCheckout").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }
  let msg = "🛒 *Nuevo pedido NeoPrado Café*%0A";
  let total = 0;
  cart.forEach(item => {
    msg += `• ${item.qty} x ${item.product} ${item.size}g (${item.grind}) — ₡${item.subtotal}%0A`;
    total += item.subtotal;
  });
  msg += `%0ATotal: ₡${total}%0A`;
  msg += "Por favor confirmar disponibilidad.";
  window.open(`https://wa.me/50683910511?text=${msg}`, "_blank");
});

// -------------------------
// CARRUSEL DE PRODUCTOS (CON DRAG/SWIPE)
// -------------------------
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
