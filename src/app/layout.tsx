import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import HeaderBackLink from "@/components/HeaderBackLink";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photocards",
  description: "Image to text flip-card learning app for Windows and macOS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = window.localStorage.getItem('photocards-theme');
              const theme = stored === 'dark' || stored === 'light'
                ? stored
                : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.classList.toggle('dark', theme === 'dark');
              document.documentElement.style.colorScheme = theme;
            } catch (error) {
              document.documentElement.classList.remove('dark');
              document.documentElement.style.colorScheme = 'light';
            }
          })();`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-background/80 px-4 py-4 backdrop-blur dark:border-slate-700/60">
          <HeaderBackLink />
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
