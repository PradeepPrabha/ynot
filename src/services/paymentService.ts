import type { Order } from '@/types';
import { mockBackend, type PaymentSession } from './mock/mockBackend';
import { orderService } from './orderService';

export interface PaymentResult { verified: boolean; order: Order | null; reason?: string }

/**
 * Payment abstraction.
 *
 * Production flow: server creates a provider order -> browser opens the provider's hosted checkout
 * (card/UPI details are entered there, never in this app) -> provider calls YOUR webhook -> server
 * marks the order paid -> browser calls `confirm()` which only reads the server's verdict.
 *
 * Demo flow: `DemoGatewayModal` is a clearly-labelled sandbox that stands in for the provider and
 * calls `settleDemoPayment` (the mock webhook). Nothing is ever marked paid by the UI.
 */
export interface IPaymentService {
  readonly provider: 'demo';
  settleSandbox(session: PaymentSession, outcome: 'success' | 'failure'): Promise<void>;
  confirm(orderId: string, actorId: string): Promise<PaymentResult>;
}

export const paymentService: IPaymentService = {
  provider: 'demo',
  async settleSandbox(session, outcome) { await mockBackend.settleDemoPayment(session.id, outcome); },
  async confirm(orderId, actorId) {
    const order = await orderService.get(orderId, actorId);
    if (!order) return { verified: false, order: null, reason: 'We could not find this order for your account.' };
    if (order.paymentStatus === 'paid' || order.paymentStatus === 'cod_due') return { verified: true, order };
    if (order.paymentStatus === 'failed') return { verified: false, order, reason: 'The payment was not completed.' };
    return { verified: false, order, reason: 'We have not received a payment confirmation for this order yet.' };
  },
};
