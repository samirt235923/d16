import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import { fetchPublishedProducts } from "@/lib/product-repository";
import { categories } from "@/data/categories";
import { StoreFooter, TrustStrip } from "@/components/store/StoreChrome";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "GizmoZone BD | স্মার্ট গ্যাজেটের নির্ভরযোগ্য দোকান" },
      {
        name: "description",
        content: "GizmoZone BD থেকে দরকারি gadget কিনুন ক্যাশ অন ডেলিভারিতে।",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { q = "" } = Route.useSearch();
  const [catalog, setCatalog] = useState(products);
  useEffect(() => {
    void fetchPublishedProducts().then(setCatalog);
  }, []);
  const filtered = useMemo(
    () =>
      catalog.filter(
        (product) =>
          !q || `${product.name} ${product.category}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [catalog, q],
  );
  const featured = filtered.slice(0, 4);
  const bestSellers = filtered.filter((product) => product.badge === "বেস্ট সেলার");
  const newArrivals = filtered.filter((product) => product.badge === "নতুন");
  const hero = catalog[0] ?? products[0];

  return (
    <div>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "GizmoZone BD",
          url: "https://gizmozonebd.online",
        })}
      </script>
      <StoreHeader />
      <main>
        <section className="bg-gradient-hero px-4 py-8 sm:py-12">
          <div className="mx-auto grid max-w-6xl items-center gap-7 md:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                GizmoZone BD · ঘরের জন্য স্মার্ট পণ্য
              </span>
              <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
                আপনার দৈনন্দিন জীবনকে আরও সহজ করুন
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                বিশ্বাসযোগ্য দামে বাছাই করা দরকারি gadget, দ্রুত delivery এবং পণ্য হাতে পেয়ে
                payment-এর সুবিধা।
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/product/$slug"
                  params={{ slug: hero.slug }}
                  className="btn-cta w-auto px-6"
                >
                  আজকের অফার দেখুন <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/category/$slug"
                  params={{ slug: "home-lifestyle" }}
                  className="inline-flex min-h-12 items-center rounded-2xl border border-primary/30 bg-card px-5 font-bold text-primary"
                >
                  সব পণ্য দেখুন
                </Link>
              </div>
            </div>
            <Link
              to="/product/$slug"
              params={{ slug: hero.slug }}
              className="relative overflow-hidden rounded-3xl border border-white/50 bg-card shadow-soft"
            >
              <img
                src={hero.images[0]}
                alt={hero.name}
                width={900}
                height={900}
                fetchPriority="high"
                className="aspect-square w-full object-cover"
              />
              <span className="absolute bottom-4 left-4 rounded-2xl bg-card/95 px-4 py-3 shadow-card">
                <span className="block text-xs text-muted-foreground">বেস্ট সেলার</span>
                <strong>{hero.shortTitle}</strong>
              </span>
            </Link>
          </div>
        </section>
        <TrustStrip />
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-primary">শপ বাই ক্যাটাগরি</p>
              <h2 className="mt-1 text-2xl font-extrabold">আপনার প্রয়োজন বেছে নিন</h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
              >
                <span className="text-3xl">{category.icon}</span>
                <h3 className="mt-3 font-bold">{category.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <ProductSection title="ফিচার্ড প্রোডাক্ট" products={featured} />
        <ProductSection
          title="বেস্ট সেলার"
          products={bestSellers.length ? bestSellers : featured.slice(0, 2)}
        />
        <ProductSection
          title="নতুন এসেছে"
          products={newArrivals.length ? newArrivals : featured.slice(-2)}
        />
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-3xl bg-card p-6 shadow-soft sm:p-8">
            <p className="text-sm font-bold text-primary">কেন GizmoZone BD?</p>
            <h2 className="mt-1 text-2xl font-extrabold">কেনাকাটা হোক নিশ্চিন্তে</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <Reason
                icon={<ShieldCheck />}
                title="বিশ্বাসযোগ্য পণ্য"
                text="প্রতিটি product-এর তথ্য ও দাম পরিষ্কারভাবে দেখুন।"
              />
              <Reason
                icon={<Truck />}
                title="সারা দেশে delivery"
                text="ঢাকা ও ঢাকার বাইরে সহজ delivery ব্যবস্থা।"
              />
              <Reason
                icon={<Undo2 />}
                title="সহজ সাপোর্ট"
                text="প্রয়োজনে ফোন বা WhatsApp-এ আমাদের সাথে কথা বলুন।"
              />
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}

function ProductSection({ title, products: items }: { title: string; products: typeof products }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <span className="text-sm text-muted-foreground">{items.length}টি পণ্য</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
function Reason({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
