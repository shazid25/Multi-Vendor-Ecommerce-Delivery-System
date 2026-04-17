import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const submitVendorRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { shopName, shopDescription, businessType, phoneNumber } = req.body;

    const existing = await prisma.roleRequest.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
    });
    if (existing) throw new AppError('You already have a pending request', 400);

    const request = await prisma.roleRequest.create({
      data: {
        userId: req.user.id,
        requestType: 'VENDOR',
        shopName,
        shopDescription,
        businessType,
        phoneNumber,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('submitVendorRequest Error:', error);
      res.status(500).json({ message: 'Failed to submit request' });
    }
  }
};

export const submitDeliveryRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { phoneNumber, vehicleType, licenseNumber, nidNumber } = req.body;

    const existing = await prisma.roleRequest.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
    });
    if (existing) throw new AppError('You already have a pending request', 400);

    const request = await prisma.roleRequest.create({
      data: {
        userId: req.user.id,
        requestType: 'DELIVERY_PARTNER',
        phoneNumber,
        vehicleType,
        licenseNumber,
        nidNumber,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('submitDeliveryRequest Error:', error);
      res.status(500).json({ message: 'Failed to submit request' });
    }
  }
};

export const getRoleRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const requests = await prisma.roleRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error('getRoleRequests Error:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

export const approveRoleRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const roleRequest = await tx.roleRequest.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!roleRequest) throw new Error("Request not found");
      if (roleRequest.status !== "PENDING") throw new Error("Request already processed");

      await tx.roleRequest.update({
        where: { id },
        data: { 
          status: "APPROVED", 
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
        },
      });

      const newRole = roleRequest.requestType === "VENDOR" ? "VENDOR" : "DELIVERY_PARTNER";
      await tx.user.update({
        where: { id: roleRequest.userId },
        data: { role: newRole as any },
      });

      if (roleRequest.requestType === "VENDOR") {
        await tx.vendor.create({
          data: {
            userId: roleRequest.userId,
            shopName: roleRequest.shopName || "My Shop",
            phoneNumber: roleRequest.phoneNumber || "",
            businessType: roleRequest.businessType || "General",
            shopDescription: roleRequest.shopDescription,
            isVerified: true,
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
            isVerified: true,
            isActive: true,
            // isAvailable: true, // Not needed since we removed availability filtering
          },
        });
      }

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

    res.status(200).json(result);
  } catch (error) {
    console.error('approveRoleRequest Error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to approve' });
  }
};

export const rejectRoleRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;
    const { reason } = req.body;

    const roleRequest = await prisma.roleRequest.update({
      where: { id },
      data: { 
        status: "REJECTED", 
        reviewedBy: req.user.id,
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

    res.status(200).json(roleRequest);
  } catch (error) {
    console.error('rejectRoleRequest Error:', error);
    res.status(500).json({ message: 'Failed to reject' });
  }
};
