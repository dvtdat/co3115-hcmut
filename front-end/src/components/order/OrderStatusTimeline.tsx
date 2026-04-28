import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/hooks/use-orders";

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  shipping: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const FLOW: OrderStatus[] = ["pending", "confirmed", "shipping", "delivered"];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === "cancelled";
  const activeIndex = FLOW.indexOf(currentStatus);

  const steps = isCancelled
    ? [...FLOW.slice(0, 1), "cancelled" as OrderStatus]
    : FLOW;

  return (
    <ol className="border-border relative ml-3 border-l">
      {steps.map((status, index) => {
        const isDone = isCancelled ? index === 0 : index <= activeIndex;
        const isCurrent = isCancelled ? status === "cancelled" : index === activeIndex;

        return (
          <li key={status} className="mb-6 ml-6 last:mb-0">
            <span
              className={cn(
                "ring-background absolute -left-3 flex size-6 items-center justify-center rounded-full ring-4",
                isDone || isCurrent
                  ? status === "cancelled"
                    ? "bg-destructive"
                    : "bg-primary"
                  : "border-muted-foreground/30 bg-background border-2",
              )}
            >
              {(isDone || isCurrent) && (
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <p className={cn("text-sm font-medium", isCurrent ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground")}>
              {STATUS_LABELS[status] ?? status}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
