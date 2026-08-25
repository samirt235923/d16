'use client';

import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  ORDER_STATUS_LABELS,
  CALL_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderStatus,
  type CallStatus,
} from "@/lib/order-schema";

export const Route = createFileRoute("/management")({
  head: () => ({ meta: [{ title: "Order Management Dashboard" }] }),
  component: ManagementPage,
});

function ManagementPage() {
  const [authOk, setAuthOk] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("Admin");
  const [password, setPassword] = useState("");
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCallStatus, setFilterCallStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersRequestId = useRef(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch functions
  const login = useCallback(async () => {
    try {
      const res = await fetch("/management-api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setAuthOk(true);
      } else {
        alert("Invalid credentials");
      }
    } catch (e) {
      alert(String(e));
    }
  }, [username, password]);

  const fetchOrders = useCallback(async () => {
    if (!authOk) return;
    const requestId = ++ordersRequestId.current;
    setLoading(true);
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus) params.append("status", filterStatus);
      if (filterCallStatus) params.append("callStatus", filterCallStatus);
      params.append("sort", sortBy);
      params.append("page", "1");
      params.append("limit", "10000");

      const res = await fetch(`/management-api/orders?${params}`, {
        headers: { Authorization: basic },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (requestId === ordersRequestId.current) {
          setOrders(data.orders || []);
          setTotalOrders(Number(data.total) || 0);
        }
      } else if (res.status === 401) {
        setAuthOk(false);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, [authOk, username, password, searchQuery, filterStatus, filterCallStatus, sortBy]);

  const fetchStats = useCallback(async () => {
    if (!authOk) return;
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch("/management-api/stats", {
        headers: { Authorization: basic },
        cache: "no-store",
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  }, [authOk, username, password]);

  useEffect(() => {
    if (authOk) {
      fetchOrders();
      fetchStats();
      const interval = setInterval(() => {
        fetchStats();
      }, 30000); // Refresh stats every 30s
      return () => clearInterval(interval);
    }
  }, [authOk, fetchOrders, fetchStats]);

  const refreshDashboard = async () => {
    await Promise.all([fetchOrders(), fetchStats()]);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch(`/management-api/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: basic,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = await res.json();
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (e) {
      alert("Failed to update status: " + String(e));
    }
  };

  const updateCallStatus = async (orderId: string, result: CallStatus, note?: string, callbackDate?: string, callbackTime?: string, callbackNote?: string) => {
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch(`/management-api/orders/${orderId}/call`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: basic,
        },
        body: JSON.stringify({ result, note, callbackDate, callbackTime, callbackNote }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = await res.json();
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (e) {
      alert("Failed to log call: " + String(e));
    }
  };

  const updatePayment = async (orderId: string, paidAmount: number) => {
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch(`/management-api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Authorization: basic,
        },
        body: JSON.stringify({ paidAmount }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = await res.json();
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (e) {
      alert("Failed to update payment: " + String(e));
    }
  };

  const addNote = async (orderId: string, notes: string) => {
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch(`/management-api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Authorization: basic,
        },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const updatedOrder = await res.json();
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (e) {
      alert("Failed to add note: " + String(e));
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const basic = "Basic " + btoa(`${username}:${password}`);
      const res = await fetch(`/management-api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: basic },
      });
      if (res.ok) {
        setShowDeleteConfirm(null);
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setShowOrderDetail(false);
          setSelectedOrder(null);
        }
      }
    } catch (e) {
      alert("Failed to delete order: " + String(e));
    }
  };

  if (!authOk) {
    return <LoginPage onLogin={login} username={username} setUsername={setUsername} password={password} setPassword={setPassword} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <Header username={username} onLogout={() => { setAuthOk(false); setOrders([]); }} />

        <main className="p-6">
          {/* Dashboard Stats */}
          <DashboardStats stats={stats} />

          {/* Filters and Search */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              placeholder="Search by name, phone, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="callPending">Call Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="deliveryPending">Delivery Pending</SelectItem>
                <SelectItem value="outForDelivery">Out for Delivery</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCallStatus} onValueChange={(val) => { setFilterCallStatus(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Call Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Call Status</SelectItem>
                <SelectItem value="notCalled">Not Called</SelectItem>
                <SelectItem value="callPending">Call Pending</SelectItem>
                <SelectItem value="callDone">Call Done</SelectItem>
                <SelectItem value="callAgain">Call Again</SelectItem>
                <SelectItem value="notInterested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(val) => { setSortBy(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Price</SelectItem>
                <SelectItem value="lowest">Lowest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">All Orders</h2>
            <Button variant="outline" size="sm" onClick={refreshDashboard} disabled={loading}>
              {loading ? "Refreshing..." : "↻ Refresh"}
            </Button>
          </div>
          <OrdersTable
            orders={orders}
            loading={loading}
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setShowOrderDetail(true);
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} of {totalOrders} orders
            </div>
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={showOrderDetail}
        onOpenChange={setShowOrderDetail}
        onStatusChange={updateOrderStatus}
        onCallStatusChange={updateCallStatus}
        onPaymentChange={updatePayment}
        onNoteAdd={addNote}
        onDelete={(orderId) => {
          setShowDeleteConfirm(orderId);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The order will be permanently deleted from the system.
          </AlertDialogDescription>
          <div className="flex gap-2 mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteConfirm && deleteOrder(showDeleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoginPage({
  onLogin,
  username,
  setUsername,
  password,
  setPassword,
}: {
  onLogin: () => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Order Management</CardTitle>
          <CardDescription className="text-center">Sign in to your admin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && onLogin()}
            />
          </div>
          <Button onClick={onLogin} className="w-full">
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Sidebar() {
  const menuItems = [
    { label: "Dashboard", icon: "📊" },
    { label: "All Orders", icon: "📦" },
    { label: "New Orders", icon: "🟡" },
    { label: "Call Pending", icon: "📞" },
    { label: "Confirmed", icon: "✅" },
    { label: "Processing", icon: "⚙️" },
    { label: "Delivery", icon: "🚚" },
    { label: "Delivered", icon: "🎁" },
    { label: "Cancelled", icon: "❌" },
    { label: "Customers", icon: "👥" },
    { label: "Reports", icon: "📈" },
    { label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 border-r bg-card p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">💧 Humidifier</h1>
        <p className="text-xs text-muted-foreground">Order Management System</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Header({ username, onLogout }: { username: string; onLogout: () => void }) {
  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold">Orders Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Logged in as {username}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function DashboardStats({ stats }: { stats: any }) {
  if (!stats) return null;

  const statCards = [
    { label: "Total Orders", value: stats.total, color: "bg-blue-50" },
    { label: "New Orders", value: stats.new, color: "bg-yellow-50" },
    { label: "Call Pending", value: stats.callPending, color: "bg-orange-50" },
    { label: "Confirmed", value: stats.confirmed, color: "bg-green-50" },
    { label: "Processing", value: stats.processing, color: "bg-purple-50" },
    { label: "Out for Delivery", value: stats.outForDelivery, color: "bg-indigo-50" },
    { label: "Done", value: stats.done, color: "bg-emerald-50" },
    { label: "Cancelled", value: stats.cancelled, color: "bg-red-50" },
    { label: "Today's Orders", value: stats.todayOrders, color: "bg-cyan-50" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label} className={stat.color}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-2 text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  loading,
  onSelectOrder,
}: {
  orders: Order[];
  loading: boolean;
  onSelectOrder: (order: Order) => void;
}) {
  if (loading) return <div className="mt-6 text-center py-8 text-muted-foreground">Loading orders...</div>;

  if (orders.length === 0) {
    return <div className="mt-6 text-center py-8 text-muted-foreground">No orders found</div>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Order Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Call Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => onSelectOrder(order)}>
              <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{order.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-sm font-medium">{order.name}</td>
              <td className="px-4 py-3 text-sm">{order.phone}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold">৳{order.totalPrice}</td>
              <td className="px-4 py-3 text-sm">
                <Badge variant="outline">{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
              </td>
              <td className="px-4 py-3 text-sm">
                <Badge variant="secondary">{CALL_STATUS_LABELS[order.callStatus]}</Badge>
              </td>
              <td className="px-4 py-3 text-sm">
                <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelectOrder(order); }}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onStatusChange,
  onCallStatusChange,
  onPaymentChange,
  onNoteAdd,
  onDelete,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onCallStatusChange: (orderId: string, result: CallStatus, note?: string) => void;
  onPaymentChange: (orderId: string, paidAmount: number) => void;
  onNoteAdd: (orderId: string, notes: string) => void;
  onDelete: (orderId: string) => void;
}) {
  const [paidAmount, setPaidAmount] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (order) {
      setPaidAmount(String(order.paidAmount));
      setNewNote(order.notes || "");
    }
  }, [order]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details: {order.id}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="call">Call</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Customer Name</label>
                <div className="text-lg font-medium">{order.name}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                <div className="text-lg font-medium">{order.phone}</div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-semibold text-muted-foreground">Address</label>
                <div className="text-lg font-medium">{order.address}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Quantity</label>
                <div className="text-lg font-medium">{order.qty} units</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Color</label>
                <div className="text-lg font-medium">{order.color}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Area</label>
                <div className="text-lg font-medium">{order.area === "inside" ? "Inside Dhaka" : "Outside Dhaka"}</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Created</label>
                <div className="text-lg font-medium">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-semibold">Internal Notes</label>
              <div className="mt-2 space-y-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal notes..."
                />
                <Button
                  size="sm"
                  onClick={() => {
                    onNoteAdd(order.id, newNote);
                    setNewNote("");
                  }}
                >
                  Save Note
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Update Order Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["new", "callPending", "confirmed", "processing", "deliveryPending", "outForDelivery", "done", "cancelled"] as OrderStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={order.orderStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => onStatusChange(order.id, status)}
                  >
                    {ORDER_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-4 border-t">
                <label className="text-sm font-semibold mb-2 block">Status History</label>
                <div className="space-y-2">
                  {order.statusHistory.map((record, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{ORDER_STATUS_LABELS[record.status]}</div>
                      <div className="text-xs text-muted-foreground">{new Date(record.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Call Tab */}
          <TabsContent value="call" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Log Call Result</label>
              <div className="grid grid-cols-2 gap-2">
                {(["callDone", "noAnswer", "notInterested", "callAgain"] as CallStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => onCallStatusChange(order.id, status)}
                  >
                    {CALL_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Call History */}
            {order.callHistory && order.callHistory.length > 0 && (
              <div className="pt-4 border-t">
                <label className="text-sm font-semibold mb-2 block">Call History</label>
                <div className="space-y-2">
                  {order.callHistory.map((record, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{CALL_STATUS_LABELS[record.result]}</div>
                      <div className="text-xs text-muted-foreground">{new Date(record.timestamp).toLocaleString()}</div>
                      {record.note && <div className="text-xs mt-1">{record.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Product Price:</span>
                  <div className="text-lg font-semibold">৳{order.productPrice}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Qty:</span>
                  <div className="text-lg font-semibold">{order.qty}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Delivery:</span>
                  <div className="text-lg font-semibold">৳{order.deliveryCharge}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Discount:</span>
                  <div className="text-lg font-semibold">-৳{order.discount}</div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">৳{order.totalPrice}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Payment Received</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Amount paid"
                  />
                  <Button
                    onClick={() => {
                      onPaymentChange(order.id, parseInt(paidAmount));
                      setPaidAmount("");
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-accent rounded">
                <div className="flex justify-between mb-2">
                  <span>Paid:</span>
                  <span className="font-semibold">৳{order.paidAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due:</span>
                  <span className="font-semibold text-destructive">৳{order.dueAmount}</span>
                </div>
              </div>

              <Badge className="w-full justify-center" variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
          <Button variant="destructive" onClick={() => onDelete(order.id)}>
            Delete Order
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Route;
