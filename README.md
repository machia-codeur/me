# COWRI - Marketplace Monorepo

Cowri est une marketplace africaine construite avec une architecture monorepo moderne utilisant **Turborepo**.

## Architecture

```
cowri/
├── apps/
│   ├── web/          # Frontend - Next.js 14 + TypeScript + Tailwind CSS
│   └── api/          # Backend  - NestJS + Prisma + Swagger
├── packages/
│   ├── ui/           # Composants UI partagés (shadcn/ui + CVA)
│   ├── db/           # Schéma Prisma + client de base de données
│   └── config/       # Configurations partagées (ESLint, Prettier, TypeScript)
├── turbo.json        # Configuration Turborepo
├── pnpm-workspace.yaml
└── package.json
```

### Apps

| App | Stack | Port | Description |
|-----|-------|------|-------------|
| `@cowri/web` | Next.js 14, Tailwind CSS, TypeScript | 3000 | Interface utilisateur de la marketplace |
| `@cowri/api` | NestJS, Prisma, Swagger | 4000 | API REST avec documentation OpenAPI |

### Packages

| Package | Description |
|---------|-------------|
| `@cowri/ui` | Bibliothèque de composants React basée sur shadcn/ui (Button, Card, Input, Badge) |
| `@cowri/db` | Schéma Prisma complet et client singleton pour PostgreSQL |
| `@cowri/config` | Configurations ESLint, Prettier et TypeScript partagées entre tous les workspaces |

## Modèle de données

Le schéma Prisma inclut les entités suivantes :

- **User** - Acheteurs, vendeurs et administrateurs
- **Shop** - Profil de boutique pour les vendeurs
- **Category** - Catégories hiérarchiques (parent/enfant)
- **Product** - Produits avec images, prix et stock
- **ProductImage** - Images associées aux produits
- **Order** - Commandes avec statut de suivi
- **OrderItem** - Lignes de commande
- **Address** - Adresses de livraison
- **Review** - Avis et notes des acheteurs
- **PaymentTransaction** - Transactions de paiement (Mobile Money, carte, virement)

## Prérequis

- **Node.js** >= 18
- **pnpm** >= 9
- **PostgreSQL** >= 15

## Démarrage rapide

```bash
# 1. Installer les dépendances
pnpm install

# 2. Configurer les variables d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Générer le client Prisma
pnpm db:generate

# 4. Appliquer le schéma à la base de données
pnpm db:push

# 5. Lancer en développement
pnpm dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lancer tous les apps en mode développement |
| `pnpm build` | Build de production pour tous les workspaces |
| `pnpm lint` | Linter tout le code avec ESLint |
| `pnpm format` | Formatter le code avec Prettier |
| `pnpm format:check` | Vérifier le formatage sans modifier |
| `pnpm db:generate` | Générer le client Prisma |
| `pnpm db:push` | Synchroniser le schéma avec la base de données |
| `pnpm clean` | Nettoyer les dossiers de build et caches |

## API Documentation

L'API expose une documentation Swagger accessible à :
```
http://localhost:4000/api/docs
```

### Endpoints principaux

- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/products` - Liste des produits
- `GET /api/v1/categories` - Liste des catégories
- `GET /api/v1/orders` - Commandes utilisateur
- `GET /api/v1/reviews/product/:id` - Avis d'un produit

## Stack technique

- **Monorepo** : Turborepo + pnpm workspaces
- **Frontend** : Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend** : NestJS 10, Prisma ORM, Passport JWT
- **Base de données** : PostgreSQL
- **Qualité de code** : ESLint, Prettier, TypeScript strict
- **Paiement** : Support Mobile Money (XOF), carte bancaire, virement
