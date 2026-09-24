import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";

export const Route = createFileRoute("/return-refund-policy")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy | GizmoZone BD" },
      { name: "description", content: "Return and refund terms for orders placed on GizmoZone BD." },
    ],
  }),
  component: ReturnRefundPolicyPage,
});

function ReturnRefundPolicyPage() {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>

        <article className="mt-6 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Policy</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Return / Refund Policy</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              We want every customer to be satisfied with their purchase. This policy explains the
              conditions under which product returns or refund requests may be accepted.
            </p>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">1. Product Condition</h2>
              <p className="mt-2">
                We accept return requests only when the product is damaged, defective, or different
                from what was ordered. The product must be returned in its original condition with all
                packaging, accessories, and proof of purchase.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">2. Time Limit</h2>
              <p className="mt-2">
                Claims for wrong delivery, damaged products, or missing items must be reported within
                <strong> 24 hours</strong> of parcel delivery. If a defect is discovered later, the
                customer must notify us within <strong>3 days</strong> of receiving the parcel so the
                issue can be reviewed and resolved fairly.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">3. Non-Returnable Items</h2>
              <p className="mt-2">
                Items that have been used, installed, damaged by the customer, or are not returned in
                original condition may not be eligible for return or refund. Custom or special-order
                items may also be excluded unless a defect is confirmed.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">4. Refund Process</h2>
              <p className="mt-2">
                Once a return or refund request is approved, refunds will be processed within
                <strong> 5–7 working days</strong> to the original payment method or bKash/Nagad
                account, depending on the payment channel and verification timeline.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">5. Return Shipping and Courier Charges</h2>
              <p className="mt-2">
                If the product is damaged, incorrect, or defective due to our error, GizmoZone BD will
                cover the return shipping cost. For customer change-of-mind requests, size exchanges,
                or returns caused by customer preference, the customer is responsible for the return
                courier charge. We will communicate the approved return method before collecting the
                item.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">6. Delivery and Shipping Issues</h2>
              <p className="mt-2">
                Estimated delivery time is <strong>2–3 business days</strong> inside Dhaka and
                <strong> 3–5 business days</strong> outside Dhaka. If the product is delivered damaged
                or incorrect, please contact us with photos and your order details. We may arrange a
                replacement or refund after verification.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">7. Customer Support</h2>
              <p className="mt-2">
                For any return or refund concern, please contact our support team by WhatsApp or phone.
                We will review each case individually and provide a fair resolution.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <h3 className="text-base font-extrabold text-foreground">Contact Us</h3>
              <div className="mt-3 space-y-2 text-sm text-foreground">
                <p><strong>Phone / WhatsApp:</strong> 01935710706</p>
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
