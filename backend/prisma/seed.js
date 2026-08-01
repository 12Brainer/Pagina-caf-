/**
 * Seed de SAN BERNARDO SPECIALTY COFFEE ESTATE
 * - Crea el administrador por defecto
 * - Crea los 3 cafés existentes con sus precios reales
 * Ejecutar: npm run seed  (desde backend/)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // ---------- ADMIN por defecto ----------
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sanbernardo.cr';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.admin.create({
      data: { nombre: 'Administrador', email: adminEmail, password: hash }
    });
    console.log(`✔ Admin creado: ${adminEmail} / ${adminPass}`);
  } else {
    console.log(`✔ Admin ya existente: ${adminEmail}`);
  }

  // ---------- PRODUCTOS (los 3 cafés actuales) ----------
  const products = [
    {
      name: 'Premium Honey',
      slug: 'premium-honey',
      shortDesc: 'Dulce intenso, miel de maple, cítrico y balanceado. Proceso honey.',
      description:
        'Nuestro café Premium Honey es un micro-lote de especialidad con proceso honey. ' +
        'Dulzor intenso a miel de maple, acidez cítrica brillante y un final balanceado ' +
        'y prolongado. Cultivado a 1,400 m.s.n.m en San Lorenzo, Tarrazú.',
      process: 'Honey',
      profile: 'Notas de miel de maple, acidez cítrica brillante y dulzor prolongado.',
      altitude: '1,400 m.s.n.m',
      variety: 'Venecia y Obata',
      roast: 'Medio',
      image: '/assets/honey.png',
      images: ['/assets/honey.png', '/assets/honey-finca.png', '/assets/honey-grano.png'],
      price250: 3900,
      price500: 7000,
      category: 'Café de especialidad',
      stock: 50,
      featured: true
    },
    {
      name: 'Café Lavado',
      slug: 'cafe-lavado',
      shortDesc: 'Sabor limpio, acidez brillante y cuerpo ligero. Proceso lavado.',
      description:
        'Café de proceso lavado (washed) con sabor limpio, acidez brillante y cuerpo ligero. ' +
        'Un perfil clásico de Tarrazú que resalta la pureza del grano. 100% arábica.',
      process: 'Lavado (Washed)',
      profile: 'Cuerpo ligero, acidez brillante y sabor limpio.',
      altitude: '1,400 m.s.n.m',
      variety: 'Venecia y Obata',
      roast: 'Medio',
      image: '/assets/lavado.png',
      images: ['/assets/lavado.png', '/assets/lavado-finca.png', '/assets/lavado-grano.png'],
      price250: 3900,
      price500: 7000,
      category: 'Café de especialidad',
      stock: 50,
      featured: true
    },
    {
      name: 'Café Natural',
      slug: 'cafe-natural',
      shortDesc: 'Dulzor frutal pronunciado, cuerpo medio-alto y acidez suave. Proceso natural.',
      description:
        'Café de proceso natural con dulzor frutal pronunciado, cuerpo medio-alto y acidez ' +
        'suave. Un perfil intenso y afrutado, ideal para quienes buscan experiencias nuevas.',
      process: 'Natural',
      profile: 'Cuerpo medio-alto, dulzor frutal pronunciado y acidez suave.',
      altitude: '1,400 m.s.n.m',
      variety: 'Venecia y Obata',
      roast: 'Medio',
      image: '/assets/natural 1.png',
      images: ['/assets/natural 1.png', '/assets/natural 2.png', '/assets/natural 3.png'],
      price250: 3900,
      price500: 7000,
      category: 'Café de especialidad',
      stock: 50,
      featured: true
    }
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({ data: p });
      console.log(`✔ Producto creado: ${p.name}`);
    } else {
      console.log(`✔ Producto ya existente: ${p.name}`);
    }
  }

  console.log('✔ Seed completado correctamente.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

