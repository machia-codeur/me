export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "1", name: "Textiles", icon: "shirt-outline" },
  { id: "2", name: "Bijoux", icon: "diamond-outline" },
  { id: "3", name: "Beauté", icon: "flower-outline" },
  { id: "4", name: "Art", icon: "color-palette-outline" },
  { id: "5", name: "Accessoires", icon: "bag-handle-outline" },
  { id: "6", name: "Vêtements", icon: "shirt-outline" },
  { id: "7", name: "Décoration", icon: "home-outline" },
  { id: "8", name: "Musique", icon: "musical-notes-outline" },
];

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  description: string;
  variants: { label: string; options: string[] }[];
  seller: string;
  inStock: boolean;
}

export const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Tissu Bogolan Authentique",
    price: 35000,
    originalPrice: 42000,
    images: ["bogolan1", "bogolan2", "bogolan3"],
    category: "Textiles",
    rating: 4.8,
    reviews: 124,
    description:
      "Tissu bogolan fait main par des artisans maliens. Motifs traditionnels uniques, teint avec des pigments naturels. Idéal pour la décoration intérieure ou la confection de vêtements.",
    variants: [
      { label: "Taille", options: ["1m", "2m", "3m", "5m"] },
      { label: "Couleur", options: ["Marron", "Noir", "Indigo"] },
    ],
    seller: "Artisan Mali",
    inStock: true,
  },
  {
    id: "2",
    name: "Bracelet Or 18 Carats",
    price: 128000,
    images: ["bracelet1", "bracelet2"],
    category: "Bijoux",
    rating: 4.9,
    reviews: 56,
    description:
      "Bracelet en or 18 carats avec motifs traditionnels africains. Travail artisanal de haute qualité. Livré dans un écrin de luxe.",
    variants: [
      { label: "Taille", options: ["S", "M", "L"] },
    ],
    seller: "Bijouterie Abidjan",
    inStock: true,
  },
  {
    id: "3",
    name: "Sac en Cuir Artisanal",
    price: 45000,
    images: ["sac1", "sac2", "sac3"],
    category: "Accessoires",
    rating: 4.6,
    reviews: 89,
    description:
      "Sac à main en cuir véritable, fait main. Design unique inspiré des motifs géométriques africains. Compartiments multiples.",
    variants: [
      { label: "Couleur", options: ["Marron", "Noir", "Camel"] },
    ],
    seller: "Cuir d'Afrique",
    inStock: true,
  },
  {
    id: "4",
    name: "Huile de Karité Bio",
    price: 6500,
    originalPrice: 8000,
    images: ["karite1", "karite2"],
    category: "Beauté",
    rating: 4.7,
    reviews: 312,
    description:
      "Huile de karité 100% pure et biologique du Burkina Faso. Non raffinée, pressée à froid. Hydrate et nourrit la peau et les cheveux.",
    variants: [
      { label: "Volume", options: ["100ml", "250ml", "500ml"] },
    ],
    seller: "Karité du Faso",
    inStock: true,
  },
  {
    id: "5",
    name: "Chemise Wax Premium",
    price: 15000,
    images: ["wax1", "wax2", "wax3"],
    category: "Vêtements",
    rating: 4.5,
    reviews: 201,
    description:
      "Chemise en tissu wax de qualité supérieure. Coupe moderne et ajustée. Finitions soignées. Disponible en plusieurs motifs.",
    variants: [
      { label: "Taille", options: ["S", "M", "L", "XL", "XXL"] },
      { label: "Motif", options: ["Ankara", "Kente", "Adinkra"] },
    ],
    seller: "Mode Abidjan",
    inStock: true,
  },
  {
    id: "6",
    name: "Collier Perles Naturelles",
    price: 22000,
    images: ["collier1", "collier2"],
    category: "Bijoux",
    rating: 4.4,
    reviews: 78,
    description:
      "Collier de perles naturelles d'eau douce. Montage artisanal avec fermoir en argent 925. Pièce unique et élégante.",
    variants: [
      { label: "Longueur", options: ["40cm", "45cm", "50cm"] },
    ],
    seller: "Perles d'Afrique",
    inStock: false,
  },
];

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
}

export const mobileMoneyProviders = [
  { id: "orange", name: "Orange Money", color: "#FF6600", prefix: "+225" },
  { id: "mtn", name: "MTN MoMo", color: "#FFCC00", prefix: "+225" },
  { id: "moov", name: "Moov Money", color: "#0066CC", prefix: "+225" },
  { id: "wave", name: "Wave", color: "#1DC3E2", prefix: "+221" },
];
