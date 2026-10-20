import { useState } from 'react';
import type { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { ColorSwatches, PriceDisplay, QuantityStepper, SizeSelector } from '@/components/ui/Primitives';
import { useCart } from '@/features/cart/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useUi } from '@/features/ui/UiContext';
import ProductImage from './ProductImage';

export default function QuickAddModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');
  const cart = useCart();
  const toast = useToast();
  const { setCartOpen } = useUi();
  const stock = (s: string) => product.inventory[`${color}|${s}`] ?? 0;
  const maxQty = size ? Math.min(10, stock(size)) : 10;

  const submit = () => {
    if (!size) { setErr('Select a size to continue.'); return; }
    const r = cart.add(product.id, color, size, qty);
    if (!r.ok) { setErr(r.message); return; }
    toast.success(r.message); onClose(); setCartOpen(true);
  };
  return (
    <Modal open={open} onClose={onClose} title="Quick add" size="md">
      <div className="flex gap-4">
        <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl sm:w-36"><ProductImage product={product} color={color} /></div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl font-semibold">{product.title}</h3>
          <div className="mt-1"><PriceDisplay price={product.price} compareAt={product.compareAtPrice} discount={product.discount} /></div>
          <p className="mt-3 text-[13px] font-semibold">Colour: <span className="font-normal text-ink/70">{color}</span></p>
          <div className="mt-1.5"><ColorSwatches colors={product.colors} selected={color} onSelect={(c) => { setColor(c); setSize(''); setErr(''); }} /></div>
        </div>
      </div>
      <p className="mb-2 mt-5 text-[13px] font-semibold">Size</p>
      <SizeSelector sizes={product.sizes} selected={size} onSelect={(s) => { setSize(s); setErr(''); setQty(1); }} isDisabled={(s) => stock(s) <= 0} error={!!err && !size} />
      {err && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{err}</p>}
      <div className="mt-5 flex items-center gap-4">
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, maxQty)} />
        {size && stock(size) > 0 && stock(size) <= 5 && <span className="text-[13px] font-semibold text-coral">Only {stock(size)} left</span>}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button block onClick={submit}>Add to cart</Button>
        <LinkButton variant="outline" block to={`/product/${product.slug}`} onClick={onClose}>View full details</LinkButton>
      </div>
    </Modal>
  );
}
