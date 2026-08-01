import { Link } from 'react-router-dom';
import { formatCRC } from '../api/client';

export default function ProductCard({ product }) {
  return (
    <div className="card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/producto/${product.slug}`}>
        <div className="overflow-hidden bg-brand-beige2">
          <img
            src={product.image}
            alt={product.name}
            className="h-56 w-full object-contain p-4 transition duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-bold text-gray-900">{product.name}</h3>
        <p className="flex-1 text-sm text-gray-600">{product.shortDesc}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-bold text-brand-green">250g — {formatCRC(product.price250)}</p>
            <p className="font-bold text-brand-green">500g — {formatCRC(product.price500)}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Link
            to={`/producto/${product.slug}`}
            className="btn-outline !px-4 !py-2 text-xs"
          >
            Ver más
          </Link>
          <Link
            to={`/producto/${product.slug}`}
            className="btn-primary !px-4 !py-2 text-xs"
          >
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
}

