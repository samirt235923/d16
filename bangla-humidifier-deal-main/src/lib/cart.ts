import type { Product, ProductVariant } from "@/data/products";

export type CartColor = "black" | "white";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  deliveryDhaka?: number;
  deliveryOutsideDhaka?: number;
  color: CartColor;
  variantName?: string;
  variantValue?: string;
};

const CART_KEY = "gizmozone-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.map((item) => ({
          ...item,
          color: item.color === "white" ? "white" : "black",
        }))
      : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("gizmozone-cart-updated"));
}

export function addToCart(
  product: Product,
  quantity = 1,
  variant?: ProductVariant | CartColor,
) {
  const items = readCart();
  const selectedVariant = typeof variant === "object" ? variant : undefined;
  const color = typeof variant === "string" ? variant : "black";
  const variantKey = selectedVariant ? `${selectedVariant.name}:${selectedVariant.value}` : color;
  const itemId = `${product.id}:${variantKey}`;
  const existing = items.find((item) => item.productId === itemId);
  if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
  else
    items.push({
      productId: itemId,
      slug: product.slug,
      name: selectedVariant
        ? `${product.shortTitle} (${selectedVariant.name}: ${selectedVariant.value})`
        : `${product.shortTitle} (${color === "black" ? "কালো" : "সাদা"})`,
      image: product.images[0],
      price: selectedVariant?.price ?? product.offerPrice,
      quantity,
      deliveryDhaka: product.deliveryDhaka,
      deliveryOutsideDhaka: product.deliveryOutsideDhaka,
      color,
      variantName: selectedVariant?.name,
      variantValue: selectedVariant?.value,
    });
  writeCart(items);
}

export function cartCount(items = readCart()) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items = readCart()) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
