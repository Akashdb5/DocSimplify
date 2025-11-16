import type { ReactNode } from "react";
import { UIProviders } from "./providers";
import "@/lib/polyfills";
import "./globals.css";

export const metadata = {
  title: "DocSimplify.ai",
  description: "Simplify, translate, and chat with complex documents."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="app-shell text-text-primary transition-colors duration-300">
        <UIProviders>{children}</UIProviders>
      </body>
    </html>
  );
}
