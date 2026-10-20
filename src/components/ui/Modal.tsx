import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLockBody } from '@/hooks/useLockBody';
import { Button } from './Button';
import { cn } from '@/utils/format';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onClose]);
  return ref;
}

interface ModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; hideTitle?: boolean }
export function Modal({ open, onClose, title, children, size = 'md', hideTitle }: ModalProps) {
  useLockBody(open);
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-ink/45" onClick={onClose} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cn('relative max-h-[92vh] w-full animate-pop-in overflow-y-auto rounded-t-2xl bg-ivory p-5 shadow-lift sm:rounded-2xl sm:p-7', w)}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className={cn('font-serif text-2xl font-semibold', hideTitle && 'sr-only')}>{title}</h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-full p-2 text-ink/60 hover:bg-beige/70 hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>, document.body);
}

interface DrawerProps { open: boolean; onClose: () => void; title: string; side?: 'left' | 'right'; children: ReactNode; footer?: ReactNode; width?: string }
export function Drawer({ open, onClose, title, side = 'right', children, footer, width = 'max-w-md' }: DrawerProps) {
  useLockBody(open);
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fade-in bg-ink/45" onClick={onClose} aria-hidden />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cn('absolute top-0 flex h-full w-[92%] flex-col bg-ivory shadow-lift', width, side === 'right' ? 'right-0 animate-drawer-in' : 'left-0 animate-drawer-in-left')}>
        <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label={`Close ${title}`} className="rounded-full p-2 text-ink/60 hover:bg-beige/70 hover:text-ink"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="border-t border-[var(--border)] bg-cream p-5">{footer}</footer>}
      </aside>
    </div>, document.body);
}

interface ConfirmOptions { title: string; message: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean }
const ConfirmCtx = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);
export const useConfirm = () => { const c = useContext(ConfirmCtx); if (!c) throw new Error('useConfirm outside provider'); return c; };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((res) => { resolver.current = res; setOpts(o); }), []);
  const close = (v: boolean) => { resolver.current?.(v); resolver.current = null; setOpts(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => close(false)} title={opts?.title ?? ''} size="sm">
        <p className="text-sm leading-6 text-ink/75">{opts?.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="soft" onClick={() => close(false)}>{opts?.cancelLabel ?? 'Cancel'}</Button>
          <Button data-autofocus onClick={() => close(true)} className={opts?.destructive ? '!bg-red-700 hover:!bg-red-800' : ''}>{opts?.confirmLabel ?? 'Confirm'}</Button>
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  );
}
