/**
 * MOCK SERVER (demo only).
 *
 * This module plays the role of the trusted backend: it re-prices every order from the catalog,
 * validates stock, owns the order + payment ledger and is the only thing that can mark a payment
 * as "paid". The UI never sets a paid flag itself and never trusts URL params. In production this
 * file is replaced by Supabase (Postgres + Row Level Security) and a payment-provider webhook
 * handled in a server-side function. See README → "Going live".
 */
import type { Address, Order, OrderLine, PaymentMethod } from '@/types';
import { getProductById } from '@/data/catalog';
import { computeTotals, MAX_QTY_PER_LINE } from '../pricing';
import { orderNumber, tick, uid } from '../ids';
import { storage, KEYS } from '@/utils/storage';
import { addDays } from '@/utils/format';

interface State { orders: Order[]; sessions: Record<string, { orderId: string }>; idem: Record<string, string> }
const load = (): State => storage.get<State>(KEYS.backend, { orders: [], sessions: {}, idem: {} });
const save = (s: State) => storage.set(KEYS.backend, s);

export const COD_LIMIT = 10000;
export class OrderError extends Error {}

export interface CreateOrderInput {
  lines: { productId: string; color: string; size: string; qty: number }[];
  address: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  idempotencyKey: string;
}
export interface PaymentSession { id: string; orderId: string; provider: 'demo'; amount: number; method: PaymentMethod }

export const isVerified = (o: Order) => o.paymentStatus === 'paid' || o.paymentStatus === 'cod_due';

function validateAddress(a: Address) {
  if (!a.fullName?.trim() || !/^[6-9]\d{9}$/.test(a.phone) || !/^\S+@\S+\.\S+$/.test(a.email) || !a.line1?.trim() || !a.city?.trim() || !a.state?.trim() || !/^[1-9]\d{5}$/.test(a.pincode))
    throw new OrderError('Shipping details are incomplete or invalid.');
}

export const mockBackend = {
  async createOrder(input: CreateOrderInput, actorId: string): Promise<{ order: Order; session: PaymentSession | null }> {
    await tick(250);
    const state = load();
    const existingId = state.idem[input.idempotencyKey];
    if (existingId) {
      const existing = state.orders.find((o) => o.id === existingId)!;
      const sid = Object.keys(state.sessions).find((k) => state.sessions[k].orderId === existingId);
      return { order: existing, session: existing.paymentStatus === 'pending' && sid ? { id: sid, orderId: existingId, provider: 'demo', amount: existing.totals.total, method: existing.paymentMethod } : null };
    }
    if (!input.lines.length) throw new OrderError('Your order has no items.');
    validateAddress(input.address);

    const lines: OrderLine[] = input.lines.map((l) => {
      const p = getProductById(l.productId);
      if (!p) throw new OrderError('One of the items is no longer available.');
      const color = p.colors.find((c) => c.name === l.color);
      if (!color || !p.sizes.includes(l.size)) throw new OrderError(`Choose a valid colour and size for ${p.title}.`);
      if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > MAX_QTY_PER_LINE) throw new OrderError(`Quantity for ${p.title} must be between 1 and ${MAX_QTY_PER_LINE}.`);
      if ((p.inventory[`${l.color}|${l.size}`] ?? 0) < l.qty) throw new OrderError(`${p.title} (${l.color}, ${l.size}) does not have enough stock.`);
      return { productId: p.id, slug: p.slug, title: p.title, color: l.color, colorHex: color.hex, size: l.size, qty: l.qty, unitPrice: p.price, mrp: p.compareAtPrice, art: p.art, pattern: p.pattern, category: p.category };
    });

    const { totals } = computeTotals(lines.map((l) => ({ productId: l.productId, qty: l.qty })), input.couponCode);
    const cod = input.paymentMethod === 'cod';
    if (cod && totals.total > COD_LIMIT) throw new OrderError(`Cash on delivery is available up to ₹${COD_LIMIT.toLocaleString('en-IN')}. Choose another payment method.`);
    const now = new Date();
    const order: Order = {
      id: orderNumber(), createdAt: now.toISOString(), lines, totals, address: input.address, paymentMethod: input.paymentMethod,
      paymentStatus: cod ? 'cod_due' : 'pending', status: cod ? 'confirmed' : 'pending_payment', verifiedAt: cod ? now.toISOString() : undefined,
      estimatedDelivery: addDays(now, 5).toISOString(), ownerId: actorId,
    };
    state.orders.unshift(order);
    state.idem[input.idempotencyKey] = order.id;
    let session: PaymentSession | null = null;
    if (!cod) {
      session = { id: uid(), orderId: order.id, provider: 'demo', amount: totals.total, method: input.paymentMethod };
      state.sessions[session.id] = { orderId: order.id };
    }
    save(state);
    return { order, session };
  },

  /** Stands in for the payment provider's server-to-server webhook. Only reachable from the sandbox modal. */
  async settleDemoPayment(sessionId: string, outcome: 'success' | 'failure'): Promise<Order> {
    await tick(450);
    const state = load();
    const sess = state.sessions[sessionId];
    if (!sess) throw new OrderError('Payment session not found or expired.');
    const order = state.orders.find((o) => o.id === sess.orderId)!;
    if (order.paymentStatus !== 'paid') {
      if (outcome === 'success') {
        order.paymentStatus = 'paid'; order.status = 'confirmed'; order.verifiedAt = new Date().toISOString();
        order.paymentRef = `DEMO-${uid().slice(0, 8).toUpperCase()}`;
      } else { order.paymentStatus = 'failed'; }
      save(state);
    }
    return order;
  },

  async retryPayment(orderId: string, actorId: string): Promise<{ order: Order; session: PaymentSession }> {
    await tick(150);
    const state = load();
    const order = state.orders.find((o) => o.id === orderId && o.ownerId === actorId);
    if (!order || order.paymentStatus === 'paid') throw new OrderError('This order cannot be paid again.');
    order.paymentStatus = 'pending';
    const session: PaymentSession = { id: uid(), orderId, provider: 'demo', amount: order.totals.total, method: order.paymentMethod };
    state.sessions[session.id] = { orderId };
    save(state);
    return { order, session };
  },

  /** Ownership-checked read. Returns null for unknown ids AND for orders belonging to someone else. */
  async getOrder(orderId: string, actorId: string): Promise<Order | null> {
    await tick(120);
    return load().orders.find((o) => o.id === orderId && o.ownerId === actorId) ?? null;
  },

  async listOrders(actorId: string): Promise<Order[]> {
    await tick(120);
    return load().orders.filter((o) => o.ownerId === actorId && isVerified(o));
  },

  claimGuestOrders(guestId: string, userId: string) {
    const state = load();
    let changed = false;
    state.orders.forEach((o) => { if (o.ownerId === guestId) { o.ownerId = userId; changed = true; } });
    if (changed) save(state);
  },
};
