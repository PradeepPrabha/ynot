import type { CategoryDef, CategorySlug } from '@/types';
import shirtsBanner from '@/assets/photos/banner-shirts.jpg';
import tshirtsBanner from '@/assets/photos/banner-tshirts.jpg';
import jeansBanner from '@/assets/photos/banner-jeans.jpg';
import trousersBanner from '@/assets/photos/banner-trousers.jpg';
import jacketsBanner from '@/assets/photos/banner-jackets.jpg';

const TOP = ['S', 'M', 'L', 'XL', 'XXL'];
const WAIST = ['28', '30', '32', '34', '36', '38'];

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'shirts', label: 'Shirts', nav: 'Shirts', art: 'shirt', tint: '#E8E0D0', photo: shirtsBanner, sizes: [...TOP, '3XL'],
    headline: 'Shirts', tagline: 'Classic to contemporary. Shirts for every you.',
    blurb: 'Casual, formal, linen and printed shirts cut to sit right from the first wear.',
    subcategories: [
      { slug: 'casual', label: 'Casual Shirts', art: 'shirt', color: '#4b5a35' },
      { slug: 'formal', label: 'Formal Shirts', art: 'shirt', color: '#9fbbe0' },
      { slug: 'linen', label: 'Linen Shirts', art: 'shirt', color: '#cdb895' },
      { slug: 'denim', label: 'Denim Shirts', art: 'shirt', color: '#2e4a7d', pattern: 'denim' },
      { slug: 'printed', label: 'Printed Shirts', art: 'shirt', color: '#f1e6d2', pattern: 'print' },
      { slug: 'check', label: 'Check Shirts', art: 'shirt', color: '#a8322d', pattern: 'check' },
      { slug: 'solid', label: 'Solid Shirts', art: 'shirt', color: '#1b1a17' },
    ],
  },
  {
    slug: 't-shirts', label: 'T-Shirts', nav: 'T-Shirts', art: 'tshirt', tint: '#E9DDCC', photo: tshirtsBanner, sizes: [...TOP, '3XL'],
    headline: 'T-Shirts', tagline: 'Everyday comfort for a bolder you.',
    blurb: 'Soft combed cotton crews, polos and oversized fits for every day of the week.',
    subcategories: [
      { slug: 'crew-neck', label: 'Crew Neck', art: 'tshirt', color: '#f6f2ea' },
      { slug: 'polo', label: 'Polos', art: 'polo', color: '#1f2f4d' },
      { slug: 'oversized', label: 'Oversized', art: 'tshirt', color: '#cdb895' },
      { slug: 'graphic', label: 'Graphic Tees', art: 'tshirt', color: '#1b1a17' },
      { slug: 'henley', label: 'Henley', art: 'tshirt', color: '#4b5a35' },
      { slug: 'striped', label: 'Striped', art: 'tshirt', color: '#1f2f4d', pattern: 'stripe' },
    ],
  },
  {
    slug: 'jeans', label: 'Jeans', nav: 'Jeans', art: 'jeans', tint: '#E6E0D4', photo: jeansBanner, sizes: WAIST,
    headline: 'Jeans', tagline: 'Every move. More style. Jeans for every you.',
    blurb: 'Stretch denim in washes that age well, from sharp slim fits to easy relaxed cuts.',
    subcategories: [
      { slug: 'slim', label: 'Slim Fit', art: 'jeans', color: '#25365a', pattern: 'denim' },
      { slug: 'straight', label: 'Straight Fit', art: 'jeans', color: '#4f78ad', pattern: 'denim' },
      { slug: 'tapered', label: 'Tapered', art: 'jeans', color: '#1b1a17', pattern: 'denim' },
      { slug: 'relaxed', label: 'Relaxed Fit', art: 'jeans', color: '#8fb0d6', pattern: 'denim' },
      { slug: 'bootcut', label: 'Bootcut', art: 'jeans', color: '#2e4a7d', pattern: 'denim' },
    ],
  },
  {
    slug: 'trousers', label: 'Trousers', nav: 'Trousers', art: 'trousers', tint: '#E8DFCF', photo: trousersBanner, sizes: WAIST,
    headline: 'Trousers', tagline: 'Tailored for every moment. Trousers for every you.',
    blurb: 'Formal trousers, chinos, cargos and joggers with clean lines and all-day comfort.',
    subcategories: [
      { slug: 'formal', label: 'Formal Trousers', art: 'trousers', color: '#3a3a3c' },
      { slug: 'chinos', label: 'Chinos', art: 'trousers', color: '#b8a47a' },
      { slug: 'cargo', label: 'Cargo', art: 'trousers', color: '#4b5a35' },
      { slug: 'linen', label: 'Linen Trousers', art: 'trousers', color: '#eadfc8', pattern: 'textured' },
      { slug: 'pleated', label: 'Pleated', art: 'trousers', color: '#1f2f4d' },
      { slug: 'joggers', label: 'Joggers', art: 'trousers', color: '#9a9a98' },
    ],
  },
  {
    slug: 'jackets', label: 'Jackets', nav: 'Jackets', art: 'jacket', tint: '#E5DACA', photo: jacketsBanner, sizes: TOP,
    headline: 'Jackets', tagline: 'Layer your style. Jackets for every you.',
    blurb: 'Bombers, denim and utility jackets, quilted layers and blazers to top off any look.',
    subcategories: [
      { slug: 'bomber', label: 'Bomber', art: 'jacket', color: '#2f4a33' },
      { slug: 'denim', label: 'Denim Jackets', art: 'jacket', color: '#2e4a7d', pattern: 'denim' },
      { slug: 'utility', label: 'Utility', art: 'jacket', color: '#7a4a28' },
      { slug: 'faux-leather', label: 'Faux Leather', art: 'jacket', color: '#1b1a17' },
      { slug: 'quilted', label: 'Quilted', art: 'jacket', color: '#1f2f4d' },
      { slug: 'blazer', label: 'Blazers', art: 'jacket', color: '#3a3a3c' },
    ],
  },
  {
    slug: 'ethnic', label: 'Ethnic Wear', nav: 'Ethnic', art: 'kurta', tint: '#EADFD0', sizes: TOP,
    headline: 'Ethnic Wear', tagline: 'Rooted in tradition. Made for today.',
    blurb: 'Kurtas, kurta sets and Nehru jackets in breathable cotton, linen and silk blends.',
    subcategories: [
      { slug: 'kurtas', label: 'Kurtas', art: 'kurta', color: '#e3b2b5' },
      { slug: 'kurta-sets', label: 'Kurta Sets', art: 'kurta', color: '#eadfc8' },
      { slug: 'nehru-jackets', label: 'Nehru Jackets', art: 'nehru', color: '#1f2f4d' },
      { slug: 'festive', label: 'Festive Wear', art: 'kurta', color: '#5b1b2f' },
    ],
  },
  {
    slug: 'accessories', label: 'Accessories', nav: 'Accessories', art: 'watch', tint: '#E9DCC8', sizes: ['One Size'],
    headline: 'Accessories', tagline: 'The details make the difference.',
    blurb: 'Watches, belts, wallets, caps, sunglasses and bags that finish the outfit.',
    subcategories: [
      { slug: 'watches', label: 'Watches', art: 'watch', color: '#1b1a17' },
      { slug: 'belts', label: 'Belts', art: 'belt', color: '#6b4226' },
      { slug: 'wallets', label: 'Wallets', art: 'wallet', color: '#422817' },
      { slug: 'caps', label: 'Caps', art: 'cap', color: '#1f2f4d' },
      { slug: 'sunglasses', label: 'Sunglasses', art: 'sunglasses', color: '#1b1a17' },
      { slug: 'backpacks', label: 'Backpacks', art: 'backpack', color: '#3a3a3c' },
      { slug: 'socks', label: 'Socks', art: 'socks', color: '#9a9a98' },
      { slug: 'fragrance', label: 'Fragrance', art: 'fragrance', color: '#2f6f6d' },
      { slug: 'sling-bags', label: 'Sling Bags', art: 'sling', color: '#7a4a28' },
      { slug: 'keychains', label: 'Keychains', art: 'keychain', color: '#6b4226' },
    ],
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<CategorySlug, CategoryDef>;
export const isCategorySlug = (s: string | undefined): s is CategorySlug => !!s && s in CATEGORY_MAP;

/** Which filter groups each category listing shows. */
export type FilterGroup = 'category' | 'subcategory' | 'size' | 'color' | 'fit' | 'pattern' | 'fabric' | 'price' | 'brand' | 'discount' | 'availability';
export const CATEGORY_FILTERS: Record<CategorySlug | 'all', FilterGroup[]> = {
  all: ['category', 'size', 'color', 'fit', 'fabric', 'brand', 'price', 'discount', 'availability'],
  shirts: ['subcategory', 'size', 'color', 'fit', 'pattern', 'fabric', 'brand', 'price', 'discount', 'availability'],
  't-shirts': ['subcategory', 'size', 'color', 'fit', 'pattern', 'fabric', 'brand', 'price', 'discount', 'availability'],
  jeans: ['subcategory', 'size', 'color', 'fit', 'fabric', 'brand', 'price', 'discount', 'availability'],
  trousers: ['subcategory', 'size', 'color', 'fit', 'fabric', 'brand', 'price', 'discount', 'availability'],
  jackets: ['subcategory', 'size', 'color', 'fit', 'fabric', 'brand', 'price', 'discount', 'availability'],
  ethnic: ['subcategory', 'size', 'color', 'fabric', 'pattern', 'brand', 'price', 'discount', 'availability'],
  accessories: ['subcategory', 'color', 'brand', 'price', 'discount', 'availability'],
};
