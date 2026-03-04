import Link from "next/link";
import {
  CheckCircle,
  Smartphone,
  Clock,
  ArrowRight,
  Shield,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { formatFCFA } from "@/lib/utils";

// Mock — in production this comes from the server after payment init
const orderData = {
  orderNumber: "COWRI-CI-2026-00042",
  total: 50000,
  paymentMethod: "Orange Money",
  phone: "+225 07 08 09 10 11",
  status: "PAYMENT_PENDING",
};

export default function ConfirmationPage() {
  return (
    <div className="container py-6">
      <CheckoutSteps currentStep={4} />

      <div className="max-w-xl mx-auto space-y-6">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-cowri-orange/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-cowri-orange" />
          </div>
          <h1 className="text-2xl font-bold">Commande creee !</h1>
          <p className="text-muted-foreground">
            Finalisez votre paiement pour confirmer la commande.
          </p>
        </div>

        {/* Order number */}
        <div className="rounded-xl border bg-card p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Numero de commande
          </p>
          <p className="text-2xl font-mono font-bold tracking-wider text-cowri-orange">
            {orderData.orderNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Montant : <span className="font-semibold text-foreground">{formatFCFA(orderData.total)}</span>
          </p>
        </div>

        {/* OTP Instructions */}
        <div className="rounded-xl border bg-amber-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold">
              Instructions de paiement — {orderData.paymentMethod}
            </h2>
          </div>

          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </span>
              <span>
                Un SMS avec un <strong>code OTP</strong> va etre envoye au{" "}
                <span className="font-mono">{orderData.phone}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </span>
              <span>
                Composez <strong>#144*82#</strong> ou ouvrez votre application{" "}
                {orderData.paymentMethod}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </span>
              <span>
                Entrez le <strong>code OTP</strong> recu par SMS pour confirmer
                le paiement de {formatFCFA(orderData.total)}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                4
              </span>
              <span>
                Saisissez votre <strong>code secret</strong>{" "}
                {orderData.paymentMethod} pour valider
              </span>
            </li>
          </ol>

          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg p-3">
            <Clock className="h-4 w-4 flex-shrink-0" />
            Vous avez 15 minutes pour finaliser le paiement.
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Et ensuite ?</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Paiement securise par escrow</p>
                <p className="text-muted-foreground">
                  Vos fonds sont retenus par Cowri et ne sont verses au vendeur
                  qu&apos;apres votre confirmation de reception.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Suivi de livraison</p>
                <p className="text-muted-foreground">
                  Vous recevrez des notifications a chaque etape : preparation,
                  expedition, livraison.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row gap-3">
          <Link href="/orders" className="flex-1">
            <Button className="w-full bg-cowri-orange hover:bg-cowri-orange/90">
              Suivre ma commande
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Retour a l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
