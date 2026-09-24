import { Facebook, MessageCircle, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { categories } from "@/data/categories";
import { siteConfig } from "@/data/siteConfig";

export function TrustStrip() {
  return <div className="border-y border-border bg-card"><div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border sm:grid-cols-4">{["ক্যাশ অন ডেলিভারি", "সারা দেশে ডেলিভারি", "সহজ রিটার্ন", "কল সাপোর্ট"].map((item) => <div key={item} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground sm:text-sm">✓ {item}</div>)}</div></div>;
}

export function StoreFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-foreground px-4 py-10 text-background">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xl font-extrabold text-primary-foreground">{siteConfig.brandName}</p>
          <p className="mt-2 text-sm text-background/70">{siteConfig.footerInfo}</p>
        </div>
        <div>
          <h3 className="font-bold">ক্যাটাগরি</h3>
          <div className="mt-3 space-y-2 text-sm text-background/70">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="block hover:text-background"
              >
                {category.icon} {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold">যোগাযোগ</h3>
          <div className="mt-3 space-y-2 text-sm text-background/70">
            <a className="flex items-center gap-2 hover:text-background" href={`tel:${siteConfig.phone}`}>
              <Phone className="h-4 w-4" /> {siteConfig.phone}
            </a>
            <a
              className="flex items-center gap-2 hover:text-background"
              href={`https://wa.me/88${siteConfig.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Support
            </a>
            <a
              className="flex items-center gap-2 hover:text-background"
              href={siteConfig.facebookPage}
              target="_blank"
              rel="noreferrer"
            >
              <Facebook className="h-4 w-4" /> Facebook Page
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold">নিয়ম ও নীতি</h3>
          <div className="mt-3 space-y-2 text-sm text-background/70">
            <Link to="/contact" className="block hover:text-background">
              Contact Us
            </Link>
            <Link to="/privacy-policy" className="block hover:text-background">
              Privacy Policy
            </Link>
            <Link to="/return-refund-policy" className="block hover:text-background">
              Return / Refund Policy
            </Link>
            <Link to="/terms" className="block hover:text-background">
              Terms & Conditions
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">ডেলিভারি ও পেমেন্ট</h3>
          <p className="mt-3 text-sm leading-relaxed text-background/70">
            {siteConfig.codText}
          </p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-background/15 pt-5 text-xs text-background/50">
        © {new Date().getFullYear()} {siteConfig.brandName}. সর্বস্বত্ব সংরক্ষিত।
      </p>
    </footer>
  );
}

