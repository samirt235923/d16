import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  Check,
  ExternalLink,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  LogOut,
  Pencil,
  Plus,
  Redo2,
  RefreshCw,
  Search,
  Trash2,
  Underline,
  Upload,
  Video,
  X,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories } from "@/data/categories";
import { markdownToHtml } from "@/lib/markdown";
import { getSupabaseClient } from "@/lib/supabase";
import { PRODUCT_COLUMNS, type ProductRow, slugify } from "@/lib/product-repository";

export const Route = createFileRoute("/product-management/")({
  head: () => ({ meta: [{ title: "Product Management | GizmoZone BD" }] }),
  component: ProductManagementPage,
});

type AuthState = "checking" | "unauthenticated" | "forbidden" | "authenticated";
type Feature = { title: string; description: string };
type Spec = { label: string; value: string };
type ProductVariant = {
  id?: string;
  name: string;
  value: string;
  price: string;
  stock_quantity: string;
  image_url: string;
};
type FormState = {
  content_format: "rich" | "markdown";
  name: string;
  slug: string;
  short_title: string;
  category: string;
  secondary_category: string;
  use_secondary_category: boolean;
  tags: string;
  short_description: string;
  description: string;
  regular_price: string;
  offer_price: string;
  stock_quantity: string;
  countdown_enabled: boolean;
  countdown_days: string;
  countdown_hours: string;
  countdown_minutes: string;
  countdown_seconds: string;
  stock_message: string;
  delivery_dhaka: string;
  delivery_outside_dhaka: string;
  status: ProductRow["status"];
  active: boolean;
  has_variants: boolean;
  variants: ProductVariant[];
  video_url: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  benefits: string;
  whats_included: string;
  customer_information: string;
  delivery_information: string;
  return_information: string;
  features: Feature[];
  specifications: Spec[];
  specifications_format: "structured" | "markdown";
  specifications_markdown: string;
  how_to_use: string[];
};

const blankForm: FormState = {
  content_format: "rich",
  name: "",
  slug: "",
  short_title: "",
  category: "uncategorized",
  secondary_category: "",
  use_secondary_category: false,
  tags: "",
  short_description: "",
  description: "",
  regular_price: "",
  offer_price: "",
  stock_quantity: "0",
  countdown_enabled: false,
  countdown_days: "0",
  countdown_hours: "0",
  countdown_minutes: "0",
  countdown_seconds: "0",
  stock_message: "",
  delivery_dhaka: "70",
  delivery_outside_dhaka: "130",
  status: "draft",
  active: true,
  has_variants: false,
  variants: [],
  video_url: "",
  seo_title: "",
  meta_description: "",
  focus_keyword: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  benefits: "",
  whats_included: "",
  customer_information: "",
  delivery_information: "",
  return_information: "",
  features: [],
  specifications: [],
  specifications_format: "structured",
  specifications_markdown: "",
  how_to_use: [],
};
const imageLimit = 10 * 1024 * 1024;
const videoLimit = 150 * 1024 * 1024;
type ImageRow = NonNullable<ProductRow["product_images"]>[number];
type ReviewStatus = "pending" | "approved" | "rejected";
type ReviewRow = {
  id: string;
  product_id: string | null;
  product_slug: string;
  customer_name: string;
  rating: number;
  review_text: string;
  customer_image: string | null;
  status: ReviewStatus;
  created_at: string;
  approved_at: string | null;
  admin_note: string | null;
};

function ProductManagementPage() {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [reviewRows, setReviewRows] = useState<ReviewRow[]>([]);
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | "all">("pending");
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [databaseReady, setDatabaseReady] = useState(true);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);

  const syncAuth = async () => {
    try {
      const { data } = await getSupabaseClient().auth.getUser();
      if (!data.user) return setAuth("unauthenticated");
      setAuth(
        data.user.app_metadata?.role === "admin" || data.user.user_metadata?.role === "admin"
          ? "authenticated"
          : "forbidden",
      );
    } catch {
      setAuth("unauthenticated");
    }
  };
  const loadProducts = async () => {
    setError("");
    const { data, error: loadError } = await getSupabaseClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: false });
    if (loadError) {
      const missing =
        loadError.code === "42P01" ||
        loadError.code === "PGRST205" ||
        loadError.message.includes("public.products");
      setDatabaseReady(!missing);
      setError(
        missing
          ? "Product database is not set up. Apply the product-management migration in Supabase, then try again."
          : loadError.message,
      );
    } else {
      setDatabaseReady(true);
      setRows((data ?? []) as unknown as ProductRow[]);
    }
  };
  const loadReviews = async () => {
    const { data, error: reviewError } = await getSupabaseClient()
      .from("product_reviews")
      .select(
        "id,product_id,product_slug,customer_name,rating,review_text,customer_image,status,created_at,approved_at,admin_note",
      )
      .order("created_at", { ascending: false });

    if (reviewError) {
      if (reviewError.code === "42P01" || reviewError.code === "PGRST205") {
        setReviewRows([]);
        return;
      }
      setError(reviewError.message);
      return;
    }

    setReviewRows((data ?? []) as ReviewRow[]);
  };
  const loadSingle = async (id: string) => {
    const { data } = await getSupabaseClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", id)
      .single();
    return data as unknown as ProductRow | null;
  };
  useEffect(() => {
    void syncAuth();
    const { data } = getSupabaseClient().auth.onAuthStateChange(() => void syncAuth());
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (auth === "authenticated") {
      void loadProducts();
      void loadReviews();
    }
  }, [auth]);

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!query || `${row.name} ${row.slug}`.toLowerCase().includes(query.toLowerCase())) &&
          (statusFilter === "all" || row.status === statusFilter),
      ),
    [rows, query, statusFilter],
  );
  const stats = {
    total: rows.length,
    published: rows.filter((row) => row.status === "published").length,
    drafts: rows.filter((row) => row.status === "draft").length,
    active: rows.filter((row) => row.active).length,
    out: rows.filter((row) => row.stock_quantity === 0).length,
    pendingReviews: reviewRows.filter((review) => review.status === "pending").length,
    approvedReviews: reviewRows.filter((review) => review.status === "approved").length,
  };

  const filteredReviewRows = useMemo(
    () =>
      reviewRows.filter(
        (row) => reviewFilter === "all" || row.status === reviewFilter,
      ),
    [reviewFilter, reviewRows],
  );

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    const { error: updateError } = await getSupabaseClient()
      .from("product_reviews")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", reviewId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice(status === "approved" ? "Review approved and published." : "Review rejected.");
    await loadReviews();
  };

  const deleteReview = async (reviewId: string) => {
    if (!window.confirm("Delete this customer review permanently?")) return;
    const { error: deleteError } = await getSupabaseClient().from("product_reviews").delete().eq("id", reviewId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice("Review deleted.");
    await loadReviews();
  };
  const rowToForm = (row: ProductRow): FormState => ({
    ...blankForm,
    content_format: "rich",
    name: row.name,
    slug: row.slug,
    short_title: row.short_title,
    category: row.category.split(",")[0]?.trim() || "uncategorized",
    secondary_category: row.category.split(",")[1]?.trim() || "",
    use_secondary_category: Boolean(row.category.split(",")[1]?.trim()),
    tags: row.tags.join(", "),
    short_description: row.short_description,
    description: row.description,
    regular_price: String(row.regular_price),
    offer_price: String(row.offer_price),
    stock_quantity: String(row.stock_quantity),
    countdown_enabled: Boolean(row.countdown_enabled),
    countdown_days: String(Math.floor((row.countdown_duration_seconds ?? 0) / 86400)),
    countdown_hours: String(Math.floor(((row.countdown_duration_seconds ?? 0) % 86400) / 3600)),
    countdown_minutes: String(Math.floor(((row.countdown_duration_seconds ?? 0) % 3600) / 60)),
    countdown_seconds: String((row.countdown_duration_seconds ?? 0) % 60),
    stock_message: row.stock_message ?? "",
    delivery_dhaka: String(row.delivery_dhaka),
    delivery_outside_dhaka: String(row.delivery_outside_dhaka),
    status: row.status,
    active: row.active,
    has_variants: Boolean(row.product_variations?.length),
    variants: (row.product_variations ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      value: variant.value,
      price: variant.price == null ? "" : String(variant.price),
      stock_quantity: String(variant.stock_quantity),
      image_url: variant.image_url ?? "",
    })),
    video_url: row.video_url ?? "",
    seo_title: row.seo_title,
    meta_description: row.meta_description,
    focus_keyword: row.focus_keyword,
    canonical_url: row.canonical_url,
    og_title: row.og_title,
    og_description: row.og_description,
    og_image: row.og_image ?? "",
    benefits: row.benefits.join("\n"),
    whats_included: row.whats_included,
    customer_information: row.customer_information,
    delivery_information: row.delivery_information,
    return_information: row.return_information,
    features: row.key_features ?? [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    specifications_format: Array.isArray(row.specifications) ? "structured" : "markdown",
    specifications_markdown:
      !Array.isArray(row.specifications) && row.specifications?.format === "markdown"
        ? row.specifications.content
        : "",
    how_to_use: row.how_to_use?.map((step) => `${step.title}: ${step.description}`) ?? [],
  });
  const setField = (key: keyof FormState, value: string | boolean | ProductVariant[]) =>
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !selected
        ? { slug: slugify(String(value)), short_title: String(value), seo_title: String(value) }
        : {}),
    }));
  const edit = (row: ProductRow) => {
    setSelected(row);
    setForm(rowToForm(row));
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const newProduct = () => {
    setSelected(null);
    setForm(blankForm);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const backToList = () => {
    setEditing(false);
    setPreview(false);
    setError("");
    setNotice("");
  };
  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) setLoginError("Unable to sign in. Check your email and password.");
    else {
      setPassword("");
      await syncAuth();
    }
    setBusy(false);
  };

  const save = async (event: React.FormEvent, statusOverride?: ProductRow["status"]) => {
    event.preventDefault();
    if (!databaseReady) {
      setError(
        "Product database is not set up. Apply the product-management migration in Supabase first.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    const regular = Number(form.regular_price);
    const offer = Number(form.offer_price);
    const stock = Number(form.stock_quantity);
    const countdownDays = Math.max(0, Number(form.countdown_days) || 0);
    const countdownHours = Math.max(0, Number(form.countdown_hours) || 0);
    const countdownMinutes = Math.max(0, Number(form.countdown_minutes) || 0);
    const countdownSeconds = Math.max(0, Number(form.countdown_seconds) || 0);
    const countdownDurationSeconds =
      countdownDays * 86400 + countdownHours * 3600 + countdownMinutes * 60 + countdownSeconds;
    if (
      !form.name.trim() ||
      !form.slug.trim() ||
      !Number.isFinite(regular) ||
      !Number.isFinite(offer) ||
      offer > regular ||
      stock < 0
    ) {
      setError("Enter a name, slug, valid prices, and a non-negative stock quantity.");
      setBusy(false);
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      short_title: form.short_title.trim() || form.name.trim(),
      category: [form.category.trim() || "uncategorized", form.use_secondary_category ? form.secondary_category.trim() : ""]
        .filter(Boolean)
        .filter((category, index, all) => all.indexOf(category) === index)
        .join(","),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      short_description: form.short_description.trim(),
      description:
        form.content_format === "markdown" ? markdownToHtml(form.description) : form.description,
      regular_price: regular,
      offer_price: offer,
      stock_quantity: stock,
      countdown_enabled: form.countdown_enabled,
      countdown_duration_seconds: countdownDurationSeconds,
      stock_message: form.stock_message.trim(),
      delivery_dhaka: Number(form.delivery_dhaka) || 0,
      delivery_outside_dhaka: Number(form.delivery_outside_dhaka) || 0,
      status: statusOverride ?? form.status,
      active: form.active,
      video_url: form.video_url.trim() || null,
      key_features: form.features,
      benefits: form.benefits
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      specifications:
        form.specifications_format === "markdown"
          ? { format: "markdown", content: form.specifications_markdown }
          : form.specifications.filter((item) => item.label.trim() || item.value.trim()),
      how_to_use: form.how_to_use.filter(Boolean).map((item, index) => ({
        step: String(index + 1),
        title: item.split(":")[0],
        description: item.includes(":") ? item.slice(item.indexOf(":") + 1).trim() : item,
      })),
      whats_included: form.whats_included,
      customer_information: form.customer_information,
      delivery_information: form.delivery_information,
      return_information: form.return_information,
      seo_title: form.seo_title.trim() || form.name.trim(),
      meta_description: form.meta_description.trim() || form.short_description.trim(),
      focus_keyword: form.focus_keyword.trim(),
      canonical_url: form.canonical_url.trim(),
      og_title: form.og_title.trim() || form.name.trim(),
      og_description: form.og_description.trim() || form.meta_description.trim(),
      og_image: form.og_image.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const client = getSupabaseClient();
    const result = selected
      ? await client
          .from("products")
          .update(payload)
          .eq("id", selected.id)
          .select(PRODUCT_COLUMNS)
          .single()
      : await client.from("products").insert(payload).select(PRODUCT_COLUMNS).single();
    if (result.error) setError(result.error.message);
    else {
      try {
        const saved = result.data as unknown as ProductRow;
        await syncProductVariants(saved.id, form.has_variants, form.variants);
        setSelected(saved);
        setForm(rowToForm({ ...saved, product_variations: form.has_variants ? form.variants.map((variant) => ({
          id: variant.id ?? crypto.randomUUID(),
          name: variant.name,
          value: variant.value,
          price: variant.price ? Number(variant.price) : null,
          stock_quantity: Number(variant.stock_quantity) || 0,
          image_url: variant.image_url || null,
        })) : [] }));
        setNotice(
          statusOverride === "published"
            ? "Product published successfully."
            : selected
              ? "Product updated successfully."
              : "Product saved successfully.",
        );
        await loadProducts();
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : "Unable to save product variants.";
        setError(message);
      }
    }
    setBusy(false);
  };

  const syncProductVariants = async (
    productId: string,
    hasVariants: boolean,
    variants: ProductVariant[],
  ) => {
    const client = getSupabaseClient();

    if (!hasVariants) {
      const { error } = await client.from("product_variations").delete().eq("product_id", productId);
      if (error) throw error;
      return;
    }

    const cleanedVariants = variants
      .filter((variant) => variant.name.trim() || variant.value.trim())
      .map((variant) => ({
        product_id: productId,
        name: variant.name.trim(),
        value: variant.value.trim(),
        price: variant.price.trim() ? Number(variant.price) : null,
        stock_quantity: Number(variant.stock_quantity) || 0,
        image_url: variant.image_url.trim() || null,
      }));

    const { error: clearError } = await client.from("product_variations").delete().eq("product_id", productId);
    if (clearError) throw clearError;
    if (!cleanedVariants.length) return;

    const { error: insertError } = await client.from("product_variations").insert(cleanedVariants);
    if (insertError) throw insertError;
  };

  const uploadMedia = async (files: FileList | null, kind: "image" | "video") => {
    if (!selected || !files?.length) {
      setError("Save the product first, then upload media.");
      return;
    }
    const accepted =
      kind === "image" ? ["image/jpeg", "image/png", "image/webp"] : ["video/mp4", "video/webm"];
    const limit = kind === "image" ? imageLimit : videoLimit;
    const chosen = Array.from(files).filter(
      (file) => accepted.includes(file.type) && file.size <= limit,
    );
    if (chosen.length !== files.length) {
      setError(
        kind === "image"
          ? "Please upload JPG, PNG or WEBP images under 10MB each."
          : "Please upload MP4 or WebM video under 150MB.",
      );
      if (!chosen.length) return;
    }
    setBusy(true);
    const client = getSupabaseClient();
    const storage = client.storage.from("product-media");
    for (const file of chosen) {
      const path = `products/${selected.id}/${kind === "image" ? "images" : "videos"}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const uploaded = await storage.upload(path, file, { upsert: false, contentType: file.type });
      if (uploaded.error) {
        setError(uploaded.error.message);
        continue;
      }
      const url = storage.getPublicUrl(path).data.publicUrl;
      if (kind === "image")
        await client.from("product_images").insert({
          product_id: selected.id,
          storage_path: path,
          public_url: url,
          sort_order: selected.product_images?.length ?? 0,
        });
      else {
        await client.from("products").update({ video_url: url }).eq("id", selected.id);
        setField("video_url", url);
      }
    }
    const fresh = await loadSingle(selected.id);
    if (fresh) {
      setSelected(fresh);
      setForm(rowToForm(fresh));
    }
    setNotice(kind === "image" ? "Image uploaded successfully." : "Video uploaded successfully.");
    setBusy(false);
  };
  const deleteImage = async (image: ImageRow) => {
    if (!selected || !window.confirm("Delete this product image?")) return;
    setBusy(true);
    const client = getSupabaseClient();
    await client.storage.from("product-media").remove([image.storage_path]);
    const result = await client.from("product_images").delete().eq("id", image.id);
    if (result.error) setError(result.error.message);
    else {
      const fresh = await loadSingle(selected.id);
      if (fresh) setSelected(fresh);
      setNotice("Image deleted successfully.");
    }
    setBusy(false);
  };
  const setMainImage = async (imageId: string) => {
    if (!selected?.product_images) return;
    setBusy(true);
    const ordered = [...selected.product_images].sort((a, b) => a.sort_order - b.sort_order);
    const main = ordered.find((image) => image.id === imageId);
    if (main) ordered.splice(ordered.indexOf(main), 1);
    if (main) ordered.unshift(main);
    const client = getSupabaseClient();
    await Promise.all(
      ordered.map((image, index) =>
        client.from("product_images").update({ sort_order: index }).eq("id", image.id),
      ),
    );
    const fresh = await loadSingle(selected.id);
    if (fresh) setSelected(fresh);
    setNotice("Main image updated.");
    setBusy(false);
  };
  const reorderImages = async (fromId: string, toId: string) => {
    if (!selected?.product_images || fromId === toId) return;
    const ordered = [...selected.product_images].sort((a, b) => a.sort_order - b.sort_order);
    const from = ordered.findIndex((image) => image.id === fromId);
    const to = ordered.findIndex((image) => image.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    setBusy(true);
    const client = getSupabaseClient();
    await Promise.all(
      ordered.map((image, index) =>
        client.from("product_images").update({ sort_order: index }).eq("id", image.id),
      ),
    );
    const fresh = await loadSingle(selected.id);
    if (fresh) setSelected(fresh);
    setNotice("Gallery order updated.");
    setBusy(false);
  };
  const deleteVideo = async () => {
    if (!selected || !form.video_url || !window.confirm("Delete this product video?")) return;
    setBusy(true);
    const path = form.video_url.split("/product-media/")[1];
    if (path) await getSupabaseClient().storage.from("product-media").remove([path]);
    await getSupabaseClient().from("products").update({ video_url: null }).eq("id", selected.id);
    setField("video_url", "");
    setNotice("Video deleted successfully.");
    setBusy(false);
  };
  const remove = async (row: ProductRow) => {
    if (!window.confirm("Archive this product? It will no longer appear publicly.")) return;
    const { error: archiveError } = await getSupabaseClient()
      .from("products")
      .update({ active: false, status: "unpublished" })
      .eq("id", row.id);
    if (archiveError) setError(archiveError.message);
    else {
      setNotice("Product archived successfully.");
      await loadProducts();
    }
  };

  if (auth === "checking") return <Centered>Checking your admin session...</Centered>;
  if (auth === "unauthenticated")
    return (
      <Login
        email={email}
        password={password}
        error={loginError}
        busy={busy}
        setEmail={setEmail}
        setPassword={setPassword}
        onSubmit={login}
      />
    );
  if (auth === "forbidden")
    return (
      <Centered>
        <h1 className="text-2xl font-extrabold">Admin access required</h1>
        <button
          className="mt-4 rounded-xl bg-primary px-4 py-3 text-primary-foreground"
          onClick={() => void getSupabaseClient().auth.signOut()}
        >
          Log out
        </button>
      </Centered>
    );
  if (editing)
    return (
      <Editor
        form={form}
        selected={selected}
        busy={busy}
        error={error}
        notice={notice}
        databaseReady={databaseReady}
        preview={preview}
        setPreview={setPreview}
        setField={setField}
        backToList={backToList}
        save={save}
        uploadMedia={uploadMedia}
        deleteImage={deleteImage}
        setMainImage={setMainImage}
        reorderImages={reorderImages}
        deleteVideo={deleteVideo}
        newProduct={newProduct}
      />
    );
  return (
    <div className="space-y-6">
      <ListView
        rows={visibleRows}
        stats={stats}
        query={query}
        statusFilter={statusFilter}
        error={error}
        notice={notice}
        databaseReady={databaseReady}
        setQuery={setQuery}
        setStatusFilter={setStatusFilter}
        onRetry={() => void loadProducts()}
        onAdd={newProduct}
        onEdit={edit}
        onRemove={remove}
        onLogout={() => void getSupabaseClient().auth.signOut()}
      />
      <ReviewModerationPanel
        reviews={filteredReviewRows}
        filter={reviewFilter}
        setFilter={setReviewFilter}
        onApprove={(id) => void updateReviewStatus(id, "approved")}
        onReject={(id) => void updateReviewStatus(id, "rejected")}
        onDelete={deleteReview}
      />
    </div>
  );
}

function Editor({
  form,
  selected,
  busy,
  error,
  notice,
  databaseReady,
  preview,
  setPreview,
  setField,
  backToList,
  save,
  uploadMedia,
  deleteImage,
  setMainImage,
  reorderImages,
  deleteVideo,
  newProduct,
}: {
  form: FormState;
  selected: ProductRow | null;
  busy: boolean;
  error: string;
  notice: string;
  databaseReady: boolean;
  preview: boolean;
  setPreview: (value: boolean) => void;
  setField: (key: keyof FormState, value: string | boolean | ProductVariant[]) => void;
  backToList: () => void;
  save: (event: React.FormEvent, status?: ProductRow["status"]) => Promise<void>;
  uploadMedia: (files: FileList | null, kind: "image" | "video") => Promise<void>;
  deleteImage: (image: ImageRow) => Promise<void>;
  setMainImage: (id: string) => Promise<void>;
  reorderImages: (fromId: string, toId: string) => Promise<void>;
  deleteVideo: () => Promise<void>;
  newProduct: () => void;
}) {
  const discount =
    Number(form.regular_price) > 0
      ? Math.max(0, Math.round((1 - Number(form.offer_price) / Number(form.regular_price)) * 100))
      : 0;
  return (
    <div className="min-h-screen bg-secondary/50">
      <AdminHeader onLogout={() => void getSupabaseClient().auth.signOut()} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={backToList}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to products
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 font-bold"
            >
              <ExternalLink className="h-4 w-4" /> Preview product
            </button>
            <button
              type="button"
              onClick={newProduct}
              className="rounded-xl border bg-card px-4 py-2.5 font-bold"
            >
              New product
            </button>
          </div>
        </div>
        <form onSubmit={(event) => void save(event)} className="space-y-6">
          <Section title="Product identity" eyebrow={selected ? "EDIT PRODUCT" : "NEW PRODUCT"}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Product name"
                value={form.name}
                required
                onChange={(value) => setField("name", value)}
              />
              <Field
                label="Product slug"
                value={form.slug}
                required
                onChange={(value) => setField("slug", value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field
                label="Short title"
                value={form.short_title}
                onChange={(value) => setField("short_title", value)}
              />
              <label className="block text-sm font-bold">
                Primary category
                <select
                  className="mt-1 w-full rounded-xl border bg-background p-3 font-normal"
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                >
                  <option value="uncategorized">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Tags (comma separated)"
                value={form.tags}
                placeholder="humidifier, desk"
                onChange={(value) => setField("tags", value)}
              />
            </div>
            <div className="mt-4 rounded-xl border bg-secondary/30 p-4">
              <label className="inline-flex items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.use_secondary_category}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setField("use_secondary_category", enabled);
                    if (!enabled) setField("secondary_category", "");
                  }}
                />
                Show this product in a second category
              </label>
              {form.use_secondary_category && (
                <label className="mt-3 block max-w-md text-sm font-bold">
                  Second category
                  <select
                    className="mt-1 w-full rounded-xl border bg-background p-3 font-normal"
                    value={form.secondary_category}
                    onChange={(event) => setField("secondary_category", event.target.value)}
                  >
                    <option value="">Select second category</option>
                    {categories
                      .filter((category) => category.slug !== form.category)
                      .map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            </div>
            <div className="mt-4">
              <Field
                label="Short description"
                value={form.short_description}
                onChange={(value) => setField("short_description", value)}
              />
            </div>
          </Section>
          <Section title="Media" eyebrow="PRODUCT IMAGES & VIDEO">
            <MediaPanel
              selected={selected}
              videoUrl={form.video_url}
              busy={busy}
              onImageUpload={(files) => void uploadMedia(files, "image")}
              onVideoUpload={(files) => void uploadMedia(files, "video")}
              onVideoUrl={(value) => setField("video_url", value)}
              onDelete={deleteImage}
              onSetMain={setMainImage}
              onReorder={reorderImages}
              onDeleteVideo={deleteVideo}
            />
          </Section>
          <Section title="Product content" eyebrow="CONTENT">
            <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
              <div>
                <RichEditor
                  value={form.description}
                  onChange={(value) => setField("description", value)}
                  format={form.content_format}
                  onFormatChange={(value) => setField("content_format", value)}
                />
                <div className="mt-4">
                  <TextArea
                    label="Benefits (one per line)"
                    value={form.benefits}
                    onChange={(value) => setField("benefits", value)}
                    rows={5}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Repeater
                  title="Key features"
                  items={form.features.map((item) => `${item.title}|${item.description}`)}
                  addLabel="Add feature"
                  onChange={(items) =>
                    setField(
                      "features",
                      items.map((item) => {
                        const [title, ...description] = item.split("|");
                        return { title, description: description.join("|") };
                      }),
                    )
                  }
                />
                <Repeater
                  title="How to use"
                  items={form.how_to_use}
                  addLabel="Add step"
                  onChange={(items) => setField("how_to_use", items)}
                />
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextArea
                label="What's included"
                value={form.whats_included}
                onChange={(value) => setField("whats_included", value)}
                rows={4}
              />
              <TextArea
                label="Customer information"
                value={form.customer_information}
                onChange={(value) => setField("customer_information", value)}
                rows={4}
              />
              <TextArea
                label="Delivery information"
                value={form.delivery_information}
                onChange={(value) => setField("delivery_information", value)}
                rows={4}
              />
              <TextArea
                label="Return information"
                value={form.return_information}
                onChange={(value) => setField("return_information", value)}
                rows={4}
              />
            </div>
          </Section>
          <Section title="Pricing & inventory" eyebrow="BDT / à§³">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field
                label="Regular price"
                type="number"
                value={form.regular_price}
                required
                onChange={(value) => setField("regular_price", value)}
              />
              <Field
                label="Offer price"
                type="number"
                value={form.offer_price}
                required
                onChange={(value) => setField("offer_price", value)}
              />
              <Field
                label="Stock"
                type="number"
                value={form.stock_quantity}
                onChange={(value) => setField("stock_quantity", value)}
              />
              <Field
                label="Dhaka delivery"
                type="number"
                value={form.delivery_dhaka}
                onChange={(value) => setField("delivery_dhaka", value)}
              />
              <Field
                label="Outside Dhaka"
                type="number"
                value={form.delivery_outside_dhaka}
                onChange={(value) => setField("delivery_outside_dhaka", value)}
              />
            </div>
            <p className="mt-4 rounded-xl bg-brand-soft p-3 text-sm font-bold text-primary">
              Discount: {discount}% OFF
            </p>
          </Section>
          <Section title="Offer urgency" eyebrow="COUNTDOWN & STOCK">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.countdown_enabled}
                  onChange={(event) => setField("countdown_enabled", event.target.checked)}
                />
                Enable countdown timer
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Days"
                  type="number"
                  value={form.countdown_days}
                  min="0"
                  onChange={(value) => setField("countdown_days", value)}
                />
                <Field
                  label="Hours"
                  type="number"
                  value={form.countdown_hours}
                  min="0"
                  onChange={(value) => setField("countdown_hours", value)}
                />
                <Field
                  label="Minutes"
                  type="number"
                  value={form.countdown_minutes}
                  min="0"
                  onChange={(value) => setField("countdown_minutes", value)}
                />
                <Field
                  label="Seconds"
                  type="number"
                  value={form.countdown_seconds}
                  min="0"
                  onChange={(value) => setField("countdown_seconds", value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Field
                label="Stock urgency message"
                value={form.stock_message}
                placeholder="স্টকে মাত্র 12 পিস আছে"
                onChange={(value) => setField("stock_message", value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Leave empty to show the default stock warning automatically.
              </p>
            </div>
          </Section>
          <Section title="Variants" eyebrow="OPTIONAL">
            <label className="inline-flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.has_variants}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  setField("has_variants", enabled);
                  if (!enabled) setField("variants", []);
                }}
              />
              This product has variants
            </label>

            {form.has_variants && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Variant options</h3>
                  <button
                    type="button"
                    onClick={() => setField("variants", [...form.variants, {
                      name: "Color",
                      value: "",
                      price: "",
                      stock_quantity: "0",
                      image_url: "",
                    }])}
                    className="inline-flex items-center gap-1 text-sm font-bold text-primary"
                  >
                    <Plus className="h-4 w-4" /> Add variant
                  </button>
                </div>

                {form.variants.length ? (
                  form.variants.map((variant, index) => (
                    <div key={`${variant.name}-${index}`} className="grid gap-3 rounded-xl border bg-secondary/40 p-3 md:grid-cols-[1.1fr_1.1fr_1fr_1fr_1.2fr_auto]">
                      <label className="text-xs font-bold text-muted-foreground">
                        Name
                        <input
                          className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                          value={variant.name}
                          placeholder="Color"
                          onChange={(event) =>
                            setField(
                              "variants",
                              form.variants.map((current, itemIndex) =>
                                itemIndex === index ? { ...current, name: event.target.value } : current,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs font-bold text-muted-foreground">
                        Value
                        <input
                          className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                          value={variant.value}
                          placeholder="Black"
                          onChange={(event) =>
                            setField(
                              "variants",
                              form.variants.map((current, itemIndex) =>
                                itemIndex === index ? { ...current, value: event.target.value } : current,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs font-bold text-muted-foreground">
                        Price
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                          value={variant.price}
                          placeholder="0"
                          onChange={(event) =>
                            setField(
                              "variants",
                              form.variants.map((current, itemIndex) =>
                                itemIndex === index ? { ...current, price: event.target.value } : current,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs font-bold text-muted-foreground">
                        Stock
                        <input
                          type="number"
                          className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                          value={variant.stock_quantity}
                          placeholder="0"
                          onChange={(event) =>
                            setField(
                              "variants",
                              form.variants.map((current, itemIndex) =>
                                itemIndex === index ? { ...current, stock_quantity: event.target.value } : current,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="text-xs font-bold text-muted-foreground">
                        Image URL
                        <input
                          className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                          value={variant.image_url}
                          placeholder="https://..."
                          onChange={(event) =>
                            setField(
                              "variants",
                              form.variants.map((current, itemIndex) =>
                                itemIndex === index ? { ...current, image_url: event.target.value } : current,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        type="button"
                        aria-label="Delete variant"
                        className="self-end rounded-xl border px-3 py-3 text-destructive"
                        onClick={() =>
                          setField(
                            "variants",
                            form.variants.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                    No variants added yet.
                  </div>
                )}
              </div>
            )}
          </Section>
          <Section title="Specifications" eyebrow="STRUCTURED DATA">
            <SpecificationRepeater
              items={form.specifications}
              format={form.specifications_format}
              markdown={form.specifications_markdown}
              onFormatChange={(format) => setField("specifications_format", format)}
              onMarkdownChange={(markdown) => setField("specifications_markdown", markdown)}
              onChange={(items) => setField("specifications", items)}
            />
          </Section>
          <Section title="Publication & SEO" eyebrow="DISCOVERABILITY">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold">
                Publication
                <select
                  className="mt-1 w-full rounded-xl border bg-background p-3 font-normal"
                  value={form.status}
                  onChange={(event) => setField("status", event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </label>
              <label className="flex items-end gap-2 p-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setField("active", event.target.checked)}
                />{" "}
                Active product
              </label>
              <Field
                label="SEO title"
                value={form.seo_title}
                onChange={(value) => setField("seo_title", value)}
              />
              <Field
                label="Focus keyword"
                value={form.focus_keyword}
                onChange={(value) => setField("focus_keyword", value)}
              />
              <Field
                label="Canonical URL"
                value={form.canonical_url}
                onChange={(value) => setField("canonical_url", value)}
              />
              <Field
                label="OG image URL"
                value={form.og_image}
                onChange={(value) => setField("og_image", value)}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextArea
                label="Meta description"
                value={form.meta_description}
                onChange={(value) => setField("meta_description", value)}
                rows={3}
              />
              <TextArea
                label="OG description"
                value={form.og_description}
                onChange={(value) => setField("og_description", value)}
                rows={3}
              />
            </div>
          </Section>
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          {notice && <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}
          <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border bg-card/95 p-3 shadow-soft backdrop-blur">
            <button
              type="button"
              onClick={backToList}
              className="rounded-xl border px-5 py-3 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !databaseReady}
              className="rounded-xl border px-5 py-3 font-bold disabled:opacity-50"
            >
              {selected ? "Update product" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={busy || !databaseReady}
              onClick={(event) => void save(event, "published")}
              className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Saving..." : "Publish product"}
            </button>
          </div>
        </form>
        {preview && (
          <Preview
            form={form}
            selected={selected}
            discount={discount}
            onClose={() => setPreview(false)}
          />
        )}
      </main>
    </div>
  );
}

function MediaPanel({
  selected,
  videoUrl,
  busy,
  onImageUpload,
  onVideoUpload,
  onVideoUrl,
  onDelete,
  onSetMain,
  onReorder,
  onDeleteVideo,
}: {
  selected: ProductRow | null;
  videoUrl: string;
  busy: boolean;
  onImageUpload: (files: FileList | null) => void;
  onVideoUpload: (files: FileList | null) => void;
  onVideoUrl: (value: string) => void;
  onDelete: (image: ImageRow) => void;
  onSetMain: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onDeleteVideo: () => void;
}) {
  const images = [...(selected?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Product images</h3>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            <ImagePlus className="h-4 w-4" /> Upload images
            <input
              className="hidden"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onImageUpload(event.target.files)}
            />
          </label>
        </div>
        <div className="grid min-h-44 grid-cols-2 gap-3 rounded-2xl border-2 border-dashed p-3 sm:grid-cols-4">
          {images.length ? (
            images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/product-image", image.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void onReorder(event.dataTransfer.getData("text/product-image"), image.id);
                }}
                className="group relative overflow-hidden rounded-xl border bg-secondary"
              >
                <img
                  src={image.public_url}
                  alt={`Product image ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSetMain(image.id)}
                    className="flex-1 rounded-lg bg-card/95 px-2 py-1 text-[11px] font-bold"
                  >
                    {index === 0 ? "Main image" : "Set main"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(image)}
                    className="rounded-lg bg-destructive px-2 py-1 text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                    Main
                  </span>
                )}
              </div>
            ))
          ) : (
            <label className="col-span-full grid cursor-pointer place-items-center p-8 text-center text-sm text-muted-foreground">
              <Upload className="mb-2 h-8 w-8 text-primary" />
              <span>Upload JPG, PNG or WEBP images</span>
              <input
                className="hidden"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onImageUpload(event.target.files)}
              />
            </label>
          )}
        </div>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Product video</h3>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold">
            <Video className="h-4 w-4" /> Upload video
            <input
              className="hidden"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(event) => onVideoUpload(event.target.files)}
            />
          </label>
        </div>
        {videoUrl ? (
          <div className="relative">
            <video controls className="aspect-video w-full rounded-xl bg-black" src={videoUrl} />
            <button
              type="button"
              disabled={busy}
              onClick={onDeleteVideo}
              className="absolute right-2 top-2 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white"
            >
              Delete video
            </button>
          </div>
        ) : (
          <div className="grid aspect-video place-items-center rounded-xl border-2 border-dashed text-sm text-muted-foreground">
            No product video yet
          </div>
        )}
        <input
          className="mt-3 w-full rounded-xl border bg-background p-3 text-sm"
          value={videoUrl}
          onChange={(event) => onVideoUrl(event.target.value)}
          placeholder="Or paste a video URL"
        />
      </div>
    </div>
  );
}
function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p>
      <h2 className="mb-5 mt-1 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        required={required}
        type={type}
        className="mt-1 w-full rounded-xl border bg-background p-3 font-normal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <textarea
        rows={rows}
        className="mt-1 w-full resize-y rounded-xl border bg-background p-3 font-normal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function Repeater({
  title,
  items,
  addLabel,
  onChange,
}: {
  title: string;
  items: string[];
  addLabel: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div className="flex gap-2" key={`${index}-${item}`}>
            <input
              className="w-full rounded-xl border bg-background p-3 text-sm"
              value={item}
              placeholder={
                title === "Specifications" ? "Capacity|180ML" : "Feature title|Description"
              }
              onChange={(event) =>
                onChange(
                  items.map((current, itemIndex) =>
                    itemIndex === index ? event.target.value : current,
                  ),
                )
              }
            />
            <button
              type="button"
              className="rounded-xl border px-3 text-destructive"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpecificationRepeater({
  items,
  format,
  markdown,
  onFormatChange,
  onMarkdownChange,
  onChange,
}: {
  items: Spec[];
  format: "structured" | "markdown";
  markdown: string;
  onFormatChange: (format: "structured" | "markdown") => void;
  onMarkdownChange: (markdown: string) => void;
  onChange: (items: Spec[]) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">Specifications</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {format === "structured"
              ? "Add specification labels and details, or switch to Markdown."
              : "Write specification content using Markdown."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1" aria-label="Specifications format">
            <button
              type="button"
              aria-pressed={format === "structured"}
              onClick={() => onFormatChange("structured")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${format === "structured" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Structured
            </button>
            <button
              type="button"
              aria-pressed={format === "markdown"}
              onClick={() => onFormatChange("markdown")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${format === "markdown" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Markdown
            </button>
          </div>
          {format === "structured" && (
            <button
              type="button"
              onClick={() => onChange([...items, { label: "", value: "" }])}
              className="inline-flex items-center gap-1 text-sm font-bold text-primary"
            >
              <Plus className="h-4 w-4" /> Add specification
            </button>
          )}
        </div>
      </div>
      {format === "markdown" ? (
        <textarea
          rows={10}
          value={markdown}
          onChange={(event) => onMarkdownChange(event.target.value)}
          className="w-full resize-y rounded-xl border bg-background p-4 font-mono text-sm leading-relaxed"
          placeholder={"## Product specifications\n\n- **Model:** D16\n- **Capacity:** 180 ml\n- **Power:** USB"}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
              key={`${index}-${item.label}-${item.value}`}
            >
              <label className="text-xs font-bold text-muted-foreground">
                Specification
                <input
                  className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                  value={item.label}
                  placeholder="Product Model"
                  onChange={(event) =>
                    onChange(
                      items.map((current, itemIndex) =>
                        itemIndex === index ? { ...current, label: event.target.value } : current,
                      ),
                    )
                  }
                />
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                Details
                <input
                  className="mt-1 w-full rounded-xl border bg-background p-3 text-sm font-normal"
                  value={item.value}
                  placeholder="D16"
                  onChange={(event) =>
                    onChange(
                      items.map((current, itemIndex) =>
                        itemIndex === index ? { ...current, value: event.target.value } : current,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                aria-label="Delete specification"
                className="self-end rounded-xl border px-3 py-3 text-destructive"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!items.length && (
            <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
              No specifications added yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RichEditor({
  value,
  onChange,
  format,
  onFormatChange,
}: {
  value: string;
  onChange: (value: string) => void;
  format: "rich" | "markdown";
  onFormatChange: (value: "rich" | "markdown") => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const command = (name: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(name, false, argument);
    onChange(ref.current?.innerHTML ?? "");
  };
  if (format === "markdown") {
    return (
      <div className="overflow-hidden rounded-xl border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-secondary p-2">
          <span className="text-sm font-bold">Markdown format</span>
          <button
            type="button"
            onClick={() => onFormatChange("rich")}
            className="rounded-lg bg-card px-3 py-1.5 text-xs font-bold"
          >
            Use rich text
          </button>
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-64 w-full resize-y bg-background p-4 font-mono text-sm leading-relaxed outline-none"
          placeholder="# Product heading\n\nWrite product content using Markdown..."
        />
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">
          Supports headings, bold, italic, links, blockquotes, bullet lists, and numbered lists.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-secondary p-2">
        <button
          type="button"
          title="Bold"
          onClick={() => command("bold")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => command("italic")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Underline"
          onClick={() => command("underline")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Bulleted list"
          onClick={() => command("insertUnorderedList")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Numbered list"
          onClick={() => command("insertOrderedList")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Heading"
          onClick={() => command("formatBlock", "h2")}
          className="rounded-lg px-2 text-sm font-bold hover:bg-card"
        >
          H2
        </button>
        <button
          type="button"
          title="Undo"
          onClick={() => command("undo")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo"
          onClick={() => command("redo")}
          className="rounded-lg p-2 hover:bg-card"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Link"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) command("createLink", url);
          }}
          className="rounded-lg p-2 hover:bg-card"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onFormatChange("markdown")}
          className="ml-auto rounded-lg bg-card px-3 py-1.5 text-xs font-bold"
        >
          Markdown format
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-48 p-4 outline-none [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
function ListView({
  rows,
  stats,
  query,
  statusFilter,
  error,
  notice,
  databaseReady,
  setQuery,
  setStatusFilter,
  onRetry,
  onAdd,
  onEdit,
  onRemove,
  onLogout,
}: {
  rows: ProductRow[];
  stats: { total: number; published: number; drafts: number; active: number; out: number };
  query: string;
  statusFilter: string;
  error: string;
  notice: string;
  databaseReady: boolean;
  setQuery: (value: string) => void;
  setStatusFilter: (value: string) => void;
  onRetry: () => void;
  onAdd: () => void;
  onEdit: (row: ProductRow) => void;
  onRemove: (row: ProductRow) => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-secondary/50">
      <AdminHeader onLogout={onLogout} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Total", stats.total],
            ["Published", stats.published],
            ["Drafts", stats.drafts],
            ["Active", stats.active],
            ["Out of stock", stats.out],
          ].map(([label, value]) => (
            <div className="rounded-2xl bg-card p-4 shadow-card" key={String(label)}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-xl border bg-card py-2.5 pl-9 pr-3"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="rounded-xl border bg-card px-3"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <span>{error}</span>
            {!databaseReady && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 font-bold"
              >
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            )}
          </div>
        )}
        {notice && <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}
        <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="p-4">Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b last:border-0" key={row.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          row.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]
                            ?.public_url
                        }
                        alt=""
                        className="h-12 w-12 rounded-lg bg-secondary object-cover"
                      />
                      <div>
                        <p className="font-bold">{row.name}</p>
                        <p className="text-xs text-muted-foreground">/{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    à§³{row.offer_price}
                    <span className="ml-1 text-xs text-muted-foreground line-through">
                      à§³{row.regular_price}
                    </span>
                  </td>
                  <td>{row.stock_quantity}</td>
                  <td>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">
                      {row.status} Â· {row.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td>{new Date(row.updated_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      className="mr-2 rounded-lg p-2 text-primary hover:bg-secondary"
                      title="Edit"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                      title="Archive"
                      onClick={() => onRemove(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-10 text-center text-muted-foreground">No products found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
function ReviewModerationPanel({
  reviews,
  filter,
  setFilter,
  onApprove,
  onReject,
  onDelete,
}: {
  reviews: ReviewRow[];
  filter: "all" | ReviewStatus;
  setFilter: (value: "all" | ReviewStatus) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl rounded-2xl bg-card p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Reviews</p>
          <h2 className="mt-1 text-2xl font-extrabold">Customer review moderation</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${filter === value ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {reviews.length ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  {review.customer_image ? (
                    <img
                      src={review.customer_image}
                      alt={review.customer_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
                      {review.customer_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{review.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{review.product_slug}</p>
                    <p className="mt-1 text-sm text-amber-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold uppercase">
                  {review.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{review.review_text}”</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => onApprove(review.id)}
                    className="rounded-xl bg-success px-3 py-2 text-sm font-bold text-white"
                  >
                    Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => onReject(review.id)}
                    className="rounded-xl bg-warning px-3 py-2 text-sm font-bold text-primary-foreground"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(review.id)}
                  className="rounded-xl border px-3 py-2 text-sm font-bold text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No reviews match this filter.
          </div>
        )}
      </div>
    </section>
  );
}

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">GizmoZone BD</p>
          <h1 className="text-xl font-extrabold">Product management</h1>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </header>
  );
}
function Preview({
  form,
  selected,
  discount,
  onClose,
}: {
  form: FormState;
  selected: ProductRow | null;
  discount: number;
  onClose: () => void;
}) {
  const images = [...(selected?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-8 max-w-5xl rounded-3xl bg-card p-5 shadow-soft sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
              Customer preview
            </p>
            <h2 className="text-2xl font-extrabold">{form.name || "Untitled product"}</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            {images[0] ? (
              <img
                src={images[0].public_url}
                alt={form.name}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="grid aspect-square place-items-center rounded-2xl bg-secondary text-muted-foreground">
                Add a main image
              </div>
            )}
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image) => (
                <img
                  key={image.id}
                  src={image.public_url}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-primary">{form.short_title}</p>
            <h3 className="mt-2 text-3xl font-extrabold">{form.name}</h3>
            <p className="mt-3 text-muted-foreground">{form.short_description}</p>
            <div className="mt-5 flex items-end gap-3">
              <strong className="text-3xl text-primary">à§³{form.offer_price || "0"}</strong>
              <span className="text-muted-foreground line-through">
                à§³{form.regular_price || "0"}
              </span>
              <span className="rounded-full bg-warning px-2 py-1 text-xs font-bold">
                {discount}% OFF
              </span>
            </div>
            {form.video_url && (
              <video
                controls
                className="mt-5 aspect-video w-full rounded-xl bg-black"
                src={form.video_url}
              />
            )}
          </div>
        </div>
        <div className="mt-8 grid gap-6 border-t pt-6 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-extrabold">Description</h3>
            <div
              className="prose mt-3 max-w-none"
              dangerouslySetInnerHTML={{ __html: form.description }}
            />
          </div>
          <div>
            <h3 className="text-xl font-extrabold">Key features</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {form.features.map((feature) => (
                <li key={feature.title}>
                  <strong>{feature.title}</strong> {feature.description}
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-xl font-extrabold">Specifications</h3>
            {form.specifications_format === "markdown" ? (
              <div
                className="prose mt-3 max-w-none text-sm [&_h2]:font-extrabold [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(form.specifications_markdown) }}
              />
            ) : (
              <div className="mt-3 divide-y">
                {form.specifications.map((spec) => (
                  <div className="grid grid-cols-2 gap-2 py-2 text-sm" key={spec.label}>
                    <span className="text-muted-foreground">{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 p-4 text-center">
      {children}
    </div>
  );
}
function Login({
  email,
  password,
  error,
  busy,
  setEmail,
  setPassword,
  onSubmit,
}: {
  email: string;
  password: string;
  error: string;
  busy: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-hero px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl bg-card p-7 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">GizmoZone BD</p>
        <h1 className="mt-2 text-3xl font-extrabold">Admin login</h1>
        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        <label className="mt-6 block text-sm font-bold">
          Email
          <input
            className="mt-2 w-full rounded-xl border bg-background p-3 font-normal"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          Password
          <input
            className="mt-2 w-full rounded-xl border bg-background p-3 font-normal"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
