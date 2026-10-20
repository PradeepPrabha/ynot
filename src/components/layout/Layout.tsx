import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import CartDrawer from '@/components/cart/CartDrawer';
import { useUi } from '@/features/ui/UiContext';

export default function Layout() {
  const { pathname } = useLocation();
  const { setCartOpen, setSearchOpen, setNavOpen } = useUi();
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); setCartOpen(false); setSearchOpen(false); setNavOpen(false); }, [pathname, setCartOpen, setSearchOpen, setNavOpen]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-cocoa focus:px-4 focus:py-2 focus:text-ivory">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}
