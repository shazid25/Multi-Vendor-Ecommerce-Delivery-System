"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <CartProvider>
        {children}
      </CartProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--card-foreground)",
          },
        }}
      />
    </NextThemesProvider>
  );
}

