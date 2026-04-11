import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Green Mart — Your Fresh Grocery Delivery",
    template: "%s | Green Mart",
  },
  description:
    "Green Mart is your ultimate grocery delivery service connecting you with fresh produce and essentials. Shop fresh, eat healthy, deliver fast.",
  keywords: [
    "grocery",
    "delivery",
    "fresh produce",
    "green mart",
    "online grocery",
    "supermarket",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

