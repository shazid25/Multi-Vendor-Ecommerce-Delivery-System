"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Get Current Session (server-side) ──────────────────────────────────────

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// ─── Role Request Actions ───────────────────────────────────────────────────

export async function submitVendorRequest(data: {
  shopName: string;
  shopDescription?: string;
  businessType: string;
  phoneNumber: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.roleRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
    });
    if (existing) return { success: false, error: "You already have a pending request" };

    const request = await prisma.roleRequest.create({
      data: {
        userId: session.user.id,
        type: "VENDOR",
        shopName: data.shopName,
        shopDescription: data.shopDescription,
        businessType: data.businessType,
        phoneNumber: data.phoneNumber,
        bankName: data.bankName,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
      },
    });

    revalidatePath("/dashboard/customer");
    return { success: true, data: request };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return { success: false, error: message };
  }
}

export async function submitDeliveryRequest(data: {
  phoneNumber: string;
  vehicleType: string;
  licenseNumber: string;
  nidNumber?: string;
}) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.roleRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
    });
    if (existing) return { success: false, error: "You already have a pending request" };

    const request = await prisma.roleRequest.create({
      data: {
        userId: session.user.id,
        type: "DELIVERY_PARTNER",
        phoneNumber: data.phoneNumber,
        vehicleType: data.vehicleType,
        licenseNumber: data.licenseNumber,
        nidNumber: data.nidNumber,
      },
    });

    revalidatePath("/dashboard/customer");
    return { success: true, data: request };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return { success: false, error: message };
  }
}

export async function getRoleRequests(status?: string) {
  try {
    const requests = await prisma.roleRequest.findMany({
      where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
      include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: requests };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch requests";
    return { success: false, error: message };
  }
}

export async function approveRoleRequest(requestId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const roleRequest = await tx.roleRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });
      if (!roleRequest) throw new Error("Request not found");
      if (roleRequest.status !== "PENDING") throw new Error("Request already processed");

      // 1. Update request status
      await tx.roleRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", adminNote: `Approved by ${session.user.name}` },
      });

      // 2. Update user role
      const newRole = roleRequest.type === "VENDOR" ? "VENDOR" : "DELIVERY_PARTNER";
      await tx.user.update({
        where: { id: roleRequest.userId },
        data: { role: newRole as "VENDOR" | "DELIVERY_PARTNER" },
      });

      // 3. Create profile
      if (roleRequest.type === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId: roleRequest.userId,
            shopName: roleRequest.shopName || "My Shop",
            phoneNumber: roleRequest.phoneNumber || "",
            businessType: roleRequest.businessType || "General",
            shopDescription: roleRequest.shopDescription,
            bankName: roleRequest.bankName,
            bankAccountName: roleRequest.bankAccountName,
            bankAccountNumber: roleRequest.bankAccountNumber,
          },
        });
      } else {
        await tx.deliveryPartner.create({
          data: {
            userId: roleRequest.userId,
            phoneNumber: roleRequest.phoneNumber || "",
            vehicleType: roleRequest.vehicleType || "Motorcycle",
            licenseNumber: roleRequest.licenseNumber || "",
            nidNumber: roleRequest.nidNumber,
          },
        });
      }

      // 4. Notify user
      await tx.notification.create({
        data: {
          userId: roleRequest.userId,
          title: "Role Request Approved! 🎉",
          message: `Your ${roleRequest.type === "VENDOR" ? "Vendor" : "Delivery Partner"} application has been approved.`,
          type: "success",
          link: roleRequest.type === "VENDOR" ? "/dashboard/vendor" : "/dashboard/delivery",
        },
      });

      return roleRequest;
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/super-admin");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to approve";
    return { success: false, error: message };
  }
}

export async function rejectRoleRequest(requestId: string, reason: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const roleRequest = await prisma.roleRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", adminNote: reason },
    });

    await prisma.notification.create({
      data: {
        userId: roleRequest.userId,
        title: "Role Request Rejected",
        message: `Your application was rejected. Reason: ${reason}`,
        type: "error",
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true, data: roleRequest };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reject";
    return { success: false, error: message };
  }
}

// ─── Product Actions ────────────────────────────────────────────────────────

export async function getProducts(filters?: { category?: string; vendorId?: string; search?: string }) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.vendorId && { vendorId: filters.vendorId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { description: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }),
      },
      include: { vendor: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return { success: false, error: message };
  }
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  images?: string[];
  category: string;
  tags?: string[];
  stock: number;
}) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return { success: false, error: "Vendor profile not found" };

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        image: data.image,
        images: data.images || [],
        category: data.category,
        tags: data.tags || [],
        stock: data.stock,
      },
    });

    revalidatePath("/dashboard/vendor/products");
    revalidatePath("/shop");
    return { success: true, data: product };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, error: message };
  }
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    image: string;
    images: string[];
    category: string;
    tags: string[];
    stock: number;
    isActive: boolean;
  }>
) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });
    revalidatePath("/dashboard/vendor/products");
    revalidatePath("/shop");
    return { success: true, data: product };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, error: message };
  }
}

export async function deleteProduct(productId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
    revalidatePath("/dashboard/vendor/products");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: message };
  }
}

// ─── Order Actions ──────────────────────────────────────────────────────────

export async function placeOrder(data: {
  items: Array<{ productId: string; quantity: number }>;
  city: string;
  shippingAddress: string;
}) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Calculate totals
      let subtotal = 0;
      const orderItems: Array<{ productId: string; quantity: number; price: number; subtotal: number }> = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        const itemPrice = product.discountPrice || product.price;
        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: itemPrice,
          subtotal: itemSubtotal,
        });

        // Decrease stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const shippingCharge = data.city.toLowerCase().includes("dhaka") ? 80 : 120;
      const totalAmount = subtotal + shippingCharge;

      // Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          subtotal,
          shippingCharge,
          totalAmount,
          city: data.city,
          shippingAddress: data.shippingAddress,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      // Create vendor orders (group items by vendor)
      const vendorGroups = new Map<string, { subtotal: number }>();
      for (const item of order.items) {
        const product = item.product;
        const existing = vendorGroups.get(product.vendorId) || { subtotal: 0 };
        existing.subtotal += item.subtotal;
        vendorGroups.set(product.vendorId, existing);
      }

      const commissionRate = Number(process.env.PLATFORM_COMMISSION_PERCENT || "10");
      for (const [vendorId, group] of vendorGroups.entries()) {
        const commission = (group.subtotal * commissionRate) / 100;
        await tx.vendorOrder.create({
          data: {
            orderId: order.id,
            vendorId,
            subtotal: group.subtotal,
            commission,
            vendorEarning: group.subtotal - commission,
          },
        });
      }

      return order;
    });

    revalidatePath("/dashboard/customer/orders");
    revalidatePath("/dashboard/vendor/orders");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    return { success: false, error: message };
  }
}

export async function getOrders(userId?: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const orders = await prisma.order.findMany({
      where: { userId: userId || session.user.id },
      include: {
        items: { include: { product: true } },
        deliveryPartner: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return { success: false, error: message };
  }
}

export async function getVendorOrders() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    if (!vendor) return { success: false, error: "Vendor not found" };

    const vendorOrders = await prisma.vendorOrder.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: true } },
            deliveryPartner: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: vendorOrders };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch vendor orders";
    return { success: false, error: message };
  }
}

export async function acceptOrder(orderId: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "ACCEPTED" },
    });
    await prisma.vendorOrder.updateMany({
      where: { orderId },
      data: { status: "ACCEPTED" },
    });
    revalidatePath("/dashboard/vendor/orders");
    return { success: true, data: order };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to accept order";
    return { success: false, error: message };
  }
}

// ─── Delivery Actions ───────────────────────────────────────────────────────

export async function getAvailableDeliveryPartners() {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      where: { isVerified: true, isActive: true, isAvailable: true },
      include: { user: { select: { name: true, email: true, image: true } } },
    });
    return { success: true, data: partners };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch partners";
    return { success: false, error: message };
  }
}

export async function assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId,
          status: "ASSIGNED",
        },
      });
      await tx.vendorOrder.updateMany({
        where: { orderId },
        data: { status: "ASSIGNED" },
      });

      // Notify delivery partner
      const dp = await tx.deliveryPartner.findUnique({
        where: { id: deliveryPartnerId },
      });
      if (dp) {
        await tx.notification.create({
          data: {
            userId: dp.userId,
            title: "New Delivery Assignment 📦",
            message: `You have been assigned a new delivery. Order: ${updated.orderNumber}`,
            type: "info",
            link: "/dashboard/delivery",
          },
        });
      }

      return updated;
    });

    revalidatePath("/dashboard/vendor/orders");
    revalidatePath("/dashboard/delivery");
    return { success: true, data: order };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to assign partner";
    return { success: false, error: message };
  }
}

export async function getDeliveryJobs() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
    });
    if (!dp) return { success: false, error: "Delivery partner not found" };

    const orders = await prisma.order.findMany({
      where: { deliveryPartnerId: dp.id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return { success: false, error: message };
  }
}

export async function markAsDelivered(orderId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { vendorOrders: true },
      });
      if (!order) throw new Error("Order not found");

      // 1. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
      await tx.vendorOrder.updateMany({
        where: { orderId },
        data: { status: "DELIVERED" },
      });

      // 2. Delivery Partner earns shipping charge
      if (order.deliveryPartnerId) {
        await tx.deliveryPartner.update({
          where: { id: order.deliveryPartnerId },
          data: {
            totalEarnings: { increment: order.shippingCharge },
            totalDeliveries: { increment: 1 },
          },
        });
      }

      // 3. Vendor earns product price minus commission
      for (const vo of order.vendorOrders) {
        await tx.vendor.update({
          where: { id: vo.vendorId },
          data: {
            balance: { increment: vo.vendorEarning },
            totalEarnings: { increment: vo.vendorEarning },
          },
        });
      }

      // 4. Platform revenue
      const totalCommission = order.vendorOrders.reduce((sum, vo) => sum + vo.commission, 0);
      await tx.platformRevenue.create({
        data: {
          orderId: order.id,
          amount: totalCommission,
          type: "commission",
        },
      });

      // 5. Customer total spent
      await tx.user.update({
        where: { id: order.userId },
        data: { totalSpent: { increment: order.totalAmount } },
      });

      // 6. Notifications
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Order Delivered! 🎉",
          message: `Your order ${order.orderNumber} has been delivered successfully.`,
          type: "success",
        },
      });

      return order;
    });

    revalidatePath("/dashboard/delivery");
    revalidatePath("/dashboard/vendor");
    revalidatePath("/dashboard/customer");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark as delivered";
    return { success: false, error: message };
  }
}

export async function startTransit(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "IN_TRANSIT" },
    });
    await prisma.vendorOrder.updateMany({
      where: { orderId },
      data: { status: "IN_TRANSIT" },
    });
    revalidatePath("/dashboard/delivery");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return { success: false, error: message };
  }
}

// ─── Admin / Super Admin Actions ────────────────────────────────────────────

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        vendor: { select: { shopName: true, balance: true, totalEarnings: true } },
        deliveryPartner: { select: { totalEarnings: true, totalDeliveries: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: users };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return { success: false, error: message };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as "CUSTOMER" | "VENDOR" | "DELIVERY_PARTNER" | "ADMIN" | "SUPER_ADMIN" },
    });
    revalidatePath("/dashboard/super-admin/users");
    return { success: true, data: user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return { success: false, error: message };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/dashboard/super-admin/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return { success: false, error: message };
  }
}

export async function getGlobalAnalytics() {
  try {
    const [totalUsers, totalVendors, totalDeliveryPartners, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.deliveryPartner.count(),
      prisma.order.count(),
    ]);

    const platformRevenue = await prisma.platformRevenue.aggregate({
      _sum: { amount: true },
    });

    const totalSpent = await prisma.user.aggregate({
      _sum: { totalSpent: true },
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    return {
      success: true,
      data: {
        totalUsers,
        totalVendors,
        totalDeliveryPartners,
        totalOrders,
        platformRevenue: platformRevenue._sum.amount || 0,
        totalCustomerSpend: totalSpent._sum.totalSpent || 0,
        recentOrders,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch analytics";
    return { success: false, error: message };
  }
}

export async function getNotifications() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, data: notifications };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    return { success: false, error: message };
  }
}

export async function getDeliveryPartnerStats() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: session.user.id },
    });
    if (!dp) return { success: false, error: "Not a delivery partner" };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayDeliveries, monthDeliveries, totalOrders] = await Promise.all([
      prisma.order.count({
        where: { deliveryPartnerId: dp.id, status: "DELIVERED", deliveredAt: { gte: todayStart } },
      }),
      prisma.order.count({
        where: { deliveryPartnerId: dp.id, status: "DELIVERED", deliveredAt: { gte: monthStart } },
      }),
      prisma.order.count({
        where: { deliveryPartnerId: dp.id },
      }),
    ]);

    // Calculate today's earnings (sum of shipping charges for today's deliveries)
    const todayEarnings = await prisma.order.aggregate({
      where: { deliveryPartnerId: dp.id, status: "DELIVERED", deliveredAt: { gte: todayStart } },
      _sum: { shippingCharge: true },
    });
    const monthEarnings = await prisma.order.aggregate({
      where: { deliveryPartnerId: dp.id, status: "DELIVERED", deliveredAt: { gte: monthStart } },
      _sum: { shippingCharge: true },
    });

    return {
      success: true,
      data: {
        ...dp,
        todayDeliveries,
        monthDeliveries,
        totalOrders,
        todayEarnings: todayEarnings._sum.shippingCharge || 0,
        monthEarnings: monthEarnings._sum.shippingCharge || 0,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return { success: false, error: message };
  }
}

export async function getVendorStats() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!vendor) return { success: false, error: "Not a vendor" };

    const pendingOrders = await prisma.vendorOrder.count({
      where: { vendorId: vendor.id, status: "PENDING" },
    });

    return {
      success: true,
      data: {
        ...vendor,
        pendingOrders,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return { success: false, error: message };
  }
}

export async function getCustomerStats() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { orders: true, roleRequests: true } } },
    });

    const activeOrders = await prisma.order.count({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "ACCEPTED", "ASSIGNED", "IN_TRANSIT"] },
      },
    });

    const pendingRequest = await prisma.roleRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
    });

    return {
      success: true,
      data: {
        user,
        activeOrders,
        pendingRequest,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    return { success: false, error: message };
  }
}
