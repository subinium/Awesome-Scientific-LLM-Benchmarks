import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scientific LLM Benchmarks",
  description:
    "A curated, searchable index of benchmarks for evaluating large language models on scientific reasoning and discovery.",
};

// Set the theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <div className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-2.5 sm:px-8">
            <Link href="/" className="flex items-center gap-2 text-sm">
              <span className="font-serif text-[17px] leading-none">◆</span>
              <span className="font-medium tracking-tight">
                Scientific LLM Benchmarks
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/subinium/Awesome-Scientific-LLM-Benchmarks"
                className="text-xs text-muted transition-colors hover:text-accent"
              >
                GitHub
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
