import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Khue Nguyen",
    location: "Ho Chi Minh City",
    rating: 5,
    quote:
      "HealthyFood changed how my family eats. The produce is always incredibly fresh and the delivery is super fast!",
  },
  {
    name: "Minh Tran",
    location: "Hanoi",
    rating: 5,
    quote: "I love that everything is certified organic. I finally trust where my food comes from.",
  },
  {
    name: "Thu Pham",
    location: "Da Nang",
    rating: 4,
    quote:
      "Great variety and the salad kits save me so much time during the week. Highly recommend!",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-amber-400" : "text-gray-200"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
            <span className="text-primary text-sm font-semibold">
              {getInitials(testimonial.name)}
            </span>
          </div>
          <div>
            <p className="text-foreground font-bold">{testimonial.name}</p>
            <p className="text-muted-foreground text-xs">{testimonial.location}</p>
          </div>
        </div>

        {/* Stars */}
        <StarRating rating={testimonial.rating} />

        {/* Quote */}
        <p className="text-muted-foreground leading-relaxed italic">"{testimonial.quote}"</p>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-12 md:py-20" style={{ backgroundColor: "#f9fbe7" }}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            What Our Customers Say
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
