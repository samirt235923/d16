import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";
import { siteConfig } from "@/data/siteConfig";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | GizmoZone BD" },
      { name: "description", content: "Terms and conditions for shopping with GizmoZone BD." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>

        <article className="mt-6 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Agreement</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Terms & Conditions</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              By using this website and placing an order with GizmoZone BD, you agree to the following
              terms and conditions. These terms are intended to protect both the customer and the store.
            </p>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">1. Order Acceptance</h2>
              <p className="mt-2">
                Your order is considered accepted after it is confirmed by our team or processing system.
                We reserve the right to cancel or reject any order if the product is unavailable, the
                payment is invalid, or the order is suspicious or fraudulent.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">2. Pricing</h2>
              <p className="mt-2">
                Product prices are displayed in Bangladeshi Taka (BDT) and may change without prior
                notice. If there is a pricing error or mismatch, we may cancel or correct the order
                before completion.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">3. Payment</h2>
              <p className="mt-2">
                We support cash on delivery and other payment arrangements communicated through the order
                flow. By placing an order, you agree to pay the amount due as displayed at the time of
                order confirmation.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">4. Delivery</h2>
              <p className="mt-2">
                Estimated delivery time is <strong>2–3 business days</strong> inside Dhaka and
                <strong> 3–5 business days</strong> outside Dhaka. Delivery times may vary due to
                courier conditions, weather, public holidays, or force majeure events, but we will do
                our best to keep customers informed throughout the fulfillment process.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">5. Product Quality</h2>
              <p className="mt-2">
                We work to provide genuine and properly checked products. If a product is delivered in a
                damaged or incorrect condition, customers should report it promptly and we will review the
                issue under our return and refund policy.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">6. Limitation of Liability</h2>
              <p className="mt-2">
                GizmoZone BD is not responsible for indirect, incidental, or consequential losses arising
                from product use, order delays, or service interruptions unless required by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">7. Governing Law</h2>
              <p className="mt-2">
                These terms are governed by the laws of Bangladesh. Any dispute related to these terms or
                the sale of goods will be subject to the jurisdiction of the competent courts of Bangladesh.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <h3 className="text-base font-extrabold text-foreground">Contact Us</h3>
              <div className="mt-3 space-y-2 text-sm text-foreground">
                <p><strong>Phone:</strong> {siteConfig.phone}</p>
                <p><strong>WhatsApp:</strong> {siteConfig.whatsapp}</p>
                <p><strong>Office Address:</strong> Matuail jatrabari Dhaka 1362</p>
              </div>
            </div>
          </div>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
