import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Banners
export const getBanners = async (req: AuthRequest, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(banners);
  } catch (error) {
    console.error('getBanners Error:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
};

export const getAllBanners = async (req: AuthRequest, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json(banners);
  } catch (error) {
    console.error('getAllBanners Error:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
};

export const createBanner = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const banner = await prisma.banner.create({ data });
    res.status(201).json(banner);
  } catch (error) {
    console.error('createBanner Error:', error);
    res.status(500).json({ message: 'Failed to create banner' });
  }
};

export const updateBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const banner = await prisma.banner.update({ where: { id }, data });
    res.status(200).json(banner);
  } catch (error) {
    console.error('updateBanner Error:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('deleteBanner Error:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
};

// FAQs
export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('getFAQs Error:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

export const getAllFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json(faqs);
  } catch (error) {
    console.error('getAllFAQs Error:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

export const createFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const faq = await prisma.fAQ.create({ data });
    res.status(201).json(faq);
  } catch (error) {
    console.error('createFAQ Error:', error);
    res.status(500).json({ message: 'Failed to create FAQ' });
  }
};

export const updateFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const faq = await prisma.fAQ.update({ where: { id }, data });
    res.status(200).json(faq);
  } catch (error) {
    console.error('updateFAQ Error:', error);
    res.status(500).json({ message: 'Failed to update FAQ' });
  }
};

export const deleteFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('deleteFAQ Error:', error);
    res.status(500).json({ message: 'Failed to delete FAQ' });
  }
};
