"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import en from "../../../i18n/en.json";
import localesConfig from "../../../i18n.json";

const availableLocales = Array.from(
  new Set([localesConfig.locale.source, ...(localesConfig.locale.targets ?? [])])
) as string[];

type Locale = (typeof availableLocales)[number];
type Dictionary = typeof en;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolvePath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

function formatMessage(message: string, vars?: Record<string, string | number>) {
  if (!vars) return message;
  return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token) => {
    const value = vars[token];
    return value !== undefined ? String(value) : "";
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(availableLocales[0]);
  const [dictionary, setDictionary] = useState<Dictionary>(en);

  const syncDictionary = useCallback(async (nextLocale: Locale) => {
    if (nextLocale === localesConfig.locale.source || nextLocale === "en") {
      setDictionary(en);
      return;
    }
    try {
      const response = await fetch(`/api/i18n/${nextLocale}`);
      if (!response.ok) throw new Error("Failed to load locale");
      const payload = (await response.json()) as Dictionary;
      setDictionary(payload);
    } catch (error) {
      console.warn("Unable to load locale", nextLocale, error);
      setDictionary(en);
    }
  }, []);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      syncDictionary(nextLocale);
    },
    [syncDictionary]
  );

  useEffect(() => {
    syncDictionary(availableLocales[0]);
  }, [syncDictionary]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      dictionary,
      t: (key, vars) => {
        const result = resolvePath(dictionary, key);
        if (typeof result === "string") {
          return formatMessage(result, vars);
        }
        return key;
      }
    }),
    [dictionary, locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export const supportedLocales = availableLocales as Locale[];
