const STEPS = [
  { id: 1, label: "Delivery" },
  { id: 2, label: "Review" },
  { id: 3, label: "Done" },
] as const;

interface StepIndicatorProps {
  step: 1 | 2 | 3;
}

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={
              step >= s.id
                ? "bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs"
                : "bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs"
            }
          >
            {s.id}
          </span>
          <span className={step === s.id ? "text-foreground font-medium" : "text-muted-foreground"}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-muted-foreground opacity-50">→</span>}
        </div>
      ))}
    </div>
  );
}
