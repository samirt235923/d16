import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDiscountPercent, getProduct, products } from "@/data/products";
import type { Product } from "@/data/products";
import { fetchPublishedProducts } from "@/lib/product-repository";
import { siteConfig } from "@/data/siteConfig";
import { addToCart } from "@/lib/cart";
import { getAnonymousSupabaseClient } from "@/lib/supabase";
import { StoreFooter, TrustStrip } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { ProductCard } from "@/components/store/ProductCard";
import { Countdown } from "@/components/landing/Countdown";
import { VideoCard } from "@/components/landing/VideoCard";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "পণ্য | GizmoZone BD" },
      {
        name: "description",
        content: "GizmoZone BD-এর product details ও ক্যাশ অন ডেলিভারি অর্ডার।",
      },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [catalog, setCatalog] = useState(products);
  useEffect(() => {
    void fetchPublishedProducts().then(setCatalog);
  }, []);
  const product = catalog.find((item) => item.slug === slug) ?? getProduct(slug);
  if (!product) return <NotFoundProduct />;
  const related = catalog
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categories ?? [item.category]).some((category) =>
          (product.categories ?? [product.category]).includes(category),
        ),
    )
    .slice(0, 4);
  return (
    <div>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.seoDescription,
          image: product.images,
          offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: product.offerPrice,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        })}
      </script>
      <StoreHeader />
      <main>
        <ProductHero product={product} />
        <TrustStrip />
        <ProductBody product={product} related={related} />
      </main>
      <StoreFooter />
    </div>
  );
}

function ProductHero({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const variants = product.variants ?? [];
  const totalStock = variants.reduce((sum, variant) => sum + (Number(variant.stockQuantity) || 0), 0) || product.stockQuantity || 0;
  const variantGroups = Array.from(new Set(variants.map((variant) => variant.name)));
  const variantKey = (variant: NonNullable<Product["variants"]>[number]) =>
    variant.id ?? `${variant.name}:${variant.value}`;
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | undefined>(
    variants[0] ? variantKey(variants[0]) : undefined,
  );
  const selectedVariant = variants.find((variant) => variantKey(variant) === selectedVariantKey);
  const currentPrice = selectedVariant?.price ?? product.offerPrice;
  const discount = product.regularPrice > 0
    ? Math.max(0, Math.round((1 - currentPrice / product.regularPrice) * 100))
    : 0;
  const buy = () => {
    addToCart(product, quantity, selectedVariant);
    navigate({ to: "/checkout", search: { product: product.slug, qty: quantity, color: selectedVariant?.value === "সাদা" ? "white" : "black" } });
  };
  const add = () => addToCart(product, quantity, selectedVariant);
  return (
    <section className="bg-gradient-hero px-4 py-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-card shadow-soft">
            <img
              src={product.images[active]}
              alt={product.name}
              width={1000}
              height={1000}
              fetchPriority="high"
              className="aspect-square w-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="আগের ছবি"
                  onClick={() =>
                    setActive((active - 1 + product.images.length) % product.images.length)
                  }
                  className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  aria-label="পরের ছবি"
                  onClick={() => setActive((active + 1) % product.images.length)}
                  className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${active === index ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={image}
                    alt={`${product.shortTitle} ছবি ${index + 1}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {product.badge && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-primary-foreground">
                {discount}% সাশ্রয়
              </span>
            )}
          </div>
          <p className="mt-4 text-sm font-bold text-primary">{product.shortTitle}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">
            {product.heroHeadline}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {product.heroSubtext}
          </p>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-5xl font-extrabold text-primary">৳{currentPrice}</span>
            <span className="pb-1 text-lg text-muted-foreground line-through">
              ৳{product.regularPrice}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-success">
            আপনার সাশ্রয় ৳{product.regularPrice - currentPrice}
          </p>
          {product.stockMessage && (
            <p className="mt-3 text-sm font-bold text-warning">
              {product.stockMessage}
            </p>
          )}
          {!product.stockMessage && totalStock > 0 && totalStock <= 12 && (
            <p className="mt-3 text-sm font-bold text-warning">
              স্টকে মাত্র {totalStock} পিস আছে
            </p>
          )}
          {product.countdownEnabled && (
            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-3">
              <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-warning">
                ⏳ অফার শেষ হতে আর মাত্র
              </p>
              <Countdown
                durationSeconds={product.countdownDurationSeconds || 2 * 3600 + 15 * 60 + 48}
                storageKey={product.slug}
              />
            </div>
          )}
          <p
            className={`mt-4 text-sm font-bold ${product.inStock ? "text-success" : "text-destructive"}`}
          >
            {product.inStock ? "✓ স্টকে আছে — অর্ডার করা যাচ্ছে" : "এই মুহূর্তে স্টক শেষ"}
          </p>

          {variants.length > 0 && (
            <div className="mt-5 space-y-4">
              {variantGroups.map((group) => (
                <div key={group}>
                  <p className="text-sm font-bold text-foreground">{group} বেছে নিন</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {variants.filter((variant) => variant.name === group).map((variant) => {
                      const isActive = variantKey(variant) === selectedVariantKey;
                      return (
                        <button
                          key={variant.id ?? `${variant.name}-${variant.value}`}
                          type="button"
                          disabled={variant.stockQuantity === 0}
                          onClick={() => setSelectedVariantKey(variantKey(variant))}
                          className={`relative flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-all ${
                            isActive
                              ? "border-primary bg-brand-soft text-accent-foreground shadow-card"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {group.toLowerCase().includes("color") && (
                            <span
                              className="h-6 w-6 shrink-0 rounded-full border border-border"
                              style={{ backgroundColor: variant.value.toLowerCase().includes("white") || variant.value === "সাদা" ? "#f3f4f6" : "#1c1c1e" }}
                            />
                          )}
                          {variant.value}
                          {variant.price != null && <span className="ml-auto">৳{variant.price}</span>}
                          {isActive && <Check className="ml-auto h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <div className="flex h-12 items-center rounded-xl border border-border bg-card">
              <button
                type="button"
                aria-label="পরিমাণ কমান"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid h-full w-11 place-items-center text-xl font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                type="button"
                aria-label="পরিমাণ বাড়ান"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                className="grid h-full w-11 place-items-center text-xl font-bold"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={buy}
              className="btn-cta flex-1 disabled:opacity-50"
            >
              অর্ডার করুন
            </button>
          </div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={add}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-card px-4 font-bold text-primary disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" /> কার্টে যোগ করুন
          </button>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-4">
            <span>💵 হাতে পেয়ে টাকা</span>
            <span>🚚 সারা দেশে delivery</span>
            <span>📞 কল সাপোর্ট</span>
            <span>↩️ সহজ রিটার্ন</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductBody({
  product,
  related,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  related: typeof products;
}) {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="text-2xl font-extrabold">কেন এই প্রোডাক্ট?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-secondary p-4">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="mt-2 font-bold">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-3 lg:grid-cols-2">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-xl font-extrabold">বিস্তারিত তথ্য</h2>
          {product.descriptionHtml ? (
            <div
              className="prose mt-3 max-w-none text-sm text-muted-foreground [&_h2]:font-extrabold [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            product.longDescription.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))
          )}
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {product.keyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" /> {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-xl font-extrabold">Product Specifications</h2>
          <div className="mt-4 divide-y divide-border text-sm">
            {product.specifications.map((spec) => (
              <div key={spec.label} className="grid grid-cols-2 gap-3 py-2">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {product.videos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-7">
          <h2 className="text-2xl font-extrabold">ভিডিওতে দেখে নিন</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {product.videos.map((video, index) => (
              <VideoCard
                key={video}
                src={video}
                poster={product.videoPosters[index] ?? product.images[0]}
                label={`${product.shortTitle} ভিডিও ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}
      {product.howToUse.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-7">
          <h2 className="text-2xl font-extrabold">মাত্র কয়েকটি ধাপেই ব্যবহার করুন</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {product.howToUse.map((step) => (
              <div key={step.step} className="rounded-2xl bg-card p-4 shadow-card">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft font-bold text-primary">
                  {step.step}
                </span>
                <h3 className="mt-3 font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {product.feedbackImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-7">
          <h2 className="text-2xl font-extrabold">যারা ব্যবহার করেছেন, তারা কী বলছেন?</h2>
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
            {product.feedbackImages.map((image) => (
              <img
                key={image}
                src={image}
                alt="কাস্টমার ফিডব্যাক"
                loading="lazy"
                width={300}
                height={400}
                className="w-[72%] max-w-[280px] shrink-0 snap-center rounded-2xl object-cover shadow-card"
              />
            ))}
          </div>
        </section>
      )}
      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="rounded-3xl bg-brand-soft p-5">
          <h2 className="text-xl font-extrabold">ডেলিভারি চার্জ ও পেমেন্ট</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">ঢাকার ভিতরে</p>
              <p className="text-2xl font-bold text-primary">৳{product.deliveryDhaka ?? siteConfig.delivery.insideDhaka}</p>
            </div>
            <div className="rounded-2xl bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">ঢাকার বাইরে</p>
              <p className="text-2xl font-bold text-primary">৳{product.deliveryOutsideDhaka ?? siteConfig.delivery.outsideDhaka}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-accent-foreground">{siteConfig.codText}</p>
        </div>
      </section>
      <CustomerReviewsSection product={product} />
      {product.faqs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-7">
          <h2 className="text-2xl font-extrabold">সাধারণ জিজ্ঞাসা</h2>
          <div className="mt-4 space-y-3">
            {product.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-card px-4 py-3 shadow-card [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
                  <span>{faq.question}</span>
                  <span className="text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-7">
          <h2 className="text-2xl font-extrabold">সম্পর্কিত পণ্য</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type ReviewRow = {
  id: string;
  product_id: string | null;
  product_slug: string;
  customer_name: string;
  rating: number;
  review_text: string;
  customer_image: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
  admin_note: string | null;
};

function CustomerReviewsSection({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const { data, error } = await getAnonymousSupabaseClient()
        .from("product_reviews")
        .select(
          "id,product_id,product_slug,customer_name,rating,review_text,customer_image,status,created_at,approved_at,admin_note",
        )
        .eq("product_slug", product.slug)
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error) setReviews((data ?? []) as ReviewRow[]);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [product.slug]);

  const summary = useMemo(() => {
    if (!reviews.length) {
      return { average: 0, total: 0 };
    }
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return { average: total / reviews.length, total: reviews.length };
  }, [reviews]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">যারা ব্যবহার করেছেন, তারা কী বলছেন?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.total ? `${summary.total}টি ভেরিফাইড রিভিউ` : "কোনো প্রকাশিত মতামত নেই"}
          </p>
        </div>
        {summary.total > 0 && (
          <div className="rounded-2xl bg-card px-4 py-3 shadow-card">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-primary">
                {summary.average.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <div className="mt-1 text-sm font-medium text-amber-500">
              {"★".repeat(Math.round(summary.average))}
              {"☆".repeat(5 - Math.round(summary.average))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-card">
              রিভিউ লোড হচ্ছে...
            </div>
          ) : reviews.length ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-amber-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  “{review.review_text}”
                </p>
                {review.customer_image && (
                  <img
                    src={review.customer_image}
                    alt={`${review.customer_name}-এর product photo`}
                    className="mt-4 max-h-80 w-full rounded-xl bg-secondary/40 object-contain"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground shadow-card">
              এখনও কোনো প্রকাশিত রিভিউ নেই। আপনি প্রথমটি লিখে দিতে পারেন।
            </div>
          )}
        </div>
        <ReviewSubmissionForm
          product={product}
          onSubmitted={() => {
            void loadReviews();
          }}
        />
      </div>
    </section>
  );
}

function ReviewSubmissionForm({
  product,
  onSubmitted,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    reviewText: "",
    customerImage: "",
  });
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const uploadCustomerImage = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG, PNG অথবা WEBP image upload করুন।");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image-এর size সর্বোচ্চ ৫MB হতে পারবে।");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const storage = getAnonymousSupabaseClient().storage.from("product-media");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `reviews/${product.slug}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await storage.upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) {
        setError(uploadError.message || "Image upload করা যায়নি।");
        return;
      }
      setForm((current) => ({
        ...current,
        customerImage: storage.getPublicUrl(path).data.publicUrl,
      }));
    } catch {
      setError("Image upload করার সময় সমস্যা হয়েছে।");
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || form.reviewText.trim().length < 10) {
      setError("নাম লিখুন এবং কমপক্ষে ১০ অক্ষরের রিভিউ দিন।");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const { error: insertError } = await getAnonymousSupabaseClient().from("product_reviews").insert({
        product_id: null,
        product_slug: product.slug,
        customer_name: form.name.trim(),
        rating: Number(form.rating),
        review_text: form.reviewText.trim(),
        customer_image: form.customerImage.trim() || null,
        status: "pending",
      });

      if (insertError) {
        setError(insertError.message || "রিভিউ জমা দিতে ব্যর্থ হয়েছে।");
      } else {
        setSuccess("ধন্যবাদ! আপনার রিভিউ জমা হয়েছে এবং অনুমোদনের জন্য অপেক্ষা করছে।");
        setForm({ name: "", rating: 5, reviewText: "", customerImage: "" });
        onSubmitted();
      }
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="rounded-3xl bg-card p-5 shadow-soft">
      <h3 className="text-xl font-extrabold">রিভিউ লিখুন</h3>
      <p className="mt-1 text-sm text-muted-foreground">আপনার অভিজ্ঞতা শেয়ার করুন।</p>
      <div className="mt-4 space-y-3">
        <input
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="আপনার নাম"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        />
        <label className="block text-sm font-medium text-muted-foreground">
          রেটিং
          <select
            value={form.rating}
            onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} স্টার
              </option>
            ))}
          </select>
        </label>
        <textarea
          required
          rows={5}
          value={form.reviewText}
          onChange={(event) => setForm({ ...form, reviewText: event.target.value })}
          placeholder="আপনার মূল্যায়ন লিখুন..."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Product-এর সাথে আপনার ছবি (ঐচ্ছিক)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || uploadingImage}
              onChange={(event) => void uploadCustomerImage(event.target.files?.[0])}
              className="mt-1 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-semibold"
            />
          </label>
          {uploadingImage && <p className="text-xs text-muted-foreground">Image upload হচ্ছে...</p>}
          {form.customerImage && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-2">
              <img
                src={form.customerImage}
                alt="আপলোড করা customer image"
                className="h-14 w-14 rounded-lg object-cover"
              />
              <p className="text-xs text-muted-foreground">Image যুক্ত হয়েছে</p>
            </div>
          )}
          <input
            value={form.customerImage}
            onChange={(event) => setForm({ ...form, customerImage: event.target.value })}
            placeholder="অথবা image URL দিন (ঐচ্ছিক)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-success">{success}</p>}
      <button type="submit" disabled={busy} className="btn-cta mt-4 w-full disabled:opacity-60">
        {busy ? "জমা হচ্ছে..." : "রিভিউ পাঠান"}
      </button>
    </form>
  );
}

function NotFoundProduct() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-[60vh] max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold">পণ্যটি পাওয়া যায়নি</h1>
        <p className="mt-3 text-muted-foreground">এই product link-টি আর available নেই।</p>
        <Link to="/" className="btn-cta mx-auto mt-6 max-w-xs">
          শপে ফিরে যান
        </Link>
      </main>
      <StoreFooter />
    </>
  );
}
