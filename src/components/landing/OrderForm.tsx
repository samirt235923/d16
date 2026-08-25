import { useState } from "react";
import { PRICE, DELIVERY_INSIDE, DELIVERY_OUTSIDE } from "@/lib/media";

export function OrderForm() {
  const [area, setArea] = useState<"inside" | "outside">("inside");
  const [color, setColor] = useState<"black" | "white">("black");
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [debugAttempts, setDebugAttempts] = useState<Array<{ url: string; status?: number; ok?: boolean; error?: string }>>([]);

  const delivery = area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
  const subtotal = PRICE * qty;
  const total = subtotal + delivery;

  const nameOk = form.name.trim().length > 1;
  const phoneOk = /^01\d{9}$/.test(form.phone.trim());
  const addressOk = form.address.trim().length > 5;
  const valid = nameOk && phoneOk && addressOk;

  const field = (ok: boolean) =>
    `w-full rounded-2xl border bg-background px-4 py-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/15 ${
      touched && !ok ? "border-destructive" : "border-border"
    }`;

  if (done) {
    return (
      <div className="rounded-3xl bg-card p-7 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-3xl text-success">
          ✓
        </div>
        <h3 className="mt-4 text-xl font-bold">অর্ডার রিকোয়েস্ট পেয়েছি!</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          আমাদের প্রতিনিধি শীঘ্রই <span className="font-semibold text-foreground">{form.phone}</span>{" "}
          নাম্বারে ফোন করে অর্ডার কনফার্ম করবেন। পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।
        </p>
        <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold">
          সর্বমোট পরিশোধ করবেন: <span className="text-primary">৳{total}</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setTouched(true);
            if (valid) {
              // send order to server API
              try {
                  const payload = { ...form, qty, color, area };
                  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
                  const candidatePorts = [window.location.port, "8082", "8081", "8080", "3000"]
                    .filter(Boolean)
                    .map(String);

                  const endpoints = [
                    "/management-api/orders",
                    ...candidatePorts.map((p) => `http://${host}:${p}/management-api/orders`),
                  ];

                  let res: Response | null = null;
                  for (const url of endpoints) {
                    try {
                      console.log("Trying order POST to:", url);
                      res = await fetch(url, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      setDebugAttempts((s) => [...s, { url, status: res?.status, ok: res?.ok }]);
                      if (res && res.ok) {
                        console.log("Order successfully posted to", url);
                        break;
                      }
                      // if non-ok, continue to next
                      console.warn("Non-ok response from", url, res && res.status);
                      setDebugAttempts((s) => [...s, { url, status: res?.status, ok: res?.ok, error: "non-ok" }]);
                    } catch (err) {
                      console.warn("Submit to", url, "failed:", err);
                      setDebugAttempts((s) => [...s, { url, error: String(err) }]);
                      res = null;
                    }
                  }

                  if (!res) {
                    alert("Failed to submit order to any known backend endpoints. Open the site on the same dev port as the server or check console for errors.");
                    return;
                  }

                  if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    console.error("Order API error:", res.status, text);
                    alert("Failed to submit order. Please try again.");
                    return;
                  }

                  const created = await res.json().catch(() => null);
                  console.log("Order created:", created);
                  setDone(true);
                } catch (e) {
                  console.error(e);
                  alert("Network error submitting order");
                  return;
                }
            }
      }}
      className="overflow-hidden rounded-3xl bg-card shadow-soft"
    >
      <div className="flex items-center gap-2 bg-gradient-cta px-5 py-3.5 text-primary-foreground">
        <span className="text-lg">🛒</span>
        <p className="text-[15px] font-bold">অর্ডার ফর্ম — ১ মিনিটেই শেষ</p>
      </div>

      <div className="space-y-5 p-5">
        {debugAttempts.length > 0 && (
          <div className="rounded-2xl border border-border bg-secondary p-3 text-xs">
            <div className="font-semibold">Debug attempts</div>
            {debugAttempts.map((d, i) => (
              <div key={i} className="mt-1">
                <div>{d.url}</div>
                <div className="text-muted-foreground">
                  {d.ok ? `ok (${d.status})` : d.status ? `status ${d.status}` : d.error}
                </div>
              </div>
            ))}
          </div>
        )}
        <StepField
          step="১"
          label="আপনার নাম"
          error={touched && !nameOk ? "নাম লিখুন" : undefined}
        >
          <input
            className={field(nameOk)}
            placeholder="আপনার নাম লিখুন"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </StepField>

        <StepField
          step="২"
          label="মোবাইল নাম্বার"
          error={touched && !phoneOk ? "সঠিক ১১ ডিজিটের নাম্বার দিন" : undefined}
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
        </StepField>

        <StepField
          step="৩"
          label="সম্পূর্ণ ঠিকানা"
          error={touched && !addressOk ? "সম্পূর্ণ ঠিকানা লিখুন" : undefined}
        >
          <textarea
            rows={3}
            className={field(addressOk)}
            placeholder="গ্রাম/বাড়ি, রোড, থানা, জেলা"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </StepField>

        <StepField step="৪" label="কালার বাছাই করুন">
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
                  className={`relative flex items-center gap-2.5 rounded-2xl border-2 px-3 py-3.5 text-sm font-bold transition-all ${
                    active
                      ? "border-primary bg-brand-soft text-accent-foreground shadow-card"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: swatch }}
                  />
                  {label}
                  {active && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </StepField>

        <StepField step="৫" label="ডেলিভারি এলাকা">
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
                  className={`relative rounded-2xl border-2 px-3 py-3.5 text-sm font-bold transition-all ${
                    active
                      ? "border-primary bg-brand-soft text-accent-foreground shadow-card"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                      ✓
                    </span>
                  )}
                  {label}
                  <span className="mt-1 block text-xs font-medium">ডেলিভারি ৳{charge}</span>
                </button>
              );
            })}
          </div>
        </StepField>

        <StepField step="৬" label="পরিমাণ">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-background px-4 py-2.5">
            <button
              type="button"
              aria-label="কমান"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-xl font-bold"
            >
              −
            </button>
            <span className="flex-1 text-center text-lg font-bold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="বাড়ান"
              onClick={() => setQty((q) => Math.min(5, q + 1))}
              className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-xl font-bold text-primary"
            >
              +
            </button>
          </div>
        </StepField>

        <div className="rounded-2xl bg-secondary p-4 text-sm">
          <Row label={`D16 Humidifier (${color === "black" ? "কালো" : "সাদা"}) × ${qty}`} value={`৳${subtotal}`} />
          <Row label="ডেলিভারি চার্জ" value={`৳${delivery}`} />
          <div className="my-2 border-t border-border" />
          <div className="flex items-center justify-between text-base font-bold">
            <span>সর্বমোট</span>
            <span className="text-xl text-primary">৳{total}</span>
          </div>
        </div>

        <button type="submit" className="btn-cta">
          ক্যাশ অন ডেলিভারিতে অর্ডার করুন
        </button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          🔒 আপনার তথ্য সম্পূর্ণ গোপন থাকবে · অর্ডার কনফার্ম করতে আমাদের প্রতিনিধি ফোন করবেন
        </p>
      </div>
    </form>
  );
}

function StepField({
  step,
  label,
  error,
  children,
}: {
  step: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-primary">
          {step}
        </span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
