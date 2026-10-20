/** Safe localStorage wrapper: never throws (private mode, quota, SSR). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

export const KEYS = {
  cart: 'ynot.cart.v1',
  wishlist: 'ynot.wishlist.v1',
  guest: 'ynot.guest.v1',
  users: 'ynot.demo.users.v1',
  session: 'ynot.demo.session.v1',
  addresses: 'ynot.demo.addresses.v1',
  backend: 'ynot.demo.backend.v1',
  newsletter: 'ynot.demo.newsletter.v1',
  recent: 'ynot.recent-searches.v1',
  viewMode: 'ynot.view-mode.v1',
} as const;
