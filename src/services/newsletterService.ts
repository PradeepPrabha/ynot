import { storage, KEYS } from '@/utils/storage';
import { tick } from './ids';

/** Demo: stores the email locally. Production: POST to your email provider / Supabase table. */
export const newsletterService = {
  async subscribe(email: string): Promise<'subscribed' | 'already'> {
    await tick(300);
    const list = storage.get<string[]>(KEYS.newsletter, []);
    const e = email.trim().toLowerCase();
    if (list.includes(e)) return 'already';
    storage.set(KEYS.newsletter, [...list, e]);
    return 'subscribed';
  },
};
