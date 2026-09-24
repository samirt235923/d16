import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getProduct, products } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { addToCart, cartTotal, readCart, writeCart, type CartItem } from "@/lib/cart";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { getAnonymousSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search.product === "string" ? search.product : "",
    qty: Number(search.qty) > 0 ? Number(search.qty) : 1,
    color: search.color === "white" ? "white" : "black",
  }),
  head: () => ({
    meta: [
      { title: "Checkout | GizmoZone BD" },
      { name: "description", content: "GizmoZone BD-তে ক্যাশ অন ডেলিভারি checkout করুন।" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { product: productSlug, qty, color: selectedColor } = Route.useSearch();
  const navigate = useNavigate();
  const selectedProduct = getProduct(productSlug);
  const [items, setItems] = useState<CartItem[]>(() => {
    const current = readCart();
    if (current.length || !selectedProduct) return current;
    addToCart(selectedProduct, qty, selectedColor);
    return readCart();
  });
  const [area, setArea] = useState<"inside" | "outside">("inside");
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstItem = items[0];
  const delivery =
    area === "inside"
      ? (firstItem?.deliveryDhaka ?? siteConfig.delivery.insideDhaka)
      : (firstItem?.deliveryOutsideDhaka ?? siteConfig.delivery.outsideDhaka);
  const insideDelivery = firstItem?.deliveryDhaka ?? siteConfig.delivery.insideDhaka;
  const outsideDelivery = firstItem?.deliveryOutsideDhaka ?? siteConfig.delivery.outsideDhaka;
  const subtotal = cartTotal(items);
  const total = subtotal + (items.length ? delivery : 0);
  const valid =
    form.name.trim().length > 1 &&
    /^01\d{9}$/.test(form.phone.trim()) &&
    form.address.trim().length > 5 &&
    items.length > 0;
  const updateQty = (id: string, amount: number) => {
    const next = items.map((item) =>
      item.productId === id
        ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + amount)) }
        : item,
    );
    setItems(next);
    writeCart(next);
  };
  const remove = (id: string) => {
    const next = items.filter((item) => item.productId !== id);
    setItems(next);
    writeCart(next);
  };
  const field = (ok: boolean) =>
    `w-full rounded-xl border bg-background px-4 py-3 outline-none focus:border-primary ${touched && !ok ? "border-destructive" : "border-border"}`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (!valid || submitting) return;
    setSubmitting(true);
    const payload = {
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
      delivery_area: area,
      items,
      subtotal,
      delivery_charge: delivery,
      total_price: total,
      payment_method: "cash_on_delivery",
    };
    try {
      if (siteConfig.orderWebhookUrl) {
        const response = await fetch(siteConfig.orderWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Webhook failed");
      } else {
        const first = items[0];
        const client = getAnonymousSupabaseClient();
        const selectedColors = items
          .map((item) => item.variantValue ?? (item.color === "white" ? "White" : "Black"))
          .filter((value, index, values) => values.indexOf(value) === index)
          .join(", ");
        const { error: dbError } = await client
          .from("orders")
          .insert({
            customer_name: payload.customer_name,
            phone: payload.phone,
            address: payload.address,
            delivery_area: area,
            color: selectedColors || selectedColor,
            note: payload.note,
            quantity: first?.quantity ?? 1,
            product_name: items.map((item) => `${item.name} × ${item.quantity}`).join(", "),
            product_price: subtotal,
            delivery_charge: delivery,
            total_price: total,
          });
        if (dbError) throw dbError;
      }
      writeCart([]);
      navigate({ to: "/thank-you", search: { phone: form.phone.trim(), total } });
    } catch {
      setError("দুঃখিত, অর্ডারটি সংরক্ষণ করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <StoreHeader />
      <main className="min-h-[70vh] bg-gradient-hero px-4 py-7">
        <div className="mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
            <ArrowLeft className="h-4 w-4" /> শপে ফিরে যান
          </Link>
          <h1 className="mt-5 text-3xl font-extrabold">Checkout</h1>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={submit}
              className="order-2 space-y-4 rounded-3xl bg-card p-5 shadow-soft lg:order-1"
            >
              <h2 className="text-xl font-extrabold">অর্ডার তথ্য</h2>
              <label className="block text-sm font-bold">
                নাম
                <input
                  className={`mt-2 ${field(form.name.trim().length > 1)}`}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="আপনার নাম"
                />
              </label>
              <label className="block text-sm font-bold">
                মোবাইল নম্বর
                <input
                  className={`mt-2 ${field(/^01\d{9}$/.test(form.phone.trim()))}`}
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </label>
              <label className="block text-sm font-bold">
                সম্পূর্ণ ঠিকানা
                <textarea
                  className={`mt-2 ${field(form.address.trim().length > 5)}`}
                  rows={3}
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="গ্রাম/বাড়ি, রোড, থানা, জেলা"
                />
              </label>
              <div>
                <p className="text-sm font-bold">এলাকা</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(
                    [
                      ["inside", "ঢাকার ভিতরে", insideDelivery],
                      ["outside", "ঢাকার বাইরে", outsideDelivery],
                    ] as const
                  ).map(([key, label, charge]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setArea(key)}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-bold ${area === key ? "border-primary bg-brand-soft text-primary" : "border-border"}`}
                    >
                      {label}
                      <span className="mt-1 block text-xs font-normal">৳{charge} delivery</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-sm font-bold">
                নোট <span className="font-normal text-muted-foreground">(optional)</span>
                <textarea
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  rows={2}
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন"
                />
              </label>
              {touched && (!valid || !items.length) && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  নাম, সঠিক মোবাইল নম্বর, সম্পূর্ণ ঠিকানা এবং অন্তত একটি পণ্য দিন।
                </p>
              )}
              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || !items.length}
                className="btn-cta disabled:opacity-50"
              >
                {submitting ? "অর্ডার পাঠানো হচ্ছে..." : "ক্যাশ অন ডেলিভারিতে অর্ডার করুন"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                🔒 এখন কোনো টাকা লাগবে না · পণ্য হাতে পেয়ে payment করবেন
              </p>
            </form>
            <aside className="order-1 h-fit rounded-3xl bg-card p-5 shadow-soft lg:order-2">
              <h2 className="text-xl font-extrabold">আপনার অর্ডার</h2>
              {items.length ? (
                <div className="mt-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-border">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, -1)}
                              className="p-1.5"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, 1)}
                              className="p-1.5"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.productId)}
                            aria-label="পণ্য সরান"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 text-sm">
                    <Summary label="সাবটোটাল" value={`৳${subtotal}`} />
                    <Summary label="ডেলিভারি" value={`৳${delivery}`} />
                    <div className="mt-2 flex justify-between border-t border-border pt-3 text-lg font-extrabold">
                      <span>সর্বমোট</span>
                      <span className="text-primary">৳{total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                  কার্টে কোনো পণ্য নেই।
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
