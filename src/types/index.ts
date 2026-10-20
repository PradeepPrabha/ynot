export type CategorySlug =
  | 'shirts'
  | 't-shirts'
  | 'jeans'
  | 'trousers'
  | 'jackets'
  | 'ethnic'
  | 'accessories';

export type ArtKind =
  | 'shirt' | 'tshirt' | 'polo' | 'jeans' | 'trousers' | 'jacket' | 'kurta' | 'nehru'
  | 'watch' | 'belt' | 'wallet' | 'cap' | 'sunglasses' | 'backpack' | 'socks'
  | 'fragrance' | 'sling' | 'keychain';

export type Pattern = 'solid' | 'check' | 'stripe' | 'print' | 'denim' | 'textured';
export type ImageView = 'front' | 'back' | 'detail' | 'styled';

export interface ProductColor { name: string; hex: string }

export interface ProductImage {
  view: ImageView;
  alt: string;
  /** When connected to Supabase Storage, set `src` to the public image URL. Without it, the built-in illustration renders. */
  src?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  subcategoryLabel: string;
  description: string;
  images: ProductImage[];
  price: number;
  compareAtPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: ProductColor[];
  fit: string;
  fabric: string;
  pattern: Pattern;
  art: ArtKind;
  stock: number;
  /** key: `${colorName}|${size}` */
  inventory: Record<string, number>;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
  care: string[];
  specs: Record<string, string>;
  /** Ratings, review counts and inventory in the sample catalog are demo data. */
  isDemoData: true;
}

export interface SubcategoryDef { slug: string; label: string; art: ArtKind; color: string; pattern?: Pattern }

export interface CategoryDef {
  slug: CategorySlug;
  label: string;
  tagline: string;
  headline: string;
  blurb: string;
  nav: string;
  sizes: string[];
  subcategories: SubcategoryDef[];
  art: ArtKind;
  tint: string;
  photo?: string;
}

export type SortKey = 'popularity' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'relevance';

export interface CartLine { productId: string; color: string; size: string; qty: number; selected: boolean }
export interface WishlistItem { productId: string; color?: string; size?: string; addedAt: string }

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
}
export interface SavedAddress extends Address { id: string }

export interface UserProfile { id: string; fullName: string; email: string; phone: string; createdAt: string }

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cod_due';
export type OrderStatus = 'pending_payment' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string; slug: string; title: string; color: string; colorHex: string; size: string;
  qty: number; unitPrice: number; mrp: number; art: ArtKind; pattern: Pattern; category: CategorySlug;
}
export interface Totals {
  mrpTotal: number; subtotal: number; productSavings: number; couponCode?: string;
  couponDiscount: number; shipping: number; total: number; itemCount: number; totalSavings: number;
}
export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  totals: Totals;
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  verifiedAt?: string;
  status: OrderStatus;
  estimatedDelivery: string;
  ownerId: string;
}
