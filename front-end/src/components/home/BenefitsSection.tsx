import { Card, CardContent } from "@/components/ui/card";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: "⚡",
    title: "Genuine Products",
    description: "Every item is sourced directly from authorized distributors — 100% authentic.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Order today, at your door tomorrow. Nationwide shipping with real-time tracking.",
  },
  {
    icon: "🛡️",
    title: "2-Year Warranty",
    description: "All products come with a minimum 2-year warranty and dedicated after-sales support.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Why TechMart?
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            We make buying electronics simple, safe, and fast.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="border shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6">
                <span className="text-4xl" role="img" aria-label={benefit.title}>
                  {benefit.icon}
                </span>
                <h3 className="text-foreground text-lg font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
