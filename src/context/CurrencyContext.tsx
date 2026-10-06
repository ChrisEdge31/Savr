"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getDoc, setDoc } from "firebase/firestore";
import { userDoc } from "@/lib/firebase/firestore";
import { CurrencyCode, DEFAULT_CURRENCY, currencySymbol, formatMoney, isCurrencyCode } from "@/lib/utils/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  symbol: string;
  /** Left padding for an Input with the symbol absolutely positioned at left-3. */
  inputPadClass: string;
  format: (amount: number) => string;
  saveCurrency: (code: CurrencyCode) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  symbol: "$",
  inputPadClass: "pl-7",
  format: (amount) => formatMoney(amount, DEFAULT_CURRENCY),
  saveCurrency: async () => {},
});

export function CurrencyProvider({ uid, children }: { uid: string | undefined; children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    if (!uid) return;
    getDoc(userDoc(uid)).then((snap) => {
      const stored = snap.data()?.currency;
      if (isCurrencyCode(stored)) setCurrency(stored);
    });
  }, [uid]);

  const saveCurrency = useCallback(
    async (code: CurrencyCode) => {
      if (!uid) return;
      setCurrency(code);
      await setDoc(userDoc(uid), { currency: code } as Parameters<typeof setDoc>[1], { merge: true });
    },
    [uid]
  );

  const value = useMemo(() => {
    const symbol = currencySymbol(currency);
    return {
      currency,
      symbol,
      inputPadClass: symbol.length > 1 ? "pl-10" : "pl-7",
      format: (amount: number) => formatMoney(amount, currency),
      saveCurrency,
    };
  }, [currency, saveCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
