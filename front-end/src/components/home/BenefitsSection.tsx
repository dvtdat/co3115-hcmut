import { Card, CardContent } from "@/components/ui/card";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: "🌿",
    title: "100% Organic",
    description:
      "Every product is certified organic — grown without pesticides or artificial fertilizers.",
  },
  {
    icon: "🚚",
    title: "Fresh Delivery",
    description: "From farm to your door in under 24 hours. We don't do stale.",
  },
  {
    icon: "💚",
    title: "Nutritionist Approved",
    description: "Our catalog is curated by certified nutritionists to support your health goals.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Why HealthyFood?
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            We believe good food is the foundation of a good life.
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
