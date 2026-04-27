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
      "TechMart delivered my laptop the next day. Setup was straightforward and the packaging was solid — no damage at all.",
  },
  {
    name: "Minh Tran",
    location: "Hanoi",
    rating: 5,
    quote: "Best place to buy genuine electronics online. The warranty claim process was painless.",
  },
  {
    name: "Thu Pham",
    location: "Da Nang",
    rating: 4,
    quote:
      "Great product range and competitive prices. The USB-C hub I bought has been running flawlessly for months.",
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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e0eaf8]">
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
    <section className="py-12 md:py-20" style={{ backgroundColor: "#f0f4fb" }}>
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
