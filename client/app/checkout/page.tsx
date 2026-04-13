"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { PageTransition, GlassCard } from "@/components/shared/mart-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, CreditCard, MapPin, Loader2, Trash2, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { placeOrder, createCheckoutSession } from "@/app/actions/mart-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'CASH_ON_DELIVERY'>('STRIPE');
  const [address, setAddress] = useState({
    city: "Dhaka",
    street: "",
  });

  const shippingCharge = address.city.toLowerCase().includes("dhaka") ? 80 : 120;
  const total = state.totalAmount + shippingCharge;

  const handleCheckout = async () => {
    if (!address.street) return toast.error("Please enter your shipping address");
    setLoading(true);

    try {
      // 1. Place order in DB
      const orderRes = await placeOrder({
        items: state.items.map(i => ({ productId: i.id, quantity: i.quantity })),
        city: address.city,
        shippingAddress: address.street,
        paymentMethod: paymentMethod,
      });

      if (!orderRes.success) throw new Error(orderRes.error);

      if (paymentMethod === 'STRIPE') {
        // 2. Create Stripe Session
        const stripeRes = await createCheckoutSession({
          orderId: orderRes.data.id,
          amount: total,
          items: state.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        });

        if (!stripeRes.success) throw new Error(stripeRes.error);

        // 3. Redirect to Stripe
        if (stripeRes.url) {
          window.location.href = stripeRes.url;
        }
      } else {
        // Cash on Delivery - Success!
        clearCart();
        toast.success("Order placed successfully with Cash on Delivery!");
        router.push(`/dashboard/customer/orders?success=true&orderId=${orderRes.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push("/shop")} className="mt-4">Go Shopping</Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input placeholder="House #, Road #, Area..." value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'STRIPE' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Online Payment</span>
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Pay securely with your credit or debit card via Stripe.</p>
                </div>
                <div 
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Cash on Delivery</span>
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Pay in cash when your order is delivered to your doorstep.</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Review Items
              </h3>
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-white/5">
                    <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-primary font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                      <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(state.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span>{formatCurrency(shippingCharge)}</span>
                </div>
                <div className="pt-4 border-t flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="mart-gradient-text">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button onClick={handleCheckout} disabled={loading} className="w-full h-14 text-lg" variant="gradient">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (
                  paymentMethod === 'STRIPE' ? (
                    <><CreditCard className="w-5 h-5 mr-2" /> Pay with Stripe</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5 mr-2" /> Place COD Order</>
                  )
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                By completing your purchase you agree to our Terms of Service and Privacy Policy.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
