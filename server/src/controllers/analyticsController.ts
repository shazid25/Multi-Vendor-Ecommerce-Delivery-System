import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const getGlobalAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalVendors, totalDeliveryPartners, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.deliveryPartner.count(),
      prisma.order.count(),
    ]);

    const totalSpent = await prisma.user.aggregate({
      _sum: { totalSpent: true },
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    res.status(200).json({
      totalUsers,
      totalVendors,
      totalDeliveryPartners,
      totalOrders,
      totalCustomerSpend: totalSpent._sum.totalSpent || 0,
      recentOrders,
    });
  } catch (error) {
    console.error('getGlobalAnalytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getDeliveryPartnerStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const dp = await prisma.deliveryPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!dp) throw new AppError('Not a delivery partner', 404);

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

    const todayEarnings = await prisma.order.aggregate({
      where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: todayStart } },
      _sum: { shippingCharge: true },
    });
    const monthEarnings = await prisma.order.aggregate({
      where: { deliveryAssignment: { deliveryPartnerId: dp.id }, status: "DELIVERED", updatedAt: { gte: monthStart } },
      _sum: { shippingCharge: true },
    });

    res.status(200).json({
      ...dp,
      todayDeliveries,
      monthDeliveries,
      totalOrders,
      todayEarnings: todayEarnings._sum?.shippingCharge || 0,
      monthEarnings: monthEarnings._sum?.shippingCharge || 0,
    });
  } catch (error) {
    console.error('getDeliveryPartnerStats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

export const getVendorStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!vendor) throw new AppError('Not a vendor', 404);

    const pendingOrders = await prisma.vendorOrder.count({
      where: { vendorId: vendor.id, status: "PENDING" },
    });

    res.status(200).json({
      ...vendor,
      pendingOrders,
    });
  } catch (error) {
    console.error('getVendorStats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

export const getCustomerStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { _count: { select: { orders: true, roleRequests: true } } },
    });

    const activeOrders = await prisma.order.count({
      where: {
        userId: req.user.id,
        status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] },
      },
    });

    const pendingRequest = await prisma.roleRequest.findFirst({
      where: { userId: req.user.id, status: "PENDING" },
    });

    res.status(200).json({
      user,
      activeOrders,
      pendingRequest,
    });
  } catch (error) {
    console.error('getCustomerStats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
