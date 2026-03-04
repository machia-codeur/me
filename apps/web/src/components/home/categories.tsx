import Link from "next/link";
import {
  Shirt,
  Gem,
  Leaf,
  Home as HomeIcon,
  Smartphone,
  Palette,
} from "lucide-react";

const categories = [
  {
    name: "Mode & Textile",
    slug: "mode-textile",
    icon: Shirt,
    color: "bg-cowri-orange/10 text-cowri-orange",
  },
  {
    name: "Bijoux & Accessoires",
    slug: "bijoux-accessoires",
    icon: Gem,
    color: "bg-cowri-purple/10 text-cowri-purple",
  },
  {
    name: "Beaute & Bien-etre",
    slug: "beaute-bien-etre",
    icon: Leaf,
    color: "bg-cowri-green/10 text-cowri-green",
  },
  {
    name: "Maison & Deco",
    slug: "maison-deco",
    icon: HomeIcon,
    color: "bg-cowri-blue/10 text-cowri-blue",
  },
  {
    name: "High-Tech",
    slug: "high-tech",
    icon: Smartphone,
    color: "bg-cowri-red/10 text-cowri-red",
  },
  {
    name: "Art & Artisanat",
    slug: "art-artisanat",
    icon: Palette,
    color: "bg-cowri-yellow/10 text-yellow-700",
  },
];

export function Categories() {
  return (
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-6">Categories</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
