const FAQS = [
  ["এই Humidifier কীভাবে ব্যবহার করবো?", "Water tank-এ পানি দিন, USB cable সংযুক্ত করুন, তারপর power button চাপুন। Mist mode বেছে নিয়ে ঘরে আরামদায়ক পরিবেশ তৈরি করুন।"],
  ["Delivery charge কত?", "ঢাকার ভিতরে ৳70 এবং ঢাকার বাইরে ৳130।"],
  ["ক্যাশ অন ডেলিভারি আছে কি?", "হ্যাঁ, পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা পরিশোধ করে নেবেন।"],
  ["ঢাকার বাইরে কি ডেলিভারি হয়?", "হ্যাঁ, সারা বাংলাদেশে কুরিয়ারের মাধ্যমে ডেলিভারি করা হয়।"],
  ["কত ml পানি ধরে?", "Water tank-এর ধারণক্ষমতা ১৮০ ml।"],
  ["USB দিয়ে কি চালানো যায়?", "হ্যাঁ, USB পোর্ট, পাওয়ার ব্যাংক বা USB অ্যাডাপ্টার দিয়ে চালানো যায়।"],
  ["অফার মূল্য কত?", "নিয়মিত দাম ৳699 হলেও এখন অফার মূল্য মাত্র ৳399।"],
  ["অর্ডার করার পর কী হবে?", "অর্ডার কনফার্ম হওয়ার পর আমাদের প্রতিনিধি ফাইনাল কনফার্ম করবেন, এরপর পণ্য ডেলিভারি শুরু করা হবে।"],
  ["এই Humidifier-এ Night Light আছে কি?", "হ্যাঁ, এতে ৭-রঙের LED Night Light রয়েছে, যা ঘুমানোর সময় সুন্দর অ্যানবিয়েন্ট লাইট করে।"],
  ["Noise level কত?", "এই ডিভাইসটি খুবই কম শব্দে কাজ করে, তাই শোবার ঘরেও ব্যবহার উপযোগী।"],
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
