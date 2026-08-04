# 🛠️ GUÍA DE CONFIGURACIÓN — Pedidos + Panel Admin con Google Sheets / Apps Script / Drive

Esta guía explica cómo conectar el nuevo **Finalizar Compra** (con comprobante SINPE)
y el **Panel de Administración** a Google, **sin Firebase, Supabase ni servicios de pago**.

---

## 📦 Requisitos

- Una cuenta de **Google** (Gmail).
- Acceso a **Google Sheets**, **Google Drive** y **Google Apps Script**.
- El proyecto ya tiene los archivos en `src/` (Code.gs) y `styles/` (frontend).

---

## 1️⃣ Crear la hoja de Google Sheets (base de datos)

1. Ve a **sheets.new** → crea una hoja nueva.
2. Nómbrala, por ejemplo: **`SanBernardo-Pedidos`**.
3. En la URL verás algo así:
   ```
   https://docs.google.com/spreadsheets/d/<AQUI_VA_EL_ID>/edit
   ```
   Copia el `<AQUI_VA_EL_ID>` (es la parte larga entre `/d/` y `/edit`).

### Hojas que DEBE contener el libro (con encabezados en la fila 1)

**Hoja `Pedidos`** (columnas):
```
ID Pedido | Fecha | Nombre | Apellidos | WhatsApp | Correo | Método de entrega | Dirección | Método de pago | Productos (JSON) | Cantidades | Peso seleccionado | Proceso/Molienda | Precio unitario | Subtotal | Envío | Total | Estado | URL comprobante | Nombre comprobante
```

**Hoja `Clientes`** (columnas):
```
Nombre | WhatsApp | Correo | Número de pedidos | Total comprado | Última compra
```

**Hoja `Control`** (columnas):
```
Clave | Valor
```
(Esta hoja guarda el contador de pedidos. La primera vez agrega una fila: `contadorPedidos | 1`)

**Hoja `Credenciales`** (columnas):
```
Usuario | PasswordHash | Nombre | Rol | Creado
```

> El backend (`Code.gs`) crea automáticamente estas hojas con sus encabezados si no existen.

---

## 2️⃣ Configurar el backend de Google Apps Script

1. Ve a **script.google.com** → **Nuevo proyecto**.
2. Reemplaza el contenido por el de **`src/Code.gs`**.
3. En el editor, en la parte superior:
   - **Editor → Servicios** (o `+` junto a "Servicios"): agrega **DriveApp** (Drive API).
   - **SpreadsheetApp** y **LockService** ya están incluidos.
4. En `Code.gs`, edita la constante `CONFIG.SPREADSHEET_ID` con el ID que copiaste en el paso 1.
5. (Opcional) Cambia `CONFIG.ADMIN_SECRET` por una clave aleatoria larga.

---

## 3️⃣ Crear la carpeta de Google Drive para comprobantes

1. Ve a **drive.google.com** → **Nueva → Carpeta**.
2. Nómbrala exactamente: **`Comprobantes SINPE`** (tal cual, con espacio).
3. Si ya existe o se crea automáticamente, no hay problema: el backend la busca por nombre y la crea si no existe.

> Los comprobantes SINPE se suben a esta carpeta y se comparten con el enlace "Cualquier persona con el enlace".

---

## 4️⃣ Configurar el administrador (credenciales)

Las credenciales **nunca** van en el HTML/JS. Se guardan únicamente en la hoja `Credenciales` con **hash SHA-256**.

1. En la hoja `Credenciales`, con encabezados en la fila 1, agrega una fila:
   - **Usuario:** `tuAdmin`
   - **PasswordHash:** el hash SHA-256 de tu contraseña
   - **Nombre:** `Nombre del Administrador`
   - **Rol:** `Administrador`
   - **Creado:** `01/01/2025`

2. Para obtener el hash SHA-256 de tu contraseña (ej. `Admin123!`):
   - Abre el editor de Apps Script y ejecuta una vez en la consola:
     ```js
     function generarHash() {
       const hash = sha256('Admin123!'); // cambia la contraseña
       Logger.log(hash);
     }
     ```
   - Copia el valor que aparece en "Registros" (View → Logs).
   - O usa cualquier calculadora SHA-256 online (resultado en texto plano / hex).

> ⚠️ **Nunca** escribas la contraseña en texto plano en el código. Solo el hash va en la hoja.

---

## 5️⃣ Desplegar el Web App

1. En el editor de Apps Script, clic en **Implementar → Nueva implementación**.
2. Selecciona tipo: **Aplicación web**.
3. Configura:
   - **Descripción:** `Checkout SAN BERNARDO`
   - **Ejecutar como:** `Yo` (tu cuenta)
   - **Quién tiene acceso:** `Cualquier persona`
4. Clic en **Implementar** y autoriza los permisos.
5. Copia la **URL de la aplicación web** (termina en `/exec`).

---

## 6️⃣ Conectar el frontend con Google Sheets

Abre **`styles/scripts/checkout-config.js`** y pega la URL del Web App:

```js
GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycb...VUw/exec',
```

También configura ahí:
- **SINPE**: número y titular.
- **WHATSAPP**: número de la tienda.
- **ENVIO**: costo y envío gratis.

---

## 7️⃣ Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. En **Branch**, selecciona `main` (o `master`) y carpeta `/root`.
4. Guarda. La página quedará en `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

> ⚠️ En GitHub Pages el dominio cambia. Asegúrate de que las rutas de los scripts
> (`styles/scripts/...`) y las imágenes (`../assets/...`) sean relativas (ya son relativas).

---

## ✅ Resumen de archivos

| Archivo | Función |
|---|---|
| `styles/Pedidos.html` | Página de Finalizar Compra + Panel Admin |
| `styles/checkout.css` | Estilos premium (Shopify) |
| `styles/scripts/checkout-config.js` | Configuración (endpoint, SINPE, WhatsApp, envío) |
| `styles/scripts/checkout.js` | Lógica del checkout y panel admin |
| `src/Code.gs` | Backend Google Apps Script (pedidos, Drive, clientes, admin) |
| `src/Code.js` | Stub de compatibilidad (no tocar) |
| `src/appsscript.json` | Configuración del proyecto Apps Script |

---

## 🔐 Estados de pedido (automáticos)

| Estado | Descripción |
|---|---|
| Pago por verificar | Estado inicial al crear el pedido |
| Pago aprobado | Admin aprueba el pago |
| Preparando pedido | Se está preparando |
| Enviado | En camino (envío) |
| Listo para retirar | Listo para recoger en tienda |
| Entregado | Pedido entregado |
| Cancelado | Pedido cancelado |

---

## ❓ Preguntas frecuentes

**¿Funciona sin conexión a Google?**
No. El checkout necesita el Web App de Apps Script para guardar el pedido y subir el comprobante.

**¿Puedo usar otro método de pago?**
Sí, se puede agregar a `Code.gs` y al frontend. Solo SINPE y Efectivo están implementados.

**¿El comprobante se guarda en Drive?**
Sí, solo si el método es SINPE Móvil. Se sube a la carpeta `Comprobantes SINPE` y su enlace se guarda en la hoja `Pedidos`.

**¿Dónde están las credenciales del admin?**
Solo en la hoja `Credenciales` con hash SHA-256. Nunca en el código del frontend.
