// Inserta productos de ejemplo (ficticios). Es idempotente: no duplica. Uso: npm run seed
const db = require('../src/config/db');
const productosRepo = require('../src/repositories/productos.repo');

const productos = [
  { nombre: 'Laptop Andina 14"', descripcion: 'Portátil ligero de 14 pulgadas, 16 GB de RAM y SSD de 512 GB.', categoria: 'Electrónica', precio: 749.9 },
  { nombre: 'Auriculares Brisa BT', descripcion: 'Auriculares inalámbricos con cancelación de ruido y 30 h de batería.', categoria: 'Electrónica', precio: 89.5 },
  { nombre: 'Teclado Mecánico Volcán', descripcion: 'Teclado mecánico compacto con retroiluminación y switches rojos.', categoria: 'Electrónica', precio: 64.99 },
  { nombre: 'Silla Ergonómica Pacífico', descripcion: 'Silla de oficina con soporte lumbar y altura regulable.', categoria: 'Hogar', precio: 189 },
  { nombre: 'Lámpara de Escritorio Luna', descripcion: 'Lámpara LED regulable con tres tonos de luz y puerto USB.', categoria: 'Hogar', precio: 29.75 },
  { nombre: 'Mochila Cóndor 25L', descripcion: 'Mochila resistente al agua con compartimento para portátil.', categoria: 'Accesorios', precio: 45 },
  { nombre: 'Botella Térmica Galápagos', descripcion: 'Botella de acero inoxidable de 750 ml que mantiene el frío 24 h.', categoria: 'Accesorios', precio: 19.9 },
  { nombre: 'Cuaderno Cacao A5', descripcion: 'Cuaderno de tapa dura con 200 hojas rayadas de papel reciclado.', categoria: 'Papelería', precio: 6.5 },
];

let nuevos = 0;
for (const p of productos) {
  if (!productosRepo.existePorNombre(p.nombre)) {
    productosRepo.crear(p);
    nuevos += 1;
  }
}
console.log(`Productos insertados: ${nuevos} (de ${productos.length} de ejemplo).`);
db.close();
