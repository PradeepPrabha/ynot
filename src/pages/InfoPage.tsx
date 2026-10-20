import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs, Accordion } from '@/components/ui/Primitives';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SITE } from '@/data/site';
import { FREE_SHIPPING_ABOVE, SHIPPING_FEE } from '@/services/pricing';
import { CATEGORIES } from '@/data/categories';
import NotFound from './NotFound';

interface Page { title: string; intro: string; body: ReactNode }
const mail = <a className="link-underline font-semibold" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>;
const demo = <p className="mt-6 rounded-lg bg-cream p-3 text-xs leading-5 text-ink/60">This is a demo storefront. Replace this sample policy text with your legal team’s approved wording before launch.</p>;

const FAQ: [string, string][] = [
  ['How long does delivery take?', 'Most orders arrive in 2–4 days across South India and 4–7 days elsewhere. You can check your pincode on any product page.'],
  ['When is shipping free?', `Shipping is free on orders above ₹${FREE_SHIPPING_ABOVE}. Below that, a flat ₹${SHIPPING_FEE} delivery fee applies. Some coupons also waive delivery.`],
  ['Can I return or exchange an item?', 'Yes. Unworn items with tags can be returned or exchanged within 7 days of delivery.'],
  ['Which payment methods do you accept?', 'UPI, cards, net banking, wallets and cash on delivery (orders up to ₹10,000).'],
  ['How do I track my order?', 'Open Track Order in the menu or footer, then choose your order to see its shipment timeline.'],
  ['How do I use a coupon?', 'Enter the code in your cart or at checkout. Try WELCOME10 on your first order above ₹799.'],
  ['How do I choose my size?', 'Every product page has a size guide with body measurements. If you are between sizes, go one size up for a relaxed fit.'],
];

const PAGES: Record<string, Page> = {
  about: { title: 'Our story', intro: 'YNOT began with a simple idea: well-made menswear should feel easy to buy and easy to wear.', body: (<><p>We design everyday essentials, from shirts and tees to jeans, jackets and festive wear, with clean fits, honest fabrics and details that hold up after wash number fifty.</p><p>Our collection is made in India and sold online and at our Coimbatore store. Style today. A bolder tomorrow. That is what “For a Better You” means to us.</p><h2>What we care about</h2><ul><li>Fabrics that feel good against the skin</li><li>Fits tested on real people</li><li>Fair prices without the markup</li></ul></>) },
  sustainability: { title: 'Sustainability', intro: 'Small choices, made consistently.', body: (<><p>We are working towards lower-impact production one step at a time: cotton and linen blends over heavily synthetic fabrics, recyclable packaging, and made-to-last construction so you buy fewer, better pieces.</p><ul><li>Plastic-light shipping bags and recycled mailers</li><li>Care labels that help clothes last longer</li><li>Limited runs to reduce unsold stock</li></ul></>) },
  careers: { title: 'Careers', intro: 'Help us build menswear people love to wear.', body: <p>We are always glad to hear from people in design, merchandising, retail and customer care. Send a short note and your portfolio or CV to {mail}.</p> },
  contact: { title: 'Contact us', intro: 'We usually reply within one working day.', body: (<><p>Email: {mail}</p><p>Visit us: {SITE.store.name}, {SITE.store.address}.</p><p>For order questions, include your order number so we can help faster. You can find it under <Link to="/account/orders" className="link-underline font-semibold">Track Order</Link>.</p></>) },
  'store-locator': { title: 'Store locator', intro: 'Try on the collection in person.', body: (<><h2>{SITE.store.name}</h2><p>{SITE.store.address}.</p><p>Opening hours and contact details change from time to time, so please check with us at {mail} before you travel.</p><p><a className="link-underline font-semibold" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(`YNOT ${SITE.store.address}`)}`}>Open in Google Maps</a></p></>) },
  shipping: { title: 'Shipping policy', intro: 'Fast, tracked delivery across India.', body: (<><ul><li>Free shipping on orders above ₹{FREE_SHIPPING_ABOVE}; otherwise a ₹{SHIPPING_FEE} fee applies.</li><li>Orders are packed in 1–2 working days.</li><li>Delivery takes 2–4 days in South India and 4–7 days elsewhere.</li><li>Cash on delivery is available on orders up to ₹10,000.</li></ul><p>Use the pincode checker on any product page to see your estimate.</p>{demo}</>) },
  returns: { title: 'Returns & exchange', intro: 'Easy returns within 7 days.', body: (<><ul><li>Return or exchange within 7 days of delivery.</li><li>Items must be unworn, unwashed and have their original tags.</li><li>Innerwear, socks and fragrance cannot be returned for hygiene reasons unless damaged.</li><li>Refunds go back to the original payment method within 5–7 working days of us receiving the item.</li></ul><p>To start a return, email {mail} with your order number.</p>{demo}</>) },
  terms: { title: 'Terms & conditions', intro: 'The ground rules for using YNOT.', body: (<><h2>Using this site</h2><p>By placing an order you confirm that the details you provide are accurate and that you are legally able to enter a purchase agreement.</p><h2>Pricing and availability</h2><p>Prices are in Indian rupees and include applicable taxes. We may cancel an order if an item becomes unavailable or a pricing error is found, and we will refund any payment made.</p><h2>Coupons</h2><p>Coupons are single-use per order, cannot be combined, and may be withdrawn at any time.</p>{demo}</>) },
  privacy: { title: 'Privacy policy', intro: 'What we collect and why.', body: (<><p>We collect the details needed to deliver your order: name, contact details, delivery address and order history. Payment details are handled by our payment provider and never stored by YNOT.</p><ul><li>We never sell your personal data.</li><li>You can ask us to delete your account data by emailing {mail}.</li><li>This demo keeps your cart, wishlist and profile in your browser’s local storage only.</li></ul>{demo}</>) },
  'size-guide': { title: 'Size guide', intro: 'Find your fit.', body: (<><p>Measure over light clothing, keep the tape snug but not tight, and compare with the table on each product page.</p><h2>Tops (inches)</h2><table><thead><tr><th>Size</th><th>Chest</th><th>Shoulder</th><th>Length</th></tr></thead><tbody>{[['S', 38, 17, 28], ['M', 40, 17.5, 29], ['L', 42, 18, 30], ['XL', 44, 18.5, 31], ['XXL', 46, 19, 32]].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table><h2>Bottoms (inches)</h2><table><thead><tr><th>Size</th><th>Waist</th><th>Hip</th></tr></thead><tbody>{[[28, 28, 36], [30, 30, 38], [32, 32, 40], [34, 34, 42], [36, 36, 44], [38, 38, 46]].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table><p>Browse by category: {CATEGORIES.slice(0, 4).map((c, i) => <span key={c.slug}>{i > 0 && ', '}<Link className="link-underline" to={`/category/${c.slug}`}>{c.label}</Link></span>)}.</p></>) },
  faqs: { title: 'Frequently asked questions', intro: 'Quick answers to common questions.', body: <div>{FAQ.map(([q, a], i) => <Accordion key={q} title={q} defaultOpen={i === 0}><p>{a}</p></Accordion>)}<p className="mt-6 text-sm">Still stuck? Write to {mail}.</p></div> },
};

export default function InfoPage() {
  const { slug = '' } = useParams();
  const page = PAGES[slug];
  usePageMeta(page?.title ?? 'Page not found', page?.intro);
  if (!page) return <NotFound />;
  return (
    <div className="container-page pb-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.title }]} />
      <article className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{page.title}</h1>
        <p className="mt-3 text-lg text-ink/70">{page.intro}</p>
        <div className="prose-ynot mt-8 [&_table]:mb-6 [&_table]:w-full [&_table]:text-left [&_table]:text-sm [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:py-2 [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:py-2 [&_th]:font-semibold">{page.body}</div>
      </article>
    </div>
  );
}
