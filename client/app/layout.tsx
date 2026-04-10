import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nexus — Multi-Vendor E-Commerce & Delivery",
    template: "%s | Nexus",
  },
  description:
    "Nexus is the ultimate multi-vendor marketplace connecting vendors, customers, and delivery partners. Shop smart, sell better, deliver faster.",
  keywords: [
    "e-commerce",
    "multi-vendor",
    "marketplace",
    "delivery",
    "nexus",
    "online shopping",
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
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
