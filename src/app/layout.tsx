import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/shared/ToastContainer";
import { appMetadata } from "../lib/getAppMetadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${appMetadata.title} v${appMetadata.version}`,
  description: appMetadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <footer className="text-center text-xs text-zinc-500 mt-8 mb-4">
              {appMetadata.title} — v{appMetadata.version}
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
