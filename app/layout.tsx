import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/ui/Header";
import { Navigation } from "@/components/ui/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Event Planner",
  description: "社会人サークルのライブイベント企画・運営システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <SessionProvider>
          <Header />
          <Navigation />
          <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
