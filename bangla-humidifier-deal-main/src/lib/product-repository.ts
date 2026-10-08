import type { Product } from "@/data/products";
import type { ProductSpecMarkdown } from "@/data/products";
import { products as fallbackProducts } from "@/data/products";
import { getAnonymousSupabaseClient } from "@/lib/supabase";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  short_title: string;
  category: string;
  tags: string[];
  short_description: string;
  description: string;
  regular_price: number;
  offer_price: number;
  stock_quantity: number;
  countdown_enabled: boolean;
  countdown_duration_seconds: number;
  stock_message: string | null;
  delivery_dhaka: number;
  delivery_outside_dhaka: number;
  status: "published" | "draft" | "unpublished";
  active: boolean;
  video_url: string | null;
  key_features: Product["features"];
  benefits: string[];
  specifications: Product["specifications"] | ProductSpecMarkdown;
  how_to_use: Product["howToUse"];
  whats_included: string;
  customer_information: string;
  delivery_information: string;
  return_information: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  created_at: string;
  updated_at: string;
  product_images?: { id: string; storage_path: string; public_url: string; sort_order: number }[];
  product_variations?: {
    id: string;
    name: string;
    value: string;
    price: number | null;
    stock_quantity: number;
    image_url: string | null;
  }[];
};

export const PRODUCT_COLUMNS =
  "id,name,slug,short_title,category,tags,short_description,description,regular_price,offer_price,stock_quantity,countdown_enabled,countdown_duration_seconds,stock_message,delivery_dhaka,delivery_outside_dhaka,offer_start_date,offer_end_date,status,active,video_url,key_features,benefits,specifications,how_to_use,whats_included,customer_information,delivery_information,return_information,seo_title,meta_description,focus_keyword,canonical_url,og_title,og_description,og_image,created_at,updated_at,product_images(id,storage_path,public_url,sort_order),product_variations(id,name,value,price,stock_quantity,image_url)";

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortTitle: row.short_title,
    category: row.category,
    categories: row.category.split(",").map((category) => category.trim()).filter(Boolean),
    regularPrice: Number(row.regular_price),
    offerPrice: Number(row.offer_price),
    deliveryDhaka: row.delivery_dhaka == null ? 70 : Number(row.delivery_dhaka),
    deliveryOutsideDhaka: row.delivery_outside_dhaka == null ? 130 : Number(row.delivery_outside_dhaka),
    images: (row.product_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.public_url),
    videos: row.video_url ? [row.video_url] : [],
    videoPosters: [],
    feedbackImages: [],
    badge: null,
    inStock: row.stock_quantity > 0,
    stockQuantity: Number(row.stock_quantity) || 0,
    stockMessage: row.stock_message || undefined,
    shortDescription: row.short_description,
    descriptionHtml: row.description,
    heroHeadline: row.name,
    heroSubtext: row.short_description,
    features: row.key_features ?? [],
    longDescription: row.description ? row.description.split("\n\n") : [],
    keyPoints: row.benefits ?? [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    specificationsMarkdown:
      !Array.isArray(row.specifications) && row.specifications?.format === "markdown"
        ? row.specifications.content
        : undefined,
    howToUse: row.how_to_use ?? [],
    faqs: [],
    seoTitle: row.seo_title || row.name,
    seoDescription: row.meta_description || row.short_description,
    countdownEnabled: Boolean(row.countdown_enabled),
    countdownDurationSeconds: Number(row.countdown_duration_seconds) || 0,
    variants: (row.product_variations ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      price: variant.price,
      stockQuantity: variant.stock_quantity,
      imageUrl: variant.image_url,
    })),
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function fetchPublishedProducts() {
  try {
    const { data, error } = await getAnonymousSupabaseClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return fallbackProducts;
    return (data as unknown as ProductRow[]).map(rowToProduct);
  } catch {
    return fallbackProducts;
  }
}
