import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/common/Providers";
import Header from "@/components/layout/Header";
import VisitorIdProvider from "@/components/common/VisitorIdProvider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Snuggle",
  description: "Snuggle - Your cozy community",
};

const themeScript = `
  (function() {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');

      document.documentElement.style.colorScheme = theme;

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.style.backgroundColor = '#000000';
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '#ffffff';
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning style={{ colorScheme: 'light dark' }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-white dark:bg-black" suppressHydrationWarning>
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow={false}
        />
        <Providers>
          <VisitorIdProvider>
            <Header />
            {children}
          </VisitorIdProvider>
        </Providers>
      </body>
    </html>
  );
}
