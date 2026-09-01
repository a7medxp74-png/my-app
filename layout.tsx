import type { Metadata, Viewport } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Commit — Study. Prove. Grow.", description: "منصة Commit للمذاكرة والانضباط", manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#172554", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const session = await auth();
  return <html lang="ar" dir="rtl"><body><AppShell session={session}>{children}</AppShell><script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}} /></body></html>;
}
