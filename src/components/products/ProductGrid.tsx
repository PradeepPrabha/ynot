import type { Product } from '@/types';
import { cn } from '@/utils/format';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, layout = 'grid', dense }: { products: Product[]; layout?: 'grid' | 'list'; dense?: boolean }) {
  if (layout === 'list') return <div className="space-y-4">{products.map((p) => <ProductCard key={p.id} product={p} layout="list" />)}</div>;
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4', dense ? 'lg:grid-cols-4 xl:grid-cols-5' : 'xl:grid-cols-4 2xl:grid-cols-5')}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
