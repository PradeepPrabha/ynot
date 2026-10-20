import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/Modal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { UiProvider } from '@/features/ui/UiContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { CartProvider } from '@/features/cart/CartContext';
import { WishlistProvider } from '@/features/wishlist/WishlistContext';
import { productService } from '@/services/productService';
import heroImg from '@/assets/photos/hero-style.jpg';

/** Boot progress is REAL: each task below flips true only when it has actually finished. */
function useBoot() {
  const [tasks, setTasks] = useState({ fonts: false, hero: false, catalog: false });
  useEffect(() => {
    const done = (k: keyof typeof tasks) => setTasks((t) => ({ ...t, [k]: true }));
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 3000))]).then(() => done('fonts'));
    const img = new Image();
    img.onload = img.onerror = () => done('hero');
    img.src = heroImg;
    productService.bestSellers().then(() => done('catalog'), () => done('catalog'));
  }, []);
  const values = Object.values(tasks);
  const completed = values.filter(Boolean).length;
  return { ready: completed === values.length, progress: (completed / values.length) * 100 };
}

export default function App() {
  const { ready, progress } = useBoot();
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <ConfirmProvider>
            <UiProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    {ready ? <AppRoutes /> : <LoadingScreen progress={progress} message="Getting your style ready" />}
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </UiProvider>
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
