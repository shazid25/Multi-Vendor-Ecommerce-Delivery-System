"use server";

import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";

// Determine the internal API_URL for server-to-server calls.
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NEXT_PUBLIC_SERVER_URL ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api` : "") ||
  "http://127.0.0.1:5000/api";
const API_URL = RAW_API_URL.replace(/\/$/, "");

// ─── Stripe Initialization ──────────────────────────────────────────────────
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" as any })
  : null;

// ─── Helper for server-to-server calls ──────────────────────────────────────

async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  // Use absolute URL for server-side fetches
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${normalizedEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
        ...options.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || res.statusText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("serverFetch network error:", { url, error });
    return {
      success: false,
      error: "Unable to connect to backend API. Please ensure server is running.",
    };
  }
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

  if (!stripe) {
    return { success: false, error: "Stripe is not configured on the server." };
  }

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

export async function placeOrder(data: {
  items: Array<{ productId: string; quantity: number }>;
  city: string;
  shippingAddress: string;
  paymentMethod: 'STRIPE' | 'CASH_ON_DELIVERY';
  customerPhone: string;
  customerName: string;
}) {
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
  return serverFetch("/delivery/partners");
}

export async function assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
  const res = await serverFetch("/delivery/assign", {
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

export async function getDeliveryPartnerStats() {
  return serverFetch("/orders/delivery/stats");
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

export async function getDeliveryEarnings() {
  return serverFetch("/delivery/earnings");
}

// ─── Admin / Super Admin Actions ────────────────────────────────────────────

export async function getAllUsers() {
  return serverFetch("/auth/users");
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
  return serverFetch("/auth/notifications");
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
  if (res.success) revalidatePath("/faq");
  return res;
}

export async function updateFAQ(id: string, data: any) {
  const res = await serverFetch(`/cms/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/faq");
  return res;
}

export async function deleteFAQ(id: string) {
  const res = await serverFetch(`/cms/faqs/${id}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/faq");
  return res;
}

// ─── Blog Actions ───────────────────────────────────────────────────────────

export async function getBlogs() {
  return serverFetch("/cms/blogs");
}

export async function getAllBlogs() {
  return serverFetch("/cms/blogs/all");
}

export async function getBlogBySlug(slug: string) {
  return serverFetch(`/cms/blogs/${slug}`);
}

export async function createBlog(data: any) {
  const res = await serverFetch("/cms/blogs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/blog");
  return res;
}

export async function updateBlog(id: string, data: any) {
  const res = await serverFetch(`/cms/blogs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug || id}`);
  }
  return res;
}

export async function deleteBlog(id: string) {
  const res = await serverFetch(`/cms/blogs/${id}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/blog");
  return res;
}

// ─── Help Actions ───────────────────────────────────────────────────────────

export async function getHelpEntries() {
  return serverFetch("/cms/help");
}

export async function getAllHelpEntries() {
  return serverFetch("/cms/help/all");
}

export async function createHelpEntry(data: any) {
  const res = await serverFetch("/cms/help", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/help");
  return res;
}

export async function updateHelpEntry(id: string, data: any) {
  const res = await serverFetch(`/cms/help/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.success) revalidatePath("/help");
  return res;
}

export async function deleteHelpEntry(id: string) {
  const res = await serverFetch(`/cms/help/${id}`, {
    method: "DELETE",
  });
  if (res.success) revalidatePath("/help");
  return res;
}
