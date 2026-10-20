import type { ReactNode } from 'react';
import { LinkButton } from './Button';

type Kind = 'bag' | 'heart' | 'search' | 'box' | 'lock' | 'alert';
const art: Record<Kind, ReactNode> = {
  bag: (<><path d="M52 62h76l8 72H44z" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" strokeLinejoin="round" /><path d="M68 62c0-14 8-24 22-24s22 10 22 24" fill="none" stroke="#6B4226" strokeWidth="3" strokeLinecap="round" /><circle cx="76" cy="84" r="3" fill="#6B4226" /><circle cx="104" cy="84" r="3" fill="#6B4226" /><path d="M78 108q12 10 24 0" fill="none" stroke="#C39A61" strokeWidth="3" strokeLinecap="round" /></>),
  heart: (<><path d="M90 140C50 112 40 84 54 66c12-14 30-8 36 6 6-14 24-20 36-6 14 18 4 46-36 74z" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" strokeLinejoin="round" /><path d="M66 78q6-10 16-4" fill="none" stroke="#C39A61" strokeWidth="3" strokeLinecap="round" /></>),
  search: (<><circle cx="82" cy="78" r="34" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" /><path d="M108 104l28 28" stroke="#6B4226" strokeWidth="6" strokeLinecap="round" /><path d="M68 84q14 12 28 0" fill="none" stroke="#C39A61" strokeWidth="3" strokeLinecap="round" /><circle cx="72" cy="70" r="3" fill="#6B4226" /><circle cx="92" cy="70" r="3" fill="#6B4226" /></>),
  box: (<><path d="M40 70l50-24 50 24v56l-50 24-50-24z" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" strokeLinejoin="round" /><path d="M40 70l50 24 50-24M90 94v56" fill="none" stroke="#6B4226" strokeWidth="3" /><path d="M65 58l50 24" stroke="#C39A61" strokeWidth="4" /></>),
  lock: (<><rect x="52" y="76" width="76" height="62" rx="10" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" /><path d="M66 76V62c0-14 10-24 24-24s24 10 24 24v14" fill="none" stroke="#6B4226" strokeWidth="3" /><circle cx="90" cy="104" r="6" fill="#C39A61" /></>),
  alert: (<><circle cx="90" cy="90" r="46" fill="#E9DDCC" stroke="#6B4226" strokeWidth="3" /><path d="M90 66v30" stroke="#6B4226" strokeWidth="6" strokeLinecap="round" /><circle cx="90" cy="112" r="4" fill="#C39A61" /></>),
};

interface Props { level?: 1 | 2; kind?: Kind; title: string; message: string; action?: { label: string; to: string }; secondary?: ReactNode }
export function EmptyState({ level = 2, kind = 'box', title, message, action, secondary }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-14 text-center">
      <svg viewBox="0 0 180 180" className="mb-4 h-36 w-36" aria-hidden>{art[kind]}</svg>
      {level === 1 ? <h1 className="font-serif text-2xl font-semibold">{title}</h1> : <h2 className="font-serif text-2xl font-semibold">{title}</h2>}
      <p className="mt-2 text-sm leading-6 text-ink/70">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {action && <LinkButton to={action.to}>{action.label}</LinkButton>}
        {secondary}
      </div>
    </div>
  );
}
