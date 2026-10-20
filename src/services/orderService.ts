import type { Order } from '@/types';
import { mockBackend, type CreateOrderInput, type PaymentSession } from './mock/mockBackend';

export { isVerified, OrderError } from './mock/mockBackend';
export type { PaymentSession } from './mock/mockBackend';

/** Order service: replace with calls to your API / Supabase edge functions. All totals are computed server-side. */
export interface IOrderService {
  place(input: CreateOrderInput, actorId: string): Promise<{ order: Order; session: PaymentSession | null }>;
  retryPayment(orderId: string, actorId: string): Promise<{ order: Order; session: PaymentSession }>;
  get(orderId: string, actorId: string): Promise<Order | null>;
  list(actorId: string): Promise<Order[]>;
  claimGuestOrders(guestId: string, userId: string): void;
}

export const orderService: IOrderService = {
  place: (i, a) => mockBackend.createOrder(i, a),
  retryPayment: (id, a) => mockBackend.retryPayment(id, a),
  get: (id, a) => mockBackend.getOrder(id, a),
  list: (a) => mockBackend.listOrders(a),
  claimGuestOrders: (g, u) => mockBackend.claimGuestOrders(g, u),
};
