import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { SiteFooter } from "@/components/SiteFooter";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <Component {...pageProps} />
        </div>
        <SiteFooter />
      </div>
    </SessionProvider>
  );
}

export default MyApp;
