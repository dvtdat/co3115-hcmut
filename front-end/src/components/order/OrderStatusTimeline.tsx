import type { components } from "@/api/schema.d.ts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type StatusHistoryEntry = components["schemas"]["StatusHistoryEntry"];
type OrderStatus = components["schemas"]["Order"]["status"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
}

export function OrderStatusTimeline({ currentStatus, statusHistory }: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === "cancelled";

  const historyMap = new Map(statusHistory.map((entry) => [entry.status, entry]));

  const displayStatuses = isCancelled
    ? [...statusHistory]
    : ALL_STATUSES.map((status) => ({
        status,
        changedAt: historyMap.get(status)?.changedAt ?? null,
        note: historyMap.get(status)?.note,
      }));

  const activeIndex = isCancelled
    ? displayStatuses.length - 1
    : ALL_STATUSES.indexOf(currentStatus);

  return (
    <ol className="border-border relative ml-3 border-l">
      {displayStatuses.map((entry, index) => {
        const isDone = isCancelled ? true : index <= activeIndex;
        const isCurrent = isCancelled
          ? index === displayStatuses.length - 1
          : index === activeIndex;
        const isCancelledStep = entry.status === "cancelled";

        return (
          <li key={entry.status} className="mb-6 ml-6 last:mb-0">
            <span
              className={cn(
                "ring-background absolute -left-3 flex size-6 items-center justify-center rounded-full ring-4",
                isDone
                  ? isCancelledStep
                    ? "bg-destructive"
                    : "bg-primary"
                  : "border-muted-foreground/30 bg-background border-2",
              )}
            >
              {isDone && (
                <svg
                  className="size-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>

            <div className="flex flex-col gap-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-foreground"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[entry.status] ?? entry.status}
              </p>

              {entry.changedAt && (
                <time className="text-muted-foreground text-xs">
                  {format(new Date(entry.changedAt), "MMM d, yyyy · h:mm a")}
                </time>
              )}

              {entry.note && <p className="text-muted-foreground mt-0.5 text-xs">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
