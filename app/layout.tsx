import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Figtree, Lusitana } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const lusitana = Lusitana({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lusitana" });

export const metadata: Metadata = {
  title: "Administração | RSVP",
  description: "Confirme presença no evento"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${figtree.variable} ${lusitana.variable} bg-feijoada text-white`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
