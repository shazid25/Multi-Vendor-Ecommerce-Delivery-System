"use server";

import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

// ─── Helper for server-to-server calls ──────────────────────────────────────

async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return { success: false, error: errorData.message || res.statusText };
  }

  const data = await res.json();
  return { success: true, data };
}

// ─── Get Current Session (server-side) ──────────────────────────────────────

export async function getSession() {
  const res = await serverFetch("/auth/me");
  if (res.success) {
    return { user: res.data };
  }
  return null;
}

export async function createCheckoutSession(data: {
  orderId: string;
  amount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: data.items.map((item) => ({
        price_data: {
          currency: "bdt",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/orders?success=true&orderId=${data.orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customer/orders?cancelled=true`,
      metadata: {
        orderId: data.orderId,
        userId: session.user.id,
      },
    });

    return { success: true, url: checkoutSession.url };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    return { success: false, error: message };
  }
}

// ─── Role Request Actions ───────────────────────────────────────────────────

export async function submitVendorRequest(data: {
  shopName: string;
  shopDescription?: string;
  businessType: string;
  phoneNumber: string;
}) {
  const res = await serverFetch("/requests/vendor", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/customer");
  return res;
}

export async function submitDeliveryRequest(data: {
  phoneNumber: string;
  vehicleType: string;
  licenseNumber: string;
  nidNumber?: string;
}) {
  const res = await serverFetch("/requests/delivery", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/dashboard/customer");
  return res;
}

export async function getRoleRequests(status?: string) {
  return serverFetch(`/requests${status ? `?status=${status}` : ""}`);
}

export async function approveRoleRequest(requestId: string) {
  const res = await serverFetch(`/requests/${requestId}/approve`, {
    method: "PATCH",
  });
  if (res.success) {
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/super-admin");
  }
  return res;
}

export async function rejectRoleRequest(requestId: string, reason: string) {
  const res = await serverFetch(`/requests/${requestId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (res.success) revalidatePath("/dashboard/admin");
  return res;
}

// ─── Product Actions ────────────────────────────────────────────────────────

export async function getProducts(filters?: { category?: string; vendorId?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.vendorId) params.append("vendorId", filters.vendorId);
  if (filters?.search) params.append("search", filters.search);

  return serverFetch(`/products?${params.toString()}`);
}

export async function createProduct(data: any) {
  const res = await serverFetch("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) {
    revalidatePath("/dashboard/vendor/products");
    revalidatePath("/shop");
  }
  return res;
}

export async function updateProduct(productId: string, data: any) {
  const res = await serverFetch(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) {
    revalidatePath("/dashboard/vendor/products");
    revalidatePath("/shop");
  }
  return res;
}

export async function deleteProduct(productId: string) {
  const res = await serverFetch(`/products/${productId}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/dashboard/vendor/products");
  return res;
}

// ─── Order Actions ──────────────────────────────────────────────────────────

export async function placeOrder(data: any) {
  const res = await serverFetch("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) {
    revalidatePath("/dashboard/customer/orders");
    revalidatePath("/dashboard/vendor/orders");
  }
  return res;
}

export async function getOrders(userId?: string) {
  return serverFetch(`/orders${userId ? `?userId=${userId}` : ""}`);
}

export async function getVendorOrders() {
  return serverFetch("/orders/vendor");
}

export async function acceptOrder(orderId: string) {
  const res = await serverFetch(`/orders/${orderId}/accept`, {
    method: "PATCH",
  });
  if (res.success) revalidatePath("/dashboard/vendor/orders");
  return res;
}

// ─── Delivery Actions ───────────────────────────────────────────────────────

export async function getAvailableDeliveryPartners() {
  return serverFetch("/delivery/partners"); // I need to add this endpoint to server
}

export async function assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
  const res = await serverFetch("/orders/assign", {
    method: "POST",
    body: JSON.stringify({ orderId, deliveryPartnerId }),
  });
  if (res.success) {
    revalidatePath("/dashboard/vendor/orders");
    revalidatePath("/dashboard/delivery");
  }
  return res;
}

export async function getDeliveryJobs() {
  return serverFetch("/orders/delivery");
}

export async function markAsDelivered(orderId: string) {
  const res = await serverFetch(`/orders/${orderId}/deliver`, {
    method: "PATCH",
  });
  if (res.success) {
    revalidatePath("/dashboard/delivery");
    revalidatePath("/dashboard/vendor");
    revalidatePath("/dashboard/customer");
  }
  return res;
}

export async function startTransit(orderId: string) {
  const res = await serverFetch(`/orders/${orderId}/transit`, {
    method: "PATCH",
  });
  if (res.success) revalidatePath("/dashboard/delivery");
  return res;
}

// ─── Admin / Super Admin Actions ────────────────────────────────────────────

export async function getAllUsers() {
  return serverFetch("/auth/users"); // I need to add this to server
}

export async function updateUserRole(userId: string, role: string) {
  const res = await serverFetch(`/auth/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  if (res.success) {
    revalidatePath("/dashboard/super-admin/users");
    revalidatePath("/profile");
  }
  return res;
}

export async function updateUserProfile(data: any) {
  const res = await serverFetch("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/profile");
  return res;
}

export async function deleteUser(userId: string) {
  const res = await serverFetch(`/auth/users/${userId}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/dashboard/super-admin/users");
  return res;
}

export async function getGlobalAnalytics() {
  return serverFetch("/analytics/global");
}

export async function getNotifications() {
  return serverFetch("/auth/notifications"); // I need to add this
}

export async function getDeliveryPartnerStats() {
  return serverFetch("/analytics/delivery");
}

export async function getVendorStats() {
  return serverFetch("/analytics/vendor");
}

export async function getCustomerStats() {
  return serverFetch("/analytics/customer");
}

// ─── Banner Actions ─────────────────────────────────────────────────────────

export async function getBanners() {
  return serverFetch("/cms/banners");
}

export async function getAllBanners() {
  return serverFetch("/cms/banners/all");
}

export async function createBanner(data: any) {
  const res = await serverFetch("/cms/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/");
  return res;
}

export async function updateBanner(id: string, data: any) {
  const res = await serverFetch(`/cms/banners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/");
  return res;
}

export async function deleteBanner(id: string) {
  const res = await serverFetch(`/cms/banners/${id}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/");
  return res;
}

// ─── FAQ Actions ────────────────────────────────────────────────────────────

export async function getFAQs() {
  return serverFetch("/cms/faqs");
}

export async function getAllFAQs() {
  return serverFetch("/cms/faqs/all");
}

export async function createFAQ(data: any) {
  const res = await serverFetch("/cms/faqs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/");
  return res;
}

export async function updateFAQ(id: string, data: any) {
  const res = await serverFetch(`/cms/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/");
  return res;
}

export async function deleteFAQ(id: string) {
  const res = await serverFetch(`/cms/faqs/${id}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/");
  return res;
}
