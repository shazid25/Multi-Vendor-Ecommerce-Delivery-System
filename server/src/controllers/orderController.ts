import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { items, city, shippingAddress, paymentMethod, customerPhone, customerName } = req.body;

    if (!customerPhone) throw new AppError('Phone number is required', 400);
    if (!customerName) throw new AppError('Customer name is required', 400);

    // Step 1: Validate products and calculate totals (without transaction)
    let subtotal = 0;
    const orderItems: Array<any> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
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
    }

    const shippingCharge = city.toLowerCase().includes('dhaka') ? 80 : 120;
    const totalAmount = subtotal + shippingCharge;
    const orderNumber = `MART-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const zone = city.toLowerCase().includes('dhaka') ? 'DHAKA' : 'OUTSIDE_DHAKA';

    // Step 2: Create order and vendor orders in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
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
          customerPhone,
          customerName,
          paymentMethod: paymentMethod || 'STRIPE',
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      // Create vendor orders
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

    // Step 3: Update product stock (after transaction completes)
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

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
        items: { 
          include: { 
            product: { 
              select: { 
                name: true, 
                price: true, 
                discountPrice: true,
                images: true 
              } 
            } 
          } 
        },
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('getDeliveryJobs Error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

export const getDeliveryPartnerStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Delivery partner not found', 404);

    // Get today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEarnings = await prisma.deliveryEarning.aggregate({
      where: {
        deliveryPartnerId: dp.id,
        earnedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { netAmount: true },
    });

    // Get this month's earnings
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthEarnings = await prisma.deliveryEarning.aggregate({
      where: {
        deliveryPartnerId: dp.id,
        earnedAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _sum: { netAmount: true },
    });

    // Get total earnings
    const totalEarnings = await prisma.deliveryEarning.aggregate({
      where: { deliveryPartnerId: dp.id },
      _sum: { netAmount: true },
    });

    // Get today's deliveries count
    const todayDeliveries = await prisma.deliveryEarning.count({
      where: {
        deliveryPartnerId: dp.id,
        earnedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const stats = {
      totalDeliveries: dp.totalDeliveries,
      todayEarnings: todayEarnings._sum.netAmount || 0,
      monthEarnings: monthEarnings._sum.netAmount || 0,
      totalEarnings: totalEarnings._sum.netAmount || 0,
      todayDeliveries,
      rating: dp.rating,
      availableBalance: dp.availableBalance,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('getDeliveryPartnerStats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

export const markAsDelivered = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;
    
    // Verify the delivery partner is assigned to this order
    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Delivery partner not found', 404);

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId: id },
      include: {
        delivery: true,
        order: { select: { status: true } },
      },
    });
    if (!assignment) {
      throw new AppError('Delivery assignment not found for this order', 404);
    }
    if (assignment.deliveryPartnerId !== dp.id) {
      throw new AppError('You are not assigned to this order', 403);
    }

    if (assignment.delivery?.status === 'DELIVERED') {
      res.status(200).json({ success: true, message: 'Order already marked as delivered' });
      return;
    }

    const hasLegacyTransitState =
      assignment.order.status === 'SHIPPED' &&
      (!assignment.delivery || assignment.delivery.status === 'ASSIGNED' || assignment.delivery.status === 'PICKED_UP');

    if (assignment.delivery && assignment.delivery.status !== 'IN_TRANSIT' && !hasLegacyTransitState) {
      throw new AppError('Order must be in transit before marking delivered', 400);
    }

    if (!assignment.delivery && assignment.order.status !== 'SHIPPED') {
      throw new AppError('Order must be in transit before marking delivered', 400);
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { vendorOrders: { include: { vendor: true } }, deliveryAssignment: true },
        });
      if (!order) throw new AppError('Order not found', 404);

      // Update order status to DELIVERED
      await tx.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      });
      
      // Update vendor orders to DELIVERED
      await tx.vendorOrder.updateMany({
        where: { orderId: id },
        data: { status: "DELIVERED" },
      });

      // Update/create delivery status to DELIVERED (supports legacy rows that were never created)
      await tx.delivery.upsert({
        where: { orderId: id },
        update: { status: 'DELIVERED', deliveryTime: new Date() },
        create: {
          orderId: id,
          assignmentId: assignment.id,
          deliveryPartnerId: assignment.deliveryPartnerId,
          status: 'DELIVERED',
          deliveryTime: new Date(),
          pickupTime: new Date(),
        },
      });

      // Calculate delivery partner earnings with 5% platform fee
      let riderNetEarnings = 0;
      let riderPlatformFee = 0;

      if (order.deliveryAssignment) {
        const grossShippingCharge = order.shippingCharge;
        riderPlatformFee = grossShippingCharge * 0.05; // 5% platform fee
        riderNetEarnings = grossShippingCharge - riderPlatformFee; // Rider gets 95%

        await tx.deliveryPartner.update({
          where: { id: order.deliveryAssignment.deliveryPartnerId },
          data: {
            totalEarnings: { increment: riderNetEarnings },
            availableBalance: { increment: riderNetEarnings },
            totalDeliveries: { increment: 1 },
          },
        });
        
        await tx.deliveryEarning.create({
          data: {
            deliveryPartnerId: order.deliveryAssignment.deliveryPartnerId,
            orderId: order.id,
            amount: grossShippingCharge,
            commissionAmount: riderPlatformFee,
            netAmount: riderNetEarnings,
          }
        });
      }

      // Handle vendor income with 5% platform fee
      let totalVendorPlatformFee = 0;

      for (const vo of order.vendorOrders) {
        const grossVendorAmount = vo.vendorAmount; // This is already after the initial 5% deduction during order creation
        // Now deduct another 5% from what they earned for platform fee during delivery
        const vendorPlatformFee = grossVendorAmount * 0.05;
        const netVendorEarnings = grossVendorAmount - vendorPlatformFee;
        
        totalVendorPlatformFee += vendorPlatformFee;

        if (order.paymentStatus === 'COMPLETED') {
          // Stripe: vendor already got initial payment in webhook, now deduct 5% platform fee
          await tx.vendor.update({
            where: { id: vo.vendorId },
            data: {
              balance: { decrement: vendorPlatformFee },
              totalSales: { increment: vo.vendorAmount },
              totalOrders: { increment: 1 },
            },
          });
        } else {
          // COD: vendor gets paid net amount after 5% platform fee
          await tx.vendor.update({
            where: { id: vo.vendorId },
            data: {
              balance: { increment: netVendorEarnings },
              totalSales: { increment: vo.vendorAmount },
              totalOrders: { increment: 1 },
            },
          });
        }
      }

      // Total platform fee = vendor platform fees + rider platform fee
      const totalPlatformFee = totalVendorPlatformFee + riderPlatformFee;
      
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
          description: `Platform fees for order #${order.orderNumber} (5% from vendors & delivery: ${totalPlatformFee.toFixed(2)})`,
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
      },
      {
        maxWait: 10000, // Wait up to 10 seconds for a transaction to start
        timeout: 15000, // Allow 15 seconds for the transaction to complete
      }
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('markAsDelivered Error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to mark as delivered' });
    }
  }
};

export const getAvailableDeliveryPartners = async (req: AuthRequest, res: Response) => {
  try {
    const partners = await prisma.deliveryPartner.findMany({
      where: { isActive: true }, // Removed isAvailable filter for bulk assignment support
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
    
    // Identify the vendor who is assigning the partner
    let vendorId: string | undefined;
    
    if (req.user!.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id } });
      vendorId = vendor?.id;
    } else {
      // For ADMIN/SUPER_ADMIN, take the first vendor from the order
      vendorId = order.vendorOrders[0]?.vendorId;
    }

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

      // Mark delivery partner as unavailable - moved to startTransit
      // await tx.deliveryPartner.update({
      //   where: { id: deliveryPartnerId },
      //   data: { isAvailable: false },
      // });

      // Set order status to CONFIRMED (not SHIPPED) - delivery partner will update to SHIPPED when transit starts
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      // Update vendor order status as well
      await tx.vendorOrder.updateMany({
        where: { orderId },
        data: { status: 'CONFIRMED' },
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

export const startTransit = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;
    
    // Verify the delivery partner is assigned to this order
    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Delivery partner not found', 404);

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId: id },
      include: {
        delivery: true,
        order: { select: { status: true } },
      },
    });
    if (!assignment) {
      throw new AppError('Delivery assignment not found for this order', 404);
    }
    if (assignment.deliveryPartnerId !== dp.id) {
      throw new AppError('You are not assigned to this order', 403);
    }

    if (assignment.delivery?.status === 'IN_TRANSIT') {
      res.status(200).json({ success: true, message: 'Order is already in transit' });
      return;
    }

    if (assignment.delivery?.status === 'DELIVERED') {
      throw new AppError('Delivered orders cannot be moved to transit', 400);
    }
    
    await prisma.$transaction(
      async (tx) => {
        // Update order and vendor orders to SHIPPED
        await tx.order.update({
          where: { id },
          data: { status: 'SHIPPED' },
        });
        
        await tx.vendorOrder.updateMany({
          where: { orderId: id },
          data: { status: 'SHIPPED' },
        });
        
        // Update/create delivery status to IN_TRANSIT (supports legacy rows that were never created)
        await tx.delivery.upsert({
          where: { orderId: id },
          update: { status: 'IN_TRANSIT', pickupTime: new Date() },
          create: {
            orderId: id,
            assignmentId: assignment.id,
            deliveryPartnerId: assignment.deliveryPartnerId,
            status: 'IN_TRANSIT',
            pickupTime: new Date(),
          },
        });
      },
      {
        maxWait: 10000, // Wait up to 10 seconds for a transaction to start
        timeout: 15000, // Allow 15 seconds for the transaction to complete
      }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('startTransit Error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to update status' });
    }
  }
};
