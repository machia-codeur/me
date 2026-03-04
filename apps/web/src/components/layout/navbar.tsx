import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const countries = [
  { code: "CI", name: "Cote d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top bar */}
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile menu */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-cowri-orange">COWRI</span>
        </Link>

        {/* Country selector */}
        <div className="hidden md:flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-muted cursor-pointer">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg leading-none">🇨🇮</span>
          <span className="text-muted-foreground">Cote d&apos;Ivoire</span>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit, une marque..."
              className="pl-9 pr-4 bg-muted/50 border-muted"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-cowri-orange text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <User className="h-5 w-5" />
          </Button>
          <Button size="sm" className="hidden md:inline-flex bg-cowri-orange hover:bg-cowri-orange/90">
            Connexion
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden border-t px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9 bg-muted/50 border-muted"
          />
        </div>
      </div>
    </header>
  );
}
