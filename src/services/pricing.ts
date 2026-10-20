import type { Totals } from '@/types';
import { getProductById } from '@/data/catalog';

export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 79;
export const MAX_QTY_PER_LINE = 10;

export interface Coupon { code: string; label: string; minSubtotal: number; kind: 'percent' | 'flat' | 'shipping'; value: number; cap?: number }
export const COUPONS: Coupon[] = [
  { code: 'WELCOME10', label: '10% off your first order (up to ₹300)', minSubtotal: 799, kind: 'percent', value: 10, cap: 300 },
  { code: 'YNOT200', label: '₹200 off on orders above ₹1,999', minSubtotal: 1999, kind: 'flat', value: 200 },
  { code: 'FREESHIP', label: 'Free delivery on any order', minSubtotal: 1, kind: 'shipping', value: 0 },
  { code: 'FESTIVE20', label: '20% off up to ₹500 on orders above ₹2,999', minSubtotal: 2999, kind: 'percent', value: 20, cap: 500 },
];

export interface CouponResult { valid: boolean; message: string; discount: number; freeShipping: boolean; code?: string }

export function evaluateCoupon(code: string | undefined, subtotal: number): CouponResult {
  if (!code) return { valid: false, message: '', discount: 0, freeShipping: false };
  const c = COUPONS.find((x) => x.code === code.trim().toUpperCase());
  if (!c) return { valid: false, message: 'This coupon code is not valid. Check the spelling and try again.', discount: 0, freeShipping: false };
  if (subtotal < c.minSubtotal) return { valid: false, message: `Add ₹${(c.minSubtotal - subtotal).toLocaleString('en-IN')} more to use ${c.code}.`, discount: 0, freeShipping: false, code: c.code };
  if (c.kind === 'shipping') return { valid: true, message: `${c.code} applied. Delivery is free.`, discount: 0, freeShipping: true, code: c.code };
  const raw = c.kind === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  const discount = Math.min(raw, c.cap ?? raw, subtotal);
  return { valid: true, message: `${c.code} applied. You saved ₹${discount.toLocaleString('en-IN')}.`, discount, freeShipping: false, code: c.code };
}

/** Trusted price calculation. Prices come from the catalog, never from the client. */
export function computeTotals(lines: { productId: string; qty: number }[], couponCode?: string): { totals: Totals; coupon: CouponResult } {
  let mrpTotal = 0, subtotal = 0, itemCount = 0;
  for (const l of lines) {
    const p = getProductById(l.productId);
    if (!p) continue;
    mrpTotal += p.compareAtPrice * l.qty;
    subtotal += p.price * l.qty;
    itemCount += l.qty;
  }
  const coupon = evaluateCoupon(couponCode, subtotal);
  const couponDiscount = coupon.valid ? coupon.discount : 0;
  const afterCoupon = subtotal - couponDiscount;
  const shipping = itemCount === 0 || coupon.freeShipping || subtotal > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = afterCoupon + shipping;
  const productSavings = mrpTotal - subtotal;
  return {
    totals: { mrpTotal, subtotal, productSavings, couponCode: coupon.valid ? coupon.code : undefined, couponDiscount, shipping, total, itemCount, totalSavings: productSavings + couponDiscount },
    coupon,
  };
}

export interface PincodeResult { serviceable: boolean; message: string; minDays?: number; maxDays?: number; cod?: boolean }
export function checkPincode(pin: string): PincodeResult {
  if (!/^[1-9][0-9]{5}$/.test(pin)) return { serviceable: false, message: 'Enter a valid 6-digit pincode.' };
  if (pin.startsWith('9')) return { serviceable: false, message: 'We do not deliver to this pincode yet.' };
  const south = pin.startsWith('5') || pin.startsWith('6');
  const [minDays, maxDays] = south ? [2, 4] : [4, 7];
  return { serviceable: true, minDays, maxDays, cod: true, message: `Delivery in ${minDays}–${maxDays} days. Cash on delivery available.` };
}
