import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cowri-orange/10 via-cowri-yellow/5 to-cowri-green/10">
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Achetez &amp; Vendez{" "}
            <span className="text-cowri-orange">Partout en Afrique</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
            Des milliers de produits authentiques, livres chez vous.
            Paiement securise par Mobile Money avec protection acheteur.
          </p>

          {/* Main search bar */}
          <div className="flex items-center max-w-lg mx-auto bg-white rounded-full shadow-lg border p-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Que recherchez-vous ?"
                className="pl-9 border-0 focus-visible:ring-0 bg-transparent"
              />
            </div>
            <Button className="rounded-full bg-cowri-orange hover:bg-cowri-orange/90 px-6">
              Rechercher
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Populaire :</span>
            {["Wax Ankara", "Beurre de karite", "Bijoux artisanaux", "Cafe Robusta"].map(
              (term) => (
                <span
                  key={term}
                  className="bg-white border rounded-full px-3 py-0.5 hover:bg-muted cursor-pointer"
                >
                  {term}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-cowri-orange/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cowri-green/5 blur-3xl" />
    </section>
  );
}
