import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface UiState { cartOpen: boolean; searchOpen: boolean; navOpen: boolean; setCartOpen: (v: boolean) => void; setSearchOpen: (v: boolean) => void; setNavOpen: (v: boolean) => void }
const Ctx = createContext<UiState | null>(null);
export const useUi = () => { const c = useContext(Ctx); if (!c) throw new Error('useUi outside provider'); return c; };

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const v = useMemo(() => ({ cartOpen, searchOpen, navOpen, setCartOpen, setSearchOpen, setNavOpen }), [cartOpen, searchOpen, navOpen]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
