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

// Blogs
export const getBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(blogs);
  } catch (error) {
    console.error('getBlogs Error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

export const getAllBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(blogs);
  } catch (error) {
    console.error('getAllBlogs Error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

export const getBlogBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(blog);
  } catch (error) {
    console.error('getBlogBySlug Error:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
};

export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const blog = await prisma.blog.create({ data });
    res.status(201).json(blog);
  } catch (error) {
    console.error('createBlog Error:', error);
    res.status(500).json({ message: 'Failed to create blog' });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const blog = await prisma.blog.update({ where: { id }, data });
    res.status(200).json(blog);
  } catch (error) {
    console.error('updateBlog Error:', error);
    res.status(500).json({ message: 'Failed to update blog' });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('deleteBlog Error:', error);
    res.status(500).json({ message: 'Failed to delete blog' });
  }
};

// Help
export const getHelpEntries = async (req: AuthRequest, res: Response) => {
  try {
    const helpEntries = await prisma.help.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(helpEntries);
  } catch (error) {
    console.error('getHelpEntries Error:', error);
    res.status(500).json({ message: 'Failed to fetch help entries' });
  }
};

export const getAllHelpEntries = async (req: AuthRequest, res: Response) => {
  try {
    const helpEntries = await prisma.help.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json(helpEntries);
  } catch (error) {
    console.error('getAllHelpEntries Error:', error);
    res.status(500).json({ message: 'Failed to fetch help entries' });
  }
};

export const createHelpEntry = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const helpEntry = await prisma.help.create({ data });
    res.status(201).json(helpEntry);
  } catch (error) {
    console.error('createHelpEntry Error:', error);
    res.status(500).json({ message: 'Failed to create help entry' });
  }
};

export const updateHelpEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const helpEntry = await prisma.help.update({ where: { id }, data });
    res.status(200).json(helpEntry);
  } catch (error) {
    console.error('updateHelpEntry Error:', error);
    res.status(500).json({ message: 'Failed to update help entry' });
  }
};

export const deleteHelpEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.help.delete({ where: { id } });
    res.status(200).json({ message: 'Help entry deleted successfully' });
  } catch (error) {
    console.error('deleteHelpEntry Error:', error);
    res.status(500).json({ message: 'Failed to delete help entry' });
  }
};
