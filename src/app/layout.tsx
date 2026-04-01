import type { Metadata } from "next";
import { cookies } from "next/headers";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/Toast';
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Journal",
  description: "Track trades, review analytics, and improve trading discipline.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("tj_language")?.value || "EN";
  const lang = rawLang.toLowerCase();

  return (
    <html lang={lang}>
      <body className={`antialiased lang-${lang}`}>
        <NextTopLoader
          color="#34c759"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease-in-out"
          speed={400}
          shadow="0 0 10px #34c759,0 0 5px #34c759"
          zIndex={16000}
        />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
