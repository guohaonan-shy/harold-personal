"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { type Locale, defaultLocale, locales } from "../../i18n/config";

type LocaleContextType = {
  locale: Locale;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  toggleLocale: () => {},
});

export function useLocaleToggle() {
  return useContext(LocaleContext);
}

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(/locale=(\w+)/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return defaultLocale;
}

export default function LocaleProvider({
  children,
  messages,
}: {
  children: ReactNode;
  messages: Record<string, Record<string, unknown>>;
}) {
  const [locale, setLocale] = useState<Locale>(getLocaleFromCookie);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "en" ? "zh" : "en";
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    setLocale(newLocale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale] as Record<string, unknown>}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
