"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSupabaseClient } from "@/lib/supabase";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const PAGE_SIZES = [20, 50, 100] as const;
const ORDER_COLUMNS =
  "id, customer_name, phone, address, delivery_area, color, quantity, product_name, product_price, delivery_charge, total_price, status, created_at";

type OrderStatus = (typeof ORDER_STATUSES)[number];
type AuthState = "checking" | "unauthenticated" | "forbidden" | "authenticated";
type DateFilter = "all" | "today" | "yesterday" | "last7" | "last30" | "custom";
type DateRange = { from?: string; to?: string };

type AdminOrder = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_area: string;
  color: string;
  quantity: number;
  product_name: string;
  product_price: number;
  delivery_charge: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
};

type DashboardStats = Record<"total" | "today" | OrderStatus, number>;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const Route = createFileRoute("/management")({
  head: () => ({ meta: [{ title: "Order Management Dashboard" }] }),
  component: ManagementPage,
});

function ManagementPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [adminEmail, setAdminEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const requestId = useRef(0);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  const syncAuth = useCallback(async () => {
    try {
      const { data, error } = await getSupabaseClient().auth.getUser();
      const user = data.user;
      if (error || !user) {
        setAdminEmail("");
        setAuthState("unauthenticated");
        return;
      }
      if (user.app_metadata?.["role"] !== "admin") {
        setAdminEmail(user.email ?? "");
        setAuthState("forbidden");
        return;
      }
      setAdminEmail(user.email ?? "");
      setAuthState("authenticated");
    } catch {
      setAdminEmail("");
      setAuthState("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void syncAuth();
    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(() => void syncAuth());
    return () => subscription.unsubscribe();
  }, [syncAuth]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, dateFilter, customStartDate, customEndDate, pageSize]);

  const fetchOrders = useCallback(async () => {
    if (authState !== "authenticated") return;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setOrdersError(null);

    try {
      const client = getSupabaseClient();
      let query = client
        .from("orders")
        .select(ORDER_COLUMNS, { count: "exact" })
        .order("created_at", { ascending: false });
      if (filterStatus !== "all") query = query.eq("status", filterStatus);

      const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);
      if (dateRange.from) query = query.gte("created_at", dateRange.from);
      if (dateRange.to) query = query.lt("created_at", dateRange.to);

      if (debouncedSearch) {
        const safeSearch = debouncedSearch.replace(/[(),%*]/g, " ").trim();
        if (safeSearch) {
          const filters = [`customer_name.ilike.%${safeSearch}%`, `phone.ilike.%${safeSearch}%`];
          if (isUuid(safeSearch)) filters.push(`id.eq.${safeSearch}`);
          query = query.or(filters.join(","));
        }
      }

      const from = (page - 1) * pageSize;
      const { data, error, count } = await query.range(from, from + pageSize - 1);
      if (error) throw error;
      if (currentRequest === requestId.current) {
        setOrders((data ?? []) as AdminOrder[]);
        setTotalOrders(count ?? 0);
      }
    } catch (error: any) {
      console.error("Admin order fetch failed:", error);
      if (currentRequest === requestId.current) {
        setOrders([]);
        setTotalOrders(0);
        const msg = error?.message || "Unknown error";
        const code = error?.code || "";
        setOrdersError(`Orders could not be loaded. [${code}] ${msg}`);
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [
    authState,
    customEndDate,
    customStartDate,
    dateFilter,
    debouncedSearch,
    filterStatus,
    page,
    pageSize,
  ]);

  const fetchStats = useCallback(async () => {
    if (authState !== "authenticated") return;
    try {
      const client = getSupabaseClient();
      const todayRange = getDateRange("today", "", "");
      const countOrders = async (status?: OrderStatus, todayOnly = false) => {
        let query = client.from("orders").select("id", { count: "exact", head: true });
        if (status) query = query.eq("status", status);
        if (todayOnly && todayRange.from && todayRange.to)
          query = query.gte("created_at", todayRange.from).lt("created_at", todayRange.to);
        const { count, error } = await query;
        if (error) throw error;
        return count ?? 0;
      };

      const [total, today, pending, confirmed, processing, shipped, delivered, cancelled] =
        await Promise.all([
          countOrders(),
          countOrders(undefined, true),
          countOrders("pending"),
          countOrders("confirmed"),
          countOrders("processing"),
          countOrders("shipped"),
          countOrders("delivered"),
          countOrders("cancelled"),
        ]);
      setStats({ total, today, pending, confirmed, processing, shipped, delivered, cancelled });
    } catch (error) {
      console.error("Admin statistics fetch failed:", error);
      setOrdersError("Dashboard statistics could not be loaded. Please refresh and try again.");
    }
  }, [authState]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchStats()]);
  }, [fetchOrders, fetchStats]);

  useEffect(() => {
    refreshRef.current = refreshDashboard;
  }, [refreshDashboard]);

  useEffect(() => {
    if (authState === "authenticated") void fetchOrders();
  }, [authState, fetchOrders]);

  useEffect(() => {
    if (authState !== "authenticated") return;
    void fetchStats();
    const interval = window.setInterval(() => void fetchStats(), 30_000);
    return () => window.clearInterval(interval);
  }, [authState, fetchStats]);

  useEffect(() => {
    if (authState !== "authenticated") return;
    const channel = getSupabaseClient()
      .channel("admin-orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => void refreshRef.current(),
      )
      .subscribe();
    return () => {
      void getSupabaseClient().removeChannel(channel);
    };
  }, [authState]);

  const login = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setLoginError("Unable to sign in. Check your email and password.");
        return;
      }
      setPassword("");
      await syncAuth();
    } catch (error) {
      console.error("Admin sign-in failed:", error);
      setLoginError("Unable to sign in right now. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await getSupabaseClient().auth.signOut();
    setOrders([]);
    setStats(null);
    setSelectedOrder(null);
    setAuthState("unauthenticated");
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setOrdersError(null);
    try {
      const { data, error } = await getSupabaseClient()
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select(ORDER_COLUMNS)
        .single();
      if (error) throw error;
      const updatedOrder = data as AdminOrder;
      setOrders((current) => current.map((order) => (order.id === orderId ? updatedOrder : order)));
      setSelectedOrder((current) => (current?.id === orderId ? updatedOrder : current));
      await fetchStats();
    } catch (error) {
      console.error("Admin status update failed:", error);
      setOrdersError("The order status could not be updated. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    setOrdersError(null);
    try {
      const { error } = await getSupabaseClient().from("orders").delete().eq("id", orderId);
      if (error) throw error;
      setShowDeleteConfirm(null);
      setShowOrderDetail(false);
      setSelectedOrder(null);
      await refreshDashboard();
    } catch (error) {
      console.error("Admin order deletion failed:", error);
      setOrdersError("The order could not be deleted. Please try again.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  if (authState === "checking")
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Checking your admin session...
      </div>
    );
  if (authState === "unauthenticated")
    return (
      <LoginPage
        email={email}
        error={loginError}
        loading={loginLoading}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onLogin={login}
      />
    );
  if (authState === "forbidden") return <AccessDenied email={adminEmail} onLogout={logout} />;

  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header email={adminEmail} onLogout={logout} />
        <main className="p-4 md:p-6">
          <DashboardStats stats={stats} />
          {ordersError && (
            <p
              role="alert"
              className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {ordersError}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              placeholder="Search by name, phone, or full order ID..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as OrderStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as DateFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <Input
                type="date"
                aria-label="Start date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
              />
            )}
            {dateFilter === "custom" && (
              <Input
                type="date"
                aria-label="End date"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">All Orders</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshDashboard()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </Button>
          </div>
          <OrdersTable
            loading={loading}
            orders={orders}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setShowOrderDetail(true);
            }}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {orders.length} of {totalOrders} orders
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value) as (typeof PAGE_SIZES)[number])}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </main>
      </div>

      <OrderDetailModal
        deleting={deletingOrderId === selectedOrder?.id}
        onDelete={(orderId) => setShowDeleteConfirm(orderId)}
        onOpenChange={setShowOrderDetail}
        onStatusChange={updateOrderStatus}
        open={showOrderDetail}
        order={selectedOrder}
        updating={updatingOrderId === selectedOrder?.id}
      />
      <AlertDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete order?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this order? This cannot be undone.
          </AlertDialogDescription>
          <div className="mt-6 flex gap-2">
            <AlertDialogCancel disabled={!!deletingOrderId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={!!deletingOrderId}
              onClick={() => showDeleteConfirm && void deleteOrder(showDeleteConfirm)}
            >
              {deletingOrderId ? "Deleting..." : "Delete order"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoginPage({
  email,
  error,
  loading,
  password,
  setEmail,
  setPassword,
  onLogin,
}: {
  email: string;
  error: string | null;
  loading: boolean;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Order Management</CardTitle>
          <CardDescription className="text-center">Sign in to your admin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Admin email</label>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(event) => event.key === "Enter" && onLogin()}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button onClick={onLogin} className="w-full" disabled={loading || !email || !password}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AccessDenied({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin access required</CardTitle>
          <CardDescription>
            {email || "This account"} is authenticated but is not an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => void onLogout()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Sidebar() {
  const menuItems = [
    ["📊", "Dashboard"],
    ["📦", "All Orders"],
    ["🟡", "Pending"],
    ["⚙️", "Processing"],
    ["🎁", "Delivered"],
  ];
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card p-4 lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">💧 Humidifier</h1>
        <p className="text-xs text-muted-foreground">Order Management System</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map(([icon, label]) => (
          <div
            key={label}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground"
          >
            <span className="mr-2">{icon}</span>
            {label}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Header({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <h1 className="text-xl font-bold">Orders Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <Button variant="outline" size="sm" onClick={() => void onLogout()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function DashboardStats({ stats }: { stats: DashboardStats | null }) {
  const cards = [
    ["Total Orders", stats?.total, "bg-blue-50"],
    ["Today's Orders", stats?.today, "bg-cyan-50"],
    ["Pending", stats?.pending, "bg-yellow-50"],
    ["Confirmed", stats?.confirmed, "bg-green-50"],
    ["Delivered", stats?.delivered, "bg-emerald-50"],
    ["Cancelled", stats?.cancelled, "bg-red-50"],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(([label, value, color]) => (
        <Card key={String(label)} className={String(color)}>
          <CardContent className="pt-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-3xl font-bold">{stats ? value : "–"}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrdersTable({
  loading,
  orders,
  onSelectOrder,
}: {
  loading: boolean;
  orders: AdminOrder[];
  onSelectOrder: (order: AdminOrder) => void;
}) {
  if (loading && orders.length === 0)
    return <div className="mt-6 py-8 text-center text-muted-foreground">Loading orders...</div>;
  if (orders.length === 0)
    return (
      <div className="mt-6 py-8 text-center text-muted-foreground">No matching orders found.</div>
    );
  const headings = [
    "Order ID",
    "Customer",
    "Phone",
    "Address",
    "Area",
    "Color",
    "Qty",
    "Product",
    "Product price",
    "Delivery",
    "Total",
    "Status",
    "Date",
  ];
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className="min-w-[1500px] w-full">
        <thead className="bg-muted">
          <tr>
            {headings.map((heading) => (
              <th key={heading} className="px-4 py-3 text-left text-sm font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="cursor-pointer border-t hover:bg-muted/50"
              onClick={() => onSelectOrder(order)}
            >
              <td className="px-4 py-3 text-sm font-mono">{order.id}</td>
              <td className="px-4 py-3 text-sm font-medium">{order.customer_name}</td>
              <td className="px-4 py-3 text-sm">{order.phone}</td>
              <td className="max-w-56 truncate px-4 py-3 text-sm" title={order.address}>
                {order.address}
              </td>
              <td className="px-4 py-3 text-sm">{order.delivery_area}</td>
              <td className="px-4 py-3 text-sm capitalize">{order.color}</td>
              <td className="px-4 py-3 text-sm">{order.quantity}</td>
              <td className="px-4 py-3 text-sm">{order.product_name}</td>
              <td className="px-4 py-3 text-sm">৳{order.product_price}</td>
              <td className="px-4 py-3 text-sm">৳{order.delivery_charge}</td>
              <td className="px-4 py-3 text-sm font-semibold">৳{order.total_price}</td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDhakaDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailModal({
  deleting,
  onDelete,
  onOpenChange,
  onStatusChange,
  open,
  order,
  updating,
}: {
  deleting: boolean;
  onDelete: (orderId: string) => void;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  open: boolean;
  order: AdminOrder | null;
  updating: boolean;
}) {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Order ID" value={order.id} />
          <Detail label="Order date" value={formatDhakaDate(order.created_at)} />
          <Detail label="Customer name" value={order.customer_name} />
          <Detail label="Phone" value={order.phone} />
          <Detail className="sm:col-span-2" label="Full address" value={order.address} />
          <Detail label="Delivery area" value={order.delivery_area} />
          <Detail label="Color" value={order.color} />
          <Detail label="Product" value={order.product_name} />
          <Detail label="Quantity" value={String(order.quantity)} />
          <Detail label="Product price" value={`৳${order.product_price}`} />
          <Detail label="Delivery charge" value={`৳${order.delivery_charge}`} />
          <Detail label="Total price" value={`৳${order.total_price}`} />
          <div>
            <label className="mb-1 block text-sm font-semibold text-muted-foreground">
              Order status
            </label>
            <Select
              value={order.status}
              onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
              disabled={updating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating && <p className="mt-1 text-xs text-muted-foreground">Saving status...</p>}
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t pt-4">
          <Button variant="destructive" disabled={deleting} onClick={() => onDelete(order.id)}>
            {deleting ? "Deleting..." : "Delete order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  className = "",
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-base font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant={
        status === "cancelled" ? "destructive" : status === "delivered" ? "default" : "secondary"
      }
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function formatDhakaDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

function getDateRange(filter: DateFilter, customStart: string, customEnd: string): DateRange {
  const today = getDhakaDateString();
  if (filter === "all") return {};
  if (filter === "today")
    return { from: startOfDhakaDay(today), to: startOfDhakaDay(addDays(today, 1)) };
  if (filter === "yesterday")
    return { from: startOfDhakaDay(addDays(today, -1)), to: startOfDhakaDay(today) };
  if (filter === "last7")
    return { from: startOfDhakaDay(addDays(today, -6)), to: startOfDhakaDay(addDays(today, 1)) };
  if (filter === "last30")
    return { from: startOfDhakaDay(addDays(today, -29)), to: startOfDhakaDay(addDays(today, 1)) };
  const range: DateRange = {};
  if (customStart) range.from = startOfDhakaDay(customStart);
  if (customEnd) range.to = startOfDhakaDay(addDays(customEnd, 1));
  return range;
}

function getDhakaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function startOfDhakaDay(date: string) {
  return new Date(`${date}T00:00:00+06:00`).toISOString();
}

function addDays(date: string, amount: number) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + amount);
  return result.toISOString().slice(0, 10);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
