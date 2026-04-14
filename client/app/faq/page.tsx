import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { FAQSection } from "@/components/shared/faq-section";
import { getFAQs } from "@/app/actions/mart-actions";

export default async function FAQPage() {
  const res = await getFAQs();
  const faqs = res.success ? res.data : [];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        <FAQSection faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
