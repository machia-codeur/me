import Link from "next/link";
import { CreditCard, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";

const paymentMethods = [
  {
    id: "orange-money",
    name: "Orange Money",
    desc: "Payez avec votre compte Orange Money",
    color: "bg-orange-500",
    provider: "cinetpay",
  },
  {
    id: "mtn-momo",
    name: "MTN Mobile Money",
    desc: "Payez avec votre compte MTN MoMo",
    color: "bg-yellow-400",
    provider: "cinetpay",
  },
  {
    id: "wave",
    name: "Wave",
    desc: "Payez avec votre compte Wave",
    color: "bg-blue-500",
    provider: "cinetpay",
  },
  {
    id: "moov-money",
    name: "Moov Money",
    desc: "Payez avec votre compte Moov Money",
    color: "bg-green-500",
    provider: "cinetpay",
  },
  {
    id: "flutterwave",
    name: "Carte bancaire",
    desc: "Visa, Mastercard via Flutterwave",
    color: "bg-amber-500",
    provider: "flutterwave",
    icon: CreditCard,
  },
];

export default function PaymentPage() {
  return (
    <div className="container py-6">
      <CheckoutSteps currentStep={3} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment methods */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5" />
            <h1 className="text-xl font-bold">Mode de paiement</h1>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon || Smartphone;
              return (
                <label
                  key={method.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 md:p-5 cursor-pointer hover:border-cowri-orange hover:shadow-sm transition-all"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    className="w-4 h-4 text-cowri-orange accent-cowri-orange"
                    defaultChecked={method.id === "orange-money"}
                  />
                  <div
                    className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.desc}
                    </p>
                  </div>
                  <span className="hidden md:inline text-xs text-muted-foreground border rounded-full px-2 py-0.5">
                    {method.provider === "cinetpay"
                      ? "CinetPay"
                      : "Flutterwave"}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p>
              Votre paiement est securise par le systeme d&apos;escrow Cowri.
              Les fonds ne sont liberes au vendeur qu&apos;apres votre
              confirmation de reception.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <OrderSummary subtotal={47500} shipping={2500} />
          <Link href="/checkout/confirmation" className="block">
            <Button className="w-full bg-cowri-orange hover:bg-cowri-orange/90 h-12 text-base">
              Payer 50 000 FCFA
            </Button>
          </Link>
          <Link href="/checkout/address" className="block">
            <Button variant="outline" className="w-full">
              Retour
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
