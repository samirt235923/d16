import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Facebook, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { siteConfig } from "@/data/siteConfig";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | GizmoZone BD" },
      { name: "description", content: "Get support, order help, or business contact details for GizmoZone BD." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>

        <article className="mt-6 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Support</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Contact Us</h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                আমাদের টিম আপনার অর্ডার, ডেলিভারি, রিটার্ন, পেমেন্ট এবং পণ্যের বিষয়ে সহায়তা দিতে
                প্রস্তুত। WhatsApp, ফোন অথবা ফেসবুকের মাধ্যমে সহজে যোগাযোগ করুন।
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-extrabold text-foreground">ফোন / WhatsApp</p>
                    <a href={`tel:${siteConfig.phone}`} className="mt-1 block text-primary hover:underline">
                      {siteConfig.phone}
                    </a>
                    <a
                      href={`https://wa.me/88${siteConfig.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-primary hover:underline"
                    >
                      WhatsApp Support
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-extrabold text-foreground">অফিস ঠিকানা</p>
                    <p className="mt-1">Matuail jatrabari Dhaka 1362</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-extrabold text-foreground">সাপোর্ট সময়</p>
                    <p className="mt-1">সকাল ৯:০০টা – রাত ৯:০০টা, সপ্তাহের সব দিন</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                  <Facebook className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-extrabold text-foreground">ফেসবুক</p>
                    <a href={siteConfig.facebookPage} target="_blank" rel="noreferrer" className="mt-1 block text-primary hover:underline">
                      Facebook Page
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-secondary/50 p-5">
              <h2 className="text-xl font-extrabold text-foreground">Quick Help</h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" /> অর্ডার স্ট্যাটাস জানতে চাইলে
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> ডেলিভারি সমস্যা রিপোর্ট করতে চাইলে
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> রিটার্ন / রিফান্ড বিষয়ে জানতে চাইলে
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-primary/50 bg-background p-4 text-sm text-foreground">
                <p className="font-bold">আপনার অর্ডার সম্পর্কে দ্রুত উত্তর পেতে:</p>
                <p className="mt-2">আপনার অর্ডার নম্বর, নাম, ঠিকানা ও সমস্যার বিবরণ লিখে আমাদেরকে পাঠান।</p>
              </div>
            </aside>
          </div>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
