const FAQS = [
  ["এই Humidifier কীভাবে ব্যবহার করবো?", "Water tank-এ পানি দিন, USB cable সংযুক্ত করুন, তারপর power button চাপুন।"],
  ["Delivery charge কত?", "ঢাকার ভিতরে ৳50 এবং ঢাকার বাইরে ৳100।"],
  ["ক্যাশ অন ডেলিভারি আছে কি?", "হ্যাঁ, পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা পরিশোধ করবেন।"],
  ["ঢাকার বাইরে কি ডেলিভারি হয়?", "হ্যাঁ, সারা বাংলাদেশে কুরিয়ারের মাধ্যমে ডেলিভারি করা হয়।"],
  ["কত ml পানি ধরে?", "Water tank-এর ধারণক্ষমতা ১৮০ ml।"],
  ["USB দিয়ে কি চালানো যায়?", "হ্যাঁ, USB পোর্ট, পাওয়ার ব্যাংক বা অ্যাডাপ্টার দিয়ে চালানো যায়।"],
  ["অর্ডার করার পর কী হবে?", "আমাদের প্রতিনিধি ফোন করে অর্ডার কনফার্ম করবেন, এরপর পণ্য পাঠানো হবে।"],
];

export function Faq() {
  return (
    <div className="space-y-3">
      {FAQS.map(([q, a]) => (
        <details
          key={q}
          className="group rounded-2xl bg-card px-4 py-3 shadow-card [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-[15px] font-semibold">
            <span className="min-w-0">{q}</span>
            <span className="shrink-0 text-primary transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  );
}
