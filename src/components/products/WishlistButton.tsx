import { Heart } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/format';

export default function WishlistButton({ productId, title, className, label = false }: { productId: string; title: string; className?: string; label?: boolean }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const on = has(productId);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); const added = toggle(productId); toast.success(added ? 'Saved to your wishlist.' : 'Removed from your wishlist.'); }}
      className={cn('inline-flex items-center justify-center gap-2 transition', label ? 'btn btn-outline' : 'h-9 w-9 rounded-full bg-ivory/90 shadow-soft hover:bg-ivory', className)}>
      <Heart className={cn('h-[18px] w-[18px]', on ? 'fill-coral text-coral' : 'text-ink')} aria-hidden />
      {label && <span>{on ? 'Wishlisted' : 'Add to wishlist'}</span>}
    </button>
  );
}
