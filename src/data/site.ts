export const SITE = {
  name: 'YNOT',
  tagline: 'For a Better You',
  supportEmail: 'support@ynot.example',
  store: { name: 'YNOT Saravanampatti', address: 'Sathy Road, Vaiyapuri Nagar, Saravanampatti, Coimbatore, Tamil Nadu' },
  /** Replace with the brand's real profile URLs before launch. */
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Facebook', href: 'https://www.facebook.com/' },
    { label: 'YouTube', href: 'https://www.youtube.com/' },
    { label: 'X (Twitter)', href: 'https://x.com/' },
  ],
};

export const NAV = [
  { label: 'New In', to: '/products?new=1&sort=newest' },
  { label: 'Shirts', to: '/category/shirts' },
  { label: 'T-Shirts', to: '/category/t-shirts' },
  { label: 'Jeans', to: '/category/jeans' },
  { label: 'Trousers', to: '/category/trousers' },
  { label: 'Jackets', to: '/category/jackets' },
  { label: 'Ethnic', to: '/category/ethnic' },
  { label: 'Accessories', to: '/category/accessories' },
  { label: 'Sale', to: '/products?sale=1&sort=discount', sale: true },
];

export const FOOTER = {
  shop: [...[{ label: 'New In', to: '/products?new=1&sort=newest' }, { label: 'Shirts', to: '/category/shirts' }, { label: 'T-Shirts', to: '/category/t-shirts' }, { label: 'Jeans', to: '/category/jeans' }, { label: 'Trousers', to: '/category/trousers' }, { label: 'Jackets', to: '/category/jackets' }, { label: 'Ethnic', to: '/category/ethnic' }, { label: 'Accessories', to: '/category/accessories' }, { label: 'Sale', to: '/products?sale=1&sort=discount' }]],
  help: [
    { label: 'Track Order', to: '/account/orders' }, { label: 'Returns & Exchange', to: '/pages/returns' }, { label: 'Size Guide', to: '/pages/size-guide' },
    { label: 'Shipping Policy', to: '/pages/shipping' }, { label: 'Terms & Conditions', to: '/pages/terms' }, { label: 'Privacy Policy', to: '/pages/privacy' }, { label: 'FAQs', to: '/pages/faqs' },
  ],
  about: [
    { label: 'Our Story', to: '/pages/about' }, { label: 'Sustainability', to: '/pages/sustainability' }, { label: 'Careers', to: '/pages/careers' },
    { label: 'Store Locator', to: '/pages/store-locator' }, { label: 'Contact Us', to: '/pages/contact' },
  ],
};

export const POPULAR_SEARCHES = ['Linen shirt', 'Chinos', 'Oversized tee', 'Kurta', 'Leather belt', 'Sunglasses'];
