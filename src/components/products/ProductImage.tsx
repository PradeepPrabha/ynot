import type { ImageView, Product } from '@/types';
import ProductArt from '@/components/art/ProductArt';
import { artVariant } from '@/data/catalog';
import { cn } from '@/utils/format';

interface Props { product: Product; color?: string; view?: ImageView; className?: string }

/** Renders a product image for the chosen colour. Uses `images[].src` when present (Supabase Storage), else the built-in illustration. */
export default function ProductImage({ product, color, view = 'front', className }: Props) {
  const hex = product.colors.find((c) => c.name === color)?.hex ?? product.colors[0].hex;
  const img = product.images.find((i) => i.view === view) ?? product.images[0];
  const alt = `${product.title} in ${color ?? product.colors[0].name}${view === 'front' ? '' : `, ${view} view`}`;
  if (img.src) return <img src={img.src} alt={alt} loading="lazy" className={cn('h-full w-full object-cover', className)} />;
  return <ProductArt art={product.art} color={hex} pattern={product.pattern} view={view} variant={artVariant(product)} label={alt} className={cn('h-full w-full', className)} />;
}
