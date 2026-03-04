import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg text-cowri-orange mb-4">COWRI</h3>
          <p className="text-sm text-muted-foreground">
            La marketplace qui connecte les acheteurs et vendeurs a travers l&apos;Afrique.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/categories" className="hover:text-foreground">Categories</Link></li>
            <li><Link href="/sellers" className="hover:text-foreground">Vendeurs</Link></li>
            <li><Link href="/deals" className="hover:text-foreground">Promotions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/help" className="hover:text-foreground">Centre d&apos;aide</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link href="/disputes" className="hover:text-foreground">Litiges</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Paiement securise</h4>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="border rounded px-2 py-1">Orange Money</span>
            <span className="border rounded px-2 py-1">MTN MoMo</span>
            <span className="border rounded px-2 py-1">Wave</span>
            <span className="border rounded px-2 py-1">Flutterwave</span>
          </div>
        </div>
      </div>
      <div className="border-t py-4">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Cowri. Tous droits reserves.
        </p>
      </div>
    </footer>
  );
}
