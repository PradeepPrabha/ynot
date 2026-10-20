import type { ArtKind, CategorySlug, Pattern, Product, ProductColor, ProductImage } from '@/types';
import { CATEGORIES, CATEGORY_MAP } from './categories';
import { hash, seeded } from '@/utils/hash';
import { slugify } from '@/utils/format';

const COLORS: Record<string, string> = {
  Black: '#1b1a17', White: '#f6f2ea', Navy: '#1f2f4d', Olive: '#4b5a35', 'Sky Blue': '#9fbbe0', Maroon: '#6d1f2b', Beige: '#cdb895',
  Brown: '#6b4226', Pink: '#e3b2b5', Grey: '#9a9a98', Charcoal: '#3a3a3c', Indigo: '#2e4a7d', Mustard: '#c79a2d', Rust: '#a24b2a',
  Tan: '#b98b5a', Khaki: '#b8a47a', Cream: '#eadfc8', Stone: '#c8c0b0', Teal: '#2f6f6d', Sage: '#9aa88a', Wine: '#5b1b2f', Blue: '#3f6fb0',
  'Light Wash': '#8fb0d6', 'Mid Wash': '#4f78ad', 'Dark Wash': '#25365a', Red: '#a8322d', Gold: '#c39a61', Silver: '#c0c2c4',
  Tobacco: '#7a4a28', Forest: '#2f4a33', Peach: '#e8b79a', Lavender: '#b9aed0',
};
const col = (names: string[]): ProductColor[] => names.map((name) => ({ name, hex: COLORS[name] }));

export const COLOR_HEX = COLORS;

interface Row {
  s: string; t: string; p: number; c: number; col: string[]; fit: string; fab: string; pat?: Pattern; f?: string; sizes?: string[];
}

const SHIRTS: Row[] = [
  { s: 'casual', t: 'Solid Casual Shirt', p: 1299, c: 1999, col: ['Olive', 'Navy', 'Cream', 'Black'], fit: 'Regular Fit', fab: 'Cotton Twill', f: 'bf' },
  { s: 'formal', t: 'Classic Formal Shirt', p: 1499, c: 2299, col: ['White', 'Sky Blue', 'Cream'], fit: 'Slim Fit', fab: 'Cotton Poplin', f: 'b' },
  { s: 'linen', t: 'Linen Casual Shirt', p: 1399, c: 1999, col: ['Beige', 'Sky Blue', 'White', 'Sage'], fit: 'Relaxed Fit', fab: 'Linen Blend', f: 'f' },
  { s: 'solid', t: 'Slim Fit Shirt', p: 1299, c: 1999, col: ['Black', 'White', 'Charcoal'], fit: 'Slim Fit', fab: 'Cotton Stretch', f: 'b' },
  { s: 'check', t: 'Check Casual Shirt', p: 1199, c: 1799, col: ['Red', 'Navy', 'Olive', 'Beige'], fit: 'Regular Fit', fab: 'Cotton Flannel', pat: 'check', f: 'n' },
  { s: 'denim', t: 'Denim Shirt', p: 1599, c: 2399, col: ['Indigo', 'Light Wash', 'Black'], fit: 'Regular Fit', fab: 'Denim', pat: 'denim', f: 'n' },
  { s: 'printed', t: 'Printed Casual Shirt', p: 1299, c: 1999, col: ['Cream', 'Sky Blue', 'Sage'], fit: 'Relaxed Fit', fab: 'Viscose', pat: 'print' },
  { s: 'solid', t: 'Striped Shirt', p: 1399, c: 2099, col: ['Navy', 'Maroon', 'Black'], fit: 'Regular Fit', fab: 'Cotton Poplin', pat: 'stripe', f: 'b' },
  { s: 'linen', t: 'Textured Shirt', p: 1499, c: 2199, col: ['Cream', 'Stone', 'Navy', 'Olive'], fit: 'Regular Fit', fab: 'Cotton Linen', pat: 'textured' },
  { s: 'formal', t: 'Solid Formal Shirt', p: 1299, c: 1999, col: ['Maroon', 'Navy', 'Charcoal', 'White'], fit: 'Slim Fit', fab: 'Cotton Satin' },
  { s: 'check', t: 'Gingham Check Shirt', p: 1349, c: 1899, col: ['Sky Blue', 'Pink', 'Sage'], fit: 'Regular Fit', fab: 'Cotton Poplin', pat: 'check', f: 'n' },
  { s: 'casual', t: 'Mandarin Collar Shirt', p: 1249, c: 1799, col: ['White', 'Olive', 'Tan'], fit: 'Regular Fit', fab: 'Cotton Linen' },
];
const TEES: Row[] = [
  { s: 'crew-neck', t: 'Classic Crew Neck T-Shirt', p: 799, c: 1199, col: ['White', 'Black', 'Navy', 'Beige', 'Maroon'], fit: 'Regular Fit', fab: 'Combed Cotton', f: 'bf' },
  { s: 'polo', t: 'Pique Polo T-Shirt', p: 999, c: 1499, col: ['Navy', 'White', 'Olive', 'Maroon'], fit: 'Regular Fit', fab: 'Cotton Pique', f: 'b' },
  { s: 'oversized', t: 'Oversized Drop-Shoulder Tee', p: 899, c: 1399, col: ['Beige', 'Black', 'Stone', 'Sage'], fit: 'Oversized Fit', fab: 'Heavy Cotton', f: 'n' },
  { s: 'graphic', t: 'YNOT Emblem Graphic Tee', p: 899, c: 1299, col: ['Black', 'White', 'Navy'], fit: 'Regular Fit', fab: 'Combed Cotton', pat: 'solid', f: 'n' },
  { s: 'henley', t: 'Henley Button Tee', p: 949, c: 1399, col: ['Olive', 'Cream', 'Charcoal', 'Rust'], fit: 'Slim Fit', fab: 'Slub Cotton' },
  { s: 'striped', t: 'Breton Striped Tee', p: 849, c: 1299, col: ['Navy', 'Maroon', 'Black'], fit: 'Regular Fit', fab: 'Cotton Jersey', pat: 'stripe', f: 'b' },
  { s: 'crew-neck', t: 'Supima Crew Tee', p: 1099, c: 1599, col: ['White', 'Stone', 'Teal'], fit: 'Slim Fit', fab: 'Supima Cotton' },
  { s: 'polo', t: 'Textured Knit Polo', p: 1199, c: 1799, col: ['Cream', 'Black', 'Tobacco'], fit: 'Slim Fit', fab: 'Cotton Knit', pat: 'textured', f: 'f' },
  { s: 'oversized', t: 'Boxy Heavyweight Tee', p: 999, c: 1499, col: ['White', 'Black', 'Olive'], fit: 'Oversized Fit', fab: 'Heavy Cotton' },
  { s: 'crew-neck', t: 'Everyday Pack Tee', p: 699, c: 999, col: ['Grey', 'Navy', 'White'], fit: 'Regular Fit', fab: 'Cotton Jersey' },
  { s: 'henley', t: 'Waffle Henley', p: 1049, c: 1549, col: ['Beige', 'Navy', 'Forest'], fit: 'Regular Fit', fab: 'Waffle Cotton', f: 'n' },
  { s: 'graphic', t: 'Heritage Script Tee', p: 849, c: 1249, col: ['Cream', 'Black', 'Brown'], fit: 'Regular Fit', fab: 'Combed Cotton' },
];
const JEANS: Row[] = [
  { s: 'slim', t: 'Slim Fit Stretch Jeans', p: 1499, c: 2199, col: ['Dark Wash', 'Black', 'Mid Wash'], fit: 'Slim Fit', fab: 'Stretch Denim', pat: 'denim', f: 'bf' },
  { s: 'straight', t: 'Straight Fit Jeans', p: 1599, c: 2399, col: ['Mid Wash', 'Dark Wash', 'Light Wash'], fit: 'Regular Fit', fab: 'Rigid Denim', pat: 'denim', f: 'b' },
  { s: 'tapered', t: 'Tapered Fit Jeans', p: 1549, c: 2299, col: ['Black', 'Dark Wash', 'Grey'], fit: 'Slim Fit', fab: 'Stretch Denim', pat: 'denim', f: 'n' },
  { s: 'relaxed', t: 'Relaxed Fit Jeans', p: 1649, c: 2499, col: ['Light Wash', 'Mid Wash', 'Stone'], fit: 'Relaxed Fit', fab: 'Rigid Denim', pat: 'denim' },
  { s: 'bootcut', t: 'Bootcut Jeans', p: 1699, c: 2599, col: ['Dark Wash', 'Mid Wash'], fit: 'Relaxed Fit', fab: 'Stretch Denim', pat: 'denim' },
  { s: 'slim', t: 'Ultra Soft Slim Jeans', p: 1399, c: 1999, col: ['Light Wash', 'Dark Wash', 'Charcoal'], fit: 'Slim Fit', fab: 'Soft Stretch Denim', pat: 'denim', f: 'f' },
  { s: 'straight', t: 'Classic Five-Pocket Jeans', p: 1449, c: 2099, col: ['Indigo', 'Black', 'Mid Wash'], fit: 'Regular Fit', fab: 'Cotton Denim', pat: 'denim' },
  { s: 'tapered', t: 'Carrot Fit Jeans', p: 1599, c: 2399, col: ['Mid Wash', 'Beige', 'Dark Wash'], fit: 'Relaxed Fit', fab: 'Cotton Denim', pat: 'denim', f: 'n' },
  { s: 'relaxed', t: 'Wide Leg Jeans', p: 1799, c: 2699, col: ['Dark Wash', 'Light Wash'], fit: 'Relaxed Fit', fab: 'Rigid Denim', pat: 'denim' },
  { s: 'slim', t: 'Washed Black Jeans', p: 1499, c: 2199, col: ['Black', 'Charcoal'], fit: 'Slim Fit', fab: 'Stretch Denim', pat: 'denim', f: 'b' },
];
const TROUSERS: Row[] = [
  { s: 'formal', t: 'Formal Trousers', p: 1399, c: 1999, col: ['Charcoal', 'Navy', 'Black', 'Grey'], fit: 'Slim Fit', fab: 'Poly Viscose', f: 'bf' },
  { s: 'chinos', t: 'Stretch Chinos', p: 1399, c: 1999, col: ['Khaki', 'Navy', 'Olive', 'Stone'], fit: 'Slim Fit', fab: 'Cotton Stretch Twill', f: 'b' },
  { s: 'cargo', t: 'Utility Cargo Trousers', p: 1599, c: 2299, col: ['Olive', 'Black', 'Beige'], fit: 'Relaxed Fit', fab: 'Cotton Ripstop', f: 'n' },
  { s: 'linen', t: 'Linen Blend Trousers', p: 1499, c: 2199, col: ['Cream', 'Sage', 'Navy'], fit: 'Regular Fit', fab: 'Linen Blend', pat: 'textured', f: 'f' },
  { s: 'pleated', t: 'Pleated Tailored Trousers', p: 1699, c: 2499, col: ['Navy', 'Tobacco', 'Charcoal'], fit: 'Relaxed Fit', fab: 'Wool Blend' },
  { s: 'joggers', t: 'Everyday Joggers', p: 1199, c: 1799, col: ['Grey', 'Black', 'Navy'], fit: 'Regular Fit', fab: 'French Terry', f: 'b' },
  { s: 'chinos', t: 'Washed Cotton Chinos', p: 1349, c: 1949, col: ['Tan', 'Olive', 'White'], fit: 'Regular Fit', fab: 'Washed Cotton' },
  { s: 'formal', t: 'Flat-Front Dress Trousers', p: 1599, c: 2299, col: ['Black', 'Grey', 'Navy'], fit: 'Slim Fit', fab: 'Wool Blend', f: 'n' },
  { s: 'cargo', t: 'Tapered Cargo Pants', p: 1649, c: 2399, col: ['Khaki', 'Black', 'Stone'], fit: 'Slim Fit', fab: 'Cotton Twill' },
  { s: 'joggers', t: 'Tech Knit Joggers', p: 1299, c: 1899, col: ['Charcoal', 'Olive'], fit: 'Slim Fit', fab: 'Tech Knit' },
];
const JACKETS: Row[] = [
  { s: 'utility', t: 'Utility Jacket', p: 1999, c: 2999, col: ['Tobacco', 'Navy', 'Black', 'Olive'], fit: 'Regular Fit', fab: 'Cotton Canvas', f: 'bf' },
  { s: 'bomber', t: 'Classic Bomber Jacket', p: 2299, c: 3399, col: ['Forest', 'Black', 'Navy'], fit: 'Regular Fit', fab: 'Nylon Twill', f: 'b' },
  { s: 'denim', t: 'Trucker Denim Jacket', p: 2199, c: 3199, col: ['Indigo', 'Light Wash', 'Black'], fit: 'Regular Fit', fab: 'Denim', pat: 'denim', f: 'n' },
  { s: 'faux-leather', t: 'Faux Leather Biker Jacket', p: 2799, c: 3999, col: ['Black', 'Brown'], fit: 'Slim Fit', fab: 'PU Leather', f: 'f' },
  { s: 'quilted', t: 'Quilted Liner Jacket', p: 2399, c: 3499, col: ['Navy', 'Olive', 'Black'], fit: 'Regular Fit', fab: 'Quilted Polyester' },
  { s: 'blazer', t: 'Unstructured Blazer', p: 3299, c: 4799, col: ['Charcoal', 'Navy', 'Tan'], fit: 'Slim Fit', fab: 'Cotton Linen', f: 'b' },
  { s: 'bomber', t: 'Suede Finish Bomber', p: 2599, c: 3799, col: ['Tan', 'Tobacco', 'Charcoal'], fit: 'Regular Fit', fab: 'Faux Suede', f: 'n' },
  { s: 'utility', t: 'Overshirt Jacket', p: 1899, c: 2699, col: ['Sage', 'Rust', 'Navy'], fit: 'Relaxed Fit', fab: 'Cotton Twill' },
  { s: 'denim', t: 'Sherpa Lined Denim Jacket', p: 2699, c: 3799, col: ['Dark Wash', 'Black'], fit: 'Regular Fit', fab: 'Denim', pat: 'denim' },
  { s: 'blazer', t: 'Textured Casual Blazer', p: 3499, c: 4999, col: ['Beige', 'Black', 'Wine'], fit: 'Slim Fit', fab: 'Textured Blend', pat: 'textured' },
];
const ETHNIC: Row[] = [
  { s: 'kurtas', t: 'Linen Kurta', p: 1399, c: 1899, col: ['Sage', 'Pink', 'Cream', 'Navy'], fit: 'Regular Fit', fab: 'Linen Blend', f: 'bf' },
  { s: 'kurtas', t: 'Cotton Straight Kurta', p: 1199, c: 1699, col: ['White', 'Sky Blue', 'Mustard'], fit: 'Regular Fit', fab: 'Cotton', f: 'b' },
  { s: 'kurta-sets', t: 'Kurta Pyjama Set', p: 2199, c: 3199, col: ['Cream', 'Beige', 'Sage'], fit: 'Regular Fit', fab: 'Cotton Silk', f: 'n' },
  { s: 'nehru-jackets', t: 'Nehru Jacket', p: 2499, c: 3499, col: ['Navy', 'Maroon', 'Black', 'Forest'], fit: 'Slim Fit', fab: 'Poly Silk', f: 'b' },
  { s: 'festive', t: 'Jacquard Festive Kurta', p: 2299, c: 3299, col: ['Wine', 'Gold', 'Navy'], fit: 'Regular Fit', fab: 'Jacquard Silk Blend', pat: 'textured', f: 'f' },
  { s: 'kurtas', t: 'Printed Short Kurta', p: 1299, c: 1799, col: ['Cream', 'Teal', 'Rust'], fit: 'Relaxed Fit', fab: 'Cotton', pat: 'print' },
  { s: 'kurta-sets', t: 'Embroidered Kurta Set', p: 2799, c: 3999, col: ['White', 'Pink', 'Sky Blue'], fit: 'Slim Fit', fab: 'Cotton Silk', f: 'n' },
  { s: 'nehru-jackets', t: 'Textured Nehru Jacket', p: 2299, c: 3299, col: ['Beige', 'Charcoal', 'Wine'], fit: 'Slim Fit', fab: 'Cotton Blend', pat: 'textured' },
  { s: 'festive', t: 'Silk Blend Sherwani Kurta', p: 3299, c: 4599, col: ['Maroon', 'Gold', 'Black'], fit: 'Slim Fit', fab: 'Silk Blend' },
  { s: 'kurtas', t: 'Chikankari Style Kurta', p: 1699, c: 2399, col: ['White', 'Peach', 'Lavender'], fit: 'Regular Fit', fab: 'Cotton Voile', pat: 'textured' },
];
const ONE = ['One Size'];
const ACCESSORIES: Row[] = [
  { s: 'watches', t: 'Classic Leather Strap Watch', p: 2499, c: 3999, col: ['Brown', 'Black', 'Tan'], fit: 'Standard', fab: 'Stainless Steel & Leather', f: 'bf', sizes: ONE },
  { s: 'watches', t: 'Minimal Gold Dial Watch', p: 2999, c: 4499, col: ['Black', 'Navy'], fit: 'Standard', fab: 'Gold-tone Steel', f: 'n', sizes: ONE },
  { s: 'belts', t: 'Genuine Leather Belt', p: 899, c: 1399, col: ['Brown', 'Black', 'Tan'], fit: 'Standard', fab: 'Full-grain Leather', f: 'b', sizes: ['32', '34', '36', '38'] },
  { s: 'belts', t: 'Reversible Formal Belt', p: 999, c: 1499, col: ['Black', 'Brown'], fit: 'Standard', fab: 'Genuine Leather', sizes: ['32', '34', '36', '38'] },
  { s: 'wallets', t: 'Bi-fold Leather Wallet', p: 799, c: 1199, col: ['Tobacco', 'Black', 'Tan'], fit: 'Standard', fab: 'Genuine Leather', f: 'b', sizes: ONE },
  { s: 'wallets', t: 'Slim Card Holder', p: 599, c: 899, col: ['Black', 'Brown', 'Navy'], fit: 'Standard', fab: 'Genuine Leather', sizes: ONE },
  { s: 'caps', t: 'Washed Cotton Cap', p: 499, c: 799, col: ['Navy', 'Beige', 'Olive', 'Black'], fit: 'Adjustable', fab: 'Cotton Twill', sizes: ONE, f: 'n' },
  { s: 'sunglasses', t: 'Wayfarer Sunglasses', p: 1299, c: 1999, col: ['Black', 'Tobacco', 'Navy'], fit: 'Standard', fab: 'Acetate, UV400', f: 'bf', sizes: ONE },
  { s: 'backpacks', t: 'Everyday Laptop Backpack', p: 1799, c: 2599, col: ['Charcoal', 'Navy', 'Olive'], fit: 'Standard', fab: 'Water-resistant Polyester', sizes: ONE },
  { s: 'socks', t: 'Cotton Crew Socks (Pack of 3)', p: 399, c: 599, col: ['White', 'Grey', 'Black', 'Navy'], fit: 'Free Size', fab: 'Combed Cotton', sizes: ['Free Size'], f: 'b' },
  { s: 'fragrance', t: 'YNOT Noir Eau de Parfum', p: 1499, c: 2199, col: ['Teal', 'Wine', 'Black'], fit: '100 ml', fab: 'Woody Aromatic', sizes: ['100 ml'], f: 'f' },
  { s: 'sling-bags', t: 'Crossbody Sling Bag', p: 1199, c: 1799, col: ['Tobacco', 'Black', 'Olive'], fit: 'Standard', fab: 'Vegan Leather', sizes: ONE, f: 'n' },
  { s: 'keychains', t: 'Leather Fob Keychain', p: 299, c: 499, col: ['Brown', 'Black', 'Tan'], fit: 'Standard', fab: 'Leather & Brass', sizes: ONE },
];

const ROWS: Record<CategorySlug, Row[]> = {
  shirts: SHIRTS, 't-shirts': TEES, jeans: JEANS, trousers: TROUSERS, jackets: JACKETS, ethnic: ETHNIC, accessories: ACCESSORIES,
};

const BRANDS = ['YNOT', 'YNOT Essentials', 'YNOT Studio'];
const NOW = new Date('2026-10-19T00:00:00.000Z').getTime();

const careFor = (fab: string): string[] => {
  const f = fab.toLowerCase();
  if (f.includes('leather') || f.includes('suede')) return ['Wipe with a soft dry cloth', 'Keep away from water and direct heat', 'Condition with leather balm every few months'];
  if (f.includes('wool') || f.includes('silk') || f.includes('jacquard')) return ['Dry clean recommended', 'Steam or cool iron on reverse', 'Store on a padded hanger'];
  if (f.includes('denim')) return ['Wash inside out in cold water', 'Wash separately for the first few washes', 'Line dry in shade'];
  if (f.includes('steel') || f.includes('acetate') || f.includes('polyester') || f.includes('woody')) return ['Wipe clean with a soft cloth', 'Store in the pouch provided', 'Keep away from moisture and chemicals'];
  return ['Machine wash cold with similar colours', 'Do not bleach', 'Warm iron on reverse, line dry in shade'];
};

const intro: Record<CategorySlug, (t: string, fit: string, fab: string) => string> = {
  shirts: (t, fit, fab) => `The ${t} is cut in ${fab.toLowerCase()} with a ${fit.toLowerCase()} that sits clean through the shoulder and chest. A structured collar and mother-of-pearl effect buttons keep it sharp, whether it's tucked in or worn loose.`,
  't-shirts': (t, fit, fab) => `Made from ${fab.toLowerCase()}, the ${t} feels soft from the first wear and holds its shape wash after wash. The ${fit.toLowerCase()} suits everything from weekend errands to a layered evening look.`,
  jeans: (t, fit, fab) => `The ${t} is built from ${fab.toLowerCase()} with a ${fit.toLowerCase()} through the hip and thigh. Reinforced stitching and a comfortable mid-rise waist make it an easy everyday pair.`,
  trousers: (t, fit, fab) => `Tailored in ${fab.toLowerCase()}, the ${t} follows a ${fit.toLowerCase()} with a clean drop and a comfortable waistband. Pair it with a shirt for work or a tee for the weekend.`,
  jackets: (t, fit, fab) => `The ${t} layers over almost anything. Its ${fab.toLowerCase()} shell and ${fit.toLowerCase()} give structure without bulk, with pockets where you actually need them.`,
  ethnic: (t, fit, fab) => `Crafted in ${fab.toLowerCase()}, the ${t} brings a refined ${fit.toLowerCase()} to festive days and family occasions, with neat finishing at the collar, placket and hem.`,
  accessories: (t, _fit, fab) => `The ${t} is made with ${fab.toLowerCase()} and finished with care. A small detail that completes the outfit and is built for daily use.`,
};

function build(): Product[] {
  const out: Product[] = [];
  (Object.keys(ROWS) as CategorySlug[]).forEach((cat) => {
    const def = CATEGORY_MAP[cat];
    ROWS[cat].forEach((r, i) => {
      const sub = def.subcategories.find((s) => s.slug === r.s)!;
      const id = `${cat.slice(0, 2).toUpperCase()}${String(i + 1).padStart(3, '0')}`;
      const slug = slugify(`${r.t}-${r.col[0]}-${id}`);
      const colors = col(r.col);
      const sizes = r.sizes ?? def.sizes;
      const allOut = hash(id) % 29 === 0;
      const inventory: Record<string, number> = {};
      let stock = 0;
      colors.forEach((c) => sizes.forEach((s) => {
        const h = hash(`${id}|${c.name}|${s}`);
        const q = allOut ? 0 : h % 9 === 0 ? 0 : h % 17;
        inventory[`${c.name}|${s}`] = q;
        stock += q;
      }));
      const art: ArtKind = sub.art;
      const images: ProductImage[] = (['front', 'back', 'detail', 'styled'] as const).map((view) => ({
        view,
        alt: `${r.t} in ${colors[0].name}, ${view === 'front' ? 'front view' : view === 'back' ? 'back view' : view === 'detail' ? 'close-up detail' : 'styled view'}`,
      }));
      const f = r.f ?? '';
      out.push({
        id, slug, title: r.t, brand: BRANDS[hash(id) % BRANDS.length], category: cat, subcategory: r.s, subcategoryLabel: sub.label,
        description: intro[cat](r.t, r.fit, r.fab), images, price: r.p, compareAtPrice: r.c,
        discount: Math.round(((r.c - r.p) / r.c) * 100),
        rating: Math.round(seeded(id + 'r', 38, 49)) / 10, reviewCount: seeded(id + 'c', 24, 1850),
        sizes, colors, fit: r.fit, fabric: r.fab, pattern: r.pat ?? sub.pattern ?? 'solid', art, stock, inventory,
        tags: [cat, r.s, r.fit.toLowerCase(), r.fab.toLowerCase(), ...(r.pat && r.pat !== 'solid' ? [r.pat] : []), 'menswear', ...colors.map((c) => c.name.toLowerCase())],
        featured: f.includes('f'), bestSeller: f.includes('b'),
        createdAt: new Date(NOW - (f.includes('n') ? seeded(id + 'd', 2, 20) : seeded(id + 'd', 30, 240)) * 86400000).toISOString(),
        care: careFor(r.fab),
        specs: {
          Fit: r.fit, Fabric: r.fab, Pattern: (r.pat ?? sub.pattern ?? 'solid').replace(/^./, (c) => c.toUpperCase()),
          Category: def.label, Style: sub.label, 'Country of origin': 'India', 'Style code': id,
        },
        isDemoData: true,
      });
    });
  });
  return out;
}

export const CATALOG: Product[] = build();
export const PRODUCT_BY_ID = new Map(CATALOG.map((p) => [p.id, p]));
export const PRODUCT_BY_SLUG = new Map(CATALOG.map((p) => [p.slug, p]));
export const getProductById = (id: string) => PRODUCT_BY_ID.get(id);
export const ALL_COLOR_NAMES = Array.from(new Set(CATALOG.flatMap((p) => p.colors.map((c) => c.name))));
export const CATEGORY_COUNTS = Object.fromEntries(CATEGORIES.map((c) => [c.slug, CATALOG.filter((p) => p.category === c.slug).length])) as Record<CategorySlug, number>;

/** Image tone/view -> variant name passed to ProductArt (e.g. jacket style). */
export const artVariant = (p: Product) => (p.art === 'watch' ? (p.title.includes('Gold') ? 'gold' : '') : p.subcategory);
