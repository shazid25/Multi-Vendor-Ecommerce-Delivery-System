import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, vendorId, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: String(category) }),
        ...(vendorId && { vendorId: String(vendorId) }),
        ...(search && {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { description: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }),
      },
      include: { vendor: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('getProducts Error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { name, description, price, discountPrice, unit, unitValue, image, images, category, stock } = req.body;

    let vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    
    if (!vendor) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (user?.role === 'VENDOR') {
        vendor = await prisma.vendor.create({
          data: {
            userId: req.user.id,
            shopName: user.name + "'s Shop",
            phoneNumber: user.phone || '0000000000',
            businessType: 'General',
            isVerified: true,
          }
        });
      } else {
        throw new AppError('Vendor profile not found', 404);
      }
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        unit: unit || "piece",
        unitValue: unitValue ? Number(unitValue) : 1,
        image,
        images: images || [],
        category,
        stock: Number(stock),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('createProduct Error:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.price && { price: Number(data.price) }),
        ...(data.discountPrice !== undefined && { discountPrice: data.discountPrice ? Number(data.discountPrice) : null }),
        ...(data.stock !== undefined && { stock: Number(data.stock) }),
      },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error('updateProduct Error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct Error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
