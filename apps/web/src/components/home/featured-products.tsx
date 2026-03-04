import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFCFA } from "@/lib/utils";

// Mock data — replaced by API call in production
const products = [
  {
    id: "1",
    title: "Tissu Wax Ankara Premium 6 Yards",
    price: 15000,
    image: "/api/placeholder/400/400",
    seller: "Fatou Textiles",
    country: "🇨🇮",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    title: "Beurre de Karite Bio 500g",
    price: 5500,
    image: "/api/placeholder/400/400",
    seller: "Nature d'Afrique",
    country: "🇧🇫",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "3",
    title: "Collier Perles Artisanales",
    price: 12000,
    image: "/api/placeholder/400/400",
    seller: "Bijoux Sahel",
    country: "🇸🇳",
    rating: 4.7,
    reviews: 56,
  },
  {
    id: "4",
    title: "Cafe Robusta Moulu 1kg",
    price: 8500,
    image: "/api/placeholder/400/400",
    seller: "Abidjan Coffee",
    country: "🇨🇮",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: "5",
    title: "Panier Tresse Bolga Large",
    price: 22000,
    image: "/api/placeholder/400/400",
    seller: "Ghana Crafts",
    country: "🇬🇭",
    rating: 4.8,
    reviews: 67,
  },
  {
    id: "6",
    title: "Huile de Coco Vierge 250ml",
    price: 3500,
    image: "/api/placeholder/400/400",
    seller: "Bio Tropics",
    country: "🇨🇮",
    rating: 4.5,
    reviews: 312,
  },
  {
    id: "7",
    title: "Masque Mural Dan Sculpte",
    price: 45000,
    image: "/api/placeholder/400/400",
    seller: "Art Akan",
    country: "🇨🇮",
    rating: 5.0,
    reviews: 18,
  },
  {
    id: "8",
    title: "Sandales Cuir Fait Main",
    price: 18000,
    image: "/api/placeholder/400/400",
    seller: "Cuir du Niger",
    country: "🇳🇬",
    rating: 4.7,
    reviews: 94,
  },
];

export function FeaturedProducts() {
  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Produits Vedettes</h2>
        <Link
          href="/products"
          className="text-sm text-cowri-orange hover:underline font-medium"
        >
          Voir tout &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image placeholder */}
            <div className="aspect-square bg-muted relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Photo
              </div>
              <Badge className="absolute top-2 left-2 bg-white text-foreground text-xs shadow-sm">
                {product.country}
              </Badge>
            </div>

            {/* Info */}
            <div className="p-3 md:p-4 space-y-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-cowri-orange transition-colors">
                {product.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-cowri-yellow text-cowri-yellow" />
                <span>{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
              <p className="text-xs text-muted-foreground">{product.seller}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-cowri-orange">
                  {formatFCFA(product.price)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-cowri-orange/10 hover:text-cowri-orange"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
