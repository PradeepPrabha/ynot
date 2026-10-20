import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Logo } from '@/components/ui/Primitives';
import { Drawer } from '@/components/ui/Modal';
import { useCart } from '@/features/cart/CartContext';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useUi } from '@/features/ui/UiContext';
import { NAV } from '@/data/site';
import { cn } from '@/utils/format';

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cocoa px-1 text-[10px] font-bold text-ivory" aria-hidden>{n > 99 ? '99+' : n}</span>;
}

export default function Header() {
  const { count } = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const { setCartOpen, setSearchOpen, navOpen, setNavOpen } = useUi();
  const loc = useLocation();
  const isActive = (to: string) => { const [path, query] = to.split('?'); return loc.pathname === path && (!query || loc.search.includes(query.split('&')[0])); };
  const iconBtn = 'relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-beige/60';

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-ivory/95 backdrop-blur">
      <div className="container-page flex h-[68px] items-center gap-3 lg:h-[76px] lg:gap-8">
        <button className={cn(iconBtn, 'lg:hidden -ml-2')} onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <Logo className="shrink-0" />
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-4 xl:gap-6 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.label} to={n.to} className={cn('relative whitespace-nowrap py-2 text-[14px] font-semibold transition hover:text-brown', n.sale ? 'text-[#c2491d]' : 'text-ink', isActive(n.to) && 'after:absolute after:inset-x-0 after:-bottom-[1px] after:h-0.5 after:bg-brown')} aria-current={isActive(n.to) ? 'page' : undefined}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button onClick={() => setSearchOpen(true)} aria-label="Search products" className="hidden h-11 w-56 items-center gap-2.5 whitespace-nowrap rounded-lg bg-beige/50 px-3.5 text-left text-sm text-ink/55 transition hover:bg-beige 2xl:flex">
            <Search className="h-4 w-4" aria-hidden />Search for shirts, jeans…
          </button>
          <button onClick={() => setSearchOpen(true)} aria-label="Search products" className={cn(iconBtn, '2xl:hidden')}><Search className="h-[22px] w-[22px]" /></button>
          <Link to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Log in'} className={iconBtn}><User className="h-[22px] w-[22px]" /></Link>
          <Link to="/wishlist" aria-label={`Wishlist, ${wish.count} items`} className={cn(iconBtn, 'hidden sm:flex')}><Heart className="h-[22px] w-[22px]" /><Badge n={wish.count} /></Link>
          <button onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`} className={iconBtn}><ShoppingBag className="h-[22px] w-[22px]" /><Badge n={count} /></button>
        </div>
      </div>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title="Menu" side="left" width="max-w-xs">
        <nav aria-label="Mobile" className="p-3">
          <ul>
            {NAV.map((n) => <li key={n.label}><Link to={n.to} onClick={() => setNavOpen(false)} className={cn('flex items-center justify-between rounded-lg px-3 py-3.5 text-[15px] font-semibold hover:bg-beige/50', n.sale && 'text-[#c2491d]')}>{n.label}</Link></li>)}
          </ul>
          <div className="my-3 border-t border-[var(--border)]" />
          <ul className="text-sm">
            {[{ l: user ? 'My account' : 'Log in / Sign up', t: user ? '/account' : '/login' }, { l: `Wishlist (${wish.count})`, t: '/wishlist' }, { l: 'Track order', t: '/account/orders' }, { l: 'Store locator', t: '/pages/store-locator' }, { l: 'Help & FAQs', t: '/pages/faqs' }].map((i) => <li key={i.t}><Link to={i.t} onClick={() => setNavOpen(false)} className="block rounded-lg px-3 py-3 hover:bg-beige/50">{i.l}</Link></li>)}
          </ul>
        </nav>
      </Drawer>
    </header>
  );
}
