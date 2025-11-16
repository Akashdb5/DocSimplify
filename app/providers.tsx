"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/components/i18n/i18n-context";

export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <Toaster richColors position="bottom-right" />
    </I18nProvider>
  );
}
