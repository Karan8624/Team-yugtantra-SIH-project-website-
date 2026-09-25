"use client";

/**
 * Lightweight i18n context — no routing, no middleware. Chosen over a
 * full framework (e.g. next-intl's [locale] segment routing) to keep the
 * hackathon build simple; swapping to a routed i18n solution later is a
 * straightforward upgrade since all strings already flow through t().
 */

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { en } from "./messages/en";
import { hi } from "./messages/hi";
import { mr } from "./messages/mr";

export type Locale = "en" | "hi" | "mr";
export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, mr };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "amr-locale";

// Reads the saved locale without ever setting state inside an effect: the
// server snapshot is always "en" (no localStorage on the server), and the
// client snapshot reads localStorage directly. React reconciles the two
// after hydration, which is the recommended fix for this exact
// "value differs between server and client" situation.
const subscribeNever = () => () => {};
function getClientLocaleSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    return saved && DICTIONARIES[saved] ? saved : "en";
  } catch {
    return "en";
  }
}
function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const savedLocale = useSyncExternalStore(subscribeNever, getClientLocaleSnapshot, getServerLocaleSnapshot);
  const [override, setOverride] = useState<Locale | null>(null);
  const locale = override ?? savedLocale;

  const setLocale = (l: Locale) => {
    setOverride(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // localStorage can throw in private/blocked contexts — safe to ignore.
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
