import type { UserProfile } from '@/types';
import { storage, KEYS } from '@/utils/storage';
import { uid, tick } from './ids';

/**
 * Auth service interface. DEMO implementation: profiles live in localStorage; passwords are NEVER
 * stored or checked. Replace with Supabase Auth (`supabase.auth.signUp / signInWithPassword`).
 */
export interface IAuthService {
  signUp(input: { fullName: string; email: string; phone: string; password: string }): Promise<UserProfile>;
  signIn(input: { identifier: string; password: string; remember: boolean }): Promise<UserProfile>;
  signOut(): Promise<void>;
  getSession(): UserProfile | null;
  updateProfile(patch: Partial<Pick<UserProfile, 'fullName' | 'phone'>>): Promise<UserProfile>;
  requestPasswordReset(email: string): Promise<void>;
}

export class AuthError extends Error {}

const users = () => storage.get<UserProfile[]>(KEYS.users, []);
const saveUsers = (u: UserProfile[]) => storage.set(KEYS.users, u);
const readSession = (): string | null => {
  try { return window.sessionStorage.getItem(KEYS.session) ?? storage.get<string | null>(KEYS.session, null); } catch { return storage.get<string | null>(KEYS.session, null); }
};
const writeSession = (id: string, remember: boolean) => {
  storage.remove(KEYS.session);
  try { window.sessionStorage.removeItem(KEYS.session); } catch { /* noop */ }
  if (remember) storage.set(KEYS.session, id); else { try { window.sessionStorage.setItem(KEYS.session, id); } catch { storage.set(KEYS.session, id); } }
};

export const authService: IAuthService = {
  async signUp({ fullName, email, phone }) {
    await tick(300);
    const list = users();
    if (list.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new AuthError('An account with this email already exists. Try logging in instead.');
    const user: UserProfile = { id: uid(), fullName: fullName.trim(), email: email.trim().toLowerCase(), phone, createdAt: new Date().toISOString() };
    saveUsers([...list, user]);
    writeSession(user.id, true);
    return user;
  },
  async signIn({ identifier, remember }) {
    await tick(300);
    const id = identifier.trim().toLowerCase();
    const user = users().find((u) => u.email === id || u.phone === id);
    if (!user) throw new AuthError('We could not find an account with those details. Check them or create an account.');
    writeSession(user.id, remember);
    return user;
  },
  async signOut() { storage.remove(KEYS.session); try { window.sessionStorage.removeItem(KEYS.session); } catch { /* noop */ } },
  getSession() { const id = readSession(); return id ? users().find((u) => u.id === id) ?? null : null; },
  async updateProfile(patch) {
    await tick(200);
    const id = readSession();
    const list = users();
    const idx = list.findIndex((u) => u.id === id);
    if (idx < 0) throw new AuthError('You need to be logged in.');
    list[idx] = { ...list[idx], ...patch };
    saveUsers(list);
    return list[idx];
  },
  async requestPasswordReset() { await tick(400); /* Production: supabase.auth.resetPasswordForEmail(email) */ },
};

export const getGuestId = (): string => {
  let id = storage.get<string | null>(KEYS.guest, null);
  if (!id) { id = `guest-${uid()}`; storage.set(KEYS.guest, id); }
  return id;
};
