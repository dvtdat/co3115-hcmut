import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LandingProduct {
  name: string;
  slug: string;
  price: number;
  badge: string | null;
  category: string;
}

const PRODUCTS: LandingProduct[] = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    price: 1990000,
    badge: "Best Seller",
    category: "Audio",
  },
  {
    name: "Mechanical Keyboard TKL",
    slug: "mechanical-keyboard-tkl",
    price: 1250000,
    badge: "New",
    category: "Peripherals",
  },
  {
    name: "27\" 4K Monitor",
    slug: "27-4k-monitor",
    price: 8500000,
    badge: null,
    category: "Displays",
  },
  {
    name: "USB-C Hub 7-in-1",
    slug: "usb-c-hub-7-in-1",
    price: 650000,
    badge: "Popular",
    category: "Accessories",
  },
];

const BADGE_STYLES: Record<string, string> = {
  "Best Seller": "bg-blue-100 text-blue-700",
  New: "bg-indigo-100 text-indigo-700",
  Popular: "bg-amber-100 text-amber-700",
};

function formatVND(price: number): string {
  return `${price.toLocaleString("vi-VN")} ₫`;
}

interface LandingProductCardProps {
  product: LandingProduct;
}

function LandingProductCard({ product }: LandingProductCardProps) {
  return (
    <Card className="group cursor-pointer gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: "#e8edf8" }}
      >
        <div className="flex h-full items-center justify-center p-4">
          <span className="text-center text-sm leading-snug" style={{ color: "#5b7fd4" }}>
            {product.name}
          </span>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              "absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
              BADGE_STYLES[product.badge] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {product.badge}
          </span>
        )}
      </div>

      <CardContent className="flex flex-col gap-2 p-3">
        {/* Category */}
        <span className="text-muted-foreground text-xs">{product.category}</span>

        {/* Name */}
        <p className="text-foreground line-clamp-2 text-sm leading-snug font-medium">
          {product.name}
        </p>

        {/* Price */}
        <p className="text-primary text-sm font-bold">{formatVND(product.price)}</p>

        {/* CTA */}
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-1 w-full rounded-full"
          nativeButton={false}
          render={<Link to="/products/$slug" params={{ slug: product.slug }} />}
        >
          View Product
        </Button>
      </CardContent>
    </Card>
  );
}

export default function FeaturedProductsSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Our Bestsellers
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Handpicked favorites — loved by our customers.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <LandingProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            className="rounded-full px-8"
            nativeButton={false}
            render={<Link to="/products" />}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
