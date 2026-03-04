import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";

const countries = [
  { code: "CI", name: "Cote d'Ivoire" },
  { code: "SN", name: "Senegal" },
  { code: "ML", name: "Mali" },
  { code: "BF", name: "Burkina Faso" },
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
];

export default function AddressPage() {
  return (
    <div className="container py-6">
      <CheckoutSteps currentStep={2} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Address form */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            <h1 className="text-xl font-bold">Adresse de livraison</h1>
          </div>

          <div className="rounded-xl border bg-card p-4 md:p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prenom</label>
                <Input placeholder="Aya" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input placeholder="Kouadio" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telephone</label>
              <div className="flex gap-2">
                <div className="flex items-center border rounded-md px-3 bg-muted/50 text-sm text-muted-foreground w-24 flex-shrink-0">
                  +225
                </div>
                <Input placeholder="07 08 09 10 11" className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pays</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Input placeholder="Abidjan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Commune</label>
                <Input placeholder="Cocody" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quartier / Zone
              </label>
              <Input placeholder="Angre, pres du supermarche" />
              <p className="text-xs text-muted-foreground">
                Indiquez un repere connu pour faciliter la livraison
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Adresse complete (rue, numero)
              </label>
              <Input placeholder="Rue des Jardins, Immeuble Les Palmiers, 3e etage" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Instructions de livraison{" "}
                <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Sonner au portail vert, demander Mme Kouadio..."
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <OrderSummary subtotal={47500} shipping={2500} />
          <Link href="/checkout/payment" className="block">
            <Button className="w-full bg-cowri-orange hover:bg-cowri-orange/90 h-12 text-base">
              Continuer vers le paiement
            </Button>
          </Link>
          <Link href="/cart" className="block">
            <Button variant="outline" className="w-full">
              Retour au panier
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
