import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { PRODUCT_PRICE, DELIVERY_INSIDE, DELIVERY_OUTSIDE } from "./lib/order-schema";

const DATA_DIR_REL = "data";

function base64Encode(str: string) {
  try {
    // @ts-ignore
    if (typeof Buffer !== "undefined") return Buffer.from(str).toString("base64");
  } catch {}
  try {
    // @ts-ignore
    if (typeof btoa !== "undefined") return btoa(str);
  } catch {}
  return "";
}

function checkAdminAuth(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const expected = "Basic " + base64Encode("Admin:Samir01991080981");
  return auth === expected;
}

async function ensureDataFile() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const isVercel = Boolean(process.env.VERCEL);
    const DATA_DIR = isVercel ? "/tmp/d16-orders" : path.resolve(process.cwd(), DATA_DIR_REL);
    const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.promises.access(ORDERS_FILE);
    } catch {
      const bundledOrdersFile = path.resolve(process.cwd(), DATA_DIR_REL, "orders.json");
      try {
        const bundledOrders = await fs.promises.readFile(bundledOrdersFile, "utf-8");
        await fs.promises.writeFile(ORDERS_FILE, bundledOrders, "utf-8");
      } catch {
        await fs.promises.writeFile(ORDERS_FILE, "[]", "utf-8");
      }
    }
    return { fs, ORDERS_FILE } as any;
  } catch (e) {
    console.error("Unable to ensure data file:", e);
    return null;
  }
}

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/management-api")) return null;

  const data = await ensureDataFile();
  if (!data) return new Response(JSON.stringify({ error: "Data storage not available" }), { status: 500, headers: { "content-type": "application/json" } });
  const fs = data.fs;
  const ORDERS_FILE = data.ORDERS_FILE;

  // Helper to read and migrate orders
  async function readOrders() {
    try {
      const raw = await fs.promises.readFile(ORDERS_FILE, "utf-8");
      let orders = JSON.parse(raw || "[]");
      // Migrate any old orders to new schema
      orders = orders.map((o: any) => {
        if (!o.orderStatus) {
          // Old order, needs migration
          const area = o.area || "inside";
          const qty = o.qty || 1;
          const productPrice = PRODUCT_PRICE;
          const deliveryCharge = area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
          const discount = 0;
          const totalPrice = (productPrice * qty) + deliveryCharge - discount;
          
          return {
            // Preserve existing
            id: o.id,
            createdAt: o.createdAt,
            name: o.name,
            phone: o.phone,
            address: o.address,
            area,
            qty,
            color: o.color || "black",
            
            // New fields with defaults
            updatedAt: o.createdAt,
            productPrice,
            deliveryCharge,
            discount,
            totalPrice,
            paidAmount: 0,
            dueAmount: totalPrice,
            paymentStatus: "pending",
            orderStatus: "new",
            callStatus: "notCalled",
            statusHistory: [
              {
                status: "new",
                timestamp: o.createdAt,
                changedBy: "system",
              },
            ],
            callHistory: [],
          };
        }
        return o;
      });
      return orders;
    } catch (e) {
      console.error("Failed to read orders:", e);
      return [];
    }
  }

  async function writeOrders(orders: any[]) {
    try {
      await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Failed to write orders:", e);
      return false;
    }
  }

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers": "Content-Type,Authorization",
      },
    });
  }

  // POST /management-api/orders -> create order (from customer)
  if (request.method === "POST" && url.pathname === "/management-api/orders") {
    try {
      const payload = await request.json();
      const orders = await readOrders();
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const now = new Date().toISOString();
      
      const area = payload.area || "inside";
      const qty = payload.qty || 1;
      const deliveryCharge = area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
      const totalPrice = (PRODUCT_PRICE * qty) + deliveryCharge;
      
      const order = {
        id,
        createdAt: now,
        updatedAt: now,
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        area,
        qty,
        color: payload.color || "black",
        productPrice: PRODUCT_PRICE,
        deliveryCharge,
        discount: 0,
        totalPrice,
        paidAmount: 0,
        dueAmount: totalPrice,
        paymentStatus: "pending",
        orderStatus: "new",
        callStatus: "notCalled",
        statusHistory: [{ status: "new", timestamp: now, changedBy: "system" }],
        callHistory: [],
      };
      
      orders.unshift(order);
      if (!await writeOrders(orders)) {
        return new Response(JSON.stringify({ error: "Unable to save order" }), {
          status: 500,
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        });
      }
      
      return new Response(JSON.stringify(order), {
        status: 201,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      console.error("Failed to create order", e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }
  }

  // GET /management-api/orders -> list with filtering & pagination
  if (request.method === "GET" && url.pathname === "/management-api/orders") {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    try {
      let orders = await readOrders();
      
      // Parse query params for filtering, sorting, pagination
      const search = url.searchParams.get("search") || "";
      const status = url.searchParams.get("status") || "";
      const callStatus = url.searchParams.get("callStatus") || "";
      const sort = url.searchParams.get("sort") || "newest";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      
      // Filter
      if (search) {
        const q = search.toLowerCase();
        orders = orders.filter((o: any) =>
          o.name.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.id.includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      }
      
      if (status) {
        orders = orders.filter((o: any) => o.orderStatus === status);
      }
      
      if (callStatus) {
        orders = orders.filter((o: any) => o.callStatus === callStatus);
      }
      
      // Sort
      if (sort === "oldest") orders.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      else if (sort === "highest") orders.sort((a: any, b: any) => b.totalPrice - a.totalPrice);
      else if (sort === "lowest") orders.sort((a: any, b: any) => a.totalPrice - b.totalPrice);
      else orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // newest
      
      // Pagination
      const total = orders.length;
      const start = (page - 1) * limit;
      const paged = orders.slice(start, start + limit);
      
      return new Response(JSON.stringify({ orders: paged, total, page, limit }), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      console.error("Failed to read orders", e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }
  }

  // GET /management-api/orders/:id -> get single order
  const orderIdMatch = url.pathname.match(/^\/management-api\/orders\/([^\/]+)$/);
  if (request.method === "GET" && orderIdMatch) {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const orderId = orderIdMatch[1];
    try {
      const orders = await readOrders();
      const order = orders.find((o: any) => o.id === orderId);
      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // PATCH /management-api/orders/:id -> update order
  const patchOrderMatch = url.pathname.match(/^\/management-api\/orders\/([^\/]+)$/);
  if (request.method === "PATCH" && patchOrderMatch) {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const orderId = patchOrderMatch[1];
    try {
      const payload = await request.json();
      const orders = await readOrders();
      const idx = orders.findIndex((o: any) => o.id === orderId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      
      const order = orders[idx];
      order.updatedAt = new Date().toISOString();
      
      // Update allowed fields
      const { productPrice, qty, discount, paidAmount, notes } = payload;
      if (productPrice !== undefined) order.productPrice = productPrice;
      if (qty !== undefined) order.qty = qty;
      if (discount !== undefined) order.discount = discount;
      if (paidAmount !== undefined) {
        order.paidAmount = paidAmount;
        order.dueAmount = Math.max(0, order.totalPrice - paidAmount);
        order.paymentStatus = paidAmount >= order.totalPrice ? "paid" : paidAmount > 0 ? "partial" : "pending";
      }
      if (notes !== undefined) order.notes = notes;
      
      // Recalculate total if product price or qty changed
      if (productPrice !== undefined || qty !== undefined) {
        order.totalPrice = (order.productPrice * order.qty) + order.deliveryCharge - order.discount;
        order.dueAmount = Math.max(0, order.totalPrice - order.paidAmount);
      }
      
      orders[idx] = order;
      if (!await writeOrders(orders)) {
        return new Response(JSON.stringify({ error: "Unable to save order status" }), {
          status: 500,
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        });
      }
      
      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // POST /management-api/orders/:id/status -> change order status
  const statusMatch = url.pathname.match(/^\/management-api\/orders\/([^\/]+)\/status$/);
  if (request.method === "POST" && statusMatch) {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const orderId = statusMatch[1];
    try {
      const { status } = await request.json();
      const orders = await readOrders();
      const idx = orders.findIndex((o: any) => o.id === orderId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      
      const order = orders[idx];
      const now = new Date().toISOString();
      order.orderStatus = status;
      order.updatedAt = now;
      
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({ status, timestamp: now, changedBy: "admin" });
      
      orders[idx] = order;
      await writeOrders(orders);
      
      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // POST /management-api/orders/:id/call -> log call attempt
  const callMatch = url.pathname.match(/^\/management-api\/orders\/([^\/]+)\/call$/);
  if (request.method === "POST" && callMatch) {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const orderId = callMatch[1];
    try {
      const { result, note, callbackDate, callbackTime, callbackNote } = await request.json();
      const orders = await readOrders();
      const idx = orders.findIndex((o: any) => o.id === orderId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      
      const order = orders[idx];
      const now = new Date().toISOString();
      order.callStatus = result;
      order.updatedAt = now;
      
      if (!order.callHistory) order.callHistory = [];
      order.callHistory.push({
        timestamp: now,
        result,
        note,
        callbackDate: result === "callAgain" ? callbackDate : undefined,
        callbackTime: result === "callAgain" ? callbackTime : undefined,
        callbackNote: result === "callAgain" ? callbackNote : undefined,
      });
      
      if (result === "callAgain") {
        order.callbackDate = callbackDate;
        order.callbackTime = callbackTime;
        order.callbackNote = callbackNote;
      }
      
      orders[idx] = order;
      await writeOrders(orders);
      
      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // DELETE /management-api/orders/:id -> delete order
  const deleteMatch = url.pathname.match(/^\/management-api\/orders\/([^\/]+)$/);
  if (request.method === "DELETE" && deleteMatch) {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const orderId = deleteMatch[1];
    try {
      const orders = await readOrders();
      const idx = orders.findIndex((o: any) => o.id === orderId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { "content-type": "application/json" } });
      }
      
      orders.splice(idx, 1);
      await writeOrders(orders);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // GET /management-api/stats -> dashboard statistics
  if (request.method === "GET" && url.pathname === "/management-api/stats") {
    if (!checkAdminAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    try {
      const orders = await readOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        total: orders.length,
        new: orders.filter((o: any) => o.orderStatus === "new").length,
        callPending: orders.filter((o: any) => o.callStatus === "notCalled" || o.callStatus === "callPending").length,
        confirmed: orders.filter((o: any) => o.orderStatus === "confirmed").length,
        processing: orders.filter((o: any) => o.orderStatus === "processing").length,
        deliveryPending: orders.filter((o: any) => o.orderStatus === "deliveryPending").length,
        outForDelivery: orders.filter((o: any) => o.orderStatus === "outForDelivery").length,
        done: orders.filter((o: any) => o.orderStatus === "done").length,
        cancelled: orders.filter((o: any) => o.orderStatus === "cancelled").length,
        returned: orders.filter((o: any) => o.orderStatus === "returned").length,
        todayOrders: orders.filter((o: any) => new Date(o.createdAt) >= today).length,
        totalSales: orders.reduce((sum: number, o: any) => sum + (o.orderStatus === "done" ? o.totalPrice : 0), 0),
        todaySales: orders.filter((o: any) => new Date(o.createdAt) >= today && o.orderStatus === "done").reduce((sum: number, o: any) => sum + o.totalPrice, 0),
      };
      
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
    }
  }

  // POST /management-api/login -> check creds and return a simple token (client can store in memory)
  if (request.method === "POST" && url.pathname === "/management-api/login") {
    try {
      const { username, password } = await request.json();
      if (username === "Admin" && password === "Samir01991080981") {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        });
      }
      return new Response(JSON.stringify({ ok: false }), {
        status: 401,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResp = await handleApi(request);
      if (apiResp) return apiResp;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
