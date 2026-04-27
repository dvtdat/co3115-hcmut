import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Text content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Top Electronics. <span className="text-primary">Best Prices.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Shop the latest laptops, phones, and accessories. Fast delivery, genuine products,
              trusted service.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-8"
                nativeButton={false}
                render={<Link to="/products" />}
              >
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8"
                nativeButton={false}
                render={<Link to="/about" />}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero placeholder */}
          <div className="mx-auto w-full max-w-sm">
            <div
              className="flex w-full items-center justify-center rounded-2xl"
              style={{ aspectRatio: "4/5", backgroundColor: "#e8edf8" }}
            >
              <Cpu className="text-primary opacity-30" style={{ width: 96, height: 96 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
