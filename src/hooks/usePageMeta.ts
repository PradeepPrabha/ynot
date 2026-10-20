import { useEffect } from 'react';

const BASE = 'YNOT';
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === BASE ? `${BASE} — For a Better You` : `${title} | ${BASE}`;
    if (description) {
      let m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
      m.content = description;
    }
  }, [title, description]);
}
