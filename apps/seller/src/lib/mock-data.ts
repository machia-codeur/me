// Mock data for the seller dashboard

export const kpiData = {
  revenue: { value: 2_450_000, change: +12.5, label: "CA du mois", unit: "FCFA" },
  orders: { value: 156, change: +8.2, label: "Commandes", unit: "" },
  activeProducts: { value: 43, change: +2, label: "Produits actifs", unit: "" },
  averageRating: { value: 4.6, change: +0.3, label: "Note moyenne", unit: "/5" },
};

export const revenueChartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  return {
    date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    revenue: Math.floor(50_000 + Math.random() * 150_000),
  };
});

export type OrderStatus = "livré" | "en cours" | "en attente" | "annulé";

export interface Order {
  id: string;
  client: string;
  produit: string;
  montant: number;
  statut: OrderStatus;
  date: string;
}

export const recentOrders: Order[] = [
  { id: "CMD-001", client: "Aminata K.", produit: "Tissu Bogolan", montant: 35000, statut: "livré", date: "05/03/2026" },
  { id: "CMD-002", client: "Kofi M.", produit: "Bracelet Or", montant: 128000, statut: "en cours", date: "04/03/2026" },
  { id: "CMD-003", client: "Fatou D.", produit: "Sac en cuir", montant: 45000, statut: "en attente", date: "04/03/2026" },
  { id: "CMD-004", client: "Yao B.", produit: "Collier Perles", montant: 22000, statut: "livré", date: "03/03/2026" },
  { id: "CMD-005", client: "Awa S.", produit: "Sandales Artisan", montant: 18000, statut: "annulé", date: "03/03/2026" },
  { id: "CMD-006", client: "Ibrahim T.", produit: "Chemise Wax", montant: 15000, statut: "en cours", date: "02/03/2026" },
  { id: "CMD-007", client: "Marie L.", produit: "Boucles d'oreilles", montant: 8500, statut: "livré", date: "02/03/2026" },
  { id: "CMD-008", client: "Jean-Paul A.", produit: "Panier Tressé", montant: 12000, statut: "en attente", date: "01/03/2026" },
  { id: "CMD-009", client: "Salamata O.", produit: "Huile de Karité", montant: 6500, statut: "livré", date: "01/03/2026" },
  { id: "CMD-010", client: "Moussa C.", produit: "Statuette Bois", montant: 55000, statut: "en cours", date: "28/02/2026" },
];

export interface Product {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  stock: number;
  statut: "actif" | "inactif" | "rupture";
  ventes: number;
  image: string;
}

export const products: Product[] = [
  { id: "PRD-001", nom: "Tissu Bogolan Authentique", categorie: "Textiles", prix: 35000, stock: 24, statut: "actif", ventes: 89, image: "/placeholder.png" },
  { id: "PRD-002", nom: "Bracelet Or 18 Carats", categorie: "Bijoux", prix: 128000, stock: 5, statut: "actif", ventes: 34, image: "/placeholder.png" },
  { id: "PRD-003", nom: "Sac en Cuir Artisanal", categorie: "Accessoires", prix: 45000, stock: 12, statut: "actif", ventes: 67, image: "/placeholder.png" },
  { id: "PRD-004", nom: "Collier Perles Naturelles", categorie: "Bijoux", prix: 22000, stock: 0, statut: "rupture", ventes: 120, image: "/placeholder.png" },
  { id: "PRD-005", nom: "Sandales Artisanales", categorie: "Chaussures", prix: 18000, stock: 30, statut: "actif", ventes: 56, image: "/placeholder.png" },
  { id: "PRD-006", nom: "Chemise Wax Premium", categorie: "Vêtements", prix: 15000, stock: 45, statut: "actif", ventes: 201, image: "/placeholder.png" },
  { id: "PRD-007", nom: "Boucles d'oreilles Cowrie", categorie: "Bijoux", prix: 8500, stock: 18, statut: "actif", ventes: 145, image: "/placeholder.png" },
  { id: "PRD-008", nom: "Panier Tressé Décoratif", categorie: "Décoration", prix: 12000, stock: 8, statut: "actif", ventes: 43, image: "/placeholder.png" },
  { id: "PRD-009", nom: "Huile de Karité Bio", categorie: "Beauté", prix: 6500, stock: 60, statut: "actif", ventes: 312, image: "/placeholder.png" },
  { id: "PRD-010", nom: "Statuette Bois Ébène", categorie: "Art", prix: 55000, stock: 3, statut: "actif", ventes: 22, image: "/placeholder.png" },
  { id: "PRD-011", nom: "Robe Bazin Brodée", categorie: "Vêtements", prix: 75000, stock: 0, statut: "inactif", ventes: 15, image: "/placeholder.png" },
  { id: "PRD-012", nom: "Masque Mural Tribal", categorie: "Art", prix: 42000, stock: 6, statut: "actif", ventes: 28, image: "/placeholder.png" },
  { id: "PRD-013", nom: "Savon Noir Traditionnel", categorie: "Beauté", prix: 3500, stock: 100, statut: "actif", ventes: 430, image: "/placeholder.png" },
  { id: "PRD-014", nom: "Éventail en Raphia", categorie: "Accessoires", prix: 5000, stock: 25, statut: "actif", ventes: 78, image: "/placeholder.png" },
  { id: "PRD-015", nom: "Djembé Sculpté", categorie: "Musique", prix: 95000, stock: 0, statut: "rupture", ventes: 11, image: "/placeholder.png" },
];
