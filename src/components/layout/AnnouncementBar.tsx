import { Link } from 'react-router-dom';
import { BadgeCheck, Package, Truck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-beige/70 text-[12px] text-cocoa">
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <ul className="flex flex-1 items-center justify-center gap-5 sm:justify-start sm:gap-8">
          <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0" aria-hidden />Free shipping above ₹999</li>
          <li className="hidden items-center gap-2 sm:flex"><Package className="h-4 w-4 shrink-0" aria-hidden />Easy returns within 7 days</li>
          <li className="hidden items-center gap-2 lg:flex"><BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />100% original &amp; premium quality</li>
        </ul>
        <nav aria-label="Utility" className="hidden items-center gap-4 font-medium md:flex">
          <Link to="/pages/store-locator" className="hover:text-brown">Store Locator</Link>
          <Link to="/account/orders" className="hover:text-brown">Track Order</Link>
          <Link to="/pages/faqs" className="hover:text-brown">Help</Link>
        </nav>
      </div>
    </div>
  );
}
