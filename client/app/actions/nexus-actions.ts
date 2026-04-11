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
        requestType: "VENDOR",
        shopName: data.shopName,
        shopDescription: data.shopDescription,
        businessType: data.businessType,
        phoneNumber: data.phoneNumber,
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
        requestType: "DELIVERY_PARTNER",
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
        data: { 
          status: "APPROVED", 
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      // 2. Update user role
      const newRole = roleRequest.requestType === "VENDOR" ? "VENDOR" : "DELIVERY_PARTNER";
      await tx.user.update({
        where: { id: roleRequest.userId },
        data: { role: newRole as "VENDOR" | "DELIVERY_PARTNER" },
      });

      // 3. Create profile
      if (roleRequest.requestType === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId: roleRequest.userId,
            shopName: roleRequest.shopName || "My Shop",
            phoneNumber: roleRequest.phoneNumber || "",
            businessType: roleRequest.businessType || "General",
            shopDescription: roleRequest.shopDescription,
          },
        });
      } else {
        await tx.deliveryPartner.create({
          data: {
            userId: roleRequest.userId,
            phoneNumber: roleRequest.phoneNumber || "",
            vehicleType: roleRequest.vehicleType || "Motorcycle",
            licenseNumber: roleRequest.licenseNumber || "TBD",
            licenseExpiry: roleRequest.licenseExpiry || new Date(),
            nidNumber: roleRequest.nidNumber || "TBD",
            nidImage: roleRequest.nidImage,
          },
        });
      }

      // 4. Notify user
      await tx.notification.create({
        data: {
          userId: roleRequest.userId,
          title: "Role Request Approved! 🎉",
          message: `Your ${roleRequest.requestType === "VENDOR" ? "Vendor" : "Delivery Partner"} application has been approved.`,
          type: "success",
          link: roleRequest.requestType === "VENDOR" ? "/dashboard/vendor" : "/dashboard/delivery",
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
      data: { 
        status: "REJECTED", 
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
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
    let vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
    
    // Fail-safe: If user has VENDOR role but no Vendor profile (common in manual DB edits), create one.
    if (!vendor) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (user?.role === "VENDOR") {
        vendor = await prisma.vendor.create({
          data: {
            userId: session.user.id,
            shopName: user.name + "'s Shop",
            phoneNumber: user.phone || "0000000000",
            businessType: "General",
          }
        });
      } else {
        return { success: false, error: "Vendor profile not found" };
      }
    }

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

      const orderNumber = `NEX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const zone = data.city.toLowerCase().includes("dhaka") ? "DHAKA" : "OUTSIDE_DHAKA";

      // Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          orderNumber,
          zone,
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
      const items = (order as any).items || [];
      for (const item of items) {
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
            vendorAmount: group.subtotal - commission,
            commissionAmount: commission,
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
      where: userId ? { userId } : { userId: session.user.id },
      include: {
        items: { include: { product: true } },
        deliveryAssignment: { include: { deliveryPartner: { include: { user: { select: { name: true } } } } } },
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
            deliveryAssignment: { include: { deliveryPartner: { include: { user: { select: { name: true } } } } } },
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
      data: { status: "CONFIRMED" },
    });
    await prisma.vendorOrder.updateMany({
      where: { orderId },
      data: { status: "CONFIRMED" },
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
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const order = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({ where: { userId: session.user.id } });
      if (!vendor) throw new Error("Only vendors can assign partners");

      const assignment = await tx.deliveryAssignment.upsert({
        where: { orderId },
        update: { deliveryPartnerId, vendorId: vendor.id },
        create: { orderId, deliveryPartnerId, vendorId: vendor.id },
      });

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryAssignmentId: assignment.id,
          status: "SHIPPED",
        },
      });
      await tx.vendorOrder.updateMany({
        where: { orderId },
        data: { status: "SHIPPED" },
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
      where: { deliveryAssignment: { deliveryPartnerId: dp.id } },
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
        include: { vendorOrders: { include: { vendor: true } }, deliveryAssignment: true },
      });
      if (!order) throw new Error("Order not found");

      // 1. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" },
      });
      await tx.vendorOrder.updateMany({
        where: { id: orderId },
        data: { status: "DELIVERED" },
      });

      // 2. Delivery Partner earns shipping charge
      if (order.deliveryAssignment) {
        await tx.deliveryPartner.update({
          where: { id: order.deliveryAssignment.deliveryPartnerId },
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
            balance: { increment: vo.vendorAmount },
            totalSales: { increment: vo.vendorAmount },
          },
        });
      }

      // 4. Platform revenue (Note: Transaction model is used instead of non-existent platformRevenue)
      const totalCommission = order.vendorOrders.reduce((sum, vo) => sum + vo.commissionAmount, 0);
      await tx.transaction.create({
        data: {
          orderId: order.id,
          amount: totalCommission,
          type: "PLATFORM_COMMISSION",
          userId: order.userId, // Default to customer or admin
          description: `Commission for order #${order.orderNumber}`,
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
      data: { status: "SHIPPED" },
    });
    await prisma.vendorOrder.updateMany({
      where: { orderId },
      data: { status: "SHIPPED" },
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
        vendor: { select: { shopName: true, balance: true, totalSales: true } },
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
      data: { role: role as any },
    });

    // Side effect: Create profile if role is VENDOR or DELIVERY_PARTNER and doesn't exist
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (!vendor) {
        await prisma.vendor.create({
          data: {
            userId,
            shopName: user.name + "'s Shop",
            phoneNumber: user.phone || "0000000000",
            businessType: "General",
          }
        });
      }
    } else if (role === "DELIVERY_PARTNER") {
      const dp = await prisma.deliveryPartner.findUnique({ where: { userId } });
      if (!dp) {
        await prisma.deliveryPartner.create({
          data: {
            userId,
            phoneNumber: user.phone || "0000000000",
            vehicleType: "Motorcycle",
            licenseNumber: "TBD",
            licenseExpiry: new Date(),
            nidNumber: "TBD",
          }
        });
      }
    }

    revalidatePath("/dashboard/super-admin/users");
    revalidatePath("/profile");
    return { success: true, data: user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return { success: false, error: message };
  }
}

export async function updateUserProfile(data: { name?: string; phone?: string; image?: string }) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    revalidatePath("/profile");
    return { success: true, data: user };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
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
        where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: todayStart } },
      }),
      prisma.order.count({
        where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: monthStart } },
      }),
      prisma.order.count({
        where: { deliveryAssignment: { deliveryPartnerId: dp.id } },
      }),
    ]);

    // Calculate today's earnings (sum of shipping charges for today's deliveries)
    const todayEarnings = await prisma.order.aggregate({
      where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: todayStart } },
      _sum: { shippingCharge: true },
    });
    const monthEarnings = await prisma.order.aggregate({
      where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: monthStart } },
      _sum: { shippingCharge: true },
    });

    return {
      success: true,
      data: {
        ...dp,
        todayDeliveries,
        monthDeliveries,
        totalOrders,
        todayEarnings: todayEarnings._sum?.shippingCharge || 0,
        monthEarnings: monthEarnings._sum?.shippingCharge || 0,
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
        status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
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
