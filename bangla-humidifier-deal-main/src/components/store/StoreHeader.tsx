import { useEffect, useState } from "react";
import { Headphones, Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { categories } from "@/data/categories";
import { siteConfig } from "@/data/siteConfig";
import { cartCount, readCart } from "@/lib/cart";

export function StoreHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(() => cartCount());

  useEffect(() => {
    const update = () => setCount(cartCount());
    window.addEventListener("gizmozone-cart-updated", update);
    return () => window.removeEventListener("gizmozone-cart-updated", update);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate({ to: "/", search: { q: query.trim() } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden" aria-label="মেনু">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-primary sm:text-xl">{siteConfig.logo}</Link>
        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block md:max-w-md">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-muted-foreground">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="পণ্য খুঁজুন..." className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
          </label>
        </form>
        <nav className="hidden items-center gap-4 lg:flex">
          {categories.slice(0, 3).map((category) => <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} className="text-sm font-semibold text-muted-foreground transition hover:text-primary">{category.name}</Link>)}
        </nav>
        <a href={`tel:${siteConfig.phone}`} className="ml-auto hidden items-center gap-1 text-sm font-semibold text-muted-foreground xl:flex"><Headphones className="h-4 w-4" /> {siteConfig.phone}</a>
        <Link to="/checkout" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card" aria-label="কার্ট">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>}
        </Link>
      </div>
      {menuOpen && <div className="border-t border-border bg-card px-4 py-3 md:hidden"><form onSubmit={submitSearch} className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="পণ্য খুঁজুন..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></form><div className="grid grid-cols-2 gap-2">{categories.map((category) => <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} onClick={() => setMenuOpen(false)} className="rounded-xl bg-secondary px-3 py-2 text-sm font-semibold">{category.icon} {category.name}</Link>)}</div></div>}
    </header>
  );
}

export function getCartSnapshot() { return readCart(); }
