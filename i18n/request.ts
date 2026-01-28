import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  // Only try to read cookies in dynamic rendering context
  if (typeof window === "undefined") {
    try {
      const headersList = await headers();
      const cookieHeader = headersList.get("cookie") || "";
      const match = cookieHeader.match(/locale=(\w+)/);
      if (match && locales.includes(match[1] as Locale)) {
        locale = match[1] as Locale;
      }
    } catch {
      // Static generation - use default locale
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
