import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategory } from "@/data/categories";
import { products } from "@/data/products";
import { fetchPublishedProducts } from "@/lib/product-repository";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreFooter } from "@/components/store/StoreChrome";
import { StoreHeader } from "@/components/store/StoreHeader";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { title: "ক্যাটাগরি | GizmoZone BD" },
      { name: "description", content: "GizmoZone BD-এর বাছাই করা gadget category দেখুন।" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategory(slug);
  const [catalog, setCatalog] = useState(products);
  useEffect(() => {
    void fetchPublishedProducts().then(setCatalog);
  }, []);
  const items = catalog.filter((product) => (product.categories ?? [product.category]).includes(slug));
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[65vh] max-w-6xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-bold text-primary">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরুন
        </Link>
        <div className="mt-5">
          <p className="text-4xl">{category?.icon ?? "🛍️"}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{category?.name ?? "পণ্য"}</h1>
          <p className="mt-2 text-muted-foreground">
            {category?.description ?? "GizmoZone BD-এর পণ্যসমূহ"}
          </p>
        </div>
        {items.length ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            এই category-তে শিগগিরই নতুন product আসছে।
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
