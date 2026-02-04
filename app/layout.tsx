import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harold - Indie Hacker & Full-Stack Developer",
  description: "I build software that empowers developers. Embracing the Vibe Coding era, I turn caffeine into an endless stream of AI tools and indie products.",
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://haroldguo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://haroldguo.com",
    siteName: "Harold Guo",
    title: "Harold - Indie Hacker & Full-Stack Developer",
    description: "I build software that empowers developers. Embracing the Vibe Coding era, I turn caffeine into an endless stream of AI tools and indie products.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Harold Guo - Indie Hacker & Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HaonanGuo330592",
    creator: "@HaonanGuo330592",
    title: "Harold - Indie Hacker & Full-Stack Developer",
    description: "I build software that empowers developers. Embracing the Vibe Coding era, I turn caffeine into an endless stream of AI tools and indie products.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Harold Guo",
              "givenName": "Harold",
              "familyName": "Guo",
              "url": "https://haroldguo.com",
              "image": "https://haroldguo.com/avatar.png",
              "email": "guohaonan980421@gmail.com",
              "jobTitle": [
                "AI Agent Engineer",
                "Full-Stack Developer",
                "Indie Hacker",
                "Content Creator"
              ],
              "worksFor": {
                "@type": "Organization",
                "name": "Plaud"
              },
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "National University of Singapore",
                "sameAs": "https://www.nus.edu.sg"
              },
              "nationality": "China",
              "knowsAbout": [
                "AI Agent Development",
                "UI/UX Design",
                "Product Development",
                "LLM Applications",
                "TypeScript",
                "React",
                "Next.js",
                "Python",
                "Golang"
              ],
              "sameAs": [
                "https://twitter.com/HaonanGuo330592",
                "https://github.com/guohaonan-shy",
                "https://www.linkedin.com/in/harold-guo",
                "https://www.youtube.com/@HaroldGuo",
                "https://www.producthunt.com/@haroldguo"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
