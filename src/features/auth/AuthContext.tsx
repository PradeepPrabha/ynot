import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UserProfile } from '@/types';
import { authService, getGuestId } from '@/services/authService';
import { orderService } from '@/services/orderService';

interface AuthApi {
  user: UserProfile | null;
  /** Identity used to own orders: the user id when signed in, otherwise a per-device guest id. */
  actorId: string;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<UserProfile>;
  signUp: (input: { fullName: string; email: string; phone: string; password: string }) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<UserProfile, 'fullName' | 'phone'>>) => Promise<void>;
}
const Ctx = createContext<AuthApi | null>(null);
export const useAuth = () => { const c = useContext(Ctx); if (!c) throw new Error('useAuth outside provider'); return c; };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getSession());
  const guestId = useMemo(getGuestId, []);

  const attach = useCallback((u: UserProfile) => { orderService.claimGuestOrders(guestId, u.id); setUser(u); return u; }, [guestId]);
  const value = useMemo<AuthApi>(() => ({
    user, actorId: user?.id ?? guestId,
    signIn: async (identifier, password, remember) => attach(await authService.signIn({ identifier, password, remember })),
    signUp: async (input) => attach(await authService.signUp(input)),
    signOut: async () => { await authService.signOut(); setUser(null); },
    updateProfile: async (patch) => setUser(await authService.updateProfile(patch)),
  }), [user, guestId, attach]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
