const pendingPurchaseKey = "gizmozone:pending-purchase";

type PendingPurchase = {
  eventId: string;
  value: number;
  currency: "BDT";
};

declare global {
  interface Window {
    fbq?: (
      command: "track",
      eventName: "Purchase",
      parameters: { value: number; currency: "BDT" },
      options: { eventID: string },
    ) => void;
  }
}

export function recordPendingPurchase(value: number) {
  if (!Number.isFinite(value) || value <= 0 || typeof window === "undefined") return;

  try {
    const purchase: PendingPurchase = {
      eventId: window.crypto.randomUUID(),
      value,
      currency: "BDT",
    };
    window.sessionStorage.setItem(pendingPurchaseKey, JSON.stringify(purchase));
  } catch {
    // Tracking storage must not interfere with a successfully submitted order.
  }
}

export function trackPendingPurchase() {
  if (typeof window === "undefined") return;

  try {
    const stored = window.sessionStorage.getItem(pendingPurchaseKey);
    if (!stored) return;

    window.sessionStorage.removeItem(pendingPurchaseKey);
    const purchase = JSON.parse(stored) as Partial<PendingPurchase>;
    if (
      typeof purchase.eventId !== "string" ||
      !Number.isFinite(purchase.value) ||
      (purchase.value ?? 0) <= 0 ||
      purchase.currency !== "BDT" ||
      typeof window.fbq !== "function"
    ) {
      return;
    }

    window.fbq(
      "track",
      "Purchase",
      { value: purchase.value as number, currency: "BDT" },
      { eventID: purchase.eventId },
    );
  } catch {
    // Pixel failures must not interrupt the order confirmation page.
  }
}