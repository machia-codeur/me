"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { clsx } from "clsx";
import { kpiData, revenueChartData, recentOrders, type OrderStatus } from "@/lib/mock-data";

const kpiIcons = {
  revenue: DollarSign,
  orders: ShoppingCart,
  activeProducts: Package,
  averageRating: Star,
};

const kpiColors = {
  revenue: "bg-green-100 text-green-700",
  orders: "bg-blue-100 text-blue-700",
  activeProducts: "bg-purple-100 text-purple-700",
  averageRating: "bg-yellow-100 text-yellow-700",
};

const statusStyles: Record<OrderStatus, string> = {
  livré: "bg-green-100 text-green-800",
  "en cours": "bg-blue-100 text-blue-800",
  "en attente": "bg-yellow-100 text-yellow-800",
  annulé: "bg-red-100 text-red-800",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">
          Bienvenue ! Voici un aperçu de votre boutique.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(kpiData) as [keyof typeof kpiData, typeof kpiData[keyof typeof kpiData]][]).map(
          ([key, kpi]) => {
            const Icon = kpiIcons[key];
            const positive = kpi.change >= 0;
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {kpi.label}
                  </span>
                  <div className={clsx("p-2 rounded-lg", kpiColors[key])}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold">
                    {key === "revenue"
                      ? formatCurrency(kpi.value)
                      : kpi.value + kpi.unit}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  {positive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={positive ? "text-green-600" : "text-red-600"}
                  >
                    {positive ? "+" : ""}
                    {kpi.change}%
                  </span>
                  <span className="text-gray-400 ml-1">vs mois dernier</span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenus des 30 derniers jours
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Revenus"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            10 dernières commandes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  N° Commande
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Client
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Produit
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Montant
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Statut
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs font-medium">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">{order.client}</td>
                  <td className="px-6 py-4 text-gray-600">{order.produit}</td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(order.montant)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        statusStyles[order.statut]
                      )}
                    >
                      {order.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
