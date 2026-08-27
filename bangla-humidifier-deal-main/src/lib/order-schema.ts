/**
 * Order Data Schema & Utilities
 * Safe migration and schema management for orders
 */

export const PRODUCT_PRICE = 449;
export const DELIVERY_INSIDE = 50;
export const DELIVERY_OUTSIDE = 100;

export type OrderStatus =
  | "new"
  | "callPending"
  | "callAgain"
  | "confirmed"
  | "processing"
  | "deliveryPending"
  | "outForDelivery"
  | "done"
  | "cancelled"
  | "returned";
export type CallStatus =
  "notCalled" | "callPending" | "callDone" | "callAgain" | "notInterested" | "noAnswer";
export type PaymentStatus = "pending" | "partial" | "paid";

export interface CallRecord {
  timestamp: string;
  result: CallStatus;
  note?: string;
  callbackDate?: string;
  callbackTime?: string;
  callbackNote?: string;
}

export interface StatusChange {
  status: OrderStatus;
  timestamp: string;
  changedBy?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Customer Info
  name: string;
  phone: string;
  address: string;
  area: "inside" | "outside";

  // Product Info
  qty: number;
  color: "black" | "white";

  // Pricing
  productPrice: number;
  deliveryCharge: number;
  discount: number;
  totalPrice: number;
  paidAmount: number;
  dueAmount: number;

  // Status
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  callStatus: CallStatus;

  // Callback info
  callbackDate?: string;
  callbackTime?: string;
  callbackNote?: string;

  // Cancellation
  cancellationReason?: string;

  // Admin notes
  notes?: string;

  // History
  statusHistory: StatusChange[];
  callHistory: CallRecord[];
}

/**
 * Migrate an old order to new schema
 * Preserves all existing data while adding new fields with defaults
 */
export function migrateOrder(oldOrder: any): Order {
  const area = oldOrder.area || "inside";
  const qty = oldOrder.qty || 1;
  const productPrice = PRODUCT_PRICE;
  const deliveryCharge = area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
  const discount = 0;
  const totalPrice = productPrice * qty + deliveryCharge - discount;

  return {
    // Preserve existing
    id: oldOrder.id,
    createdAt: oldOrder.createdAt,
    name: oldOrder.name,
    phone: oldOrder.phone,
    address: oldOrder.address,
    area,
    qty,
    color: oldOrder.color || "black",

    // New fields with defaults
    updatedAt: oldOrder.updatedAt || oldOrder.createdAt,
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
        timestamp: oldOrder.createdAt,
        changedBy: "system",
      },
    ],
    callHistory: [],
  };
}

/**
 * Calculate totals based on order fields
 */
export function calculateTotals(order: Partial<Order>) {
  const qty = order.qty || 1;
  const productPrice = order.productPrice || PRODUCT_PRICE;
  const deliveryCharge =
    order.deliveryCharge || (order.area === "inside" ? DELIVERY_INSIDE : DELIVERY_OUTSIDE);
  const discount = order.discount || 0;
  const totalPrice = productPrice * qty + deliveryCharge - discount;
  const paidAmount = order.paidAmount || 0;
  const dueAmount = Math.max(0, totalPrice - paidAmount);

  return { totalPrice, dueAmount };
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "🟡 New",
  callPending: "🟠 Call Pending",
  callAgain: "🔄 Call Again",
  confirmed: "🔵 Confirmed",
  processing: "🟣 Processing",
  deliveryPending: "🟦 Delivery Pending",
  outForDelivery: "🚚 Out for Delivery",
  done: "🟢 Delivery Done",
  cancelled: "🔴 Cancelled",
  returned: "⚫ Returned",
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  notCalled: "Not Called",
  callPending: "Call Pending",
  callDone: "Call Done",
  callAgain: "Call Again",
  notInterested: "Not Interested",
  noAnswer: "No Answer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
};
