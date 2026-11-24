'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartView } from '@/lib/storefront/types';

type CartCtx = {
  cart: CartView | null;
  lines: CartView['lines'];
  count: number;
  subtotal: number;
  subtotalText: string;
  loading: boolean;
  isOpen: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  refresh: () => Promise<void>;
  add: (handle: string, variantTitle: string, qty?: number) => Promise<void>;
  setQty: (lineId: string, qty: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};

const Ctx = createContext<CartCtx | null>(null);

const EMPTY: CartView = {
  id: '',
  currency: 'USD',
  itemCount: 0,
  subtotal: 0,
  subtotalText: '$0.00',
  freeShippingRemaining: 75,
  freeShippingRemainingText: '$75.00',
  freeShippingThreshold: 75,
  lines: [],
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      const json = (await res.json()) as { ok: boolean; cart: CartView };
      if (json.ok) setCart(json.cart);
    } catch {
      /* cart stays as-is */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const send = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(input, init);
        const json = (await res.json()) as { ok: boolean; cart?: CartView; error?: string };
        if (!json.ok || !json.cart) {
          setError(json.error ?? 'REQUEST_FAILED');
          return;
        }
        setCart(json.cart);
      } catch {
        setError('NETWORK_ERROR');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const add = useCallback(
    async (handle: string, variantTitle: string, qty = 1) => {
      await send('/api/cart/lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, variantTitle, qty }),
      });
      setIsOpen(true);
    },
    [send],
  );

  const setQty = useCallback(
    async (lineId: string, qty: number) => {
      await send(`/api/cart/lines/${encodeURIComponent(lineId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      });
    },
    [send],
  );

  const remove = useCallback(
    async (lineId: string) => {
      await send(`/api/cart/lines/${encodeURIComponent(lineId)}`, { method: 'DELETE' });
    },
    [send],
  );

  const value = useMemo<CartCtx>(() => {
    const view = cart ?? EMPTY;
    return {
      cart: view,
      lines: view.lines,
      count: view.itemCount,
      subtotal: view.subtotal,
      subtotalText: view.subtotalText,
      loading,
      isOpen,
      error,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      refresh,
      add,
      setQty,
      remove,
    };
  }, [cart, loading, isOpen, error, refresh, add, setQty, remove]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
