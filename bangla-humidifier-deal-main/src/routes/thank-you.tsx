import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Phone } from "lucide-react";
import { useEffect } from "react";
import { siteConfig } from "@/data/siteConfig";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { trackPendingPurchase } from "@/lib/purchase-tracking";

export const Route = createFileRoute("/thank-you")({
  validateSearch: (search: Record<string, unknown>) => ({ phone: typeof search.phone === "string" ? search.phone : "", total: Number(search.total) || 0 }),
  head: () => ({ meta: [{ title: "অর্ডার নিশ্চিত | GizmoZone BD" }, { name: "description", content: "আপনার GizmoZone BD অর্ডারটি গ্রহণ করা হয়েছে।" }] }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { phone, total } = Route.useSearch();
  useEffect(() => {
    trackPendingPurchase();
  }, []);
  return <div><StoreHeader /><main className="min-h-[65vh] bg-gradient-hero px-4 py-12"><div className="mx-auto max-w-lg rounded-3xl bg-card p-7 text-center shadow-soft"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success"><Check className="h-10 w-10" /></div><h1 className="mt-5 text-3xl font-extrabold">ধন্যবাদ! অর্ডার পেয়েছি</h1><p className="mt-3 leading-relaxed text-muted-foreground">আমাদের প্রতিনিধি শীঘ্রই {phone && <span className="font-bold text-foreground">{phone}</span>} নাম্বারে কল করে অর্ডার কনফার্ম করবেন।</p>{total > 0 && <p className="mt-5 rounded-2xl bg-secondary px-4 py-4 font-bold">আনুমানিক সর্বমোট: <span className="text-primary">৳{total}</span></p>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><a href={`tel:${siteConfig.phone}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground"><Phone className="h-4 w-4" /> কল করুন</a><a href={`https://wa.me/88${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a></div><Link to="/" className="mt-6 inline-block text-sm font-bold text-primary">← শপিং চালিয়ে যান</Link></div></main><StoreFooter /></div>;
}
