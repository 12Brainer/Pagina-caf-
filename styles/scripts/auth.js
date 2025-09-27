// Configura aquí tu endpoint de Google Apps Script Web App desplegado
// Debe manejar dos acciones: register y login, y escribir/leer de la hoja "Usuarios"
// La hoja debe tener columnas: Nombre | Apellido | Correo | Teléfono | Dirección | Contraseña (encriptada)
const GAS_ENDPOINT = 'REEMPLAZA_CON_TU_URL_WEB_APP';

// Utilidad: hash de contraseña (SHA-256) en el cliente antes de enviar
async function hashPassword(plain) {
  const enc = new TextEncoder();
  const data = enc.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function setSession(user){
  try {
    localStorage.setItem('session', JSON.stringify({ nombre: user.nombre, correo: user.correo }));
  } catch {}
}
function getSession(){
  try { return JSON.parse(localStorage.getItem('session')||'null'); } catch { return null; }
}
function clearSession(){
  try { localStorage.removeItem('session'); } catch {}
}

async function handleRegister(e){
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const msg = document.getElementById('registerMsg');
  if (msg) msg.textContent = '';
  btn && (btn.disabled = true);

  const nombre = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const telefono = document.getElementById('regTelefono').value.trim();
  const direccion = document.getElementById('regDireccion').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!GAS_ENDPOINT || GAS_ENDPOINT.startsWith('REEMPLAZA_')){
    alert('Configura la URL de Google Apps Script (GAS_ENDPOINT) en scripts/auth.js');
    btn && (btn.disabled = false);
    return;
  }

  try{
    const passwordHash = await hashPassword(password);
    const res = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', nombre, apellido, correo, telefono, direccion, password: passwordHash })
    });
    const data = await res.json();
    if (data && data.success){
      if (msg) msg.textContent = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
      e.target.reset();
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
    } else {
      const err = (data && data.message) || 'No se pudo crear la cuenta';
      if (msg) msg.textContent = err;
    }
  } catch(err){
    if (msg) msg.textContent = 'Error de red o servidor. Intenta nuevamente.';
  } finally {
    btn && (btn.disabled = false);
  }
}

async function handleLogin(e){
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const msg = document.getElementById('loginMsg');
  if (msg) msg.textContent = '';
  btn && (btn.disabled = true);

  const correo = document.getElementById('loginCorreo').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!GAS_ENDPOINT || GAS_ENDPOINT.startsWith('REEMPLAZA_')){
    alert('Configura la URL de Google Apps Script (GAS_ENDPOINT) en scripts/auth.js');
    btn && (btn.disabled = false);
    return;
  }

  try{
    const passwordHash = await hashPassword(password);
    const res = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', correo, password: passwordHash })
    });
    const data = await res.json();
    if (data && data.success && data.user){
      setSession({ nombre: data.user.nombre, correo: data.user.correo });
      if (msg) msg.textContent = 'Inicio de sesión correcto. Redirigiendo...';
      setTimeout(() => { window.location.href = '../index.html'; }, 600);
    } else {
      const err = (data && data.message) || 'Credenciales inválidas';
      if (msg) msg.textContent = err;
    }
  } catch(err){
    if (msg) msg.textContent = 'Error de red o servidor. Intenta nuevamente.';
  } finally {
    btn && (btn.disabled = false);
  }
}

function applySessionToHeader(){
  // Este método se ejecuta después de que el nav se inyecta por main.js
  const session = getSession();
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const headerNav = nav.querySelector('.header-nav ul');
  const mobileNav = nav.querySelector('.mobile-nav ul');
  if (!headerNav) return;

  // Calcular rutas correctas según página actual
  const path = window.location.pathname || '';
  const isIndex = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('/Pagina-caf-/');
  const base = isIndex ? 'styles/' : '';
  const loginHref = `${base}login.html`;
  const registerHref = `${base}register.html`;

  // Limpiar bloques anteriores
  headerNav.querySelectorAll('.auth-item').forEach(li => li.remove());
  mobileNav && mobileNav.querySelectorAll('.auth-item').forEach(li => li.remove());

  // Desktop
  const li = document.createElement('li');
  li.className = 'auth-item';
  if (!session){
    li.innerHTML = `<a href="${loginHref}">Iniciar sesión</a> / <a href="${registerHref}">Crear cuenta</a>`;
  } else {
    li.innerHTML = `<span>Bienvenido ${session.nombre}</span> <button id="btnLogout" class="btn btn-ghost" style="margin-left:.5rem;">Cerrar sesión</button>`;
  }
  headerNav.appendChild(li);

  // Mobile
  if (mobileNav){
    const mli = document.createElement('li');
    mli.className = 'auth-item';
    if (!session){
      mli.innerHTML = `<a href="${loginHref}">Iniciar sesión</a> / <a href="${registerHref}">Crear cuenta</a>`;
    } else {
      mli.innerHTML = `<span>Bienvenido ${session.nombre}</span> <button id="btnLogoutMobile" class="btn btn-ghost" style="margin-left:.5rem;">Cerrar sesión</button>`;
    }
    mobileNav.appendChild(mli);
  }

  // Eventos de logout (desktop y móvil)
  const btnLogout = nav.querySelector('#btnLogout');
  const btnLogoutMobile = nav.querySelector('#btnLogoutMobile');
  function doLogout(){ clearSession(); window.location.reload(); }
  if (btnLogout) btnLogout.addEventListener('click', doLogout);
  if (btnLogoutMobile) btnLogoutMobile.addEventListener('click', doLogout);
}

// Inicializar listeners de formularios
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('registerForm');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
});

// Integración con el header (main.js inyecta nav y luego podemos modificarlo)
(function waitForNav(){
  const nav = document.getElementById('main-nav');
  if (nav && nav.children.length > 0){
    applySessionToHeader();
  } else {
    setTimeout(waitForNav, 120);
  }
})();
