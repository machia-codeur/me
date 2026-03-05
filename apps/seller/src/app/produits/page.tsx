"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { products, type Product } from "@/lib/mock-data";

const PAGE_SIZE = 8;

const statusLabel: Record<Product["statut"], string> = {
  actif: "Actif",
  inactif: "Inactif",
  rupture: "Rupture",
};

const statusStyle: Record<Product["statut"], string> = {
  actif: "bg-green-100 text-green-800",
  inactif: "bg-gray-100 text-gray-800",
  rupture: "bg-red-100 text-red-800",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function ProduitsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "tous" || p.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
          <p className="text-gray-500 mt-1">
            {products.length} produits au total
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-cowri-600 hover:bg-cowri-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cowri-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cowri-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="rupture">Rupture de stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Produit
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Catégorie
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Prix
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Stock
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Ventes
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.nom}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {product.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.categorie}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(product.prix)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        product.stock === 0 && "text-red-600 font-medium"
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.ventes}</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusStyle[product.statut]
                      )}
                    >
                      {statusLabel[product.statut]}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {filtered.length === 0
              ? "Aucun résultat"
              : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(
                  page * PAGE_SIZE,
                  filtered.length
                )} sur ${filtered.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={clsx(
                  "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                  page === i + 1
                    ? "bg-cowri-600 text-white"
                    : "hover:bg-gray-100"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
