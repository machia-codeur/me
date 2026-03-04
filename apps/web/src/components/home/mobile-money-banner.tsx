import { Shield, Smartphone, RefreshCw, Clock } from "lucide-react";

const providers = [
  { name: "Orange Money", color: "bg-orange-500" },
  { name: "MTN MoMo", color: "bg-yellow-400" },
  { name: "Wave", color: "bg-blue-500" },
  { name: "Flutterwave", color: "bg-amber-500" },
];

const features = [
  {
    icon: Shield,
    title: "Escrow securise",
    desc: "Vos fonds sont proteges jusqu'a la livraison",
  },
  {
    icon: Smartphone,
    title: "Mobile Money",
    desc: "Payez avec votre numero de telephone",
  },
  {
    icon: RefreshCw,
    title: "Remboursement",
    desc: "Garanti si le produit ne correspond pas",
  },
  {
    icon: Clock,
    title: "Protection 7 jours",
    desc: "Delai de verification apres livraison",
  },
];

export function MobileMoneyBanner() {
  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container py-12 space-y-10">
        {/* Payment providers */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Payez avec <span className="text-cowri-orange">Mobile Money</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Les methodes de paiement les plus populaires d&apos;Afrique de l&apos;Ouest,
            en un seul clic.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {providers.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm"
              >
                <span className={`w-3 h-3 rounded-full ${p.color}`} />
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Trust features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-cowri-orange/20 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-cowri-orange" />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
