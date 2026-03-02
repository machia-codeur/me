# COWRI

Plateforme e-commerce complète construite avec un monorepo **Turborepo**.

## Architecture

```
cowri/
├── apps/
│   ├── web/          # Front-end – Next.js 14 + TypeScript + Tailwind CSS
│   └── api/          # Back-end  – NestJS + Prisma
├── packages/
│   ├── ui/           # Bibliothèque de composants – shadcn/ui
│   ├── db/           # Schéma Prisma & client de base de données
│   └── config/       # Configurations partagées (ESLint, Prettier, TypeScript)
├── turbo.json        # Pipeline Turborepo
├── pnpm-workspace.yaml
└── package.json
```

### Apps

| Workspace | Technologie | Description |
|-----------|-------------|-------------|
| `apps/web` | Next.js 14, TypeScript, Tailwind CSS | Application front-end pour les acheteurs et vendeurs |
| `apps/api` | NestJS, Prisma, PostgreSQL | API REST avec authentification, gestion des produits, commandes et paiements |

### Packages

| Package | Description |
|---------|-------------|
| `@cowri/ui` | Composants React réutilisables basés sur shadcn/ui (Button, Card, Input…) |
| `@cowri/db` | Schéma Prisma complet (User, Product, Category, Order, Review, Address, Payment, Notification) |
| `@cowri/config` | Configurations ESLint, Prettier et TypeScript partagées entre tous les workspaces |

## Modèle de données

Le schéma Prisma (`packages/db/prisma/schema.prisma`) définit les entités suivantes :

- **User** – Acheteur, vendeur ou administrateur
- **Product** – Produits avec prix, stock, images et catégorie
- **Category** – Arborescence hiérarchique de catégories (self-relation)
- **Order / OrderItem** – Commandes avec lignes de détail
- **Review** – Avis clients (un par utilisateur par produit)
- **Address** – Adresses de livraison liées aux utilisateurs
- **PaymentTransaction** – Transactions de paiement (carte, mobile money, virement, contre-remboursement)
- **Notification** – Notifications en temps réel par type

## Prérequis

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL

## Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Configurer la base de données
cp packages/db/.env.example packages/db/.env
# Éditer DATABASE_URL dans packages/db/.env

# Générer le client Prisma
pnpm db:generate

# Appliquer le schéma
pnpm db:push

# Lancer en développement
pnpm dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarre tous les workspaces en mode développement |
| `pnpm build` | Build de production pour tous les workspaces |
| `pnpm lint` | Lint de tous les workspaces |
| `pnpm format` | Formate le code avec Prettier |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:push` | Applique le schéma à la base de données |
| `pnpm typecheck` | Vérifie les types TypeScript |
| `pnpm clean` | Nettoie les builds et node_modules |
