import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | GizmoZone BD" },
      { name: "description", content: "GizmoZone BD privacy policy and customer data handling information." },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>

        <article className="mt-6 rounded-3xl bg-card p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Policy</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              GizmoZone BD respects your privacy and protects your personal information. This Privacy
              Policy explains how we collect, use, store, and handle the information you give us while
              ordering or contacting us.
            </p>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">1. Information We Collect</h2>
              <p className="mt-2">
                We may collect your name, phone number, delivery address, order details, email address,
                and WhatsApp/contact information when you place an order or contact customer support.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">2. How We Use Your Information</h2>
              <p className="mt-2">
                We use the information only for order processing, delivery coordination, payment
                confirmation, customer support, and service improvement. We do not sell or rent your
                personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">3. Data Security</h2>
              <p className="mt-2">
                We take reasonable technical and operational measures to protect your information from
                unauthorized access, disclosure, or misuse. However, no digital system is completely
                risk-free, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">4. Tracking and Advertising</h2>
              <p className="mt-2">
                We use cookies, analytics tools, and the Meta (Facebook) Pixel to understand website
                interactions, measure advertising performance, improve conversion tracking, and deliver
                relevant ads based on customer activity. These tools may collect device, browser, and
                campaign-related data for marketing and analytics purposes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">5. Third-Party Services</h2>
              <p className="mt-2">
                We may use trusted third-party services such as payment gateways, delivery partners, and
                communication tools to process orders and provide support. These providers are expected
                to handle your data in accordance with their own privacy rules.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">6. Your Rights</h2>
              <p className="mt-2">
                You may contact us to request corrections, clarify how your data is being used, or ask
                questions about personal information stored by us. We will respond as quickly as
                reasonably possible.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-foreground">7. Updates to This Policy</h2>
              <p className="mt-2">
                We may update this policy from time to time to reflect changes in our practices or legal
                requirements. The latest version will always be available on this page.
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
