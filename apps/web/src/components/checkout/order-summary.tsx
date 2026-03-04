import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatFCFA } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  escrowFee?: number;
}

export function OrderSummary({
  subtotal,
  shipping,
  escrowFee = 0,
}: OrderSummaryProps) {
  const total = subtotal + shipping + escrowFee;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <h3 className="font-bold text-lg">Resume de la commande</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sous-total</span>
          <span>{formatFCFA(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Livraison</span>
          <span>{shipping === 0 ? "Gratuit" : formatFCFA(shipping)}</span>
        </div>
        {escrowFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frais escrow</span>
            <span>{formatFCFA(escrowFee)}</span>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-cowri-orange">{formatFCFA(total)}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 p-3 rounded-lg">
        <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
        <span>
          Protection acheteur : vos fonds sont securises jusqu&apos;a la
          confirmation de livraison.
        </span>
      </div>
    </div>
  );
}
