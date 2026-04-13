import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;

    if (orderId) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update Order Status
          const order = await tx.order.update({
            where: { id: orderId },
            data: { 
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED' // Online payment automatically confirms the order
            },
            include: { vendorOrders: true }
          });

          // 2. Update all VendorOrders to CONFIRMED
          await tx.vendorOrder.updateMany({
            where: { orderId },
            data: { status: 'CONFIRMED' }
          });

          // 3. Update User's totalSpent (Optional: can also do this at delivery)
          // The user specifically asked for updates to every role upon success
          await tx.user.update({
            where: { id: order.userId },
            data: { totalSpent: { increment: order.totalAmount } }
          });

          // 4. Create a Transaction record
          await tx.transaction.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              amount: order.totalAmount,
              type: 'ORDER_PAYMENT',
              description: `Stripe payment for order #${order.orderNumber}`
            }
          });

          // 5. Notify the User
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: 'Payment Successful! 💸',
              message: `Your payment for order ${order.orderNumber} was successful. We are preparing your order.`,
              type: 'success',
              link: '/dashboard/customer/orders'
            }
          });

          // 6. Notify Vendors
          for (const vo of order.vendorOrders) {
             const vendor = await tx.vendor.findUnique({ where: { id: vo.vendorId } });
             if (vendor) {
                await tx.notification.create({
                  data: {
                    userId: vendor.userId,
                    title: 'New Paid Order! 📦',
                    message: `A new paid order #${order.orderNumber} has been received.`,
                    type: 'info',
                    link: '/dashboard/vendor/orders'
                  }
                });
             }
          }
        });
        console.log(`Order ${orderId} successfully updated via Stripe Webhook`);
      } catch (error) {
        console.error('Error updating order via webhook:', error);
        res.status(500).json({ error: 'Database update failed' });
        return;
      }
    }
  }

  res.json({ received: true });
};
