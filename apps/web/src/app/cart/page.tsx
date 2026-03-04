import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem, type CartItemData } from "@/components/checkout/cart-item";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";

// Mock data — replaced by state/API in production
const cartItems: CartItemData[] = [
  {
    id: "1",
    title: "Tissu Wax Ankara Premium 6 Yards",
    variant: "Bleu / 6 yards",
    price: 15000,
    quantity: 2,
    seller: "Fatou Textiles",
    country: "🇨🇮",
  },
  {
    id: "2",
    title: "Beurre de Karite Bio 500g",
    variant: "500g",
    price: 5500,
    quantity: 1,
    seller: "Nature d'Afrique",
    country: "🇧🇫",
  },
  {
    id: "3",
    title: "Collier Perles Artisanales",
    variant: "Or / Moyen",
    price: 12000,
    quantity: 1,
    seller: "Bijoux Sahel",
    country: "🇸🇳",
  },
];

export default function CartPage() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container py-6">
      <CheckoutSteps currentStep={1} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h1 className="text-xl font-bold">
              Votre panier ({cartItems.length} articles)
            </h1>
          </div>

          <div className="rounded-xl border bg-card p-4 md:p-6">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <OrderSummary subtotal={subtotal} shipping={2500} />
          <Link href="/checkout/address" className="block">
            <Button className="w-full bg-cowri-orange hover:bg-cowri-orange/90 h-12 text-base">
              Passer la commande
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
