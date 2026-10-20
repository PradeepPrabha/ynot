import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import RequireAuth from './RequireAuth';

const Home = lazy(() => import('@/pages/Home'));
const Listing = lazy(() => import('@/pages/Listing'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Forgot = lazy(() => import('@/pages/auth/ForgotPassword'));
const Account = lazy(() => import('@/pages/account/Account'));
const Orders = lazy(() => import('@/pages/account/Orders'));
const OrderDetail = lazy(() => import('@/pages/account/OrderDetail'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const InfoPage = lazy(() => import('@/pages/InfoPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen inline />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Listing mode="all" />} />
          <Route path="category/:slug" element={<Listing mode="category" />} />
          <Route path="search" element={<Listing mode="search" />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<Forgot />} />
          <Route element={<RequireAuth />}><Route path="account" element={<Account />} /></Route>
          <Route path="account/orders" element={<Orders />} />
          <Route path="account/orders/:id" element={<OrderDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="pages/:slug" element={<InfoPage />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
