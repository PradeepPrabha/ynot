import { useState } from 'react';
import type { CategorySlug } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/format';

const TOPS = [['S', 38, 28, 40], ['M', 40, 29, 42], ['L', 42, 30, 44], ['XL', 44, 31, 46], ['XXL', 46, 32, 48]] as const;
const BOTTOMS = [['28', 28, 36, 31], ['30', 30, 38, 31], ['32', 32, 40, 32], ['34', 34, 42, 32], ['36', 36, 44, 32], ['38', 38, 46, 33]] as const;

export default function SizeGuideModal({ open, onClose, category }: { open: boolean; onClose: () => void; category: CategorySlug }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const bottoms = category === 'jeans' || category === 'trousers';
  const conv = (n: number) => (unit === 'in' ? n : Math.round(n * 2.54));
  const head = bottoms ? ['Size', 'Waist', 'Hip', 'Inseam'] : ['Size', 'Chest', 'Shoulder', 'Body length'];
  const rows = bottoms ? BOTTOMS : TOPS;
  return (
    <Modal open={open} onClose={onClose} title="Size guide" size="md">
      {category === 'accessories' ? (
        <p className="text-sm leading-6 text-ink/75">Most accessories are one size. For belts, order the size that matches your trouser waist size, then choose the middle hole for the best fit.</p>
      ) : (
        <>
          <div className="mb-4 inline-flex rounded-lg border border-[var(--border)] p-1" role="group" aria-label="Units">
            {(['in', 'cm'] as const).map((u) => <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} className={cn('rounded-md px-4 py-1.5 text-sm font-semibold', unit === u ? 'bg-cocoa text-ivory' : 'text-ink/70')}>{u === 'in' ? 'Inches' : 'Centimetres'}</button>)}
          </div>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-beige/60"><tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-[var(--border)]"><th scope="row" className="px-4 py-3 font-semibold">{r[0]}</th>{[r[1], r[2], r[3]].map((v, i) => <td key={i} className="px-4 py-3">{conv(v)} {unit}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <h3 className="mt-5 font-sans text-sm font-bold">How to measure</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
            {bottoms ? (<><li>Waist: measure around the natural waistline where you wear your trousers.</li><li>Inseam: measure from the crotch seam down to the ankle.</li></>) : (<><li>Chest: measure around the fullest part of your chest, under the arms.</li><li>Shoulder: measure across the back from one shoulder point to the other.</li></>)}
            <li>Between two sizes? Pick the larger one for a relaxed fit, the smaller for a closer fit.</li>
          </ul>
          <p className="mt-4 text-xs text-ink/55">Measurements are body measurements and may vary by up to 1 inch. Sample data for demo purposes.</p>
        </>
      )}
    </Modal>
  );
}
