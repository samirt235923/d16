import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg01 from "@/assets/product_1770548124_69886b9c71c18.jpg";
import heroImg02 from "@/assets/product_1770548124_69886b9c7c5a8.jpg";
import heroImg03 from "@/assets/product_1770548124_69886b9ccebec.jpg";
import heroImg04 from "@/assets/product_1770548161_69886bc15028b.jpg";
import featureSheet from "@/assets/ChatGPT Image Aug 16, 2026, 10_12_08 PM.png";
import productShowcase from "@/assets/f492b615-b038-4311-80d8-cf65a1efe5b8.jpg";
import posterDemo from "@/assets/product_1770548124_69886b9c7c5a8.jpg";
import posterHowto from "@/assets/product_1770548124_69886b9ccebec.jpg";
import { Countdown } from "@/components/landing/Countdown";
import { VideoCard } from "@/components/landing/VideoCard";
import { OrderForm } from "@/components/landing/OrderForm";
import { Faq } from "@/components/landing/Faq";
import {
  PRODUCT_VIDEO_URL,
  HOWTO_VIDEO_URL,
  FEEDBACK_SCREENSHOTS,
  PRICE,
  OLD_PRICE,
} from "@/lib/media";

const title = "D16 Mini Air Humidifier — মাত্র ৳449, ক্যাশ অন ডেলিভারি";
const description =
  "D16 Mini Air Humidifier ৳699 নয়, এখন মাত্র ৳449। USB পাওয়ার, ১৮০ml ট্যাংক, LED লাইট। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


const BENEFITS = [
  ["💨", "Fine Mist", "সূক্ষ্ম মিস্ট ছড়িয়ে personal space আরও comfortable করতে সাহায্য করে।"],
  ["🌈", "Colorful LED Light", "রুমে তৈরি করুন সুন্দর ambience।"],
  ["🔌", "USB Powered", "সহজেই USB দিয়ে ব্যবহার করা যায়।"],
  ["📦", "Compact Design", "Bedroom, study table বা office desk-এর জন্য উপযোগী।"],
  ["💧", "180ML Capacity", "দৈনন্দিন personal-space ব্যবহারের জন্য convenient।"],
];

const STEPS = [
  ["১", "পানি দিন", "Water tank-এ প্রয়োজনমতো পানি দিন।"],
  ["২", "USB কানেক্ট করুন", "USB cable সংযুক্ত করুন।"],
  ["৩", "চালু করুন", "Power button চাপুন এবং mist উপভোগ করুন।"],
];

function Index() {
  const navigate = useNavigate();
  const goOrder = () => navigate({ to: "/order" });
  const slides = [heroImg01, heroImg02, productShowcase, heroImg03, heroImg04, featureSheet];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => setActiveIndex(index);
  const prevSlide = () => setActiveIndex((activeIndex - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((activeIndex + 1) % slides.length);

  return (
    <main className="pb-24 md:pb-10">
      {/* HERO */}
      <section className="bg-gradient-hero px-4 pb-8 pt-6">
        <div className="mx-auto max-w-5xl md:grid md:grid-cols-2 md:items-center md:gap-10">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-soft">
              <div className="relative w-full">
                <img
                  src={slides[activeIndex]}
                  alt="D16 Mini Air Humidifier product view"
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  className="mx-auto h-[440px] w-full object-cover md:h-[540px]"
                />
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur-sm transition hover:bg-black/45"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur-sm transition hover:bg-black/45"
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide}-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`View product image ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-7 bg-primary" : "bg-white/70"
                  }`}
                />
              ))}
            </div>

            <span className="absolute left-2 top-2 rounded-full bg-warning px-3 py-1 text-xs font-bold text-primary-foreground shadow-soft">
              ৳250 সাশ্রয়
            </span>
          </div>

          <div className="mt-4 text-center md:mt-0 md:text-left">
            <p className="text-sm font-semibold text-primary">D16 Mini Air Humidifier</p>
            <h1 className="mt-1 text-[26px] font-bold leading-snug md:text-4xl">
              রুমের বাতাসকে আরও আরামদায়ক করুন ছোট্ট D16 Humidifier দিয়ে 💨
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bedroom, study table বা office desk-এ রাখুন — সূক্ষ্ম মিস্ট আর নরম LED আলোয়
              আপনার personal space হবে আরও আরামদায়ক।
            </p>

            <div className="mt-4 flex items-end justify-center gap-3 md:justify-start">
              <span className="text-5xl font-bold text-primary">৳{PRICE}</span>
              <span className="pb-1.5 text-lg text-muted-foreground line-through">
                ৳{OLD_PRICE}
              </span>
            </div>

            <div className="mt-4">
              <Countdown />
            </div>

            <button onClick={goOrder} className="btn-cta mt-5">
              অর্ডার করতে চাই →
            </button>
            <p className="mt-2 text-sm font-medium text-success">
              ✓ ক্যাশ অন ডেলিভারি সুবিধা আছে
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {["💵 হাতে পেয়ে টাকা", "🚚 সারা দেশে ডেলিভারি", "📞 অর্ডার কনফার্ম কলে", "↩️ ভুল পণ্যে রিটার্ন"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-card"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>

          </div>
        </div>
      </section>

      {/* OFFER */}
      <Section>
        <div className="rounded-3xl bg-card p-5 text-center shadow-soft">
          <h2 className="text-lg font-bold">🔥 সীমিত সময়ের জন্য বিশেষ ডিসকাউন্ট!</h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-xl text-muted-foreground line-through">৳{OLD_PRICE}</span>
            <span className="text-3xl">→</span>
            <span className="text-4xl font-bold text-primary">৳{PRICE}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-success">সাশ্রয় ৳250</p>
          <div className="mt-4">
            <Countdown />
          </div>
          <button onClick={goOrder} className="btn-cta mt-5">
            ৳{PRICE}-এ অর্ডার করুন →
          </button>
        </div>
      </Section>

      {/* BENEFITS */}
      <Section title="কেন D16 Humidifier?">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(([icon, t, d]) => (
            <div key={t} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-2 font-bold">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* VIDEOS */}
      <Section title="ভিডিওতে দেখে নিন—D16 Humidifier কেমন কাজ করে">
        <VideoCard src={PRODUCT_VIDEO_URL} poster={posterDemo} label="প্রোডাক্ট ডেমো ভিডিও" />
      </Section>

      <Section title="মাত্র কয়েকটি ধাপেই ব্যবহার করুন">
        <VideoCard src={HOWTO_VIDEO_URL} poster={posterHowto} label="ব্যবহারের নিয়ম ভিডিও" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <div key={t} className="rounded-2xl bg-card p-4 shadow-card">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft font-bold text-primary">
                {n}
              </span>
              <h3 className="mt-2 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FEEDBACK */}
      <Section title="যারা ব্যবহার করেছেন, তারা কী বলছেন?">
        {FEEDBACK_SCREENSHOTS.length > 0 ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {FEEDBACK_SCREENSHOTS.map((s) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                loading="lazy"
                className="w-[75%] max-w-[300px] shrink-0 snap-center rounded-2xl shadow-card"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            এখানে আপনার বাস্তব কাস্টমারদের feedback screenshot যুক্ত করুন
            (src/lib/media.ts)। কোনো বানানো রিভিউ ব্যবহার করা হয়নি।
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          বাস্তব কাস্টমারদের শেয়ার করা feedback
        </p>
      </Section>

      {/* DELIVERY + PRICE SUMMARY */}
      <Section title="ডেলিভারি চার্জ">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center shadow-card">
            <p className="text-sm text-muted-foreground">ঢাকার ভিতরে</p>
            <p className="text-2xl font-bold text-primary">৳50</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-card">
            <p className="text-sm text-muted-foreground">ঢাকার বাইরে</p>
            <p className="text-2xl font-bold text-primary">৳100</p>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-brand-soft px-4 py-3 text-center text-sm font-semibold text-accent-foreground">
          💵 ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা পরিশোধ করুন
        </p>

        <div className="mt-4 rounded-3xl bg-card p-5 shadow-card">
          <SummaryRow label="নিয়মিত দাম" value={`৳${OLD_PRICE}`} strike />
          <SummaryRow label="অফার দাম" value={`৳${PRICE}`} highlight />
          <SummaryRow label="আপনার সাশ্রয়" value="৳250" />
          <SummaryRow label="ডেলিভারি" value="৳50 / ৳100" />
          <div className="my-2 border-t border-border" />
          <div className="flex items-center justify-between font-bold">
            <span>সর্বমোট</span>
            <span className="text-primary">৳499 / ৳549</span>
          </div>
        </div>
      </Section>

      {/* ORDER */}
      <section id="order" className="scroll-mt-4 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-xl font-bold md:text-2xl">
            অর্ডার করতে নিচের তথ্য দিন
          </h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            ফর্ম পূরণ → আমরা ফোন করব → পণ্য হাতে পেয়ে টাকা দিন
          </p>
          <div className="my-4 grid grid-cols-3 gap-2">
            {[
              ["📝", "তথ্য দিন"],
              ["📞", "কল কনফার্ম"],
              ["💵", "হাতে পেয়ে পেমেন্ট"],
            ].map(([icon, label]) => (
              <div key={label} className="rounded-2xl bg-card p-3 text-center shadow-card">
                <div className="text-xl">{icon}</div>
                <p className="mt-1 text-[11px] font-semibold leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <OrderForm />
        </div>
      </section>


      {/* TRUST */}
      <Section>
        <div className="grid grid-cols-2 gap-3">
          {[
            "ক্যাশ অন ডেলিভারি",
            "সহজ অর্ডার প্রক্রিয়া",
            "দ্রুত ডেলিভারি",
            "কাস্টমার সাপোর্ট",
          ].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 rounded-2xl bg-card p-3 text-sm font-semibold shadow-card"
            >
              <span className="text-success">✓</span>
              <span className="min-w-0">{t}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="সাধারণ জিজ্ঞাসা">
        <Faq />
      </Section>

      {/* FINAL CTA */}
      <section className="bg-gradient-cta px-4 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-primary-foreground">
            ৳699 নয়, এখন মাত্র ৳449! 🔥
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            সীমিত সময়ের অফার শেষ হওয়ার আগে অর্ডার করুন।
          </p>
          <div className="mt-4">
            <Countdown tone="dark" />
          </div>
          <button
            onClick={goOrder}
            className="mt-5 w-full rounded-2xl bg-background px-5 py-4 text-[17px] font-bold text-primary shadow-soft transition-transform active:scale-[0.98]"
          >
            এখনই অর্ডার করুন →
          </button>
        </div>
      </section>

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} D16 Humidifier BD — ক্যাশ অন ডেলিভারিতে সারা দেশে ডেলিভারি
      </footer>

      {/* STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur md:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xl font-bold leading-none text-primary">৳{PRICE}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              <span className="line-through">৳{OLD_PRICE}</span> · ক্যাশ অন ডেলিভারি
            </p>
          </div>
          <button
            onClick={goOrder}
            className="shrink-0 rounded-2xl bg-gradient-cta px-6 py-3 text-base font-bold text-primary-foreground shadow-soft transition-transform active:scale-[0.98]"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-6">
      <div className="mx-auto max-w-5xl">
        {title && <h2 className="mb-4 text-center text-xl font-bold md:text-2xl">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  strike,
  highlight,
}: {
  label: string;
  value: string;
  strike?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-semibold ${strike ? "text-muted-foreground line-through" : ""} ${
          highlight ? "text-lg text-primary" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
