const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(Math.round(n));
export const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n));
export const formatDate = (iso: string | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('en-IN', opts ?? { day: 'numeric', month: 'short', year: 'numeric' });
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
