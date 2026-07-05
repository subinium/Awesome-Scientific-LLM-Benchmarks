import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Awesome Scientific LLM Benchmarks",
  description:
    "A searchable database of benchmarks for evaluating LLMs on scientific reasoning and discovery — math, physics, chemistry, materials, biology, and agentic science.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
