import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { items, city, shippingAddress, paymentMethod } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItems: Array<any> = [];

      for (const item of items) {
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

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const shippingCharge = city.toLowerCase().includes('dhaka') ? 80 : 120;
      const totalAmount = subtotal + shippingCharge;
      const orderNumber = `MART-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const zone = city.toLowerCase().includes('dhaka') ? 'DHAKA' : 'OUTSIDE_DHAKA';

      const order = await tx.order.create({
        data: {
          userId: req.user!.id,
          orderNumber,
          zone,
          subtotal,
          shippingCharge,
          totalAmount,
          city,
          shippingAddress,
          paymentMethod: paymentMethod || 'STRIPE',
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      const vendorGroups = new Map<string, { subtotal: number }>();
      const createdItems = (order as any).items || [];
      for (const item of createdItems) {
        const product = item.product;
        const existing = vendorGroups.get(product.vendorId) || { subtotal: 0 };
        existing.subtotal += item.subtotal;
        vendorGroups.set(product.vendorId, existing);
      }

      const commissionRate = Number(process.env.PLATFORM_COMMISSION_PERCENT || "5");
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

    res.status(201).json(result);
  } catch (error) {
    console.error('placeOrder Error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to place order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { userId } = req.query;

    const orders = await prisma.order.findMany({
      where: userId ? { userId: String(userId) } : { userId: req.user.id },
      include: {
        items: { include: { product: true } },
        deliveryAssignment: { include: { deliveryPartner: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('getOrders Error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) throw new AppError('Vendor not found', 404);

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
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(vendorOrders);
  } catch (error) {
    console.error('getVendorOrders Error:', error);
    res.status(500).json({ message: 'Failed to fetch vendor orders' });
  }
};

export const acceptOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) throw new AppError('Vendor profile not found', 404);

    const vendorOrder = await prisma.vendorOrder.findUnique({
      where: { orderId_vendorId: { orderId: id, vendorId: vendor.id } }
    });

    if (!vendorOrder) throw new AppError('Order not found for this vendor', 404);

    const result = await prisma.$transaction(async (tx) => {
      // Update vendor order status
      const updatedVO = await tx.vendorOrder.update({
        where: { id: vendorOrder.id },
        data: { status: 'CONFIRMED' },
      });

      // Check if ALL vendor orders for this main order are now confirmed
      const allVOs = await tx.vendorOrder.findMany({ where: { orderId: id } });
      const allConfirmed = allVOs.every(vo => vo.status === 'CONFIRMED');

      if (allConfirmed) {
        await tx.order.update({
          where: { id },
          data: { status: 'CONFIRMED' },
        });
      }

      return updatedVO;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('acceptOrder Error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to accept order' });
    }
  }
};

export const getDeliveryJobs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Delivery partner not found', 404);

    const orders = await prisma.order.findMany({
      where: { deliveryAssignment: { deliveryPartnerId: dp.id } },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('getDeliveryJobs Error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

export const markAsDelivered = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { vendorOrders: { include: { vendor: true } }, deliveryAssignment: true },
      });
      if (!order) throw new Error("Order not found");

      await tx.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      });
      await tx.vendorOrder.updateMany({
        where: { orderId: id },
        data: { status: "DELIVERED" },
      });

      let riderCommission = 0;

      if (order.deliveryAssignment) {
        const grossEarnings = order.shippingCharge;
        riderCommission = grossEarnings * 0.05;
        const netEarnings = grossEarnings - riderCommission;

        await tx.deliveryPartner.update({
          where: { id: order.deliveryAssignment.deliveryPartnerId },
          data: {
            totalEarnings: { increment: netEarnings },
            availableBalance: { increment: netEarnings },
            totalDeliveries: { increment: 1 },
          },
        });
        
        await tx.deliveryEarning.create({
          data: {
            deliveryPartnerId: order.deliveryAssignment.deliveryPartnerId,
            orderId: order.id,
            amount: grossEarnings,
            commissionAmount: riderCommission,
            netAmount: netEarnings,
          }
        });
      }

      for (const vo of order.vendorOrders) {
        await tx.vendor.update({
          where: { id: vo.vendorId },
          data: {
            balance: { increment: vo.vendorAmount },
            totalSales: { increment: vo.vendorAmount },
            totalOrders: { increment: 1 },
          },
        });
      }

      const totalVendorCommission = order.vendorOrders.reduce((sum, vo) => sum + vo.commissionAmount, 0);
      const totalPlatformFee = totalVendorCommission + riderCommission;
      
      // Update platform balance (Admin)
      await tx.user.updateMany({
        where: { role: 'SUPER_ADMIN' },
        data: { 
          platformBalance: { increment: totalPlatformFee },
          totalPlatformRevenue: { increment: totalPlatformFee }
        }
      });

      await tx.transaction.create({
        data: {
          orderId: order.id,
          amount: totalPlatformFee,
          type: "PLATFORM_COMMISSION",
          userId: order.userId,
          description: `Platform fees for order #${order.orderNumber} (Vendor: ${totalVendorCommission.toFixed(2)}, Rider: ${riderCommission.toFixed(2)})`,
        },
      });

      // Update user totalSpent only if it wasn't already updated (e.g. by Stripe Webhook)
      if (order.paymentStatus !== 'COMPLETED') {
        await tx.user.update({
          where: { id: order.userId },
          data: { totalSpent: { increment: order.totalAmount } },
        });
      }

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

    res.status(200).json(result);
  } catch (error) {
    console.error('markAsDelivered Error:', error);
    res.status(500).json({ message: 'Failed to mark as delivered' });
  }
};

export const startTransit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.update({
      where: { id },
      data: { status: 'SHIPPED' },
    });
    await prisma.vendorOrder.updateMany({
      where: { orderId: id },
      data: { status: 'SHIPPED' },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('startTransit Error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

export const getAvailableDeliveryPartners = async (req: AuthRequest, res: Response) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      where: { isVerified: true, isActive: true, isAvailable: true },
      include: { user: { select: { name: true, email: true, image: true } } },
    });
    res.status(200).json(partners);
  } catch (error) {
    console.error('getAvailableDeliveryPartners Error:', error);
    res.status(500).json({ message: 'Failed to fetch partners' });
  }
};

export const assignDeliveryPartner = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, deliveryPartnerId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { vendorOrders: true },
    });

    if (!order) throw new AppError('Order not found', 404);
    
    // For simplicity, we assign based on the first vendor in the order
    // In a more complex system, each vendor might have their own assignment
    const vendorId = order.vendorOrders[0]?.vendorId;
    if (!vendorId) throw new AppError('No vendor found for this order', 400);

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.deliveryAssignment.upsert({
        where: { orderId },
        update: { deliveryPartnerId, vendorId },
        create: { orderId, deliveryPartnerId, vendorId },
      });

      // Also create a Delivery record if it doesn't exist
      await tx.delivery.upsert({
        where: { orderId },
        update: { deliveryPartnerId, assignmentId: assignment.id },
        create: { orderId, deliveryPartnerId, assignmentId: assignment.id },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' }, // Or another appropriate status
      });

      return assignment;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('assignDeliveryPartner Error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to assign delivery partner' });
    }
  }
};

export const getDeliveryEarnings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Delivery partner not found', 404);

    const earnings = await prisma.deliveryEarning.findMany({
      where: { deliveryPartnerId: dp.id },
      orderBy: { earnedAt: 'desc' },
    });

    res.status(200).json(earnings);
  } catch (error) {
    console.error('getDeliveryEarnings Error:', error);
    res.status(500).json({ message: 'Failed to fetch earnings' });
  }
};
