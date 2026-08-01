# 🌱 SAN BERNARDO SPECIALTY COFFEE ESTATE – Tienda de Café de Especialidad

<p>Página web y <strong>tienda en línea completa</strong> para vender café de especialidad 100% arábica de Costa Rica.</p>

<p>🔧 <strong>Estado:</strong> Funcional — Frontend React + Vite / Backend Express + Prisma + MySQL</p>

---

## 🧱 Estructura del proyecto

```
Pagina-caf/
├── index.html              → Sitio actual (estático, se conserva intacto)
├── styles/                 → Páginas actuales (se conservan intactas)
│   ├── about.html, products.html, contacto.html, Pedidos.html, clientes.html, login.html, register.html
│   ├── style.css           → Identidad visual original
│   ├── nav.html            → Navegación dinámica
│   └── scripts/            → main.js, products.js, auth.js (funcionalidad original)
├── assets/                 → Imágenes originales (logo, cafés, finca, tienda)
├── src/                    → Google Apps Script (original, intacto)
├── server.js / db.js       → Backend original PostgreSQL (intacto)
│
├── backend/                → 🆕 Backend nuevo (Express + Prisma + MySQL + JWT)
│   ├── .env                → Configuración (base de datos, JWT, puerto)
│   ├── prisma/
│   │   ├── schema.prisma   → Modelos: Admin, Product, Customer, Order, OrderItem
│   │   └── seed.js         → Admin inicial + 3 cafés del catálogo
│   └── src/
│       ├── index.js        → Servidor Express
│       ├── lib/prisma.js   → Cliente Prisma
│       ├── middleware/     → auth (JWT) y upload (Multer)
│       └── routes/         → auth, products, orders, customers, dashboard, reports, upload
│
├── client/                 → 🆕 Frontend nuevo (React + Vite + Tailwind)
│   └── src/
│       ├── pages/          → Home, Shop, ProductDetail, Cart, Checkout, OrderTracking, OrderHistory, About, Contact
│       ├── pages/admin/    → Login, Dashboard, Productos, Pedidos, Clientes, Inventario, Reportes
│       ├── components/     → Navbar, Footer, ProductCard, Loader
│       ├── contexts/       → CartContext, AuthContext
│       └── api/client.js   → Cliente Axios + formato ₡
│
├── uploads/                → 🆕 Comprobantes SINPE subidos (se crea automáticamente)
└── TODO.md                 → Seguimiento del desarrollo
```

## ✅ Funcionalidades

- **Catálogo de productos** (desde base de datos MySQL)
- **Carrito de compras** (persistente en localStorage)
- **Checkout** con método de entrega (envío / retiro en tienda)
- **Pago por SINPE Móvil** con subida de comprobante (Multer)
- **Pago en efectivo**
- **Base de datos MySQL** con Prisma ORM
- **Backend Node.js + Express**
- **Panel administrativo** con autenticación JWT
- **Gestión de productos, pedidos y clientes**
- **Control de inventario** (descuento automático al crear pedidos)
- **Dashboard con estadísticas** (ventas, pedidos, productos más vendidos)
- **Reportes de ventas** (por rango de fechas)
- **Seguimiento de pedidos** por teléfono
- **Historial de compras** por correo
- **Diseño responsive** (computadora, tablet y celular)
- **Optimización de velocidad y SEO** (Vite build + meta tags + lazy loading de imágenes)

## 🚀 Cómo ejecutar desde Visual Studio Code

### Requisitos previos

1. **Node.js 18+** (recomendado 20/22) → https://nodejs.org
2. **MySQL** instalado y corriendo en `localhost:3306`
   - Si usas XAMPP: activa **MySQL** en el panel de control.
3. Crear la base de datos (en MySQL):
   ```sql
   CREATE DATABASE IF NOT EXISTS san_bernardo;
   ```

### Paso 1 — Configurar la base de datos

Abre el archivo `backend/.env` y ajusta la línea `DATABASE_URL` con tus credenciales de MySQL:

```
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@localhost:3306/san_bernardo"
```

Ejemplos:
- XAMPP por defecto: `mysql://root:@localhost:3306/san_bernardo`
- MySQL con contraseña: `mysql://root:TU_PASSWORD@localhost:3306/san_bernardo`

### Paso 2 — Instalar dependencias del backend

Abre una terminal nueva en VS Code (`Terminal → New Terminal`) y ejecuta:

```powershell
cd backend
npm install
```

### Paso 3 — Crear las tablas y cargar datos iniciales

```powershell
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

Esto crea las tablas y carga:
- Admin por defecto: `admin@sanbernardo.cr` / `admin123`
- Los 3 cafés: Premium Honey, Café Lavado y Café Natural

> Puedes cambiar el admin editando `backend/.env` con `ADMIN_EMAIL` y `ADMIN_PASSWORD`, o directamente en `backend/prisma/seed.js`.

### Paso 4 — Instalar dependencias del frontend

```powershell
cd client
npm install
```

### Paso 5 — Ejecutar backend y frontend (2 terminales)

**Terminal 1 — Backend (puerto 4000):**
```powershell
cd backend
npm run dev
```
Deberías ver: `✔ Servidor SAN BERNARDO en http://localhost:4000`

**Terminal 2 — Frontend (puerto 5173):**
```powershell
cd client
npm run dev
```
Abre en tu navegador: **http://localhost:5173**

---

### 🛠 Panel administrativo

1. Ve a **http://localhost:5173/admin**
2. Inicia sesión con:
   - **Email:** `admin@sanbernardo.cr`
   - **Contraseña:** `admin123`

### 🧪 Modo producción (opcional)

Compila el frontend y deja que el backend lo sirva:

```powershell
cd client
npm run build
```

Luego, con el backend corriendo, abre **http://localhost:4000** — el backend sirve el frontend compilado.

---

## 📦 Datos de negocio (configuración)

| Concepto | Valor |
|---|---|
| Precio 250 g | ₡3,900 |
| Precio 500 g | ₡7,000 |
| Envío | ₡3,000 |
| Envío gratis | Pedidos ≥ ₡30,000 |
| WhatsApp | +506 8391-0511 |
| SINPE Móvil | +506 8391-0511 |
| Correo | fatucafe75@gmail.com |
| Tienda | Tienda El Prado, San Lorenzo, Tarrazú |

---

## 🔐 Notas de seguridad

- Las credenciales se leen de `backend/.env` (no se sube a Git).
- El panel admin usa **JWT** con expiración de 12 horas.
- Las contraseñas se guardan con **bcrypt**.
- Los comprobantes SINPE se guardan en `backend/uploads/` (se puede cambiar en `.env`).
- CORS está limitado a los orígenes definidos en `CORS_ORIGINS`.

## 📄 Licencia / Créditos

© 2025 SAN BERNARDO SPECIALTY COFFEE ESTATE · Hecho en Zona de los Santos, Costa Rica

