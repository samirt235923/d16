import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { getDiscountPercent } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const discount = getDiscountPercent(product);
  const handleAdd = () => {
    addToCart(product);
    navigate({ to: "/checkout", search: { product: product.slug, qty: 1 } });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-square overflow-hidden bg-secondary">
        <img src={product.images[0]} alt={product.name} width={640} height={640} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{product.badge}</span>}
        {discount > 0 && <span className="absolute right-3 top-3 rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-primary-foreground">-{discount}%</span>}
      </Link>
      <div className="p-4">
        <Link to="/product/$slug" params={{ slug: product.slug }}><h3 className="line-clamp-2 min-h-11 font-bold leading-snug transition hover:text-primary">{product.shortTitle}</h3></Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-3 flex items-end gap-2"><span className="text-2xl font-extrabold text-primary">৳{product.offerPrice}</span><span className="text-sm text-muted-foreground line-through">৳{product.regularPrice}</span></div>
        <button type="button" onClick={handleAdd} disabled={!product.inStock} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-cta px-4 py-2.5 text-sm font-bold text-primary-foreground transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart className="h-4 w-4" />{product.inStock ? "অর্ডার করুন" : "স্টক নেই"}</button>
      </div>
    </article>
  );
}
