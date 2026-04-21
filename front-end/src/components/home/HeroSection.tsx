import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import heroImage from "@/asset/fresh-salad-explosion-presentation.jpg";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Text content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Eat Clean. Live Well. <span className="text-primary">Feel the Difference.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Fresh, organic, and nutritious food delivered straight to your door. No additives. No
              compromises.
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

          {/* Hero image */}
          <div className="mx-auto w-full max-w-sm">
            <img
              src={heroImage}
              alt="Fresh healthy food"
              className="w-full rounded-2xl object-cover"
              style={{ aspectRatio: "4/5" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
