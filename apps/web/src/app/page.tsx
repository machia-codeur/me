import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { MobileMoneyBanner } from "@/components/home/mobile-money-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <MobileMoneyBanner />
    </>
  );
}
