import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/product_1770548124_69886b9c71c18.jpg";
import { PRICE, OLD_PRICE, DELIVERY_INSIDE, DELIVERY_OUTSIDE } from "@/lib/media";

const title = "অর্ডার করুন — D16 Mini Air Humidifier ৳449 (ক্যাশ অন ডেলিভারি)";
const description =
  "নাম, মোবাইল নাম্বার আর ঠিকানা দিন — আমরা ফোন করে অর্ডার কনফার্ম করব। পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।";

export const Route = createFileRoute("/order")({
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
  component: OrderPage,
});

function OrderPage() {
  const [area, setArea] = useState<"inside" | "outside">("inside");
  const [color, setColor] = useState<"black" | "white">("black");
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const delivery = area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
  const subtotal = PRICE * qty;
  const total = subtotal + delivery;

  const nameOk = form.name.trim().length > 1;
  const phoneOk = /^01\d{9}$/.test(form.phone.trim());
  const addressOk = form.address.trim().length > 5;
  const valid = nameOk && phoneOk && addressOk;

  const field = (ok: boolean) =>
    `w-full rounded-2xl border-2 bg-background px-4 py-4 text-lg outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary ${
      touched && !ok ? "border-destructive" : "border-border"
    }`;

  if (done) {
    return (
      <main className="min-h-screen bg-gradient-hero px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl bg-card p-7 text-center shadow-soft">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-4xl text-success">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold">ধন্যবাদ! অর্ডার পেয়েছি</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            আমাদের প্রতিনিধি শীঘ্রই{" "}
            <span className="font-bold text-foreground">{form.phone}</span> নাম্বারে কল
            করবেন। ফোন ধরে অর্ডার কনফার্ম করুন।
          </p>
          <div className="mt-5 rounded-2xl bg-secondary px-4 py-4 text-lg font-bold">
            হাতে পেয়ে দিবেন: <span className="text-primary">৳{total}</span>
          </div>
          <Link to="/" className="mt-5 inline-block text-sm font-semibold text-primary">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-hero pb-28">
      <header className="flex items-center gap-3 px-4 py-4">
        <Link
          to="/"
          aria-label="পেছনে যান"
          className="grid h-10 w-10 place-items-center rounded-full bg-card text-xl shadow-card"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold">সহজ অর্ডার ফর্ম</h1>
      </header>

      <div className="mx-auto max-w-md px-4">
        {/* Product summary */}
        <div className="flex items-center gap-3 rounded-3xl bg-card p-3 shadow-card">
          <img
            src={heroImg}
            alt="D16 Mini Air Humidifier"
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">D16 Mini Air Humidifier</p>
            <p className="mt-0.5">
              <span className="text-2xl font-bold text-primary">৳{PRICE}</span>{" "}
              <span className="text-sm text-muted-foreground line-through">৳{OLD_PRICE}</span>
            </p>
            <p className="text-xs font-semibold text-success">💵 ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>

        <p className="mt-4 rounded-2xl bg-card px-4 py-3 text-center text-sm font-semibold shadow-card">
          শুধু ৩টি তথ্য দিন — বাকিটা আমরা ফোনে করে নিব 📞
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setTouched(true);
            if (!valid) return;
            const payload = { ...form, qty, color, area };
            try {
              let res: Response | null = null;
              try {
                res = await fetch(`/management-api/orders`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify(payload),
                });
              } catch (err) {
                console.warn("Primary submit failed:", err);
              }
              if (!res || !res.ok) {
                try {
                  res = await fetch(`http://localhost:8082/management-api/orders`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                } catch (err) {
                  console.warn("Fallback submit failed:", err);
                }
              }
              if (!res) {
                alert("Failed to submit order. Check console for details.");
                return;
              }
              if (!res.ok) {
                const txt = await res.text().catch(() => "");
                console.error("Order API error", res.status, txt);
                alert("Order submission failed.");
                return;
              }
            } catch (e) {
              console.error(e);
              alert("Network error submitting order");
              return;
            }
            setDone(true);
          }}
          className="mt-4 space-y-5 rounded-3xl bg-card p-5 shadow-soft"
        >
          <Field label="১) আপনার নাম" error={touched && !nameOk ? "নাম লিখুন" : undefined}>
            <input
              className={field(nameOk)}
              placeholder="যেমন: রহিম উদ্দিন"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field
            label="২) মোবাইল নাম্বার"
            error={touched && !phoneOk ? "১১ ডিজিটের নাম্বার দিন (01XXXXXXXXX)" : undefined}
          >
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className={field(phoneOk)}
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>

          <Field
            label="৩) ঠিকানা"
            error={touched && !addressOk ? "সম্পূর্ণ ঠিকানা লিখুন" : undefined}
          >
            <textarea
              rows={3}
              className={field(addressOk)}
              placeholder="গ্রাম/বাড়ি, রোড, থানা, জেলা"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          <Field label="৪) আপনি কোথায় আছেন?">
            <div className="grid grid-cols-2 gap-3">
              {([
                ["inside", "ঢাকার ভিতরে", DELIVERY_INSIDE],
                ["outside", "ঢাকার বাইরে", DELIVERY_OUTSIDE],
              ] as const).map(([key, label, charge]) => {
                const active = area === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setArea(key)}
                    className={`rounded-2xl border-2 px-3 py-4 text-[15px] font-bold transition-all ${
                      active
                        ? "border-primary bg-brand-soft text-accent-foreground shadow-card"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {label}
                    <span className="mt-1 block text-xs font-medium">ডেলিভারি ৳{charge}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="৫) কালার বাছাই করুন">
            <div className="grid grid-cols-2 gap-3">
              {([
                ["black", "কালো", "#1c1c1e"],
                ["white", "সাদা", "#f3f4f6"],
              ] as const).map(([key, label, swatch]) => {
                const active = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-[15px] font-bold transition-all ${
                      active
                        ? "border-primary bg-brand-soft text-accent-foreground shadow-card"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: swatch }}
                    />
                    {label}
                    {active && (
                      <span className="ml-auto text-xs text-primary">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="৬) পরিমাণ">
            <div className="flex items-center gap-4 rounded-2xl border-2 border-border bg-background px-4 py-3">
              <button
                type="button"
                aria-label="কমান"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-2xl font-bold"
              >
                −
              </button>
              <span className="flex-1 text-center text-xl font-bold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                aria-label="বাড়ান"
                onClick={() => setQty((q) => Math.min(5, q + 1))}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-2xl font-bold text-primary"
              >
                +
              </button>
            </div>
          </Field>

          <div className="rounded-2xl bg-secondary p-4">
            <div className="flex items-center justify-between py-1 text-sm text-muted-foreground">
              <span>D16 Humidifier ({color === "black" ? "কালো" : "সাদা"}) × {qty}</span>
              <span className="font-semibold text-foreground">৳{subtotal}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm text-muted-foreground">
              <span>ডেলিভারি চার্জ</span>
              <span className="font-semibold text-foreground">৳{delivery}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>সর্বমোট</span>
              <span className="text-2xl text-primary">৳{total}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              হাতে পেয়ে পরিশোধ করবেন — এখন কোনো টাকা লাগবে না
            </p>
          </div>

          <button type="submit" className="btn-cta">
            অর্ডার কনফার্ম করুন ✅
          </button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            🔒 আপনার তথ্য গোপন থাকবে · এখন কোনো টাকা লাগবে না
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[15px] font-bold">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
