import type { Order } from '@/types';
import { addDays } from './format';

export interface TimelineStep { key: string; label: string; detail: string; date: Date; done: boolean }
export function buildTimeline(order: Order): TimelineStep[] {
  const base = new Date(order.verifiedAt ?? order.createdAt);
  const eta = new Date(order.estimatedDelivery);
  const now = Date.now();
  const steps: Omit<TimelineStep, 'done'>[] = [
    { key: 'confirmed', label: 'Order confirmed', detail: 'We have received your order.', date: base },
    { key: 'packed', label: 'Packed', detail: 'Quality checked and packed with care.', date: addDays(base, 1) },
    { key: 'shipped', label: 'Shipped', detail: 'Handed over to our delivery partner.', date: addDays(base, 2) },
    { key: 'out', label: 'Out for delivery', detail: 'Your order is on its way to you.', date: addDays(eta, -1) },
    { key: 'delivered', label: 'Delivered', detail: 'Estimated delivery date.', date: eta },
  ];
  return steps.map((s) => ({ ...s, done: s.date.getTime() <= now }));
}
export const statusLabel = (o: Order) => {
  const done = buildTimeline(o).filter((s) => s.done);
  return o.status === 'cancelled' ? 'Cancelled' : done.length ? done[done.length - 1].label : 'Pending';
};
